const manifest = {"name":"SANSO"};
const API_VERSION = 2;
const internalAPIConnection = window.__DECKY_SECRET_INTERNALS_DO_NOT_USE_OR_YOU_WILL_BE_FIRED_deckyLoaderAPIInit;
if (!internalAPIConnection) {
    throw new Error('[@decky/api]: Failed to connect to the loader as as the loader API was not initialized. This is likely a bug in Decky Loader.');
}
let api;
try {
    api = internalAPIConnection.connect(API_VERSION, manifest.name);
}
catch {
    api = internalAPIConnection.connect(1, manifest.name);
    console.warn(`[@decky/api] Requested API version ${API_VERSION} but the running loader only supports version 1. Some features may not work.`);
}
if (api._version != API_VERSION) {
    console.warn(`[@decky/api] Requested API version ${API_VERSION} but the running loader only supports version ${api._version}. Some features may not work.`);
}
const call = api.call;
const addEventListener = api.addEventListener;
const removeEventListener = api.removeEventListener;
const definePlugin = (fn) => {
    return (...args) => {
        return fn(...args);
    };
};

var DefaultContext = {
  color: undefined,
  size: undefined,
  className: undefined,
  style: undefined,
  attr: undefined
};
var IconContext = SP_REACT.createContext && /*#__PURE__*/SP_REACT.createContext(DefaultContext);

var _excluded = ["attr", "size", "title"];
function _objectWithoutProperties(source, excluded) { if (source == null) return {}; var target = _objectWithoutPropertiesLoose(source, excluded); var key, i; if (Object.getOwnPropertySymbols) { var sourceSymbolKeys = Object.getOwnPropertySymbols(source); for (i = 0; i < sourceSymbolKeys.length; i++) { key = sourceSymbolKeys[i]; if (excluded.indexOf(key) >= 0) continue; if (!Object.prototype.propertyIsEnumerable.call(source, key)) continue; target[key] = source[key]; } } return target; }
function _objectWithoutPropertiesLoose(source, excluded) { if (source == null) return {}; var target = {}; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { if (excluded.indexOf(key) >= 0) continue; target[key] = source[key]; } } return target; }
function _extends() { _extends = Object.assign ? Object.assign.bind() : function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; }; return _extends.apply(this, arguments); }
function ownKeys(e, r) { var t = Object.keys(e); if (Object.getOwnPropertySymbols) { var o = Object.getOwnPropertySymbols(e); r && (o = o.filter(function (r) { return Object.getOwnPropertyDescriptor(e, r).enumerable; })), t.push.apply(t, o); } return t; }
function _objectSpread(e) { for (var r = 1; r < arguments.length; r++) { var t = null != arguments[r] ? arguments[r] : {}; r % 2 ? ownKeys(Object(t), true).forEach(function (r) { _defineProperty(e, r, t[r]); }) : Object.getOwnPropertyDescriptors ? Object.defineProperties(e, Object.getOwnPropertyDescriptors(t)) : ownKeys(Object(t)).forEach(function (r) { Object.defineProperty(e, r, Object.getOwnPropertyDescriptor(t, r)); }); } return e; }
function _defineProperty(obj, key, value) { key = _toPropertyKey(key); if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }
function _toPropertyKey(t) { var i = _toPrimitive(t, "string"); return "symbol" == typeof i ? i : i + ""; }
function _toPrimitive(t, r) { if ("object" != typeof t || !t) return t; var e = t[Symbol.toPrimitive]; if (void 0 !== e) { var i = e.call(t, r); if ("object" != typeof i) return i; throw new TypeError("@@toPrimitive must return a primitive value."); } return ("string" === r ? String : Number)(t); }
function Tree2Element(tree) {
  return tree && tree.map((node, i) => /*#__PURE__*/SP_REACT.createElement(node.tag, _objectSpread({
    key: i
  }, node.attr), Tree2Element(node.child)));
}
function GenIcon(data) {
  return props => /*#__PURE__*/SP_REACT.createElement(IconBase, _extends({
    attr: _objectSpread({}, data.attr)
  }, props), Tree2Element(data.child));
}
function IconBase(props) {
  var elem = conf => {
    var {
        attr,
        size,
        title
      } = props,
      svgProps = _objectWithoutProperties(props, _excluded);
    var computedSize = size || conf.size || "1em";
    var className;
    if (conf.className) className = conf.className;
    if (props.className) className = (className ? className + " " : "") + props.className;
    return /*#__PURE__*/SP_REACT.createElement("svg", _extends({
      stroke: "currentColor",
      fill: "currentColor",
      strokeWidth: "0"
    }, conf.attr, attr, svgProps, {
      className: className,
      style: _objectSpread(_objectSpread({
        color: props.color || conf.color
      }, conf.style), props.style),
      height: computedSize,
      width: computedSize,
      xmlns: "http://www.w3.org/2000/svg"
    }), title && /*#__PURE__*/SP_REACT.createElement("title", null, title), props.children);
  };
  return IconContext !== undefined ? /*#__PURE__*/SP_REACT.createElement(IconContext.Consumer, null, conf => elem(conf)) : elem(DefaultContext);
}

// THIS FILE IS AUTO GENERATED
function FaSteam (props) {
  return GenIcon({"attr":{"viewBox":"0 0 496 512"},"child":[{"tag":"path","attr":{"d":"M496 256c0 137-111.2 248-248.4 248-113.8 0-209.6-76.3-239-180.4l95.2 39.3c6.4 32.1 34.9 56.4 68.9 56.4 39.2 0 71.9-32.4 70.2-73.5l84.5-60.2c52.1 1.3 95.8-40.9 95.8-93.5 0-51.6-42-93.5-93.7-93.5s-93.7 42-93.7 93.5v1.2L176.6 279c-15.5-.9-30.7 3.4-43.5 12.1L0 236.1C10.2 108.4 117.1 8 247.6 8 384.8 8 496 119 496 256zM155.7 384.3l-30.5-12.6a52.79 52.79 0 0 0 27.2 25.8c26.9 11.2 57.8-1.6 69-28.4 5.4-13 5.5-27.3.1-40.3-5.4-13-15.5-23.2-28.5-28.6-12.9-5.4-26.7-5.2-38.9-.6l31.5 13c19.8 8.2 29.2 30.9 20.9 50.7-8.3 19.9-31 29.2-50.8 21zm173.8-129.9c-34.4 0-62.4-28-62.4-62.3s28-62.3 62.4-62.3 62.4 28 62.4 62.3-27.9 62.3-62.4 62.3zm.1-15.6c25.9 0 46.9-21 46.9-46.8 0-25.9-21-46.8-46.9-46.8s-46.9 21-46.9 46.8c.1 25.8 21.1 46.8 46.9 46.8z"},"child":[]}]})(props);
}

const EVENT_NAME = "xboxachievements_show";
const SETTINGS_EVENT = "sanso_settings_changed";
const DEFAULT_NORMAL_SOUND = "unlock_preroll.wav";
const DEFAULT_RARE_SOUND = "rare_preroll.wav";
const DEFAULT_SETTINGS = {
    normal_sound: DEFAULT_NORMAL_SOUND,
    rare_sound: DEFAULT_RARE_SOUND,
};

const toErrorMessage = (value) => {
    if (value instanceof Error) {
        return value.message;
    }
    return String(value);
};
const formatTimestamp = (value) => {
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
    const [status, setStatus] = SP_REACT.useState(null);
    const [settings, setSettings] = SP_REACT.useState(DEFAULT_SETTINGS);
    const [sounds, setSounds] = SP_REACT.useState([]);
    const [statusError, setStatusError] = SP_REACT.useState(null);
    const [lastEvent, setLastEvent] = SP_REACT.useState(null);
    const [pendingAction, setPendingAction] = SP_REACT.useState(null);
    const refreshStatus = SP_REACT.useCallback(async () => {
        try {
            const next = await call("get_status");
            setStatus(next);
            setSettings(next.settings ?? DEFAULT_SETTINGS);
            setStatusError(null);
        }
        catch (error) {
            setStatusError(toErrorMessage(error));
        }
    }, []);
    const refreshSettings = SP_REACT.useCallback(async () => {
        try {
            const [nextSettings, nextSounds] = await Promise.all([
                call("get_settings"),
                call("list_sounds"),
            ]);
            setSettings(nextSettings);
            setSounds(nextSounds);
            window.dispatchEvent(new CustomEvent(SETTINGS_EVENT, { detail: nextSettings }));
        }
        catch (error) {
            setStatusError(toErrorMessage(error));
        }
    }, []);
    SP_REACT.useEffect(() => {
        const listener = addEventListener(EVENT_NAME, (payload) => {
            if (payload) {
                setLastEvent(payload);
            }
        });
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
    const updateSettings = SP_REACT.useCallback(async (patch) => {
        setPendingAction("settings");
        try {
            const next = await call("set_settings", patch);
            setSettings(next);
            window.dispatchEvent(new CustomEvent(SETTINGS_EVENT, { detail: next }));
            await refreshStatus();
        }
        finally {
            setPendingAction(null);
        }
    }, [refreshStatus]);
    const soundOptions = sounds.map((sound) => ({ data: sound, label: sound }));
    const trigger = SP_REACT.useCallback(async (method) => {
        setPendingAction(method);
        try {
            await call(method);
            await refreshStatus();
        }
        finally {
            setPendingAction(null);
        }
    }, [refreshStatus]);
    return (SP_JSX.jsxs(SP_JSX.Fragment, { children: [SP_JSX.jsxs(DFL.PanelSection, { title: "Popup Tests", children: [SP_JSX.jsx(DFL.PanelSectionRow, { children: SP_JSX.jsx(DFL.ButtonItem, { disabled: pendingAction !== null, onClick: () => void trigger("test_popup_main"), layout: "below", description: "Toont de standaard Xbox achievement popup.", children: "Test Main" }) }), SP_JSX.jsx(DFL.PanelSectionRow, { children: SP_JSX.jsx(DFL.ButtonItem, { disabled: pendingAction !== null, onClick: () => void trigger("test_xbox_popup"), layout: "below", description: "Toont de XBOX Achievement popup via de in-game gamescope overlay.", children: "Test XBOX Popup" }) }), SP_JSX.jsx(DFL.PanelSectionRow, { children: SP_JSX.jsx(DFL.ButtonItem, { disabled: pendingAction !== null, onClick: () => void trigger("test_popup_rare"), layout: "below", description: "Toont de rare-variant met glow en rare geluid.", children: "Test Rare" }) })] }), SP_JSX.jsxs(DFL.PanelSection, { title: "Settings", children: [SP_JSX.jsx(DFL.PanelSectionRow, { children: SP_JSX.jsx(DFL.DropdownItem, { label: "Normal sound", description: "WAV voor normale achievements.", rgOptions: soundOptions, selectedOption: settings.normal_sound, disabled: pendingAction !== null || soundOptions.length === 0, onChange: (selection) => void updateSettings({ normal_sound: selection.data }) }) }), SP_JSX.jsx(DFL.PanelSectionRow, { children: SP_JSX.jsx(DFL.DropdownItem, { label: "Rare sound", description: "WAV voor rare achievements.", rgOptions: soundOptions, selectedOption: settings.rare_sound, disabled: pendingAction !== null || soundOptions.length === 0, onChange: (selection) => void updateSettings({ rare_sound: selection.data }) }) })] }), SP_JSX.jsxs(DFL.PanelSection, { title: "Watcher Status", children: [SP_JSX.jsx(DFL.PanelSectionRow, { children: SP_JSX.jsx(DFL.ButtonItem, { disabled: pendingAction !== null, onClick: () => void refreshStatus(), description: "Handmatige refresh van backend status.", children: "Refresh Status" }) }), SP_JSX.jsx(DFL.PanelSectionRow, { children: SP_JSX.jsxs("div", { children: [SP_JSX.jsxs("div", { children: ["Log watcher: ", SP_JSX.jsx("strong", { children: status?.watcher_running ? "yes" : "no" })] }), SP_JSX.jsxs("div", { children: ["Cache watcher:", " ", SP_JSX.jsx("strong", { children: status?.librarycache_watcher_running ? "yes" : "no" })] }), SP_JSX.jsxs("div", { children: ["Watcher mode: ", status?.watcher_mode ?? "-"] }), SP_JSX.jsxs("div", { children: ["Inotify app: ", status?.last_inotify_event_appid ?? "-", " / latency:", " ", status?.last_queue_latency_ms ?? "-", "ms"] }), SP_JSX.jsxs("div", { children: ["Inotify events: ", status?.processed_inotify_events ?? 0, " / fallback scans:", " ", status?.fallback_scan_count ?? 0] }), SP_JSX.jsxs("div", { children: ["Last inotify path: ", status?.last_inotify_event_path ?? "-"] }), SP_JSX.jsxs("div", { children: ["Parse retry: ", status?.last_parse_retry_error ?? "-"] }), SP_JSX.jsxs("div", { children: ["Steam API:", " ", SP_JSX.jsx("strong", { children: status?.steam_api_enabled
                                                ? status.steam_api_running
                                                    ? "running"
                                                    : "enabled"
                                                : "disabled" })] }), SP_JSX.jsxs("div", { children: ["Steam API status: ", status?.steam_api_status ?? "-"] }), SP_JSX.jsxs("div", { children: ["Steam API appids:", " ", status?.steam_api_last_appids?.length
                                            ? status.steam_api_last_appids.join(", ")
                                            : "-"] }), SP_JSX.jsxs("div", { children: ["Steam API error: ", status?.steam_api_last_error ?? "-"] }), SP_JSX.jsxs("div", { children: ["Steamworks:", " ", SP_JSX.jsx("strong", { children: status?.steamworks_running ? "running" : "idle" })] }), SP_JSX.jsxs("div", { children: ["Steamworks app: ", status?.steamworks_last_appid ?? "-", " / poll:", " ", status?.steamworks_poll_interval_ms ?? "-", "ms"] }), SP_JSX.jsx("div", { children: "Theme: XBOX Achievement" }), SP_JSX.jsxs("div", { children: ["Sounds: ", settings.normal_sound, " / ", settings.rare_sound] }), SP_JSX.jsxs("div", { children: ["Steamworks status: ", status?.steamworks_status ?? "-"] }), SP_JSX.jsxs("div", { children: ["Steamworks unlocks: ", status?.steamworks_unlock_count ?? 0] }), SP_JSX.jsxs("div", { children: ["Steamworks error: ", status?.steamworks_last_error ?? "-"] }), SP_JSX.jsxs("div", { children: ["Last match: ", formatTimestamp(status?.last_match_timestamp ?? null)] }), SP_JSX.jsxs("div", { children: ["Last source: ", status?.last_match_source ?? "-"] }), SP_JSX.jsxs("div", { children: ["Duplicate window: ", status?.duplicate_window_seconds ?? "?", "s"] }), SP_JSX.jsxs("div", { children: ["Log path: ", status?.log_path ?? "unknown"] }), SP_JSX.jsxs("div", { children: ["Cache files seen: ", status?.librarycache_files_seen ?? "?"] }), SP_JSX.jsxs("div", { children: ["Cache glob: ", status?.librarycache_glob ?? "unknown"] }), SP_JSX.jsxs("div", { children: ["Last scanned app: ", status?.last_scanned_appid ?? "-"] }), SP_JSX.jsxs("div", { children: ["Cache status: ", status?.last_cache_status ?? "-"] }), SP_JSX.jsxs("div", { children: ["Cache mtime:", " ", status?.last_cache_mtime
                                            ? formatTimestamp(new Date(status.last_cache_mtime * 1000).toISOString())
                                            : "-"] }), SP_JSX.jsxs("div", { children: ["New IDs:", " ", status?.last_new_unlock_ids?.length
                                            ? status.last_new_unlock_ids.join(", ")
                                            : "-"] }), SP_JSX.jsxs("div", { children: ["Parse note: ", status?.last_parse_error ?? "-"] }), SP_JSX.jsxs("div", { children: ["Sample: ", status?.last_match_sample ?? "-"] }), SP_JSX.jsxs("div", { children: ["Last event:", " ", lastEvent
                                            ? `${lastEvent.title} @ ${formatTimestamp(lastEvent.timestamp)}`
                                            : "none"] }), statusError ? (SP_JSX.jsxs("div", { style: { color: "#ff8a80" }, children: ["Status error: ", statusError] })) : null] }) })] })] }));
}
var index = definePlugin(() => {
    return {
        name: "SANSO",
        icon: SP_JSX.jsx(FaSteam, {}),
        alwaysRender: true,
        titleView: SP_JSX.jsx("div", { className: DFL.staticClasses.Title, children: "SANSO" }),
        content: SP_JSX.jsx(StatusPanel, {}),
    };
});

export { index as default };
//# sourceMappingURL=index.js.map
