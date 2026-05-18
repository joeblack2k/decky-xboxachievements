export const PLUGIN_NAME = "SANSO";
export const EVENT_NAME = "xboxachievements_show";
export const SETTINGS_EVENT = "sanso_settings_changed";
export const DEFAULT_NORMAL_SOUND = "unlock_preroll.wav";
export const DEFAULT_RARE_SOUND = "rare_preroll.wav";

export type SansoSettings = {
  normal_sound: string;
  rare_sound: string;
  overlay_size_percent: number;
  volume_percent: number;
  normal_gradient_start: string;
  normal_gradient_end: string;
  rare_gradient_start: string;
  rare_gradient_end: string;
};

export type NotificationPayload = {
  title: string;
  subtitle: string;
  is_rare: boolean;
  timestamp: string;
  appid?: number | null;
  achievement_id?: string | null;
  icon_url?: string | null;
  icon_path?: string | null;
};

export const DEFAULT_SETTINGS: SansoSettings = {
  normal_sound: DEFAULT_NORMAL_SOUND,
  rare_sound: DEFAULT_RARE_SOUND,
  overlay_size_percent: 50,
  volume_percent: 50,
  normal_gradient_start: "hsla(35, 98%, 38%, 0.94)",
  normal_gradient_end: "hsla(30, 96%, 22%, 0.94)",
  rare_gradient_start: "hsla(43, 93%, 52%, 0.95)",
  rare_gradient_end: "hsla(35, 79%, 21%, 0.95)",
};
