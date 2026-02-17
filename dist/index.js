const manifest = {"name":"Xbox Achievements"};
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
const routerHook = api.routerHook;
const toaster = api.toaster;
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
function FaXbox (props) {
  return GenIcon({"attr":{"viewBox":"0 0 512 512"},"child":[{"tag":"path","attr":{"d":"M369.9 318.2c44.3 54.3 64.7 98.8 54.4 118.7-7.9 15.1-56.7 44.6-92.6 55.9-29.6 9.3-68.4 13.3-100.4 10.2-38.2-3.7-76.9-17.4-110.1-39C93.3 445.8 87 438.3 87 423.4c0-29.9 32.9-82.3 89.2-142.1 32-33.9 76.5-73.7 81.4-72.6 9.4 2.1 84.3 75.1 112.3 109.5zM188.6 143.8c-29.7-26.9-58.1-53.9-86.4-63.4-15.2-5.1-16.3-4.8-28.7 8.1-29.2 30.4-53.5 79.7-60.3 122.4-5.4 34.2-6.1 43.8-4.2 60.5 5.6 50.5 17.3 85.4 40.5 120.9 9.5 14.6 12.1 17.3 9.3 9.9-4.2-11-.3-37.5 9.5-64 14.3-39 53.9-112.9 120.3-194.4zm311.6 63.5C483.3 127.3 432.7 77 425.6 77c-7.3 0-24.2 6.5-36 13.9-23.3 14.5-41 31.4-64.3 52.8C367.7 197 427.5 283.1 448.2 346c6.8 20.7 9.7 41.1 7.4 52.3-1.7 8.5-1.7 8.5 1.4 4.6 6.1-7.7 19.9-31.3 25.4-43.5 7.4-16.2 15-40.2 18.6-58.7 4.3-22.5 3.9-70.8-.8-93.4zM141.3 43C189 40.5 251 77.5 255.6 78.4c.7.1 10.4-4.2 21.6-9.7 63.9-31.1 94-25.8 107.4-25.2-63.9-39.3-152.7-50-233.9-11.7-23.4 11.1-24 11.9-9.4 11.2z"},"child":[]}]})(props);
}

function styleInject(css, ref) {
  if ( ref === void 0 ) ref = {};
  var insertAt = ref.insertAt;

  if (typeof document === 'undefined') { return; }

  var head = document.head || document.getElementsByTagName('head')[0];
  var style = document.createElement('style');
  style.type = 'text/css';

  if (insertAt === 'top') {
    if (head.firstChild) {
      head.insertBefore(style, head.firstChild);
    } else {
      head.appendChild(style);
    }
  } else {
    head.appendChild(style);
  }

  if (style.styleSheet) {
    style.styleSheet.cssText = css;
  } else {
    style.appendChild(document.createTextNode(css));
  }
}

var css_248z = ".xboxachv-stage{display:grid;inset:0;padding-bottom:108px;place-items:end center;pointer-events:none;position:fixed;z-index:2147483000}.xboxachv-wrapper{--notifywidth:min(420px,calc(100vw - 28px));--notifyheight:60px;--transition:420ms;--displaytime:5200ms;--xbox-main:#107c10;--xbox-dark:#0f4f0f;--xbox-border:hsla(0,0%,100%,.18);filter:drop-shadow(0 10px 20px rgba(0,0,0,.45));height:var(--notifyheight);width:var(--notifywidth)}.xboxachv-achcont{--start:68px;align-items:center;animation:xboxachv-shell-seq var(--displaytime) cubic-bezier(.2,.8,.2,1) both;border-radius:30px;display:grid;grid-template-columns:auto 1fr;height:100%;isolation:isolate;opacity:0;overflow:hidden;position:relative;width:var(--start)}.xboxachv-bg{animation:xboxachv-bg-seq var(--displaytime) linear both;background:linear-gradient(105deg,var(--xbox-main),var(--xbox-dark));border:1px solid var(--xbox-border);border-radius:inherit;inset:0;opacity:0;position:absolute}.xboxachv-overlay{animation:xboxachv-overlay-sweep 1.6s linear 1.6s 2;background:#fff;filter:blur(30px);height:calc(var(--notifyheight)*2);left:50%;max-width:240px;opacity:0;position:absolute;top:50%;transform:skew(-28deg,0deg);translate:-145% -50%;width:28vw}.xboxachv-iconbg{animation:xboxachv-iconbg-seq var(--displaytime) linear both;background:linear-gradient(140deg,#1b8f1a,#116010);border-radius:28px;height:56px;margin-left:6px;scale:0;transform-origin:center;width:56px}.xboxachv-achiconwrapper{display:grid;height:56px;left:6px;place-items:center;position:absolute;top:2px;width:56px}.xboxachv-achiconwrapper:after,.xboxachv-achiconwrapper:before{border-radius:999px;content:\"\";display:none;inset:4px;position:absolute;z-index:-1}.xboxachv-rare .xboxachv-achiconwrapper:after,.xboxachv-rare .xboxachv-achiconwrapper:before{display:block}.xboxachv-rare .xboxachv-achiconwrapper:before{animation:xboxachv-rare-rotate 6.2s linear infinite reverse;background:conic-gradient(from 0deg,hsla(40,87%,68%,.95),hsla(40,87%,68%,.2),hsla(40,87%,68%,.95))}.xboxachv-rare .xboxachv-achiconwrapper:after{animation:xboxachv-rare-rotate 2.8s linear infinite;background:repeating-conic-gradient(rgba(255,216,132,.6),rgba(255,216,132,.04) 20deg);filter:blur(10px);inset:2px;mix-blend-mode:overlay}.xboxachv-iconborder{animation:xboxachv-iconpulse-seq var(--displaytime) linear both;border:1px solid hsla(0,0%,100%,.18);border-radius:999px;inset:6px;opacity:0;position:absolute}.xboxachv-icon{animation:xboxachv-iconpulse-seq var(--displaytime) linear both;background:hsla(0,0%,100%,.92);border-radius:999px;color:#0f6111;display:grid;height:40px;opacity:0;place-items:center;transform:scale(.78);width:40px}.xboxachv-achcontent{align-content:center;color:#f0fbf0;display:grid;font-family:Segoe UI,Noto Sans,Roboto,sans-serif;margin-left:10px;margin-right:12px;min-width:0;row-gap:1px;text-shadow:0 1px 1px rgba(0,0,0,.5)}.xboxachv-achcontent>span{min-width:0;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}.xboxachv-title,.xboxachv-unlockmsg{animation:xboxachv-toptext-seq var(--displaytime) linear both;opacity:0;transform:translateY(18px)}.xboxachv-unlockmsg{color:hsla(0,0%,100%,.95);font-size:12px}.xboxachv-title{font-size:13px;font-weight:700}.xboxachv-desc{animation:xboxachv-desc-seq var(--displaytime) linear both;font-size:12px;opacity:0;transform:translateY(110%)}.xboxachv-time{animation:xboxachv-time-seq var(--displaytime) linear both;bottom:7px;color:hsla(0,0%,100%,.7);font-size:10px;opacity:0;position:absolute;right:14px}.xboxachv-rare .xboxachv-bg{--xbox-border:hsla(40,87%,68%,.6);background:linear-gradient(108deg,#4b3d17,#2f240f)}.xboxachv-rare .xboxachv-iconbg{background:linear-gradient(140deg,#8a6a29,#5f471a)}.xboxachv-rare .xboxachv-icon{color:#6b4f18}@keyframes xboxachv-shell-seq{0%{opacity:0;transform:translateY(18px);width:var(--start)}8%{opacity:1}24%{opacity:1;transform:translateY(0);width:var(--notifywidth)}82%{opacity:1;transform:translateY(0);width:var(--notifywidth)}to{opacity:0;transform:translateY(18px);width:var(--start)}}@keyframes xboxachv-bg-seq{0%{opacity:0}16%{opacity:1}82%{opacity:1}to{opacity:0}}@keyframes xboxachv-overlay-sweep{0%{opacity:0;translate:-145% -50%}45%{opacity:.24;translate:0 -50%}to{opacity:0;translate:110% -50%}}@keyframes xboxachv-iconbg-seq{0%{scale:0}10%{scale:1}84%{scale:1}to{scale:0}}@keyframes xboxachv-iconpulse-seq{0%{opacity:0;transform:scale(.78)}14%{opacity:1;transform:scale(1)}78%{opacity:1;transform:scale(1)}to{opacity:0;transform:scale(.84)}}@keyframes xboxachv-toptext-seq{0%{opacity:0;transform:translateY(18px)}30%{opacity:1;transform:translateY(0)}48%{opacity:1;transform:translateY(0)}58%{opacity:0;transform:translateY(-18px)}to{opacity:0;transform:translateY(-18px)}}@keyframes xboxachv-desc-seq{0%{opacity:0;transform:translateY(110%)}42%{opacity:0;transform:translateY(110%)}58%{opacity:1;transform:translateY(0)}84%{opacity:1;transform:translateY(0)}to{opacity:0;transform:translateY(-18px)}}@keyframes xboxachv-time-seq{0%{opacity:0}58%{opacity:0}68%{opacity:1}90%{opacity:1}to{opacity:0}}@keyframes xboxachv-rare-rotate{to{transform:rotate(1turn)}}";
styleInject(css_248z);

const EVENT_NAME$1 = "xboxachievements_show";
const SHOW_MS = 5200;
const SHADOW_STYLE_ID = "xboxachv-shadow-style";
const TARGET_DOC_STYLE_ID = "xboxachv-targetdoc-style";
const STYLE_SENTINEL = ".xboxachv-stage{";
const defaultPayload = {
    title: "Achievement Unlocked",
    subtitle: "Waiting for events...",
    is_rare: false,
    timestamp: new Date().toISOString(),
};
const formatClock = (timestamp) => {
    const parsed = new Date(timestamp);
    if (Number.isNaN(parsed.getTime())) {
        return timestamp;
    }
    return parsed.toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
    });
};
const trimSubtitle = (value) => {
    const normalized = value.trim();
    if (normalized.length <= 120) {
        return normalized;
    }
    return `...${normalized.slice(-117)}`;
};
function XboxNotification() {
    const stageRef = SP_REACT.useRef(null);
    const hideTimer = SP_REACT.useRef(null);
    const [payload, setPayload] = SP_REACT.useState(defaultPayload);
    const [active, setActive] = SP_REACT.useState(false);
    const [runKey, setRunKey] = SP_REACT.useState(0);
    SP_REACT.useEffect(() => {
        const onNotify = (nextPayload) => {
            if (!nextPayload) {
                return;
            }
            if (hideTimer.current !== null) {
                window.clearTimeout(hideTimer.current);
            }
            setPayload(nextPayload);
            setRunKey((value) => value + 1);
            setActive(false);
            window.requestAnimationFrame(() => {
                setActive(true);
            });
            hideTimer.current = window.setTimeout(() => {
                setActive(false);
            }, SHOW_MS);
        };
        const registered = addEventListener(EVENT_NAME$1, onNotify);
        return () => {
            if (hideTimer.current !== null) {
                window.clearTimeout(hideTimer.current);
            }
            removeEventListener(EVENT_NAME$1, registered);
        };
    }, []);
    SP_REACT.useLayoutEffect(() => {
        const stage = stageRef.current;
        if (!stage) {
            return;
        }
        const sourceStyle = Array.from(document.querySelectorAll("style")).find((node) => node.textContent?.includes(STYLE_SENTINEL));
        const cssText = sourceStyle?.textContent;
        if (!cssText) {
            return;
        }
        const ownerDocument = stage.ownerDocument;
        if (!ownerDocument.getElementById(TARGET_DOC_STYLE_ID)) {
            const targetDocStyle = ownerDocument.createElement("style");
            targetDocStyle.id = TARGET_DOC_STYLE_ID;
            targetDocStyle.textContent = cssText;
            ownerDocument.head?.appendChild(targetDocStyle);
        }
        const root = stage.getRootNode();
        if (root instanceof ShadowRoot && !root.getElementById(SHADOW_STYLE_ID)) {
            const shadowStyle = ownerDocument.createElement("style");
            shadowStyle.id = SHADOW_STYLE_ID;
            shadowStyle.textContent = cssText;
            root.appendChild(shadowStyle);
        }
    }, [active, runKey]);
    const subtitle = SP_REACT.useMemo(() => trimSubtitle(payload.subtitle), [payload.subtitle]);
    const clock = SP_REACT.useMemo(() => formatClock(payload.timestamp), [payload.timestamp]);
    const unlockMessage = payload.is_rare
        ? "Rare Achievement Unlocked"
        : "Achievement Unlocked";
    const normalizedUnlockMessage = unlockMessage.trim().toLowerCase();
    const normalizedTitle = payload.title.trim().toLowerCase();
    const normalizedSubtitle = subtitle.trim().toLowerCase();
    const showTitle = normalizedTitle.length > 0 && normalizedTitle !== normalizedUnlockMessage;
    const showSubtitle = normalizedSubtitle.length > 0 &&
        normalizedSubtitle !== normalizedUnlockMessage &&
        normalizedSubtitle !== normalizedTitle;
    if (!active) {
        return null;
    }
    return (SP_JSX.jsx("div", { ref: stageRef, className: "xboxachv-stage", "aria-live": "polite", children: SP_JSX.jsx("div", { className: `xboxachv-wrapper ${payload.is_rare ? "xboxachv-rare" : ""}`, children: SP_JSX.jsxs("div", { className: "xboxachv-achcont", children: [SP_JSX.jsx("div", { className: "xboxachv-bg", children: SP_JSX.jsx("div", { className: "xboxachv-overlay" }) }), SP_JSX.jsx("div", { className: "xboxachv-iconbg" }), SP_JSX.jsxs("div", { className: "xboxachv-achiconwrapper", children: [SP_JSX.jsx("div", { className: "xboxachv-iconborder" }), SP_JSX.jsx("div", { className: "xboxachv-icon", children: SP_JSX.jsx(FaXbox, { size: 24 }) })] }), SP_JSX.jsxs("div", { className: "xboxachv-achcontent", children: [SP_JSX.jsx("span", { className: "xboxachv-unlockmsg", children: unlockMessage }), showTitle ? SP_JSX.jsx("span", { className: "xboxachv-title", children: payload.title }) : null, showSubtitle ? SP_JSX.jsx("span", { className: "xboxachv-desc", children: subtitle }) : null] }), SP_JSX.jsx("span", { className: "xboxachv-time", children: clock })] }) }, runKey) }));
}

const GLOBAL_COMPONENT_NAME = "XboxAchievementsOverlay";
const EVENT_NAME = "xboxachievements_show";
let overlayToastListener = null;
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
    const [statusError, setStatusError] = SP_REACT.useState(null);
    const [lastEvent, setLastEvent] = SP_REACT.useState(null);
    const [pendingAction, setPendingAction] = SP_REACT.useState(null);
    const refreshStatus = SP_REACT.useCallback(async () => {
        try {
            const next = await call("get_status");
            setStatus(next);
            setStatusError(null);
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
        const interval = window.setInterval(() => {
            void refreshStatus();
        }, 5000);
        return () => {
            window.clearInterval(interval);
            removeEventListener(EVENT_NAME, listener);
        };
    }, [refreshStatus]);
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
    return (SP_JSX.jsxs(SP_JSX.Fragment, { children: [SP_JSX.jsxs(DFL.PanelSection, { title: "Popup Tests", children: [SP_JSX.jsx(DFL.PanelSectionRow, { children: SP_JSX.jsx(DFL.ButtonItem, { disabled: pendingAction !== null, onClick: () => void trigger("test_popup_main"), layout: "below", description: "Toont de standaard Xbox achievement popup.", children: "Test Main" }) }), SP_JSX.jsx(DFL.PanelSectionRow, { children: SP_JSX.jsx(DFL.ButtonItem, { disabled: pendingAction !== null, onClick: () => void trigger("test_popup_rare"), layout: "below", description: "Toont de rare-variant met glow en rare geluid.", children: "Test Rare" }) })] }), SP_JSX.jsxs(DFL.PanelSection, { title: "Watcher Status", children: [SP_JSX.jsx(DFL.PanelSectionRow, { children: SP_JSX.jsx(DFL.ButtonItem, { disabled: pendingAction !== null, onClick: () => void refreshStatus(), description: "Handmatige refresh van backend status.", children: "Refresh Status" }) }), SP_JSX.jsx(DFL.PanelSectionRow, { children: SP_JSX.jsxs("div", { children: [SP_JSX.jsxs("div", { children: ["Log watcher: ", SP_JSX.jsx("strong", { children: status?.watcher_running ? "yes" : "no" })] }), SP_JSX.jsxs("div", { children: ["Cache watcher:", " ", SP_JSX.jsx("strong", { children: status?.librarycache_watcher_running ? "yes" : "no" })] }), SP_JSX.jsxs("div", { children: ["Last match: ", formatTimestamp(status?.last_match_timestamp ?? null)] }), SP_JSX.jsxs("div", { children: ["Last source: ", status?.last_match_source ?? "-"] }), SP_JSX.jsxs("div", { children: ["Duplicate window: ", status?.duplicate_window_seconds ?? "?", "s"] }), SP_JSX.jsxs("div", { children: ["Log path: ", status?.log_path ?? "unknown"] }), SP_JSX.jsxs("div", { children: ["Cache files seen: ", status?.librarycache_files_seen ?? "?"] }), SP_JSX.jsxs("div", { children: ["Cache glob: ", status?.librarycache_glob ?? "unknown"] }), SP_JSX.jsxs("div", { children: ["Sample: ", status?.last_match_sample ?? "-"] }), SP_JSX.jsxs("div", { children: ["Last event:", " ", lastEvent
                                            ? `${lastEvent.title} @ ${formatTimestamp(lastEvent.timestamp)}`
                                            : "none"] }), statusError ? (SP_JSX.jsxs("div", { style: { color: "#ff8a80" }, children: ["Status error: ", statusError] })) : null] }) })] })] }));
}
var index = definePlugin(() => {
    if (overlayToastListener === null) {
        overlayToastListener = addEventListener(EVENT_NAME, (payload) => {
            if (!payload) {
                return;
            }
            toaster.toast({
                title: payload.title,
                body: payload.subtitle,
                duration: 4200,
                showToast: true,
                playSound: false,
            });
        });
    }
    routerHook.addGlobalComponent(GLOBAL_COMPONENT_NAME, XboxNotification);
    return {
        name: "Xbox Achievements",
        icon: SP_JSX.jsx(FaXbox, {}),
        alwaysRender: true,
        titleView: SP_JSX.jsx("div", { className: DFL.staticClasses.Title, children: "Xbox Achievements" }),
        content: SP_JSX.jsx(StatusPanel, {}),
        onDismount() {
            routerHook.removeGlobalComponent(GLOBAL_COMPONENT_NAME);
            if (overlayToastListener !== null) {
                removeEventListener(EVENT_NAME, overlayToastListener);
                overlayToastListener = null;
            }
        },
    };
});

export { index as default };
//# sourceMappingURL=index.js.map
