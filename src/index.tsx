import {
  addEventListener,
  call,
  definePlugin,
  removeEventListener,
} from "@decky/api";
import {
  ButtonItem,
  DropdownItem,
  PanelSection,
  PanelSectionRow,
  SliderField,
  ColorPickerModal,
  showModal,
  staticClasses,
} from "@decky/ui";
import { useCallback, useEffect, useState } from "react";
import { FaSteam } from "react-icons/fa";
import {
  DEFAULT_SETTINGS,
  EVENT_NAME,
  SETTINGS_EVENT,
  type NotificationPayload,
  type SansoSettings,
} from "./sansoThemes";

type BackendStatus = {
  watcher_running: boolean;
  librarycache_watcher_running: boolean;
  watcher_mode: string;
  last_inotify_event_path: string | null;
  last_inotify_event_appid: number | null;
  last_queue_latency_ms: number | null;
  processed_inotify_events: number;
  fallback_scan_count: number;
  last_parse_retry_error: string | null;
  steam_api_running: boolean;
  steam_api_enabled: boolean;
  steam_api_status: string | null;
  steam_api_last_error: string | null;
  steam_api_last_appids: number[];
  steamworks_running: boolean;
  steamworks_status: string | null;
  steamworks_last_error: string | null;
  steamworks_last_appid: number | null;
  steamworks_last_process_pid: number | null;
  steamworks_unlock_count: number;
  steamworks_poll_interval_ms: number;
  settings: SansoSettings;
  librarycache_files_seen: number;
  last_match_timestamp: string | null;
  last_match_sample: string | null;
  last_match_source: string | null;
  last_scanned_appid: number | null;
  last_cache_mtime: number | null;
  last_new_unlock_ids: string[];
  last_cache_status: string | null;
  last_parse_error: string | null;
  log_path: string;
  librarycache_glob: string;
  duplicate_window_seconds: number;
};

type DropdownSelection = {
  data: string;
};

type ColorSettingKey =
  | "normal_gradient_start"
  | "normal_gradient_end"
  | "rare_gradient_start"
  | "rare_gradient_end";

const parseHsla = (value: string) => {
  const match = value.match(
    /hsla?\(\s*(\d+(?:\.\d+)?)\s*,\s*(\d+(?:\.\d+)?)%\s*,\s*(\d+(?:\.\d+)?)%\s*(?:,\s*(\d+(?:\.\d+)?)\s*)?\)/i,
  );
  if (!match) {
    return { h: 35, s: 98, l: 38, a: 0.94 };
  }

  return {
    h: Number(match[1]),
    s: Number(match[2]),
    l: Number(match[3]),
    a: match[4] ? Number(match[4]) : 1,
  };
};

const toErrorMessage = (value: unknown): string => {
  if (value instanceof Error) {
    return value.message;
  }
  return String(value);
};

const formatTimestamp = (value: string | null): string => {
  if (!value) {
    return "never";
  }
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) {
    return value;
  }
  return parsed.toLocaleString();
};

function StatusPanel() {
  const [status, setStatus] = useState<BackendStatus | null>(null);
  const [settings, setSettings] = useState<SansoSettings>(DEFAULT_SETTINGS);
  const [sounds, setSounds] = useState<string[]>([]);
  const [statusError, setStatusError] = useState<string | null>(null);
  const [lastEvent, setLastEvent] = useState<NotificationPayload | null>(null);
  const [pendingAction, setPendingAction] = useState<string | null>(null);

  const refreshStatus = useCallback(async () => {
    try {
      const next = await call<[], BackendStatus>("get_status");
      setStatus(next);
      setSettings(next.settings ?? DEFAULT_SETTINGS);
      setStatusError(null);
    } catch (error) {
      setStatusError(toErrorMessage(error));
    }
  }, []);

  const refreshSettings = useCallback(async () => {
    try {
      const [nextSettings, nextSounds] = await Promise.all([
        call<[], SansoSettings>("get_settings"),
        call<[], string[]>("list_sounds"),
      ]);
      setSettings(nextSettings);
      setSounds(nextSounds);
      window.dispatchEvent(new CustomEvent(SETTINGS_EVENT, { detail: nextSettings }));
    } catch (error) {
      setStatusError(toErrorMessage(error));
    }
  }, []);

  useEffect(() => {
    const listener = addEventListener<[NotificationPayload]>(
      EVENT_NAME,
      (payload) => {
        if (payload) {
          setLastEvent(payload);
        }
      },
    );

    void refreshStatus();
    void refreshSettings();
    const interval = window.setInterval(() => {
      void refreshStatus();
    }, 5000);

    return () => {
      window.clearInterval(interval);
      removeEventListener(EVENT_NAME, listener);
    };
  }, [refreshSettings, refreshStatus]);

  const updateSettings = useCallback(
    async (patch: Partial<SansoSettings>) => {
      setPendingAction("settings");
      try {
        const next = await call<[Partial<SansoSettings>], SansoSettings>(
          "set_settings",
          patch,
        );
        setSettings(next);
        window.dispatchEvent(new CustomEvent(SETTINGS_EVENT, { detail: next }));
        await refreshStatus();
      } finally {
        setPendingAction(null);
      }
    },
    [refreshStatus],
  );

  const openColorPicker = useCallback(
    (key: ColorSettingKey, title: string) => {
      const color = parseHsla(settings[key]);
      let modal: { Close: () => void } | undefined;
      modal = showModal(
        <ColorPickerModal
          closeModal={() => modal?.Close()}
          title={title}
          defaultH={color.h}
          defaultS={color.s}
          defaultL={color.l}
          defaultA={color.a}
          onConfirm={(nextColor) => {
            void updateSettings({ [key]: nextColor } as Partial<SansoSettings>);
          }}
        />,
      );
    },
    [settings, updateSettings],
  );

  const colorButton = (key: ColorSettingKey, label: string) => (
    <ButtonItem
      disabled={pendingAction !== null}
      onClick={() => openColorPicker(key, label)}
      layout="below"
      description={settings[key]}
    >
      <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
        <span>{label}</span>
        <span
          style={{
            width: "42px",
            height: "18px",
            borderRadius: "999px",
            background: settings[key],
            border: "1px solid rgba(255,255,255,0.5)",
            display: "inline-block",
          }}
        />
      </div>
    </ButtonItem>
  );

  const soundOptions = sounds.map((sound) => ({ data: sound, label: sound }));

  const trigger = useCallback(
    async (
      method:
        | "test_popup_main"
        | "test_popup_rare"
        | "test_xbox_popup",
    ) => {
      setPendingAction(method);
      try {
        await call<[], void>(method);
        await refreshStatus();
      } finally {
        setPendingAction(null);
      }
    },
    [refreshStatus],
  );

  return (
    <>
      <PanelSection title="Popup Tests">
        <PanelSectionRow>
          <ButtonItem
            disabled={pendingAction !== null}
            onClick={() => void trigger("test_popup_main")}
            layout="below"
            description="Toont de standaard Xbox achievement popup."
          >
            Test Main
          </ButtonItem>
        </PanelSectionRow>
        <PanelSectionRow>
          <ButtonItem
            disabled={pendingAction !== null}
            onClick={() => void trigger("test_xbox_popup")}
            layout="below"
            description="Toont de XBOX Achievement popup via de in-game gamescope overlay."
          >
            Test XBOX Popup
          </ButtonItem>
        </PanelSectionRow>
        <PanelSectionRow>
          <ButtonItem
            disabled={pendingAction !== null}
            onClick={() => void trigger("test_popup_rare")}
            layout="below"
            description="Toont de rare-variant met glow en rare geluid."
          >
            Test Rare
          </ButtonItem>
        </PanelSectionRow>
      </PanelSection>

      <PanelSection title="Settings">
        <PanelSectionRow>
          <SliderField
            label="Popup size"
            description="0% verbergt de banner; 50% is de huidige mooie maat."
            value={settings.overlay_size_percent}
            min={0}
            max={100}
            step={10}
            notchCount={11}
            showValue
            valueSuffix="%"
            disabled={pendingAction !== null}
            onChange={(value) =>
              void updateSettings({ overlay_size_percent: value })
            }
          />
        </PanelSectionRow>
        <PanelSectionRow>
          <SliderField
            label="Volume"
            description="50% is het huidige volume; 0% is stil."
            value={settings.volume_percent}
            min={0}
            max={100}
            step={10}
            notchCount={11}
            showValue
            valueSuffix="%"
            disabled={pendingAction !== null}
            onChange={(value) => void updateSettings({ volume_percent: value })}
          />
        </PanelSectionRow>
        <PanelSectionRow>
          <DropdownItem
            label="Normal sound"
            description="WAV voor normale achievements."
            rgOptions={soundOptions}
            selectedOption={settings.normal_sound}
            disabled={pendingAction !== null || soundOptions.length === 0}
            onChange={(selection: DropdownSelection) =>
              void updateSettings({ normal_sound: selection.data })
            }
          />
        </PanelSectionRow>
        <PanelSectionRow>
          <DropdownItem
            label="Rare sound"
            description="WAV voor rare achievements."
            rgOptions={soundOptions}
            selectedOption={settings.rare_sound}
            disabled={pendingAction !== null || soundOptions.length === 0}
            onChange={(selection: DropdownSelection) =>
              void updateSettings({ rare_sound: selection.data })
            }
          />
        </PanelSectionRow>
        <PanelSectionRow>
          <div
            style={{
              height: "18px",
              borderRadius: "999px",
              background: `linear-gradient(90deg, ${settings.normal_gradient_start}, ${settings.normal_gradient_end})`,
              border: "1px solid rgba(255,255,255,0.35)",
            }}
          />
        </PanelSectionRow>
        <PanelSectionRow>
          {colorButton("normal_gradient_start", "Normal gradient start")}
        </PanelSectionRow>
        <PanelSectionRow>
          {colorButton("normal_gradient_end", "Normal gradient end")}
        </PanelSectionRow>
        <PanelSectionRow>
          <div
            style={{
              height: "18px",
              borderRadius: "999px",
              background: `linear-gradient(90deg, ${settings.rare_gradient_start}, ${settings.rare_gradient_end})`,
              border: "1px solid rgba(255,255,255,0.35)",
            }}
          />
        </PanelSectionRow>
        <PanelSectionRow>
          {colorButton("rare_gradient_start", "Rare gradient start")}
        </PanelSectionRow>
        <PanelSectionRow>
          {colorButton("rare_gradient_end", "Rare gradient end")}
        </PanelSectionRow>
      </PanelSection>

      <PanelSection title="Watcher Status">
        <PanelSectionRow>
          <ButtonItem
            disabled={pendingAction !== null}
            onClick={() => void refreshStatus()}
            description="Handmatige refresh van backend status."
          >
            Refresh Status
          </ButtonItem>
        </PanelSectionRow>
        <PanelSectionRow>
          <div>
            <div>
              Log watcher: <strong>{status?.watcher_running ? "yes" : "no"}</strong>
            </div>
            <div>
              Cache watcher:{" "}
              <strong>{status?.librarycache_watcher_running ? "yes" : "no"}</strong>
            </div>
            <div>Watcher mode: {status?.watcher_mode ?? "-"}</div>
            <div>
              Inotify app: {status?.last_inotify_event_appid ?? "-"} / latency:{" "}
              {status?.last_queue_latency_ms ?? "-"}ms
            </div>
            <div>
              Inotify events: {status?.processed_inotify_events ?? 0} / fallback scans:{" "}
              {status?.fallback_scan_count ?? 0}
            </div>
            <div>Last inotify path: {status?.last_inotify_event_path ?? "-"}</div>
            <div>Parse retry: {status?.last_parse_retry_error ?? "-"}</div>
            <div>
              Steam API:{" "}
              <strong>
                {status?.steam_api_enabled
                  ? status.steam_api_running
                    ? "running"
                    : "enabled"
                  : "disabled"}
              </strong>
            </div>
            <div>Steam API status: {status?.steam_api_status ?? "-"}</div>
            <div>
              Steam API appids:{" "}
              {status?.steam_api_last_appids?.length
                ? status.steam_api_last_appids.join(", ")
                : "-"}
            </div>
            <div>Steam API error: {status?.steam_api_last_error ?? "-"}</div>
            <div>
              Steamworks:{" "}
              <strong>{status?.steamworks_running ? "running" : "idle"}</strong>
            </div>
            <div>
              Steamworks app: {status?.steamworks_last_appid ?? "-"} / poll:{" "}
              {status?.steamworks_poll_interval_ms ?? "-"}ms
            </div>
            <div>Theme: XBOX Achievement</div>
            <div>
              Sounds: {settings.normal_sound} / {settings.rare_sound}
            </div>
            <div>
              Size/volume: {settings.overlay_size_percent}% / {settings.volume_percent}%
            </div>
            <div>Steamworks status: {status?.steamworks_status ?? "-"}</div>
            <div>Steamworks unlocks: {status?.steamworks_unlock_count ?? 0}</div>
            <div>Steamworks error: {status?.steamworks_last_error ?? "-"}</div>
            <div>Last match: {formatTimestamp(status?.last_match_timestamp ?? null)}</div>
            <div>Last source: {status?.last_match_source ?? "-"}</div>
            <div>
              Duplicate window: {status?.duplicate_window_seconds ?? "?"}s
            </div>
            <div>Log path: {status?.log_path ?? "unknown"}</div>
            <div>Cache files seen: {status?.librarycache_files_seen ?? "?"}</div>
            <div>Cache glob: {status?.librarycache_glob ?? "unknown"}</div>
            <div>Last scanned app: {status?.last_scanned_appid ?? "-"}</div>
            <div>Cache status: {status?.last_cache_status ?? "-"}</div>
            <div>
              Cache mtime:{" "}
              {status?.last_cache_mtime
                ? formatTimestamp(new Date(status.last_cache_mtime * 1000).toISOString())
                : "-"}
            </div>
            <div>
              New IDs:{" "}
              {status?.last_new_unlock_ids?.length
                ? status.last_new_unlock_ids.join(", ")
                : "-"}
            </div>
            <div>Parse note: {status?.last_parse_error ?? "-"}</div>
            <div>Sample: {status?.last_match_sample ?? "-"}</div>
            <div>
              Last event:{" "}
              {lastEvent
                ? `${lastEvent.title} @ ${formatTimestamp(lastEvent.timestamp)}`
                : "none"}
            </div>
            {statusError ? (
              <div style={{ color: "#ff8a80" }}>Status error: {statusError}</div>
            ) : null}
          </div>
        </PanelSectionRow>
      </PanelSection>
    </>
  );
}

export default definePlugin(() => {
  return {
    name: "SANSO",
    icon: <FaSteam />,
    alwaysRender: true,
    titleView: <div className={staticClasses.Title}>SANSO</div>,
    content: <StatusPanel />,
  };
});
