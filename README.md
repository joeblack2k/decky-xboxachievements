# SANSO - SteamAchievementNotifierForSteamOS

Decky Loader plugin that displays an Xbox-style SteamOS achievement popup with separate normal/rare sounds.

## Features

- Xbox-style popup rendered through a gamescope overlay for in-game visibility
- Normal and rare sound dropdowns populated from `.wav` files in `assets/sounds`
- Optional Steamworks fast watcher inspired by Steam Achievement Notifier
- Fast SteamOS achievement detection via local `inotify` events
- Safety reconciliation scan for missed local filesystem events
- Optional Steam Web API fallback polling for recent games
- Manual normal and rare popup test buttons

## Project Structure

```text
assets/        # audio assets, including assets/sounds dropdown sources
dist/          # frontend build output loaded by Decky
src/           # Decky frontend source
main.py        # Decky backend (watchers + settings + audio playback + overlay trigger)
sanso_gamescope_overlay.py # Gamescope external overlay helper for the Xbox popup
steamworks_probe.py # Optional Steamworks ctypes helper for active games
plugin.json    # Decky manifest
```

## Development

```bash
pnpm install
pnpm build
python3 -m py_compile main.py steamworks_probe.py sanso_gamescope_overlay.py
```

Deploy helper:

```bash
./deploy.sh
```

Default deploy target:

```text
/home/deck/homebrew/plugins/SANSO
```

## Notes

- Settings are stored in `/home/deck/homebrew/settings/SANSO/settings.json`.
- The old `/home/deck/homebrew/settings/XboxAchievements/steam_web_api_key` path remains supported for API-key compatibility.
- The plugin emits frontend event `xboxachievements_show` internally for compatibility with the existing backend/frontend flow.
- Backend methods include `test_popup_main`, `test_popup_rare`, `get_status`, `get_settings`, `set_settings`, and `list_sounds`.
- Steamworks fast watch is the lowest-latency path when a running game exposes `SteamAppId`/`SteamGameId` in its process environment.
- SteamOS/Linux `inotify` remains the robust local fallback.
- Steam Web API is optional and used only as a fallback/diagnostic source.

## AI Disclosure

Parts of this plugin were developed with AI-assisted coding support.
All generated code and content were manually reviewed, edited, and tested before publication.
