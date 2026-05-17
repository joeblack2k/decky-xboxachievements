import asyncio
import ctypes
import datetime as dt
import glob
import json
import os
import re
import struct
import subprocess
import time
import urllib.parse
from typing import Any, Dict, List, Optional, Set, Tuple

import decky

STEAM_LOG_PATH = "/home/deck/.local/share/Steam/logs/stats_log.txt"
STEAM_LOG_DIR = os.path.dirname(STEAM_LOG_PATH)
STEAM_USERDATA_GLOB = "/home/deck/.local/share/Steam/userdata/*"
LIBRARYCACHE_GLOB = "/home/deck/.local/share/Steam/userdata/*/config/librarycache/*.json"
LIBRARYCACHE_DIR_GLOB = "/home/deck/.local/share/Steam/userdata/*/config/librarycache"
STEAM_APPCACHE_STATS_DIR = "/home/deck/.local/share/Steam/appcache/stats"
STEAMWORKS_LIB_PATH = "/home/deck/.local/share/Steam/steamrt64/libsteam_api.so"
STEAMWORKS_HELPER_NAME = "steamworks_probe.py"
STEAMWORKS_PYTHON = "/usr/bin/python3"
POLL_INTERVAL_SECONDS = 0.35
CACHE_SCAN_INTERVAL_SECONDS = 1.5
RECONCILIATION_SCAN_INTERVAL_SECONDS = 120.0
INOTIFY_DEBOUNCE_SECONDS = 0.10
STEAMWORKS_APPID_SCAN_INTERVAL_SECONDS = 1.0
STEAMWORKS_POLL_INTERVAL_MS = 100
DUPLICATE_WINDOW_SECONDS = 8.0
RARE_PERCENT_THRESHOLD = 10.0
SKIP_CACHE_FILES = {"achievement_progress.json"}
AUDIO_PREROLL_SECONDS = 0.35
STEAM_ID64_BASE = 76561197960265728
STEAM_WEB_API_KEY_ENV = "STEAM_WEB_API_KEY"
STEAM_WEB_API_KEY_FILE = "/home/deck/homebrew/settings/XboxAchievements/steam_web_api_key"
STEAM_API_TIMEOUT_SECONDS = 2.0
STEAM_API_POLL_INTERVAL_SECONDS = 12.0
STEAM_API_RECENT_GAME_LIMIT = 2
STEAM_API_BASE_URL = "https://api.steampowered.com"
IN_CLOSE_WRITE = 0x00000008
IN_ATTRIB = 0x00000004
IN_MODIFY = 0x00000002
IN_MOVED_TO = 0x00000080
IN_CREATE = 0x00000100
IN_DELETE_SELF = 0x00000400
IN_MOVE_SELF = 0x00000800
IN_IGNORED = 0x00008000
IN_Q_OVERFLOW = 0x00004000
IN_ISDIR = 0x40000000
INOTIFY_STRUCT = struct.Struct("iIII")
INOTIFY_READ_SIZE = 65536


class Plugin:
    def __init__(self) -> None:
        self._watcher_task: Optional[asyncio.Task] = None
        self._librarycache_task: Optional[asyncio.Task] = None
        self._steam_api_task: Optional[asyncio.Task] = None
        self._steamworks_task: Optional[asyncio.Task] = None
        self._steamworks_reader_task: Optional[asyncio.Task] = None
        self._steamworks_stderr_task: Optional[asyncio.Task] = None
        self._steamworks_process: Optional[asyncio.subprocess.Process] = None
        self._inotify_fd: Optional[int] = None
        self._inotify_watches: Dict[int, Tuple[str, str]] = {}
        self._inotify_queue: Optional[asyncio.Queue[Dict[str, Any]]] = None
        self._stop_event = asyncio.Event()
        self._watcher_running = False
        self._librarycache_running = False
        self._watcher_mode = "starting"
        self._steam_api_running = False
        self._steam_api_enabled = False
        self._steam_api_status: Optional[str] = None
        self._steam_api_last_error: Optional[str] = None
        self._steam_api_last_appids: List[int] = []
        self._steamworks_running = False
        self._steamworks_status: Optional[str] = None
        self._steamworks_last_error: Optional[str] = None
        self._steamworks_last_appid: Optional[int] = None
        self._steamworks_last_process_pid: Optional[int] = None
        self._steamworks_unlock_count = 0
        self._last_inotify_event_path: Optional[str] = None
        self._last_inotify_event_appid: Optional[int] = None
        self._last_queue_latency_ms: Optional[float] = None
        self._processed_inotify_events = 0
        self._fallback_scan_count = 0
        self._last_parse_retry_error: Optional[str] = None
        self._log_inode: Optional[int] = None
        self._log_device: Optional[int] = None
        self._log_position = 0
        self._last_match_timestamp: Optional[str] = None
        self._last_match_sample: Optional[str] = None
        self._last_match_source: Optional[str] = None
        self._last_scanned_appid: Optional[int] = None
        self._last_cache_mtime: Optional[float] = None
        self._last_new_unlock_ids: List[str] = []
        self._last_cache_status: Optional[str] = None
        self._last_parse_error: Optional[str] = None
        self._last_emitted_line = ""
        self._last_emit_monotonic = 0.0
        self._cache_mtimes: Dict[str, float] = {}
        self._known_unlocked: Dict[int, Set[str]] = {}
        self._steam_api_known_unlocked: Dict[int, Set[str]] = {}
        self._steam_api_percent_cache: Dict[int, Dict[str, float]] = {}
        self._recent_emit_keys: Dict[str, float] = {}
        self._achievement_patterns = [
            re.compile(r"\bachievement\s+unlocked\b", re.IGNORECASE),
            re.compile(r"\bunlocked\s+achievement\b", re.IGNORECASE),
            re.compile(r"\bachievement\s*:\s*unlocked\b", re.IGNORECASE),
        ]
        self._rare_pattern = re.compile(r"\brare\b", re.IGNORECASE)
        self._stats_bin_pattern = re.compile(
            r"^UserGameStats_(?P<accountid>\d+)_(?P<appid>\d+)\.bin$"
        )

    async def _main(self) -> None:
        self._stop_event.clear()
        await self._prime_librarycache_state()
        self._watcher_task = asyncio.create_task(
            self._watch_logs(), name="xboxachievements-logwatch"
        )
        self._librarycache_task = asyncio.create_task(
            self._watch_librarycache(), name="xboxachievements-librarycache-watch"
        )
        self._steam_api_task = asyncio.create_task(
            self._watch_steam_api(), name="xboxachievements-steam-api-watch"
        )
        self._steamworks_task = asyncio.create_task(
            self._watch_steamworks(), name="xboxachievements-steamworks-watch"
        )
        decky.logger.info("XboxAchievements backend started")

    async def _unload(self) -> None:
        self._stop_event.set()
        self._close_inotify()
        self._stop_steamworks_process()

        tasks = [
            task
            for task in [
                self._watcher_task,
                self._librarycache_task,
                self._steam_api_task,
                self._steamworks_task,
                self._steamworks_reader_task,
                self._steamworks_stderr_task,
            ]
            if task is not None and not task.done()
        ]
        for task in tasks:
            task.cancel()

        self._watcher_running = False
        self._librarycache_running = False
        self._steam_api_running = False
        self._steamworks_running = False
        decky.logger.info("XboxAchievements backend stopped")

    async def get_status(self) -> dict:
        return {
            "watcher_running": self._watcher_running,
            "librarycache_watcher_running": self._librarycache_running,
            "watcher_mode": self._watcher_mode,
            "last_inotify_event_path": self._last_inotify_event_path,
            "last_inotify_event_appid": self._last_inotify_event_appid,
            "last_queue_latency_ms": self._last_queue_latency_ms,
            "processed_inotify_events": self._processed_inotify_events,
            "fallback_scan_count": self._fallback_scan_count,
            "last_parse_retry_error": self._last_parse_retry_error,
            "steam_api_running": self._steam_api_running,
            "steam_api_enabled": self._steam_api_enabled,
            "steam_api_status": self._steam_api_status,
            "steam_api_last_error": self._steam_api_last_error,
            "steam_api_last_appids": self._steam_api_last_appids,
            "steamworks_running": self._steamworks_running,
            "steamworks_status": self._steamworks_status,
            "steamworks_last_error": self._steamworks_last_error,
            "steamworks_last_appid": self._steamworks_last_appid,
            "steamworks_last_process_pid": self._steamworks_last_process_pid,
            "steamworks_unlock_count": self._steamworks_unlock_count,
            "steamworks_poll_interval_ms": STEAMWORKS_POLL_INTERVAL_MS,
            "librarycache_files_seen": len(self._cache_mtimes),
            "last_match_timestamp": self._last_match_timestamp,
            "last_match_sample": self._last_match_sample,
            "last_match_source": self._last_match_source,
            "last_scanned_appid": self._last_scanned_appid,
            "last_cache_mtime": self._last_cache_mtime,
            "last_new_unlock_ids": self._last_new_unlock_ids,
            "last_cache_status": self._last_cache_status,
            "last_parse_error": self._last_parse_error,
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
        filename = "rare_preroll.wav" if is_rare else "unlock_preroll.wav"
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

        try:
            subprocess.Popen(
                [
                    "paplay",
                    "--stream-name",
                    "XboxAchievements",
                    "--property=media.role=event",
                    sound_path,
                ],
                env=env,
                stdout=subprocess.DEVNULL,
                stderr=subprocess.DEVNULL,
                start_new_session=True,
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
        await asyncio.sleep(AUDIO_PREROLL_SECONDS)
        await decky.emit("xboxachievements_show", payload)

        self._last_match_timestamp = timestamp
        self._last_match_sample = line_hint
        self._last_match_source = source
        decky.logger.info("Notification emitted via %s: %s", source, payload)

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

    async def _read_new_stats_log_lines(self, initial: bool = False) -> None:
        try:
            stat = os.stat(STEAM_LOG_PATH)
        except OSError:
            self._watcher_running = False
            return

        changed_file = (
            self._log_inode is not None
            and (stat.st_ino != self._log_inode or stat.st_dev != self._log_device)
        )
        truncated = self._log_inode is not None and stat.st_size < self._log_position

        if initial:
            self._log_position = stat.st_size
        elif self._log_inode is None or changed_file or truncated:
            self._log_position = 0

        self._log_inode = stat.st_ino
        self._log_device = stat.st_dev

        try:
            with open(STEAM_LOG_PATH, "r", encoding="utf-8", errors="ignore") as stream:
                stream.seek(self._log_position)
                while True:
                    line = stream.readline()
                    if not line:
                        self._log_position = stream.tell()
                        break
                    await self._handle_log_line(line)
        except OSError as err:
            self._last_parse_retry_error = f"stats_log read failed: {err}"

    async def _watch_logs(self) -> None:
        while not self._stop_event.is_set():
            if not os.path.exists(STEAM_LOG_PATH):
                self._watcher_running = False
                decky.logger.warning("Steam log path missing: %s", STEAM_LOG_PATH)
                await asyncio.sleep(2.0)
                continue

            try:
                self._watcher_running = True
                await self._read_new_stats_log_lines(initial=True)
                decky.logger.info("Watching Steam log: %s", STEAM_LOG_PATH)

                while not self._stop_event.is_set():
                    await self._read_new_stats_log_lines()
                    await asyncio.sleep(POLL_INTERVAL_SECONDS)
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

    def _iter_librarycache_dirs(self) -> List[str]:
        return [
            path
            for path in glob.glob(LIBRARYCACHE_DIR_GLOB)
            if os.path.isdir(path)
        ]

    def _librarycache_path_for_appid(
        self, appid: int, accountid: Optional[str] = None
    ) -> Optional[str]:
        if accountid:
            path = (
                f"/home/deck/.local/share/Steam/userdata/{accountid}/"
                f"config/librarycache/{appid}.json"
            )
            if os.path.exists(path):
                return path

        matches = glob.glob(
            f"/home/deck/.local/share/Steam/userdata/*/config/librarycache/{appid}.json"
        )
        if matches:
            return matches[0]
        return None

    def _appid_from_librarycache_path(self, path: str) -> Optional[int]:
        basename = os.path.basename(path)
        appid_text, ext = os.path.splitext(basename)
        if ext != ".json" or not appid_text.isdigit():
            return None
        if basename in SKIP_CACHE_FILES:
            return None
        return int(appid_text)

    def _load_inotify_libc(self) -> Any:
        try:
            libc = ctypes.CDLL("libc.so.6", use_errno=True)
        except OSError as err:
            raise RuntimeError(f"inotify unavailable: {err}") from err

        libc.inotify_init1.argtypes = [ctypes.c_int]
        libc.inotify_init1.restype = ctypes.c_int
        libc.inotify_add_watch.argtypes = [
            ctypes.c_int,
            ctypes.c_char_p,
            ctypes.c_uint32,
        ]
        libc.inotify_add_watch.restype = ctypes.c_int
        libc.inotify_rm_watch.argtypes = [ctypes.c_int, ctypes.c_int]
        libc.inotify_rm_watch.restype = ctypes.c_int
        return libc

    def _add_inotify_watch(
        self, libc: Any, fd: int, path: str, kind: str, mask: int
    ) -> None:
        if not os.path.exists(path):
            return

        wd = libc.inotify_add_watch(fd, path.encode("utf-8"), mask)
        if wd < 0:
            err_no = ctypes.get_errno()
            raise OSError(err_no, os.strerror(err_no), path)
        self._inotify_watches[wd] = (kind, path)

    def _close_inotify(self) -> None:
        fd = self._inotify_fd
        self._inotify_fd = None
        self._inotify_watches.clear()

        if fd is None:
            return

        loop = asyncio.get_running_loop()
        try:
            loop.remove_reader(fd)
        except Exception:
            pass
        try:
            os.close(fd)
        except OSError:
            pass

    def _open_inotify(self) -> None:
        self._close_inotify()
        libc = self._load_inotify_libc()
        fd = libc.inotify_init1(os.O_NONBLOCK | os.O_CLOEXEC)
        if fd < 0:
            err_no = ctypes.get_errno()
            raise OSError(err_no, os.strerror(err_no))

        self._inotify_fd = fd
        watch_mask = (
            IN_CLOSE_WRITE
            | IN_MOVED_TO
            | IN_CREATE
            | IN_ATTRIB
            | IN_DELETE_SELF
            | IN_MOVE_SELF
            | IN_IGNORED
            | IN_Q_OVERFLOW
        )
        log_mask = watch_mask | IN_MODIFY

        for path in self._iter_librarycache_dirs():
            self._add_inotify_watch(libc, fd, path, "librarycache_dir", watch_mask)

        self._add_inotify_watch(
            libc, fd, STEAM_APPCACHE_STATS_DIR, "appcache_stats_dir", watch_mask
        )
        self._add_inotify_watch(libc, fd, STEAM_LOG_DIR, "steam_log_dir", log_mask)

        if not self._inotify_watches:
            raise RuntimeError("inotify has no valid watch paths")

        loop = asyncio.get_running_loop()
        loop.add_reader(fd, self._read_inotify_events)

    def _read_inotify_events(self) -> None:
        fd = self._inotify_fd
        queue = self._inotify_queue
        if fd is None or queue is None:
            return

        while True:
            try:
                data = os.read(fd, INOTIFY_READ_SIZE)
            except BlockingIOError:
                return
            except OSError as err:
                queue.put_nowait(
                    {"kind": "inotify_error", "error": str(err), "event_time": time.monotonic()}
                )
                return

            if not data:
                return

            offset = 0
            while offset + INOTIFY_STRUCT.size <= len(data):
                wd, mask, cookie, name_len = INOTIFY_STRUCT.unpack_from(data, offset)
                offset += INOTIFY_STRUCT.size
                raw_name = data[offset : offset + name_len]
                offset += name_len
                name = raw_name.split(b"\0", 1)[0].decode("utf-8", errors="ignore")
                watch = self._inotify_watches.get(wd)
                if watch is None:
                    continue
                kind, base_path = watch
                path = os.path.join(base_path, name) if name else base_path
                queue.put_nowait(
                    {
                        "kind": kind,
                        "path": path,
                        "mask": mask,
                        "cookie": cookie,
                        "event_time": time.monotonic(),
                    }
                )

    def _event_to_cache_path(self, event: Dict[str, Any]) -> Optional[Tuple[str, str, int]]:
        kind = event.get("kind")
        path = str(event.get("path") or "")
        mask = int(event.get("mask") or 0)

        if mask & IN_Q_OVERFLOW:
            return None

        if kind == "librarycache_dir":
            appid = self._appid_from_librarycache_path(path)
            if appid is None:
                return None
            return path, "librarycache_inotify", appid

        if kind == "appcache_stats_dir":
            match = self._stats_bin_pattern.match(os.path.basename(path))
            if not match:
                return None
            appid = int(match.group("appid"))
            cache_path = self._librarycache_path_for_appid(
                appid, accountid=match.group("accountid")
            )
            if cache_path is None:
                return None
            return cache_path, "appcache_stats_inotify", appid

        return None

    def _detect_running_steam_appid(self) -> Optional[Tuple[int, int]]:
        candidates: List[Tuple[int, int]] = []
        ignored_appids = {0, 769, 1675200}

        for pid_text in os.listdir("/proc"):
            if not pid_text.isdigit():
                continue

            environ_path = os.path.join("/proc", pid_text, "environ")
            cmdline_path = os.path.join("/proc", pid_text, "cmdline")
            stat_path = os.path.join("/proc", pid_text, "stat")
            try:
                environ = open(environ_path, "rb").read()
                cmdline = open(cmdline_path, "rb").read().decode(
                    "utf-8", errors="ignore"
                )
            except OSError:
                continue

            if STEAMWORKS_HELPER_NAME in cmdline:
                continue

            appid: Optional[int] = None
            for raw_item in environ.split(b"\0"):
                if not raw_item.startswith((b"SteamAppId=", b"SteamGameId=")):
                    continue
                try:
                    value = raw_item.split(b"=", 1)[1].decode("ascii", errors="ignore")
                    parsed = int(value)
                except (IndexError, ValueError):
                    continue
                if parsed not in ignored_appids:
                    appid = parsed
                    break

            if appid is None:
                continue

            try:
                stat = open(stat_path, "r", encoding="utf-8", errors="ignore").read()
                start_ticks = int(stat.rsplit(") ", 1)[1].split()[19])
            except Exception:
                start_ticks = 0

            candidates.append((start_ticks, appid))

        if not candidates:
            return None

        start_ticks, appid = max(candidates, key=lambda item: item[0])
        return appid, start_ticks

    def _steamworks_helper_path(self) -> str:
        return os.path.join(decky.DECKY_PLUGIN_DIR, STEAMWORKS_HELPER_NAME)

    def _stop_steamworks_process(self) -> None:
        process = self._steamworks_process
        self._steamworks_process = None
        if process is None or process.returncode is not None:
            return

        try:
            process.terminate()
        except ProcessLookupError:
            pass
        except Exception as err:
            decky.logger.warning("Unable to terminate Steamworks helper: %s", err)

    async def _start_steamworks_process(self, appid: int) -> None:
        self._stop_steamworks_process()

        helper_path = self._steamworks_helper_path()
        if not os.path.exists(helper_path):
            self._steamworks_status = "disabled_helper_missing"
            self._steamworks_running = False
            return
        if not os.path.exists(STEAMWORKS_LIB_PATH):
            self._steamworks_status = "disabled_lib_missing"
            self._steamworks_last_error = STEAMWORKS_LIB_PATH
            self._steamworks_running = False
            return

        env = os.environ.copy()
        env["SteamAppId"] = str(appid)
        env["SteamGameId"] = str(appid)
        env["LD_LIBRARY_PATH"] = (
            os.path.dirname(STEAMWORKS_LIB_PATH)
            + os.pathsep
            + env.get("LD_LIBRARY_PATH", "")
        )

        process = await asyncio.create_subprocess_exec(
            STEAMWORKS_PYTHON,
            helper_path,
            "--appid",
            str(appid),
            "--poll-ms",
            str(STEAMWORKS_POLL_INTERVAL_MS),
            "--lib",
            STEAMWORKS_LIB_PATH,
            stdout=asyncio.subprocess.PIPE,
            stderr=asyncio.subprocess.PIPE,
            env=env,
        )
        self._steamworks_process = process
        self._steamworks_last_appid = appid
        self._steamworks_last_process_pid = process.pid
        self._steamworks_status = "started"
        self._steamworks_running = True
        self._steamworks_reader_task = asyncio.create_task(
            self._read_steamworks_stdout(process, appid),
            name="xboxachievements-steamworks-stdout",
        )
        self._steamworks_stderr_task = asyncio.create_task(
            self._read_steamworks_stderr(process),
            name="xboxachievements-steamworks-stderr",
        )
        decky.logger.info("Steamworks helper started for appid=%s", appid)

    async def _read_steamworks_stderr(
        self, process: asyncio.subprocess.Process
    ) -> None:
        if process.stderr is None:
            return

        while not self._stop_event.is_set():
            line = await process.stderr.readline()
            if not line:
                return
            text = line.decode("utf-8", errors="ignore").strip()
            if text:
                self._steamworks_last_error = text[:300]

    async def _read_steamworks_stdout(
        self, process: asyncio.subprocess.Process, appid: int
    ) -> None:
        if process.stdout is None:
            return

        while not self._stop_event.is_set():
            line = await process.stdout.readline()
            if not line:
                return

            try:
                event = json.loads(line.decode("utf-8", errors="ignore"))
            except json.JSONDecodeError:
                continue

            event_type = event.get("type")
            if event_type == "ready":
                self._steamworks_status = (
                    f"appid={appid}: ready achievements={event.get('count', 0)}"
                )
                continue
            if event_type == "error":
                self._steamworks_status = "error"
                self._steamworks_last_error = str(event.get("error") or "unknown")
                continue
            if event_type != "unlock":
                continue

            achievement_id = str(event.get("id") or "")
            if not achievement_id:
                continue

            name = str(event.get("name") or achievement_id)
            desc = str(event.get("desc") or "").strip()
            percent = event.get("percent")
            is_rare = isinstance(percent, (int, float)) and percent <= RARE_PERCENT_THRESHOLD
            title = "Rare Achievement Unlocked" if is_rare else "Achievement Unlocked"
            subtitle = name if not desc else f"{name} - {desc}"
            self._steamworks_unlock_count += 1
            self._last_new_unlock_ids = [achievement_id]
            self._last_scanned_appid = appid
            self._last_cache_status = "steamworks_new_unlock"

            await self._emit_notification(
                title=title,
                subtitle=subtitle,
                is_rare=is_rare,
                line_hint=f"appid={appid} id={achievement_id} name={name}",
                source="steamworks_poll",
                dedupe_key=f"achievement:{appid}:{achievement_id}",
            )

    async def _watch_steamworks(self) -> None:
        active_appid: Optional[int] = None
        active_start_ticks: Optional[int] = None

        while not self._stop_event.is_set():
            try:
                detected = await asyncio.to_thread(self._detect_running_steam_appid)
                if detected is None:
                    if active_appid is not None:
                        self._stop_steamworks_process()
                    active_appid = None
                    active_start_ticks = None
                    self._steamworks_running = False
                    self._steamworks_status = "idle_no_running_game"
                else:
                    appid, start_ticks = detected
                    process = self._steamworks_process
                    process_dead = process is not None and process.returncode is not None
                    if (
                        appid != active_appid
                        or start_ticks != active_start_ticks
                        or process is None
                        or process_dead
                    ):
                        active_appid = appid
                        active_start_ticks = start_ticks
                        self._steamworks_last_process_pid = None
                        await self._start_steamworks_process(appid)

                await asyncio.sleep(STEAMWORKS_APPID_SCAN_INTERVAL_SECONDS)
            except asyncio.CancelledError:
                raise
            except Exception as err:
                self._steamworks_running = False
                self._steamworks_status = "error"
                self._steamworks_last_error = str(err)
                decky.logger.warning("Steamworks watcher error: %s", err)
                await asyncio.sleep(2.0)

        self._stop_steamworks_process()
        self._steamworks_running = False

    def _steam_api_key(self) -> Optional[str]:
        env_key = os.environ.get(STEAM_WEB_API_KEY_ENV, "").strip()
        if env_key:
            return env_key

        try:
            with open(STEAM_WEB_API_KEY_FILE, "r", encoding="utf-8") as stream:
                file_key = stream.read().strip()
        except OSError:
            return None

        return file_key or None

    def _steamid64_from_userdata(self) -> Optional[int]:
        candidates: List[Tuple[int, int]] = []
        for path in glob.glob("/home/deck/.local/share/Steam/userdata/*"):
            account_id_text = os.path.basename(path)
            if not account_id_text.isdigit():
                continue

            cache_glob = os.path.join(path, "config", "librarycache", "*.json")
            candidates.append((len(glob.glob(cache_glob)), int(account_id_text)))

        if not candidates:
            return None

        _cache_count, account_id = max(candidates)
        return STEAM_ID64_BASE + account_id

    async def _steam_api_json(self, path: str, params: Dict[str, Any]) -> Dict[str, Any]:
        url = f"{STEAM_API_BASE_URL}{path}?{urllib.parse.urlencode(params)}"

        def _request() -> Dict[str, Any]:
            env = os.environ.copy()
            env.pop("LD_LIBRARY_PATH", None)
            env.pop("LD_PRELOAD", None)
            result = subprocess.run(
                [
                    "curl",
                    "--fail",
                    "--silent",
                    "--show-error",
                    "--location",
                    "--max-time",
                    str(int(STEAM_API_TIMEOUT_SECONDS)),
                    "--user-agent",
                    "DeckyXboxAchievements/1.0",
                    url,
                ],
                text=True,
                stdout=subprocess.PIPE,
                stderr=subprocess.PIPE,
                env=env,
                check=False,
            )
            if result.returncode != 0:
                stderr = (result.stderr or "").strip()
                raise RuntimeError(f"curl failed ({result.returncode}): {stderr}")
            return json.loads(result.stdout)

        return await asyncio.to_thread(_request)

    async def _steam_api_recent_appids(self, key: str, steamid64: int) -> List[int]:
        payload = await self._steam_api_json(
            "/IPlayerService/GetRecentlyPlayedGames/v1/",
            {
                "key": key,
                "steamid": steamid64,
                "count": STEAM_API_RECENT_GAME_LIMIT,
                "format": "json",
            },
        )

        games = payload.get("response", {}).get("games", [])
        appids: List[int] = []
        for game in games:
            appid = game.get("appid") if isinstance(game, dict) else None
            if isinstance(appid, int):
                appids.append(appid)

        return appids

    async def _steam_api_global_percentages(self, appid: int) -> Dict[str, float]:
        cached = self._steam_api_percent_cache.get(appid)
        if cached is not None:
            return cached

        payload = await self._steam_api_json(
            f"/ISteamUserStats/GetGlobalAchievementPercentagesForApp/v2/",
            {"gameid": appid, "format": "json"},
        )
        achievements = payload.get("achievementpercentages", {}).get(
            "achievements", []
        )
        percentages: Dict[str, float] = {}
        for item in achievements:
            if not isinstance(item, dict):
                continue
            name = item.get("name")
            percent = item.get("percent")
            if isinstance(name, str) and isinstance(percent, (int, float)):
                percentages[name] = float(percent)

        self._steam_api_percent_cache[appid] = percentages
        return percentages

    async def _process_steam_api_appid(
        self, key: str, steamid64: int, appid: int
    ) -> None:
        payload = await self._steam_api_json(
            "/ISteamUserStats/GetPlayerAchievements/v1/",
            {
                "key": key,
                "steamid": steamid64,
                "appid": appid,
                "l": "english",
                "format": "json",
            },
        )

        stats = payload.get("playerstats", {})
        achievements = stats.get("achievements", [])
        if not isinstance(achievements, list):
            self._steam_api_status = f"appid={appid}: no achievements"
            return

        achieved_items: List[Dict[str, Any]] = []
        for item in achievements:
            if not isinstance(item, dict):
                continue
            if item.get("achieved") not in (1, True, "1"):
                continue
            ach_id = item.get("apiname")
            if isinstance(ach_id, str) and ach_id:
                achieved_items.append(item)

        unlocked = {
            str(item["apiname"])
            for item in achieved_items
            if isinstance(item.get("apiname"), str) and item.get("apiname")
        }
        previous = self._steam_api_known_unlocked.get(appid)
        self._steam_api_known_unlocked[appid] = unlocked

        if previous is None:
            self._steam_api_status = f"appid={appid}: baseline_loaded"
            return

        newly_unlocked = unlocked - previous
        if not newly_unlocked:
            self._steam_api_status = f"appid={appid}: no_new_unlocks"
            return

        candidates = [
            item
            for item in achieved_items
            if isinstance(item.get("apiname"), str)
            and item.get("apiname") in newly_unlocked
        ]
        candidates.sort(
            key=lambda item: int(item.get("unlocktime") or 0),
            reverse=True,
        )
        latest = candidates[0] if candidates else {}
        ach_id = str(latest.get("apiname") or sorted(newly_unlocked)[-1])
        ach_name = str(latest.get("name") or ach_id)
        ach_desc = str(latest.get("description") or "").strip()

        is_rare = False
        try:
            percentages = await self._steam_api_global_percentages(appid)
            percent = percentages.get(ach_id)
            is_rare = percent is not None and percent <= RARE_PERCENT_THRESHOLD
        except Exception as err:
            self._steam_api_last_error = f"rarity lookup failed: {err}"

        title = "Rare Achievement Unlocked" if is_rare else "Achievement Unlocked"
        subtitle = ach_name if not ach_desc else f"{ach_name} - {ach_desc}"
        self._steam_api_status = f"appid={appid}: new_unlocks_detected"
        await self._emit_notification(
            title=title,
            subtitle=subtitle,
            is_rare=is_rare,
            line_hint=f"appid={appid} id={ach_id} name={ach_name}",
            source="steam_web_api",
            dedupe_key=f"achievement:{appid}:{ach_id}",
        )

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

    def _achievement_lists(self, achievements: Dict[str, Any]) -> List[Tuple[str, List[Any]]]:
        lists: List[Tuple[str, List[Any]]] = []
        for section, values in achievements.items():
            values = achievements.get(section)
            if not isinstance(values, list):
                continue
            if not any(isinstance(item, dict) and "strID" in item for item in values):
                continue
            lists.append((section, values))
        return lists

    def _achieved_items(self, achievements: Dict[str, Any]) -> List[Dict[str, Any]]:
        achieved: List[Dict[str, Any]] = []
        for _section, values in self._achievement_lists(achievements):
            for item in values:
                if not isinstance(item, dict):
                    continue
                if item.get("bAchieved") is not True:
                    continue
                aid = item.get("strID")
                if isinstance(aid, str) and aid:
                    achieved.append(item)
        return achieved

    def _extract_unlocked_ids(self, achievements: Dict[str, Any]) -> Set[str]:
        return {
            str(item["strID"])
            for item in self._achieved_items(achievements)
            if isinstance(item.get("strID"), str) and item.get("strID")
        }

    def _parse_highlight(
        self, appid: int, achievements: Dict[str, Any], newly_unlocked: Set[str]
    ) -> Optional[Tuple[str, str, bool, str, str]]:
        candidates: List[Dict[str, Any]] = []
        for item in self._achieved_items(achievements):
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
        return title, subtitle, is_rare, hint, ach_id

    async def _prime_librarycache_state(self) -> None:
        for path in self._iter_librarycache_files():
            await self._process_librarycache_file(path, emit=False)
        decky.logger.info(
            "Librarycache baseline loaded: %s files", len(self._cache_mtimes)
        )

    async def _process_librarycache_file(
        self, path: str, emit: bool, source: str = "librarycache"
    ) -> bool:
        basename = os.path.basename(path)
        appid_text, _ = os.path.splitext(basename)
        if not appid_text.isdigit():
            return True

        appid = int(appid_text)
        try:
            mtime = os.path.getmtime(path)
        except OSError:
            return False

        self._last_scanned_appid = appid
        self._last_cache_mtime = mtime

        try:
            with open(path, "r", encoding="utf-8", errors="ignore") as stream:
                payload = json.load(stream)
        except Exception as err:
            self._last_parse_error = f"{basename}: json load failed: {err}"
            self._last_cache_status = "json_error"
            return False

        sections = self._sections_from_cache(payload)
        achievements = sections.get("achievements")
        if not isinstance(achievements, dict):
            self._cache_mtimes[path] = mtime
            self._last_parse_error = f"{basename}: achievements section missing"
            self._last_cache_status = "no_achievements_section"
            return True

        self._cache_mtimes[path] = mtime
        self._last_parse_error = None
        unlocked = self._extract_unlocked_ids(achievements)
        previous = self._known_unlocked.get(appid)
        self._known_unlocked[appid] = unlocked

        if previous is None or not emit:
            self._last_cache_status = "baseline_loaded"
            return True

        newly_unlocked = unlocked - previous
        if not newly_unlocked:
            self._last_new_unlock_ids = []
            self._last_cache_status = "no_new_unlocks"
            return True

        self._last_new_unlock_ids = sorted(newly_unlocked)
        self._last_cache_status = "new_unlocks_detected"
        parsed = self._parse_highlight(appid, achievements, newly_unlocked)
        if parsed is None:
            title = "Achievement Unlocked"
            subtitle = f"App {appid} unlocked {len(newly_unlocked)} achievement(s)"
            is_rare = False
            hint = f"appid={appid} unlocked={','.join(sorted(newly_unlocked))}"
            dedupe_id = ",".join(sorted(newly_unlocked))
        else:
            title, subtitle, is_rare, hint, dedupe_id = parsed

        await self._emit_notification(
            title=title,
            subtitle=subtitle,
            is_rare=is_rare,
            line_hint=hint,
            source=source,
            dedupe_key=f"achievement:{appid}:{dedupe_id}",
        )
        return True

    async def _process_librarycache_file_with_retries(
        self, path: str, source: str
    ) -> None:
        for attempt in range(3):
            ok = await self._process_librarycache_file(path, emit=True, source=source)
            if ok:
                self._last_parse_retry_error = None
                return

            self._last_parse_retry_error = (
                f"{os.path.basename(path)} parse retry {attempt + 1}/3"
            )
            await asyncio.sleep(INOTIFY_DEBOUNCE_SECONDS * (attempt + 1))

        self._last_parse_retry_error = f"{os.path.basename(path)} parse failed after retry"

    async def _scan_librarycache_changes(self, source: str) -> None:
        self._fallback_scan_count += 1
        paths = self._iter_librarycache_files()
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
            await self._process_librarycache_file(path, emit=True, source=source)

    async def _watch_librarycache_poll(self) -> None:
        self._watcher_mode = "poll_fallback"
        while not self._stop_event.is_set():
            try:
                self._librarycache_running = True
                await self._scan_librarycache_changes(source="poll_fallback")
            except asyncio.CancelledError:
                raise
            except Exception as err:
                self._librarycache_running = False
                decky.logger.error("Librarycache watcher error: %s", err)

            await asyncio.sleep(CACHE_SCAN_INTERVAL_SECONDS)

        self._librarycache_running = False

    async def _watch_librarycache_inotify(self) -> None:
        self._inotify_queue = asyncio.Queue()
        self._open_inotify()
        self._watcher_mode = "inotify"
        self._librarycache_running = True
        pending: Dict[str, Dict[str, Any]] = {}
        next_reconciliation = time.monotonic() + RECONCILIATION_SCAN_INTERVAL_SECONDS
        decky.logger.info("Librarycache inotify watcher started")

        try:
            while not self._stop_event.is_set():
                now = time.monotonic()
                due_times = [event["due_time"] for event in pending.values()]
                next_due = min(due_times) if due_times else None
                next_tick = min(
                    value
                    for value in [next_due, next_reconciliation]
                    if value is not None
                )
                timeout = max(0.0, next_tick - now)

                try:
                    event = await asyncio.wait_for(
                        self._inotify_queue.get(), timeout=timeout
                    )
                    event_kind = event.get("kind")
                    if event_kind == "inotify_error":
                        raise RuntimeError(str(event.get("error")))

                    mask = int(event.get("mask") or 0)
                    if mask & IN_Q_OVERFLOW:
                        await self._scan_librarycache_changes(source="inotify_overflow")
                        continue

                    if event_kind == "steam_log_dir" and os.path.basename(
                        str(event.get("path") or "")
                    ) == os.path.basename(STEAM_LOG_PATH):
                        await self._read_new_stats_log_lines()
                        continue

                    cache_event = self._event_to_cache_path(event)
                    if cache_event is None:
                        continue

                    path, source, appid = cache_event
                    event_time = float(event.get("event_time") or time.monotonic())
                    pending[path] = {
                        "path": path,
                        "source": source,
                        "appid": appid,
                        "event_time": event_time,
                        "due_time": time.monotonic() + INOTIFY_DEBOUNCE_SECONDS,
                    }
                except asyncio.TimeoutError:
                    pass

                now = time.monotonic()
                if now >= next_reconciliation:
                    await self._scan_librarycache_changes(source="librarycache_reconcile")
                    next_reconciliation = now + RECONCILIATION_SCAN_INTERVAL_SECONDS

                due_paths = [
                    path
                    for path, event in pending.items()
                    if event["due_time"] <= now
                ]
                for path in due_paths:
                    event = pending.pop(path)
                    self._processed_inotify_events += 1
                    self._last_inotify_event_path = path
                    self._last_inotify_event_appid = int(event["appid"])
                    self._last_queue_latency_ms = round(
                        (time.monotonic() - float(event["event_time"])) * 1000.0,
                        1,
                    )
                    decky.logger.info(
                        "Inotify event processed via %s appid=%s latency_ms=%s path=%s",
                        event["source"],
                        event["appid"],
                        self._last_queue_latency_ms,
                        path,
                    )
                    await self._process_librarycache_file_with_retries(
                        path, source=str(event["source"])
                    )
        finally:
            self._librarycache_running = False
            self._close_inotify()

    async def _watch_librarycache(self) -> None:
        try:
            await self._watch_librarycache_inotify()
        except asyncio.CancelledError:
            raise
        except Exception as err:
            self._watcher_mode = "poll_fallback"
            self._librarycache_running = False
            decky.logger.error("Inotify watcher unavailable, falling back to polling: %s", err)
            await self._watch_librarycache_poll()

    async def _watch_steam_api(self) -> None:
        while not self._stop_event.is_set():
            key = self._steam_api_key()
            steamid64 = self._steamid64_from_userdata()

            if not key:
                self._steam_api_enabled = False
                self._steam_api_running = False
                self._steam_api_status = "disabled_no_api_key"
                await asyncio.sleep(STEAM_API_POLL_INTERVAL_SECONDS)
                continue

            if steamid64 is None:
                self._steam_api_enabled = True
                self._steam_api_running = False
                self._steam_api_status = "disabled_no_steamid"
                await asyncio.sleep(STEAM_API_POLL_INTERVAL_SECONDS)
                continue

            try:
                self._steam_api_enabled = True
                self._steam_api_running = True
                appids = await self._steam_api_recent_appids(key, steamid64)
                self._steam_api_last_appids = appids

                if not appids:
                    self._steam_api_status = "no_recent_games"
                for appid in appids:
                    await self._process_steam_api_appid(key, steamid64, appid)

                self._steam_api_last_error = None
            except asyncio.CancelledError:
                raise
            except Exception as err:
                self._steam_api_running = False
                self._steam_api_last_error = str(err)
                self._steam_api_status = "error"
                decky.logger.warning("Steam Web API watcher error: %s", err)

            await asyncio.sleep(STEAM_API_POLL_INTERVAL_SECONDS)

        self._steam_api_running = False
