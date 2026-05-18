# SANSO - SteamAchievementNotifierForSteamOS

SANSO is a Decky Loader plugin for Steam Deck / SteamOS. It shows Xbox-style Steam achievement popups in-game, with normal and rare achievement sounds.

SANSO is not in the Decky Store yet, so you install it manually.

## What You Need

- A Steam Deck or SteamOS device.
- Decky Loader installed.
- A working internet connection on the Steam Deck.
- About 5 minutes.

If Decky Loader is not installed yet, install it first from:

[https://decky.xyz](https://decky.xyz)

## Install SANSO

This is the easiest method. You only need to copy and paste commands.

1. Hold the power button on your Steam Deck.
2. Choose `Switch to Desktop`.
3. Open the app called `Konsole`.
4. Copy this whole block and paste it into Konsole:

```bash
mkdir -p ~/homebrew/plugins
cd ~/Downloads
rm -rf SANSO.zip decky-xboxachievements-main
curl -L https://github.com/joeblack2k/decky-xboxachievements/archive/refs/heads/main.zip -o SANSO.zip
unzip SANSO.zip
rm -rf ~/homebrew/plugins/SANSO
mv decky-xboxachievements-main ~/homebrew/plugins/SANSO
chmod +x ~/homebrew/plugins/SANSO/sanso_gamescope_overlay.py
```

5. Restart Decky Loader with this command:

```bash
sudo systemctl restart plugin_loader
```

6. If SteamOS asks for a password, enter your Deck sudo password.
7. If you do not know the sudo password, just restart the Steam Deck instead.
8. Go back to Gaming Mode.
9. Open the Decky menu.
10. You should see `SANSO`.

The plugin folder must be exactly here:

```text
/home/deck/homebrew/plugins/SANSO
```

Do not put it in `Downloads`, and do not leave it inside another folder like `decky-xboxachievements-main/SANSO`.

## Manual Install With Dolphin

Use this if you do not want to paste commands.

1. Switch to Desktop Mode.
2. Open this page in a browser:

[https://github.com/joeblack2k/decky-xboxachievements](https://github.com/joeblack2k/decky-xboxachievements)

3. Press the green `Code` button.
4. Press `Download ZIP`.
5. Open the downloaded ZIP in Dolphin.
6. Extract it.
7. Rename the extracted folder to:

```text
SANSO
```

8. Move that `SANSO` folder to:

```text
/home/deck/homebrew/plugins/
```

The final path should look like this:

```text
/home/deck/homebrew/plugins/SANSO/plugin.json
/home/deck/homebrew/plugins/SANSO/main.py
/home/deck/homebrew/plugins/SANSO/dist/index.js
```

9. Restart the Steam Deck.
10. Open Decky in Gaming Mode and look for `SANSO`.

## Update SANSO

To update to the newest GitHub version:

1. Switch to Desktop Mode.
2. Open `Konsole`.
3. Paste this:

```bash
cd ~/Downloads
rm -rf SANSO.zip decky-xboxachievements-main
curl -L https://github.com/joeblack2k/decky-xboxachievements/archive/refs/heads/main.zip -o SANSO.zip
unzip SANSO.zip
rm -rf ~/homebrew/plugins/SANSO
mv decky-xboxachievements-main ~/homebrew/plugins/SANSO
chmod +x ~/homebrew/plugins/SANSO/sanso_gamescope_overlay.py
sudo systemctl restart plugin_loader
```

If the last command asks for a password you do not know, restart the Steam Deck instead.

Your SANSO settings are stored separately, so updating the plugin should not remove your settings.

Settings are stored here:

```text
/home/deck/homebrew/settings/SANSO/settings.json
```

## Remove SANSO

1. Switch to Desktop Mode.
2. Open `Konsole`.
3. Paste this:

```bash
rm -rf ~/homebrew/plugins/SANSO
sudo systemctl restart plugin_loader
```

If you cannot use `sudo`, restart the Steam Deck after deleting the folder.

## Settings

Inside the Decky menu, SANSO has settings for:

- Popup size from `0%` to `100%`.
- Volume from `0%` to `100%`.
- Normal achievement sound.
- Rare achievement sound.
- Normal popup gradient colors.
- Rare popup gradient colors.

Default size is `50%`.

Default volume is `50%`.

## Troubleshooting

If SANSO does not appear in Decky:

- Check that the folder is exactly `/home/deck/homebrew/plugins/SANSO`.
- Check that `/home/deck/homebrew/plugins/SANSO/plugin.json` exists.
- Restart the Steam Deck.

If you hear the sound but do not see the popup:

- Open SANSO settings.
- Make sure popup size is not `0%`.
- Press `Test XBOX Popup`.
- Restart the Steam Deck if it still does not show.

If achievement popups repeat after a restart:

- Update SANSO to the newest GitHub version.
- Restart the Steam Deck.

## Features

- Xbox-style achievement popup in-game.
- Real Steam achievement icon when Steam has one available.
- Special rare achievement animation.
- Normal and rare `.wav` sounds.
- Fast local SteamOS achievement detection.
- Optional Steam Web API fallback.
- Manual test buttons inside Decky.

## For Developers

```bash
pnpm install
pnpm build
python3 -m py_compile main.py steamworks_probe.py sanso_gamescope_overlay.py
```

Default deploy target:

```text
/home/deck/homebrew/plugins/SANSO
```

## AI Disclosure

Parts of this plugin were developed with AI-assisted coding support. All generated code and content were manually reviewed, edited, and tested before publication.
