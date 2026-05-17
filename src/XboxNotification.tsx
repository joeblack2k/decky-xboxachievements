import { useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import { addEventListener, call, removeEventListener } from "@decky/api";
import { FaGem, FaXbox } from "react-icons/fa";
import {
  DEFAULT_SETTINGS,
  EVENT_NAME,
  SETTINGS_EVENT,
  type SansoSettings,
  pluginBaseUrl,
  themeById,
} from "./sansoThemes";
import "./style.css";

export type NotificationPayload = {
  title: string;
  subtitle: string;
  is_rare: boolean;
  timestamp: string;
};

const SHOW_MS = 5200;
const SHADOW_STYLE_ID = "xboxachv-shadow-style";
const TARGET_DOC_STYLE_ID = "xboxachv-targetdoc-style";
const STYLE_SENTINEL = ".xboxachv-stage{";
const SAN_DISPLAY_SECONDS = SHOW_MS / 1000;

type SanThemeAssets = {
  html: string;
  css: string;
};

const sanThemeCache = new Map<string, Promise<SanThemeAssets>>();

const defaultPayload: NotificationPayload = {
  title: "Achievement Unlocked",
  subtitle: "Waiting for events...",
  is_rare: false,
  timestamp: new Date().toISOString(),
};

const trimSubtitle = (value: string): string => {
  const normalized = value.trim();
  if (normalized.length <= 120) {
    return normalized;
  }
  return `...${normalized.slice(-117)}`;
};

const rewriteCssUrls = (cssText: string, cssUrl: string): string =>
  cssText.replace(/url\((['"]?)(?!data:|https?:|#)([^'")]+)\1\)/gi, (_match, _quote, rawUrl) => {
    const absolute = new URL(String(rawUrl).trim(), cssUrl).toString();
    return `url("${absolute}")`;
  });

const fetchText = async (url: string): Promise<string> => {
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`${response.status} ${response.statusText}: ${url}`);
  }
  return response.text();
};

const loadSanTheme = (preset: string): Promise<SanThemeAssets> => {
  const cached = sanThemeCache.get(preset);
  if (cached) {
    return cached;
  }

  const baseUrl = `${pluginBaseUrl()}san-themes/`;
  const promise = Promise.all([
    fetchText(`${baseUrl}notify/base.css`).then((css) =>
      rewriteCssUrls(css, `${baseUrl}notify/base.css`),
    ),
    fetchText(`${baseUrl}notify/baseanim.css`).then((css) =>
      rewriteCssUrls(css, `${baseUrl}notify/baseanim.css`),
    ),
    fetchText(`${baseUrl}notify/presets/${preset}/styles.css`).then((css) =>
      rewriteCssUrls(css, `${baseUrl}notify/presets/${preset}/styles.css`),
    ),
    fetchText(`${baseUrl}notify/presets/${preset}/index.html`),
  ]).then(([baseCss, baseAnimCss, presetCss, html]) => ({
    html,
    css: `${baseCss}\n${baseAnimCss}\n${presetCss}`,
  }));

  sanThemeCache.set(preset, promise);
  return promise;
};

const splitAchievementText = (subtitle: string): { title: string; desc: string } => {
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

const buildSanSrcDoc = (
  assets: SanThemeAssets,
  preset: string,
  payload: NotificationPayload,
): string => {
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
  document.querySelectorAll<HTMLImageElement>("img#achicon").forEach((image) => {
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

export default function XboxNotification() {
  const stageRef = useRef<HTMLDivElement | null>(null);
  const hideTimer = useRef<number | null>(null);
  const [payload, setPayload] = useState<NotificationPayload>(defaultPayload);
  const [settings, setSettings] = useState<SansoSettings>(DEFAULT_SETTINGS);
  const [sanAssets, setSanAssets] = useState<SanThemeAssets | null>(null);
  const [sanError, setSanError] = useState<string | null>(null);
  const [active, setActive] = useState(false);
  const [runKey, setRunKey] = useState(0);

  useEffect(() => {
    const refreshSettings = async () => {
      try {
        setSettings(await call<[], SansoSettings>("get_settings"));
      } catch {
        setSettings(DEFAULT_SETTINGS);
      }
    };

    const onSettingsChanged = (event: Event) => {
      const next = (event as CustomEvent<SansoSettings>).detail;
      if (next) {
        setSettings(next);
      } else {
        void refreshSettings();
      }
    };

    void refreshSettings();
    window.addEventListener(SETTINGS_EVENT, onSettingsChanged);
    return () => window.removeEventListener(SETTINGS_EVENT, onSettingsChanged);
  }, []);

  useEffect(() => {
    const onNotify = (nextPayload: NotificationPayload) => {
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

    const registered = addEventListener<[NotificationPayload]>(EVENT_NAME, onNotify);

    return () => {
      if (hideTimer.current !== null) {
        window.clearTimeout(hideTimer.current);
      }
      removeEventListener(EVENT_NAME, registered);
    };
  }, []);

  useEffect(() => {
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

  useLayoutEffect(() => {
    const stage = stageRef.current;
    if (!stage) {
      return;
    }

    const sourceStyle = Array.from(document.querySelectorAll("style")).find(
      (node) => node.textContent?.includes(STYLE_SENTINEL),
    );
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

  const subtitle = useMemo(() => trimSubtitle(payload.subtitle), [payload.subtitle]);
  const unlockMessage = payload.is_rare
    ? "Rare Achievement Unlocked"
    : "Achievement Unlocked";
  const normalizedUnlockMessage = unlockMessage.trim().toLowerCase();
  const normalizedTitle = payload.title.trim().toLowerCase();
  const normalizedSubtitle = subtitle.trim().toLowerCase();
  const showTitle = normalizedTitle.length > 0 && normalizedTitle !== normalizedUnlockMessage;
  const showSubtitle =
    normalizedSubtitle.length > 0 &&
    normalizedSubtitle !== normalizedUnlockMessage &&
    normalizedSubtitle !== normalizedTitle;

  if (!active) {
    return null;
  }

  const theme = themeById(settings.theme);
  if (theme.preset && sanAssets && !sanError) {
    return (
      <div ref={stageRef} className="xboxachv-stage sanso-san-stage" aria-live="polite">
        <iframe
          key={`${runKey}-${theme.id}`}
          className="sanso-san-frame"
          srcDoc={buildSanSrcDoc(sanAssets, theme.preset, payload)}
          title="SANSO achievement notification"
        />
      </div>
    );
  }

  return (
    <div ref={stageRef} className="xboxachv-stage" aria-live="polite">
      <div
        key={runKey}
        className={`xboxachv-wrapper ${payload.is_rare ? "xboxachv-rare" : ""}`}
      >
        <div className="xboxachv-achcont">
          <div className="xboxachv-bg">
            <div className="xboxachv-overlay" />
          </div>

          <div className="xboxachv-iconbg" />

          <div className="xboxachv-achiconwrapper">
            <div className="xboxachv-iconborder" />

            <div className="xboxachv-icon">
              {payload.is_rare ? <FaGem size={20} /> : <FaXbox size={24} />}
            </div>
          </div>

          <div className="xboxachv-achcontent">
            <span className="xboxachv-unlockmsg">{unlockMessage}</span>
            {showTitle || showSubtitle ? (
              <span className="xboxachv-detail">
                {showTitle ? <span className="xboxachv-title">{payload.title}</span> : null}
                {showSubtitle ? <span className="xboxachv-desc">{subtitle}</span> : null}
              </span>
            ) : null}
          </div>
        </div>
      </div>
    </div>
  );
}
