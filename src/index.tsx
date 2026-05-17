import {
  addEventListener,
  call,
  definePlugin,
  removeEventListener,
  routerHook,
} from "@decky/api";
import {
  ButtonItem,
  PanelSection,
  PanelSectionRow,
  staticClasses,
} from "@decky/ui";
import { useCallback, useEffect, useState } from "react";
import { FaXbox } from "react-icons/fa";
import XboxNotification, { type NotificationPayload } from "./XboxNotification";

const GLOBAL_COMPONENT_NAME = "XboxAchievementsOverlay";
const EVENT_NAME = "xboxachievements_show";

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
  const [statusError, setStatusError] = useState<string | null>(null);
  const [lastEvent, setLastEvent] = useState<NotificationPayload | null>(null);
  const [pendingAction, setPendingAction] = useState<string | null>(null);

  const refreshStatus = useCallback(async () => {
    try {
      const next = await call<[], BackendStatus>("get_status");
      setStatus(next);
      setStatusError(null);
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
    const interval = window.setInterval(() => {
      void refreshStatus();
    }, 5000);

    return () => {
      window.clearInterval(interval);
      removeEventListener(EVENT_NAME, listener);
    };
  }, [refreshStatus]);

  const trigger = useCallback(
    async (method: "test_popup_main" | "test_popup_rare") => {
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
            onClick={() => void trigger("test_popup_rare")}
            layout="below"
            description="Toont de rare-variant met glow en rare geluid."
          >
            Test Rare
          </ButtonItem>
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
  routerHook.addGlobalComponent(GLOBAL_COMPONENT_NAME, XboxNotification);

  return {
    name: "Xbox Achievements",
    icon: <FaXbox />,
    alwaysRender: true,
    titleView: <div className={staticClasses.Title}>Xbox Achievements</div>,
    content: <StatusPanel />,
    onDismount() {
      routerHook.removeGlobalComponent(GLOBAL_COMPONENT_NAME);
    },
  };
});
