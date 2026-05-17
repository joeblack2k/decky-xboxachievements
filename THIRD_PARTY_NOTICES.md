# Third-Party Notices

This project uses open-source libraries via npm/pnpm.

## Decky Plugin Template

- Resource: `decky-plugin-template`
- License: BSD-3-Clause
- Source: https://github.com/SteamDeckHomebrew/decky-plugin-template
- Note: Development used Decky template conventions/starter patterns.
- Included license text: `LICENSE` (section: "Upstream Template License").

## React Icons

- Package: `react-icons`
- License: MIT
- Source: https://github.com/react-icons/react-icons

## Steam Achievement Notifier Theme Assets

- Resource: Steam Achievement Notifier notification presets, fonts, and images
- Source: https://github.com/SteamAchievementNotifier/SteamAchievementNotifier
- Vendored from commit: `4ba6a665c5bd36deac5fad746b74a3ee9b1daa90`
- Note: SANSO vendors concrete notification preset HTML/CSS/assets for SteamOS theme compatibility and does not vendor the full SAN application.
- License note: the upstream repository did not include a root license file or package license field at the vendored commit. Keep this notice with any redistributed theme assets and review upstream licensing if publishing outside this repository.

## Vendored SAN Fonts

- Font licenses are included under `san-themes/fonts/Licenses/`.
- Most bundled SAN fonts are distributed under the SIL Open Font License by their respective authors.

## Decky Libraries

- Package: `@decky/api`
- Package: `@decky/ui`
- Package: `@decky/rollup`
- Source: https://github.com/SteamDeckHomebrew

Please refer to `pnpm-lock.yaml` for the full resolved dependency list and versions.
