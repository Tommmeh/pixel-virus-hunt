import { useEffect, useState } from "react";
import { PixelIcon } from "../components/PixelIcon";
import { settingsStore, updateSettings, useSettings } from "../system/settings";
import { activeKey, useWindows, wm } from "../system/windows";

function Clock({ h24 }: { h24: boolean }) {
  const [now, setNow] = useState<Date | null>(null);
  useEffect(() => {
    setNow(new Date());
    const t = setInterval(() => setNow(new Date()), 10_000);
    return () => clearInterval(t);
  }, []);
  if (!now) return <span className="tray-clock" />;
  return (
    <button
      className="tray-clock"
      onClick={() => wm.open("settings", { tab: "datetime" })}
      title={now.toLocaleDateString(undefined, { dateStyle: "full" })}
    >
      {now.toLocaleTimeString([], { hour: "numeric", minute: "2-digit", hour12: !h24 })}
    </button>
  );
}

function Tray() {
  const s = useSettings();
  return (
    <div className="tray">
      <button
        className="tray-icon"
        title={`PingMe Messenger (${s.chatStatus})`}
        onClick={() => wm.open("messenger")}
      >
        <PixelIcon name="buddy" size={16} />
      </button>
      <button
        className={`tray-icon ${s.wifi ? "" : "is-off"}`}
        title={s.wifi ? `Wireless: connected to ${s.wifi}` : "Wireless: not connected"}
        onClick={() => wm.open("settings", { tab: "network" })}
      >
        <PixelIcon name="wifi" size={16} />
      </button>
      <button
        className="tray-icon"
        title={s.muted ? "Volume (muted)" : `Volume ${s.volume}%`}
        onClick={() => updateSettings({ muted: !settingsStore.get().muted })}
      >
        <PixelIcon name={s.muted ? "mute" : "speaker"} size={16} />
      </button>
      <button
        className="tray-icon"
        title="Settings"
        aria-label="Settings"
        onClick={() => wm.open("settings")}
      >
        <PixelIcon name="gear" size={16} />
      </button>
      <Clock h24={s.clock24} />
    </div>
  );
}

export function Taskbar({ startOpen, onStart }: { startOpen: boolean; onStart: () => void }) {
  const state = useWindows();
  const active = activeKey(state);
  return (
    <div className="taskbar">
      <button
        className={`nes-btn is-success start-btn ${startOpen ? "is-open" : ""}`}
        onPointerDown={(e) => e.stopPropagation()}
        onClick={onStart}
      >
        <PixelIcon name="logo" size={18} />
        <span>START</span>
      </button>
      <div className="task-list">
        {state.wins.map((w) => (
          <button
            key={w.key}
            className={`nes-btn is-small task-btn ${active === w.key ? "is-active is-primary" : ""} ${
              w.flash ? "is-flash is-warning" : ""
            }`}
            onClick={() => wm.taskbarClick(w.key)}
            title={w.title}
          >
            <PixelIcon name={w.icon} size={16} />
            <span className="task-btn-text">{w.title}</span>
          </button>
        ))}
      </div>
      <Tray />
    </div>
  );
}
