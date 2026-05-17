export const PLUGIN_NAME = "SANSO";
export const EVENT_NAME = "xboxachievements_show";
export const SETTINGS_EVENT = "sanso_settings_changed";
export const DEFAULT_THEME = "xbox-achievement";
export const DEFAULT_NORMAL_SOUND = "unlock_preroll.wav";
export const DEFAULT_RARE_SOUND = "rare_preroll.wav";

export type SansoSettings = {
  theme: string;
  normal_sound: string;
  rare_sound: string;
};

export type ThemeOption = {
  id: string;
  label: string;
  preset?: string;
};

export const DEFAULT_SETTINGS: SansoSettings = {
  theme: DEFAULT_THEME,
  normal_sound: DEFAULT_NORMAL_SOUND,
  rare_sound: DEFAULT_RARE_SOUND,
};

export const THEME_OPTIONS: ThemeOption[] = [
  { id: "xbox-achievement", label: "XBOX Achievement" },
  { id: "default", label: "Default", preset: "default" },
  { id: "xqjan", label: "xQjan", preset: "xqjan" },
  { id: "steamdeck", label: "The Deck", preset: "steamdeck" },
  { id: "epicgames", label: "Epic", preset: "epicgames" },
  { id: "xboxone", label: "XB Modern", preset: "xboxone" },
  { id: "xbox360", label: "XB Classic", preset: "xbox360" },
  { id: "ps5", label: "PS Modern", preset: "ps5" },
  { id: "ps4", label: "PS Classic", preset: "ps4" },
  { id: "ps3", label: "PS Retro", preset: "ps3" },
  { id: "windows", label: "Square", preset: "windows" },
  { id: "gfwl", label: "Aero", preset: "gfwl" },
];

export const themeById = (themeId: string): ThemeOption =>
  THEME_OPTIONS.find((theme) => theme.id === themeId) ?? THEME_OPTIONS[0];

export const pluginBaseUrl = (): string =>
  `http://127.0.0.1:1337/plugins/${encodeURIComponent(PLUGIN_NAME)}/dist/`;
