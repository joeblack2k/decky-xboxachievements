import { useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import { addEventListener, removeEventListener } from "@decky/api";
import { FaXbox } from "react-icons/fa";
import "./style.css";

export type NotificationPayload = {
  title: string;
  subtitle: string;
  is_rare: boolean;
  timestamp: string;
};

const EVENT_NAME = "xboxachievements_show";
const SHOW_MS = 5200;
const SHADOW_STYLE_ID = "xboxachv-shadow-style";
const TARGET_DOC_STYLE_ID = "xboxachv-targetdoc-style";
const STYLE_SENTINEL = ".xboxachv-stage{";

const defaultPayload: NotificationPayload = {
  title: "Achievement Unlocked",
  subtitle: "Waiting for events...",
  is_rare: false,
  timestamp: new Date().toISOString(),
};

const formatClock = (timestamp: string): string => {
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

const trimSubtitle = (value: string): string => {
  const normalized = value.trim();
  if (normalized.length <= 120) {
    return normalized;
  }
  return `...${normalized.slice(-117)}`;
};

export default function XboxNotification() {
  const stageRef = useRef<HTMLDivElement | null>(null);
  const hideTimer = useRef<number | null>(null);
  const [payload, setPayload] = useState<NotificationPayload>(defaultPayload);
  const [active, setActive] = useState(false);
  const [runKey, setRunKey] = useState(0);

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
  const clock = useMemo(() => formatClock(payload.timestamp), [payload.timestamp]);
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
              <FaXbox size={24} />
            </div>
          </div>

          <div className="xboxachv-achcontent">
            <span className="xboxachv-unlockmsg">{unlockMessage}</span>
            {showTitle ? <span className="xboxachv-title">{payload.title}</span> : null}
            {showSubtitle ? <span className="xboxachv-desc">{subtitle}</span> : null}
          </div>

          <span className="xboxachv-time">{clock}</span>
        </div>
      </div>
    </div>
  );
}
