# Xbox Achievements (Decky Loader)

Decky Loader plugin that displays Xbox-style achievement popups on Steam Deck and plays separate sound effects for normal and rare unlocks.

## Features

- Xbox-inspired popup animation and styling
- Separate `unlock.wav` and `rare.wav` playback
- Optional Steamworks fast watcher inspired by Steam Achievement Notifier
- Fast SteamOS achievement detection via local `inotify` events
- Safety reconciliation scan for missed local filesystem events
- Optional Steam Web API fallback polling for recent games
- Manual test buttons for normal and rare popups

## Project Structure

```text
assets/        # audio + visual assets used by the popup
dist/          # frontend build output loaded by Decky
src/           # Decky frontend source
main.py        # Decky backend (watchers + event + audio playback)
steamworks_probe.py # Optional Steamworks ctypes helper for active games
plugin.json    # Decky manifest
```

## Development

```bash
pnpm install
pnpm build
python3 -m py_compile main.py
```

Deploy helper:

```bash
./deploy.sh
```

## Notes

- The plugin emits frontend event `xboxachievements_show`.
- Backend methods include `test_popup_main`, `test_popup_rare`, and `get_status`.
- Steamworks fast watch is the lowest-latency path when a running game exposes `SteamAppId`/`SteamGameId` in its process environment. It polls Steam's local Steamworks state through `/home/deck/.local/share/Steam/steamrt64/libsteam_api.so` without Node/Electron or extra Python packages.
- SteamOS/Linux `inotify` remains the robust local fallback. The plugin watches Steam `librarycache`, `appcache/stats`, and `stats_log.txt` changes and debounces local writes before parsing.
- A slow reconciliation scan still runs in the background so missed local filesystem events or Steam restarts do not permanently break detection.
- Steam Web API is optional and used only as a fallback/diagnostic source. Local cache/log detection remains the fastest path and does not wait for internet/API calls.
- To enable Steam Web API polling on Steam Deck, put your key in `/home/deck/homebrew/settings/XboxAchievements/steam_web_api_key` or set `STEAM_WEB_API_KEY` for `plugin_loader`. Do not commit API keys.
- Audio files shipped in this repository are original plugin sounds generated for this project.

## AI Disclosure

Parts of this plugin were developed with AI-assisted coding support.
All generated code and content were manually reviewed, edited, and tested before publication.
