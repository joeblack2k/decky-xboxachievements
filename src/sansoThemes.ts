export const PLUGIN_NAME = "SANSO";
export const EVENT_NAME = "xboxachievements_show";
export const SETTINGS_EVENT = "sanso_settings_changed";
export const DEFAULT_NORMAL_SOUND = "unlock_preroll.wav";
export const DEFAULT_RARE_SOUND = "rare_preroll.wav";

export type SansoSettings = {
  normal_sound: string;
  rare_sound: string;
};

export type NotificationPayload = {
  title: string;
  subtitle: string;
  is_rare: boolean;
  timestamp: string;
};

export const DEFAULT_SETTINGS: SansoSettings = {
  normal_sound: DEFAULT_NORMAL_SOUND,
  rare_sound: DEFAULT_RARE_SOUND,
};
