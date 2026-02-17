# Xbox Achievements (Decky Loader)

Decky Loader plugin that displays Xbox-style achievement popups on Steam Deck and plays separate sound effects for normal and rare unlocks.

## Features

- Xbox-inspired popup animation and styling
- Separate `unlock.wav` and `rare.wav` playback
- Conservative local achievement detection (Steam logs + library cache watcher)
- Manual test buttons for normal and rare popups

## Project Structure

```text
assets/        # audio + visual assets used by the popup
dist/          # frontend build output loaded by Decky
src/           # Decky frontend source
main.py        # Decky backend (watchers + event + audio playback)
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
- The current implementation is intentionally API-free (local detection only).
- Audio files shipped in this repository are original plugin sounds generated for this project.
