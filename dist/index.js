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
const routerHook = api.routerHook;
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
}function FaXbox (props) {
  return GenIcon({"attr":{"viewBox":"0 0 512 512"},"child":[{"tag":"path","attr":{"d":"M369.9 318.2c44.3 54.3 64.7 98.8 54.4 118.7-7.9 15.1-56.7 44.6-92.6 55.9-29.6 9.3-68.4 13.3-100.4 10.2-38.2-3.7-76.9-17.4-110.1-39C93.3 445.8 87 438.3 87 423.4c0-29.9 32.9-82.3 89.2-142.1 32-33.9 76.5-73.7 81.4-72.6 9.4 2.1 84.3 75.1 112.3 109.5zM188.6 143.8c-29.7-26.9-58.1-53.9-86.4-63.4-15.2-5.1-16.3-4.8-28.7 8.1-29.2 30.4-53.5 79.7-60.3 122.4-5.4 34.2-6.1 43.8-4.2 60.5 5.6 50.5 17.3 85.4 40.5 120.9 9.5 14.6 12.1 17.3 9.3 9.9-4.2-11-.3-37.5 9.5-64 14.3-39 53.9-112.9 120.3-194.4zm311.6 63.5C483.3 127.3 432.7 77 425.6 77c-7.3 0-24.2 6.5-36 13.9-23.3 14.5-41 31.4-64.3 52.8C367.7 197 427.5 283.1 448.2 346c6.8 20.7 9.7 41.1 7.4 52.3-1.7 8.5-1.7 8.5 1.4 4.6 6.1-7.7 19.9-31.3 25.4-43.5 7.4-16.2 15-40.2 18.6-58.7 4.3-22.5 3.9-70.8-.8-93.4zM141.3 43C189 40.5 251 77.5 255.6 78.4c.7.1 10.4-4.2 21.6-9.7 63.9-31.1 94-25.8 107.4-25.2-63.9-39.3-152.7-50-233.9-11.7-23.4 11.1-24 11.9-9.4 11.2z"},"child":[]}]})(props);
}function FaGem (props) {
  return GenIcon({"attr":{"viewBox":"0 0 576 512"},"child":[{"tag":"path","attr":{"d":"M485.5 0L576 160H474.9L405.7 0h79.8zm-128 0l69.2 160H149.3L218.5 0h139zm-267 0h79.8l-69.2 160H0L90.5 0zM0 192h100.7l123 251.7c1.5 3.1-2.7 5.9-5 3.3L0 192zm148.2 0h279.6l-137 318.2c-1 2.4-4.5 2.4-5.5 0L148.2 192zm204.1 251.7l123-251.7H576L357.3 446.9c-2.3 2.7-6.5-.1-5-3.2z"},"child":[]}]})(props);
}

const PLUGIN_NAME = "SANSO";
const EVENT_NAME = "xboxachievements_show";
const SETTINGS_EVENT = "sanso_settings_changed";
const DEFAULT_THEME = "xbox-achievement";
const DEFAULT_NORMAL_SOUND = "unlock_preroll.wav";
const DEFAULT_RARE_SOUND = "rare_preroll.wav";
const DEFAULT_SETTINGS = {
    theme: DEFAULT_THEME,
    normal_sound: DEFAULT_NORMAL_SOUND,
    rare_sound: DEFAULT_RARE_SOUND,
};
const THEME_OPTIONS = [
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
const themeById = (themeId) => THEME_OPTIONS.find((theme) => theme.id === themeId) ?? THEME_OPTIONS[0];
const pluginBaseUrl = () => `http://127.0.0.1:1337/plugins/${encodeURIComponent(PLUGIN_NAME)}/dist/`;

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

var css_248z = ".xboxachv-stage{display:grid;inset:0;padding-bottom:72px;place-items:end center;pointer-events:none;position:fixed;z-index:2147483000}.sanso-san-stage{display:block;padding:0}.sanso-san-frame{background:transparent;border:0;height:100vh;pointer-events:none;width:100vw}.xboxachv-wrapper{--notifywidth:min(420px,calc(100vw - 28px));--notifyheight:60px;--transition:420ms;--displaytime:5200ms;--xbox-main:#107c10;--xbox-dark:#0f4f0f;--xbox-border:hsla(0,0%,100%,.18);filter:drop-shadow(0 10px 20px rgba(0,0,0,.45));height:var(--notifyheight);width:var(--notifywidth)}.xboxachv-achcont{--start:68px;align-items:center;animation:xboxachv-shell-seq var(--displaytime) cubic-bezier(.2,.8,.2,1) both;border-radius:30px;display:grid;grid-template-columns:auto 1fr;height:100%;isolation:isolate;opacity:0;overflow:hidden;position:relative;width:var(--start)}.xboxachv-bg{animation:xboxachv-bg-seq var(--displaytime) linear both;background:linear-gradient(105deg,var(--xbox-main),var(--xbox-dark));border:1px solid var(--xbox-border);border-radius:inherit;inset:0;opacity:0;position:absolute}.xboxachv-overlay{animation:xboxachv-overlay-sweep 1.6s linear 1.6s 2;background:#fff;filter:blur(30px);height:calc(var(--notifyheight)*2);left:50%;max-width:240px;opacity:0;position:absolute;top:50%;transform:translate(-145%,-50%) skew(-28deg,0deg);width:28vw}.xboxachv-iconbg{animation:xboxachv-iconbg-seq var(--displaytime) linear both;background:linear-gradient(140deg,#1b8f1a,#116010);border-radius:28px;height:56px;margin-left:6px;transform:scale(0);transform-origin:center;width:56px}.xboxachv-achiconwrapper{display:grid;height:56px;left:6px;place-items:center;position:absolute;top:2px;width:56px}.xboxachv-achiconwrapper:after,.xboxachv-achiconwrapper:before{border-radius:999px;content:\"\";display:none;inset:4px;position:absolute;z-index:-1}.xboxachv-rare .xboxachv-achiconwrapper:after,.xboxachv-rare .xboxachv-achiconwrapper:before{display:block}.xboxachv-rare .xboxachv-achiconwrapper:before{animation:xboxachv-rare-rotate 6.2s linear infinite reverse;background:conic-gradient(from 0deg,hsla(40,87%,68%,.95),hsla(40,87%,68%,.2),hsla(40,87%,68%,.95))}.xboxachv-rare .xboxachv-achiconwrapper:after{animation:xboxachv-rare-rotate 2.8s linear infinite;background:repeating-conic-gradient(rgba(255,216,132,.6),rgba(255,216,132,.04) 20deg);filter:blur(10px);inset:2px;mix-blend-mode:overlay}.xboxachv-iconborder{animation:xboxachv-iconpulse-seq var(--displaytime) linear both;border:1px solid hsla(0,0%,100%,.18);border-radius:999px;inset:6px;opacity:0;position:absolute}.xboxachv-icon{animation:xboxachv-iconpulse-seq var(--displaytime) linear both;background:hsla(0,0%,100%,.92);border-radius:999px;color:#0f6111;display:grid;height:40px;opacity:0;place-items:center;transform:scale(.78);width:40px}.xboxachv-achcontent{color:#f0fbf0;font-family:Segoe UI,Noto Sans,Roboto,sans-serif;inset:0 24px 0 76px;position:absolute;text-align:center;text-shadow:0 1px 1px rgba(0,0,0,.5)}.xboxachv-achcontent>span{left:0;min-width:0;overflow:hidden;position:absolute;right:0;text-overflow:ellipsis;top:50%}.xboxachv-unlockmsg{animation:xboxachv-toptext-seq var(--displaytime) linear both;color:hsla(0,0%,100%,.95);font-size:12px;white-space:nowrap}.xboxachv-detail,.xboxachv-unlockmsg{opacity:0;transform:translateY(calc(-50% + 18px))}.xboxachv-detail{align-content:center;animation:xboxachv-detail-seq var(--displaytime) linear both;display:grid;row-gap:1px}.xboxachv-detail>span{min-width:0;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}.xboxachv-title{font-size:13px;font-weight:700}.xboxachv-desc{font-size:12px}.xboxachv-rare .xboxachv-bg{--xbox-border:hsla(40,87%,68%,.6);background:linear-gradient(108deg,#4b3d17,#2f240f)}.xboxachv-rare .xboxachv-iconbg{background:linear-gradient(140deg,#8a6a29,#5f471a)}.xboxachv-rare .xboxachv-icon{color:#6b4f18}@keyframes xboxachv-shell-seq{0%{opacity:0;transform:translateY(18px);width:var(--start)}8%{opacity:1}24%{opacity:1;transform:translateY(0);width:var(--notifywidth)}82%{opacity:1;transform:translateY(0);width:var(--notifywidth)}to{opacity:0;transform:translateY(18px);width:var(--start)}}@keyframes xboxachv-bg-seq{0%{opacity:0}16%{opacity:1}82%{opacity:1}to{opacity:0}}@keyframes xboxachv-overlay-sweep{0%{opacity:0;transform:translate(-145%,-50%) skew(-28deg,0deg)}45%{opacity:.24;transform:translateY(-50%) skew(-28deg,0deg)}to{opacity:0;transform:translate(110%,-50%) skew(-28deg,0deg)}}@keyframes xboxachv-iconbg-seq{0%{transform:scale(0)}10%{transform:scale(1)}84%{transform:scale(1)}to{transform:scale(0)}}@keyframes xboxachv-iconpulse-seq{0%{opacity:0;transform:scale(.78)}14%{opacity:1;transform:scale(1)}78%{opacity:1;transform:scale(1)}to{opacity:0;transform:scale(.84)}}@keyframes xboxachv-toptext-seq{0%{opacity:0;transform:translateY(calc(-50% + 18px))}30%{opacity:1;transform:translateY(-50%)}48%{opacity:1;transform:translateY(-50%)}58%{opacity:0;transform:translateY(calc(-50% - 18px))}to{opacity:0;transform:translateY(calc(-50% - 18px))}}@keyframes xboxachv-detail-seq{0%{opacity:0;transform:translateY(calc(-50% + 18px))}42%{opacity:0;transform:translateY(calc(-50% + 18px))}58%{opacity:1;transform:translateY(-50%)}84%{opacity:1;transform:translateY(-50%)}to{opacity:0;transform:translateY(calc(-50% - 18px))}}@keyframes xboxachv-rare-rotate{to{transform:rotate(1turn)}}";
styleInject(css_248z);

const SHOW_MS = 5200;
const SHADOW_STYLE_ID = "xboxachv-shadow-style";
const TARGET_DOC_STYLE_ID = "xboxachv-targetdoc-style";
const STYLE_SENTINEL = ".xboxachv-stage{";
const SAN_DISPLAY_SECONDS = SHOW_MS / 1000;
const sanThemeCache = new Map();
const defaultPayload = {
    title: "Achievement Unlocked",
    subtitle: "Waiting for events...",
    is_rare: false,
    timestamp: new Date().toISOString(),
};
const trimSubtitle = (value) => {
    const normalized = value.trim();
    if (normalized.length <= 120) {
        return normalized;
    }
    return `...${normalized.slice(-117)}`;
};
const rewriteCssUrls = (cssText, cssUrl) => cssText.replace(/url\((['"]?)(?!data:|https?:|#)([^'")]+)\1\)/gi, (_match, _quote, rawUrl) => {
    const absolute = new URL(String(rawUrl).trim(), cssUrl).toString();
    return `url("${absolute}")`;
});
const fetchText = async (url) => {
    const response = await fetch(url);
    if (!response.ok) {
        throw new Error(`${response.status} ${response.statusText}: ${url}`);
    }
    return response.text();
};
const loadSanTheme = (preset) => {
    const cached = sanThemeCache.get(preset);
    if (cached) {
        return cached;
    }
    const baseUrl = `${pluginBaseUrl()}san-themes/`;
    const promise = Promise.all([
        fetchText(`${baseUrl}notify/base.css`).then((css) => rewriteCssUrls(css, `${baseUrl}notify/base.css`)),
        fetchText(`${baseUrl}notify/baseanim.css`).then((css) => rewriteCssUrls(css, `${baseUrl}notify/baseanim.css`)),
        fetchText(`${baseUrl}notify/presets/${preset}/styles.css`).then((css) => rewriteCssUrls(css, `${baseUrl}notify/presets/${preset}/styles.css`)),
        fetchText(`${baseUrl}notify/presets/${preset}/index.html`),
    ]).then(([baseCss, baseAnimCss, presetCss, html]) => ({
        html,
        css: `${baseCss}\n${baseAnimCss}\n${presetCss}`,
    }));
    sanThemeCache.set(preset, promise);
    return promise;
};
const splitAchievementText = (subtitle) => {
    const separator = " - ";
    const index = subtitle.indexOf(separator);
    if (index <= 0) {
        return { title: subtitle, desc: "" };
    }
    return {
        title: subtitle.slice(0, index),
        desc: subtitle.slice(index + separator.length),
    };
};
const buildSanSrcDoc = (assets, preset, payload) => {
    const parser = new DOMParser();
    const document = parser.parseFromString(assets.html, "text/html");
    const meta = document.querySelector("meta");
    const width = meta?.getAttribute("width") ?? "300";
    const height = meta?.getAttribute("height") ?? "50";
    meta?.remove();
    const baseUrl = `${pluginBaseUrl()}san-themes/`;
    const { title, desc } = splitAchievementText(trimSubtitle(payload.subtitle));
    const unlockMessage = payload.is_rare
        ? "Rare Achievement Unlocked"
        : "Achievement Unlocked";
    const primary = payload.is_rare ? "#663399" : "#203e7a";
    const secondary = payload.is_rare ? "#521f85" : "#0c2a66";
    const trophy = payload.is_rare ? "sanlogotrophy_gold.svg" : "sanlogotrophy.svg";
    document.querySelectorAll("#unlockmsg").forEach((element) => {
        element.textContent = unlockMessage;
    });
    document.querySelectorAll("#title").forEach((element) => {
        element.textContent = title;
        element.setAttribute("gs", "0");
        element.setAttribute("unit", preset === "xbox360" || preset === "gfwl" ? "G" : "");
    });
    document.querySelectorAll("#desc").forEach((element) => {
        element.textContent = desc;
        element.setAttribute("gs", "0");
        element.setAttribute("unit", preset === "xbox360" || preset === "gfwl" ? "G" : "");
    });
    document.querySelectorAll("img#achicon").forEach((image) => {
        image.src = `${baseUrl}img/achicon.png`;
    });
    const bodyAttrs = [
        "gradient",
        "alldetails",
        "bottomcenter",
        payload.is_rare ? "rare" : "",
    ]
        .filter(Boolean)
        .join(" ");
    const html = document.body.innerHTML;
    const cssVars = [
        `--notifywidth:${width}px`,
        `--notifyheight:${height}px`,
        `--displaytime:${SAN_DISPLAY_SECONDS}s`,
        "--transition:0.42s",
        "--bodyopacity:1",
        "--scale:1",
        `--primarycolor:${primary}`,
        `--secondarycolor:${secondary}`,
        "--tertiarycolor:#ffffff",
        "--fontcolor:#ffffff",
        "--opacity:1",
        "--roundness:12px",
        "--iconroundness:12px",
        "--outline:none",
        "--outlinewidth:0",
        "--outlinecolor:transparent",
        "--fontsize:1",
        "--unlockmsgfontsize:1",
        "--titlefontsize:1",
        "--descfontsize:1",
        `--logo:url('${baseUrl}img/${trophy}')`,
        `--decoration:url('${baseUrl}img/${trophy}')`,
        "--decorationdisplaytype:block",
        "--decorationindex:1",
        "--decorationscale:1",
        "--logoscale:1",
        "--iconscale:1",
        "--iconborder:",
        "--iconborderpos:99",
        "--iconborderscale:1",
        "--iconborderx:0",
        "--iconbordery:0",
        "--textvspace:0",
    ].join(";");
    return `<!doctype html>
<html>
  <head>
    <meta charset="utf-8">
    <style>${assets.css}</style>
    <style>
      html, body { width: 100vw; height: 100vh; overflow: hidden; background: transparent !important; }
      body { ${cssVars}; }
    </style>
  </head>
  <body ${bodyAttrs}>${html}</body>
</html>`;
};
function XboxNotification() {
    const stageRef = SP_REACT.useRef(null);
    const hideTimer = SP_REACT.useRef(null);
    const [payload, setPayload] = SP_REACT.useState(defaultPayload);
    const [settings, setSettings] = SP_REACT.useState(DEFAULT_SETTINGS);
    const [sanAssets, setSanAssets] = SP_REACT.useState(null);
    const [sanError, setSanError] = SP_REACT.useState(null);
    const [active, setActive] = SP_REACT.useState(false);
    const [runKey, setRunKey] = SP_REACT.useState(0);
    SP_REACT.useEffect(() => {
        const refreshSettings = async () => {
            try {
                setSettings(await call("get_settings"));
            }
            catch {
                setSettings(DEFAULT_SETTINGS);
            }
        };
        const onSettingsChanged = (event) => {
            const next = event.detail;
            if (next) {
                setSettings(next);
            }
            else {
                void refreshSettings();
            }
        };
        void refreshSettings();
        window.addEventListener(SETTINGS_EVENT, onSettingsChanged);
        return () => window.removeEventListener(SETTINGS_EVENT, onSettingsChanged);
    }, []);
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
        const registered = addEventListener(EVENT_NAME, onNotify);
        return () => {
            if (hideTimer.current !== null) {
                window.clearTimeout(hideTimer.current);
            }
            removeEventListener(EVENT_NAME, registered);
        };
    }, []);
    SP_REACT.useEffect(() => {
        const theme = themeById(settings.theme);
        if (!theme.preset || !active) {
            setSanAssets(null);
            setSanError(null);
            return;
        }
        let cancelled = false;
        loadSanTheme(theme.preset)
            .then((assets) => {
            if (!cancelled) {
                setSanAssets(assets);
                setSanError(null);
            }
        })
            .catch((error) => {
            if (!cancelled) {
                setSanAssets(null);
                setSanError(error instanceof Error ? error.message : String(error));
            }
        });
        return () => {
            cancelled = true;
        };
    }, [active, settings.theme]);
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
    const theme = themeById(settings.theme);
    if (theme.preset && sanAssets && !sanError) {
        return (SP_JSX.jsx("div", { ref: stageRef, className: "xboxachv-stage sanso-san-stage", "aria-live": "polite", children: SP_JSX.jsx("iframe", { className: "sanso-san-frame", srcDoc: buildSanSrcDoc(sanAssets, theme.preset, payload), title: "SANSO achievement notification" }, `${runKey}-${theme.id}`) }));
    }
    return (SP_JSX.jsx("div", { ref: stageRef, className: "xboxachv-stage", "aria-live": "polite", children: SP_JSX.jsx("div", { className: `xboxachv-wrapper ${payload.is_rare ? "xboxachv-rare" : ""}`, children: SP_JSX.jsxs("div", { className: "xboxachv-achcont", children: [SP_JSX.jsx("div", { className: "xboxachv-bg", children: SP_JSX.jsx("div", { className: "xboxachv-overlay" }) }), SP_JSX.jsx("div", { className: "xboxachv-iconbg" }), SP_JSX.jsxs("div", { className: "xboxachv-achiconwrapper", children: [SP_JSX.jsx("div", { className: "xboxachv-iconborder" }), SP_JSX.jsx("div", { className: "xboxachv-icon", children: payload.is_rare ? SP_JSX.jsx(FaGem, { size: 20 }) : SP_JSX.jsx(FaXbox, { size: 24 }) })] }), SP_JSX.jsxs("div", { className: "xboxachv-achcontent", children: [SP_JSX.jsx("span", { className: "xboxachv-unlockmsg", children: unlockMessage }), showTitle || showSubtitle ? (SP_JSX.jsxs("span", { className: "xboxachv-detail", children: [showTitle ? SP_JSX.jsx("span", { className: "xboxachv-title", children: payload.title }) : null, showSubtitle ? SP_JSX.jsx("span", { className: "xboxachv-desc", children: subtitle }) : null] })) : null] })] }) }, runKey) }));
}

const GLOBAL_COMPONENT_NAME = "SANSOOverlay";
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
    return (SP_JSX.jsxs(SP_JSX.Fragment, { children: [SP_JSX.jsxs(DFL.PanelSection, { title: "Popup Tests", children: [SP_JSX.jsx(DFL.PanelSectionRow, { children: SP_JSX.jsx(DFL.ButtonItem, { disabled: pendingAction !== null, onClick: () => void trigger("test_popup_main"), layout: "below", description: "Toont de standaard Xbox achievement popup.", children: "Test Main" }) }), SP_JSX.jsx(DFL.PanelSectionRow, { children: SP_JSX.jsx(DFL.ButtonItem, { disabled: pendingAction !== null, onClick: () => void trigger("test_popup_rare"), layout: "below", description: "Toont de rare-variant met glow en rare geluid.", children: "Test Rare" }) })] }), SP_JSX.jsxs(DFL.PanelSection, { title: "Settings", children: [SP_JSX.jsx(DFL.PanelSectionRow, { children: SP_JSX.jsx(DFL.DropdownItem, { label: "Theme", description: "Kies de notification style. XBOX Achievement is onze huidige default.", rgOptions: THEME_OPTIONS.map((theme) => ({
                                data: theme.id,
                                label: theme.label,
                            })), selectedOption: settings.theme, disabled: pendingAction !== null, onChange: (selection) => void updateSettings({ theme: selection.data }) }) }), SP_JSX.jsx(DFL.PanelSectionRow, { children: SP_JSX.jsx(DFL.DropdownItem, { label: "Normal sound", description: "WAV voor normale achievements.", rgOptions: soundOptions, selectedOption: settings.normal_sound, disabled: pendingAction !== null || soundOptions.length === 0, onChange: (selection) => void updateSettings({ normal_sound: selection.data }) }) }), SP_JSX.jsx(DFL.PanelSectionRow, { children: SP_JSX.jsx(DFL.DropdownItem, { label: "Rare sound", description: "WAV voor rare achievements.", rgOptions: soundOptions, selectedOption: settings.rare_sound, disabled: pendingAction !== null || soundOptions.length === 0, onChange: (selection) => void updateSettings({ rare_sound: selection.data }) }) })] }), SP_JSX.jsxs(DFL.PanelSection, { title: "Watcher Status", children: [SP_JSX.jsx(DFL.PanelSectionRow, { children: SP_JSX.jsx(DFL.ButtonItem, { disabled: pendingAction !== null, onClick: () => void refreshStatus(), description: "Handmatige refresh van backend status.", children: "Refresh Status" }) }), SP_JSX.jsx(DFL.PanelSectionRow, { children: SP_JSX.jsxs("div", { children: [SP_JSX.jsxs("div", { children: ["Log watcher: ", SP_JSX.jsx("strong", { children: status?.watcher_running ? "yes" : "no" })] }), SP_JSX.jsxs("div", { children: ["Cache watcher:", " ", SP_JSX.jsx("strong", { children: status?.librarycache_watcher_running ? "yes" : "no" })] }), SP_JSX.jsxs("div", { children: ["Watcher mode: ", status?.watcher_mode ?? "-"] }), SP_JSX.jsxs("div", { children: ["Inotify app: ", status?.last_inotify_event_appid ?? "-", " / latency:", " ", status?.last_queue_latency_ms ?? "-", "ms"] }), SP_JSX.jsxs("div", { children: ["Inotify events: ", status?.processed_inotify_events ?? 0, " / fallback scans:", " ", status?.fallback_scan_count ?? 0] }), SP_JSX.jsxs("div", { children: ["Last inotify path: ", status?.last_inotify_event_path ?? "-"] }), SP_JSX.jsxs("div", { children: ["Parse retry: ", status?.last_parse_retry_error ?? "-"] }), SP_JSX.jsxs("div", { children: ["Steam API:", " ", SP_JSX.jsx("strong", { children: status?.steam_api_enabled
                                                ? status.steam_api_running
                                                    ? "running"
                                                    : "enabled"
                                                : "disabled" })] }), SP_JSX.jsxs("div", { children: ["Steam API status: ", status?.steam_api_status ?? "-"] }), SP_JSX.jsxs("div", { children: ["Steam API appids:", " ", status?.steam_api_last_appids?.length
                                            ? status.steam_api_last_appids.join(", ")
                                            : "-"] }), SP_JSX.jsxs("div", { children: ["Steam API error: ", status?.steam_api_last_error ?? "-"] }), SP_JSX.jsxs("div", { children: ["Steamworks:", " ", SP_JSX.jsx("strong", { children: status?.steamworks_running ? "running" : "idle" })] }), SP_JSX.jsxs("div", { children: ["Steamworks app: ", status?.steamworks_last_appid ?? "-", " / poll:", " ", status?.steamworks_poll_interval_ms ?? "-", "ms"] }), SP_JSX.jsxs("div", { children: ["Theme: ", settings.theme] }), SP_JSX.jsxs("div", { children: ["Sounds: ", settings.normal_sound, " / ", settings.rare_sound] }), SP_JSX.jsxs("div", { children: ["Steamworks status: ", status?.steamworks_status ?? "-"] }), SP_JSX.jsxs("div", { children: ["Steamworks unlocks: ", status?.steamworks_unlock_count ?? 0] }), SP_JSX.jsxs("div", { children: ["Steamworks error: ", status?.steamworks_last_error ?? "-"] }), SP_JSX.jsxs("div", { children: ["Last match: ", formatTimestamp(status?.last_match_timestamp ?? null)] }), SP_JSX.jsxs("div", { children: ["Last source: ", status?.last_match_source ?? "-"] }), SP_JSX.jsxs("div", { children: ["Duplicate window: ", status?.duplicate_window_seconds ?? "?", "s"] }), SP_JSX.jsxs("div", { children: ["Log path: ", status?.log_path ?? "unknown"] }), SP_JSX.jsxs("div", { children: ["Cache files seen: ", status?.librarycache_files_seen ?? "?"] }), SP_JSX.jsxs("div", { children: ["Cache glob: ", status?.librarycache_glob ?? "unknown"] }), SP_JSX.jsxs("div", { children: ["Last scanned app: ", status?.last_scanned_appid ?? "-"] }), SP_JSX.jsxs("div", { children: ["Cache status: ", status?.last_cache_status ?? "-"] }), SP_JSX.jsxs("div", { children: ["Cache mtime:", " ", status?.last_cache_mtime
                                            ? formatTimestamp(new Date(status.last_cache_mtime * 1000).toISOString())
                                            : "-"] }), SP_JSX.jsxs("div", { children: ["New IDs:", " ", status?.last_new_unlock_ids?.length
                                            ? status.last_new_unlock_ids.join(", ")
                                            : "-"] }), SP_JSX.jsxs("div", { children: ["Parse note: ", status?.last_parse_error ?? "-"] }), SP_JSX.jsxs("div", { children: ["Sample: ", status?.last_match_sample ?? "-"] }), SP_JSX.jsxs("div", { children: ["Last event:", " ", lastEvent
                                            ? `${lastEvent.title} @ ${formatTimestamp(lastEvent.timestamp)}`
                                            : "none"] }), statusError ? (SP_JSX.jsxs("div", { style: { color: "#ff8a80" }, children: ["Status error: ", statusError] })) : null] }) })] })] }));
}
var index = definePlugin(() => {
    routerHook.addGlobalComponent(GLOBAL_COMPONENT_NAME, XboxNotification);
    return {
        name: "SANSO",
        icon: SP_JSX.jsx(FaSteam, {}),
        alwaysRender: true,
        titleView: SP_JSX.jsx("div", { className: DFL.staticClasses.Title, children: "SANSO" }),
        content: SP_JSX.jsx(StatusPanel, {}),
        onDismount() {
            routerHook.removeGlobalComponent(GLOBAL_COMPONENT_NAME);
        },
    };
});

export { index as default };
//# sourceMappingURL=index.js.map
