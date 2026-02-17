import asyncio
import datetime as dt
import glob
import json
import os
import re
import subprocess
import time
from typing import Any, Dict, List, Optional, Set, Tuple

import decky

STEAM_LOG_PATH = "/home/deck/.local/share/Steam/logs/stats_log.txt"
LIBRARYCACHE_GLOB = "/home/deck/.local/share/Steam/userdata/*/config/librarycache/*.json"
POLL_INTERVAL_SECONDS = 0.35
CACHE_SCAN_INTERVAL_SECONDS = 1.5
DUPLICATE_WINDOW_SECONDS = 8.0
RARE_PERCENT_THRESHOLD = 10.0
SKIP_CACHE_FILES = {"achievement_progress.json"}


class Plugin:
    def __init__(self) -> None:
        self._watcher_task: Optional[asyncio.Task] = None
        self._librarycache_task: Optional[asyncio.Task] = None
        self._stop_event = asyncio.Event()
        self._watcher_running = False
        self._librarycache_running = False
        self._last_match_timestamp: Optional[str] = None
        self._last_match_sample: Optional[str] = None
        self._last_match_source: Optional[str] = None
        self._last_emitted_line = ""
        self._last_emit_monotonic = 0.0
        self._cache_mtimes: Dict[str, float] = {}
        self._known_unlocked: Dict[int, Set[str]] = {}
        self._recent_emit_keys: Dict[str, float] = {}
        self._achievement_patterns = [
            re.compile(r"\bachievement\s+unlocked\b", re.IGNORECASE),
            re.compile(r"\bunlocked\s+achievement\b", re.IGNORECASE),
            re.compile(r"\bachievement\s*:\s*unlocked\b", re.IGNORECASE),
        ]
        self._rare_pattern = re.compile(r"\brare\b", re.IGNORECASE)

    async def _main(self) -> None:
        self._stop_event.clear()
        await self._prime_librarycache_state()
        self._watcher_task = asyncio.create_task(
            self._watch_logs(), name="xboxachievements-logwatch"
        )
        self._librarycache_task = asyncio.create_task(
            self._watch_librarycache(), name="xboxachievements-librarycache-watch"
        )
        decky.logger.info("XboxAchievements backend started")

    async def _unload(self) -> None:
        self._stop_event.set()
        if self._watcher_task is not None:
            self._watcher_task.cancel()
            try:
                await self._watcher_task
            except asyncio.CancelledError:
                pass
        if self._librarycache_task is not None:
            self._librarycache_task.cancel()
            try:
                await self._librarycache_task
            except asyncio.CancelledError:
                pass
        self._watcher_running = False
        self._librarycache_running = False
        decky.logger.info("XboxAchievements backend stopped")

    async def get_status(self) -> dict:
        return {
            "watcher_running": self._watcher_running,
            "librarycache_watcher_running": self._librarycache_running,
            "librarycache_files_seen": len(self._cache_mtimes),
            "last_match_timestamp": self._last_match_timestamp,
            "last_match_sample": self._last_match_sample,
            "last_match_source": self._last_match_source,
            "log_path": STEAM_LOG_PATH,
            "librarycache_glob": LIBRARYCACHE_GLOB,
            "duplicate_window_seconds": DUPLICATE_WINDOW_SECONDS,
        }

    async def test_popup_main(self) -> None:
        await self._emit_notification(
            title="Achievement Unlocked",
            subtitle="Manual main popup test",
            is_rare=False,
            line_hint="manual:test:main",
            source="manual",
            dedupe_key=f"manual:main:{time.monotonic()}",
        )

    async def test_popup_rare(self) -> None:
        await self._emit_notification(
            title="Rare Achievement Unlocked",
            subtitle="Manual rare popup test",
            is_rare=True,
            line_hint="manual:test:rare",
            source="manual",
            dedupe_key=f"manual:rare:{time.monotonic()}",
        )

    def _sound_path(self, is_rare: bool) -> str:
        filename = "rare.wav" if is_rare else "unlock.wav"
        return os.path.join(decky.DECKY_PLUGIN_DIR, "assets", filename)

    def _build_audio_env(self) -> Dict[str, str]:
        env = os.environ.copy()
        runtime_dir = env.get("XDG_RUNTIME_DIR") or f"/run/user/{os.getuid()}"
        env["XDG_RUNTIME_DIR"] = runtime_dir

        pulse_socket = os.path.join(runtime_dir, "pulse", "native")
        if os.path.exists(pulse_socket):
            env.setdefault("PULSE_SERVER", f"unix:{pulse_socket}")

        return env

    async def _play_sound(self, is_rare: bool) -> None:
        sound_path = self._sound_path(is_rare)
        if not os.path.exists(sound_path):
            decky.logger.warning("Sound file missing: %s", sound_path)
            return

        env = self._build_audio_env()

        def _run() -> subprocess.CompletedProcess[str]:
            return subprocess.run(
                [
                    "paplay",
                    "--stream-name",
                    "XboxAchievements",
                    "--property=media.role=event",
                    sound_path,
                ],
                env=env,
                text=True,
                stdout=subprocess.DEVNULL,
                stderr=subprocess.PIPE,
                check=False,
                timeout=6,
            )

        try:
            result = await asyncio.to_thread(_run)
            if result.returncode != 0:
                stderr = (result.stderr or "").strip()
                decky.logger.warning(
                    "paplay failed (%s): %s", result.returncode, stderr or "no stderr"
                )
        except Exception as err:
            decky.logger.error("Audio playback failed: %s", err)

    def _is_achievement_line(self, line: str) -> bool:
        return any(pattern.search(line) for pattern in self._achievement_patterns)

    def _is_rare_line(self, line: str) -> bool:
        return bool(self._rare_pattern.search(line))

    def _dedupe_emit(self, dedupe_key: str) -> bool:
        now = time.monotonic()
        stale = [
            key
            for key, seen in self._recent_emit_keys.items()
            if now - seen > DUPLICATE_WINDOW_SECONDS * 3
        ]
        for key in stale:
            self._recent_emit_keys.pop(key, None)

        seen = self._recent_emit_keys.get(dedupe_key)
        if seen is not None and now - seen < DUPLICATE_WINDOW_SECONDS:
            return True

        self._recent_emit_keys[dedupe_key] = now
        return False

    async def _emit_notification(
        self,
        title: str,
        subtitle: str,
        is_rare: bool,
        line_hint: str,
        source: str,
        dedupe_key: str,
    ) -> None:
        if self._dedupe_emit(dedupe_key):
            return

        timestamp = dt.datetime.now(dt.timezone.utc).isoformat()

        payload = {
            "title": title,
            "subtitle": subtitle,
            "is_rare": is_rare,
            "timestamp": timestamp,
        }

        asyncio.create_task(self._play_sound(is_rare))
        await decky.emit("xboxachievements_show", payload)

        self._last_match_timestamp = timestamp
        self._last_match_sample = line_hint
        self._last_match_source = source
        decky.logger.info("Notification emitted: %s", payload)

    async def _handle_log_line(self, line: str) -> None:
        cleaned = line.strip()
        if not cleaned or not self._is_achievement_line(cleaned):
            return

        now = time.monotonic()
        if (
            cleaned == self._last_emitted_line
            and now - self._last_emit_monotonic < DUPLICATE_WINDOW_SECONDS
        ):
            return

        self._last_emitted_line = cleaned
        self._last_emit_monotonic = now

        is_rare = self._is_rare_line(cleaned)
        title = "Rare Achievement Unlocked" if is_rare else "Achievement Unlocked"
        subtitle = cleaned
        if len(subtitle) > 150:
            subtitle = f"...{subtitle[-147:]}"

        await self._emit_notification(
            title=title,
            subtitle=subtitle,
            is_rare=is_rare,
            line_hint=cleaned,
            source="stats_log",
            dedupe_key=f"log:{cleaned}",
        )

    async def _watch_logs(self) -> None:
        while not self._stop_event.is_set():
            if not os.path.exists(STEAM_LOG_PATH):
                self._watcher_running = False
                decky.logger.warning("Steam log path missing: %s", STEAM_LOG_PATH)
                await asyncio.sleep(2.0)
                continue

            try:
                with open(STEAM_LOG_PATH, "r", encoding="utf-8", errors="ignore") as stream:
                    stream.seek(0, os.SEEK_END)
                    self._watcher_running = True
                    decky.logger.info("Watching Steam log: %s", STEAM_LOG_PATH)

                    while not self._stop_event.is_set():
                        line = stream.readline()
                        if not line:
                            await asyncio.sleep(POLL_INTERVAL_SECONDS)
                            continue
                        await self._handle_log_line(line)
            except asyncio.CancelledError:
                raise
            except Exception as err:
                self._watcher_running = False
                decky.logger.error("Log watcher error: %s", err)
                await asyncio.sleep(2.0)

        self._watcher_running = False

    def _iter_librarycache_files(self) -> List[str]:
        paths = glob.glob(LIBRARYCACHE_GLOB)
        filtered = []
        for path in paths:
            basename = os.path.basename(path)
            if basename in SKIP_CACHE_FILES:
                continue
            if not basename.endswith(".json"):
                continue
            filtered.append(path)
        return filtered

    def _sections_from_cache(self, payload: Any) -> Dict[str, Any]:
        if isinstance(payload, dict):
            return payload

        sections: Dict[str, Any] = {}
        if not isinstance(payload, list):
            return sections

        for entry in payload:
            if (
                not isinstance(entry, list)
                or len(entry) < 2
                or not isinstance(entry[0], str)
            ):
                continue
            data_blob = entry[1]
            if isinstance(data_blob, dict) and "data" in data_blob:
                sections[entry[0]] = data_blob.get("data")
            else:
                sections[entry[0]] = data_blob

        return sections

    def _extract_unlocked_ids(self, achievements: Dict[str, Any]) -> Set[str]:
        unlocked: Set[str] = set()
        for section in ("vecHighlight", "vecUnachieved", "vecAchievedHidden"):
            values = achievements.get(section)
            if not isinstance(values, list):
                continue
            for item in values:
                if not isinstance(item, dict):
                    continue
                if item.get("bAchieved") is not True:
                    continue
                aid = item.get("strID")
                if isinstance(aid, str) and aid:
                    unlocked.add(aid)
        return unlocked

    def _parse_highlight(
        self, appid: int, achievements: Dict[str, Any], newly_unlocked: Set[str]
    ) -> Optional[Tuple[str, str, bool, str]]:
        highlights = achievements.get("vecHighlight")
        if not isinstance(highlights, list):
            return None

        candidates: List[Dict[str, Any]] = []
        for item in highlights:
            if not isinstance(item, dict):
                continue
            if item.get("bAchieved") is not True:
                continue
            aid = item.get("strID")
            if isinstance(aid, str) and aid in newly_unlocked:
                candidates.append(item)

        if not candidates:
            return None

        candidates.sort(
            key=lambda item: int(item.get("rtUnlocked") or 0),
            reverse=True,
        )
        latest = candidates[0]

        ach_id = str(latest.get("strID") or "UNKNOWN")
        ach_name = str(latest.get("strName") or ach_id)
        ach_desc = str(latest.get("strDescription") or "").strip()
        rarity_value = latest.get("flAchieved")
        is_rare = False
        if isinstance(rarity_value, (int, float)):
            is_rare = float(rarity_value) <= RARE_PERCENT_THRESHOLD

        title = "Rare Achievement Unlocked" if is_rare else "Achievement Unlocked"
        subtitle = ach_name if not ach_desc else f"{ach_name} - {ach_desc}"
        hint = f"appid={appid} id={ach_id} name={ach_name}"
        return title, subtitle, is_rare, hint

    async def _prime_librarycache_state(self) -> None:
        for path in self._iter_librarycache_files():
            await self._process_librarycache_file(path, emit=False)
        decky.logger.info(
            "Librarycache baseline loaded: %s files", len(self._cache_mtimes)
        )

    async def _process_librarycache_file(self, path: str, emit: bool) -> None:
        basename = os.path.basename(path)
        appid_text, _ = os.path.splitext(basename)
        if not appid_text.isdigit():
            return

        appid = int(appid_text)
        try:
            mtime = os.path.getmtime(path)
        except OSError:
            return

        self._cache_mtimes[path] = mtime

        try:
            with open(path, "r", encoding="utf-8", errors="ignore") as stream:
                payload = json.load(stream)
        except Exception:
            return

        sections = self._sections_from_cache(payload)
        achievements = sections.get("achievements")
        if not isinstance(achievements, dict):
            return

        unlocked = self._extract_unlocked_ids(achievements)
        previous = self._known_unlocked.get(appid)
        self._known_unlocked[appid] = unlocked

        if previous is None or not emit:
            return

        newly_unlocked = unlocked - previous
        if not newly_unlocked:
            return

        parsed = self._parse_highlight(appid, achievements, newly_unlocked)
        if parsed is None:
            title = "Achievement Unlocked"
            subtitle = f"App {appid} unlocked {len(newly_unlocked)} achievement(s)"
            is_rare = False
            hint = f"appid={appid} unlocked={','.join(sorted(newly_unlocked))}"
        else:
            title, subtitle, is_rare, hint = parsed

        await self._emit_notification(
            title=title,
            subtitle=subtitle,
            is_rare=is_rare,
            line_hint=hint,
            source="librarycache",
            dedupe_key=f"librarycache:{appid}:{','.join(sorted(newly_unlocked))}",
        )

    async def _watch_librarycache(self) -> None:
        while not self._stop_event.is_set():
            try:
                paths = self._iter_librarycache_files()
                self._librarycache_running = True
                known = set(paths)

                for stale in list(self._cache_mtimes.keys()):
                    if stale not in known:
                        self._cache_mtimes.pop(stale, None)

                for path in paths:
                    try:
                        mtime = os.path.getmtime(path)
                    except OSError:
                        continue

                    previous = self._cache_mtimes.get(path)
                    if previous is not None and mtime <= previous:
                        continue
                    await self._process_librarycache_file(path, emit=True)
            except asyncio.CancelledError:
                raise
            except Exception as err:
                self._librarycache_running = False
                decky.logger.error("Librarycache watcher error: %s", err)

            await asyncio.sleep(CACHE_SCAN_INTERVAL_SECONDS)

        self._librarycache_running = False
