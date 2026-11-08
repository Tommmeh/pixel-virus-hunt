import { useEffect, useState } from "react";
import { PixelIcon } from "../../components/PixelIcon";
import { playDing } from "../../components/sound";
import { Check, GroupBox, Select, Tabs, useNow } from "../../components/ui";
import { emit } from "../../system/events";
import { setPhase } from "../../system/session";
import {
  AVATARS,
  THEMES,
  resolveTheme,
  WALLPAPERS,
  updateSettings,
  useSettings,
  type Settings as S,
} from "../../system/settings";
import { resetAllStores } from "../../system/store";
import type { Win } from "../../system/windows";
import { wallpaperUrl } from "../../shell/wallpaper";

type Tab = "display" | "sound" | "datetime" | "user" | "network" | "reset";

const TABS: { id: Tab; label: string }[] = [
  { id: "display", label: "Display" },
  { id: "sound", label: "Sound" },
  { id: "datetime", label: "Date & Time" },
  { id: "user", label: "User" },
  { id: "network", label: "Network" },
  { id: "reset", label: "Reset" },
];

const NETWORKS = [
  { name: "Taylor_Home", security: "WPA2", needsKey: false },
  { name: "Library_Guest", security: "Open", needsKey: false },
  { name: "Neighbour_5G", security: "WPA2", needsKey: true },
];

function set<K extends keyof S>(key: K, value: S[K]) {
  updateSettings({ [key]: value } as Partial<S>);
  emit({ type: "settings.change", key });
}

export function Settings({ win }: { win: Win }) {
  const s = useSettings();
  const argTab = win.args?.["tab"] as Tab | undefined;
  const [tab, setTab] = useState<Tab>(argTab ?? "display");
  const [name, setName] = useState(s.userName);
  const [confirmReset, setConfirmReset] = useState(false);
  const [netMsg, setNetMsg] = useState("");
  const now = useNow(1000, tab === "datetime");

  useEffect(() => {
    if (argTab) setTab(argTab);
  }, [win.args]); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <div className="settings">
      <Tabs tabs={TABS} value={tab} onChange={setTab} />
      <div className="settings-panel">
        {tab === "display" && (
          <>
            <div
              className="monitor-preview"
              data-wallpaper={s.wallpaper}
              data-theme={resolveTheme(s.theme)}
              style={{ backgroundImage: wallpaperUrl(s.wallpaper) ?? undefined }}
            >
              <div className="mini-win">
                <div className="mini-title">Active Window</div>
                <div className="mini-body" />
              </div>
              <div className="mini-taskbar">
                <span className="mini-start" />
              </div>
            </div>
            <GroupBox title="Theme">
              <div className="theme-list">
                {THEMES.map((t) => (
                  <Check
                    key={t.id}
                    radio
                    name="theme"
                    checked={resolveTheme(s.theme) === t.id}
                    onChange={() => set("theme", t.id)}
                  >
                    <span className="swatch" style={{ background: t.swatch }} />
                    {t.label}
                  </Check>
                ))}
              </div>
            </GroupBox>
            <GroupBox title="Wallpaper">
              <Select
                value={s.wallpaper}
                onChange={(e) => set("wallpaper", e.target.value as S["wallpaper"])}
                aria-label="Wallpaper"
              >
                {WALLPAPERS.map((w) => (
                  <option key={w.id} value={w.id}>
                    {w.label}
                  </option>
                ))}
              </Select>
            </GroupBox>
          </>
        )}

        {tab === "sound" && (
          <GroupBox title="Volume">
            <Check checked={s.muted} onChange={(v) => set("muted", v)}>
              Mute all sounds
            </Check>
            <label className="slider-row">
              <PixelIcon name="speaker" size={16} />
              <input
                type="range"
                className="os-range"
                min={0}
                max={100}
                value={s.volume}
                onChange={(e) => set("volume", Number(e.target.value))}
                aria-label="Volume"
              />
              {s.volume}%
            </label>
            <button className="nes-btn is-primary" onClick={playDing}>
              Test sound
            </button>
          </GroupBox>
        )}

        {tab === "datetime" && (
          <GroupBox title="Date & Time">
            <div className="big-clock">
              {new Date(now).toLocaleTimeString([], { hour12: !s.clock24 })}
            </div>
            <p>{new Date(now).toLocaleDateString(undefined, { dateStyle: "full" })}</p>
            <Check checked={s.clock24} onChange={(v) => set("clock24", v)}>
              Use 24-hour clock
            </Check>
          </GroupBox>
        )}

        {tab === "user" && (
          <>
            <GroupBox title="Display name">
              <form
                className="flex gap-2"
                onSubmit={(e) => {
                  e.preventDefault();
                  if (name.trim()) set("userName", name.trim().slice(0, 20));
                }}
              >
                <input
                  className="nes-input"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                />
                <button className="nes-btn is-primary" type="submit">
                  Apply
                </button>
              </form>
            </GroupBox>
            <GroupBox title="Picture">
              <div className="avatar-grid">
                {AVATARS.map((a) => (
                  <button
                    key={a}
                    className={`avatar-pick ${s.avatar === a ? "is-active" : ""}`}
                    onClick={() => set("avatar", a)}
                    aria-label={`Picture ${a}`}
                  >
                    {a}
                  </button>
                ))}
              </div>
            </GroupBox>
          </>
        )}

        {tab === "network" && (
          <GroupBox title="Wireless Network Connection">
            <p className="mb-2">
              Status: {s.wifi ? <b>Connected to {s.wifi}</b> : <b>Not connected</b>}
            </p>
            <ul className="net-list">
              {NETWORKS.map((n) => (
                <li key={n.name} className={s.wifi === n.name ? "is-active" : ""}>
                  <PixelIcon name="wifi" size={16} />
                  <span className="flex-1">
                    {n.name} <small>({n.security})</small>
                  </span>
                  {s.wifi === n.name ? (
                    <button className="nes-btn is-small" onClick={() => set("wifi", null)}>
                      Disconnect
                    </button>
                  ) : (
                    <button
                      className="nes-btn is-small"
                      onClick={() => {
                        if (n.needsKey) {
                          setNetMsg(`'${n.name}' needs a network key. Ask the owner for it.`);
                          return;
                        }
                        setNetMsg("");
                        set("wifi", n.name);
                      }}
                    >
                      Connect
                    </button>
                  )}
                </li>
              ))}
            </ul>
            {netMsg && <p className="form-error">{netMsg}</p>}
          </GroupBox>
        )}

        {tab === "reset" && (
          <GroupBox title="Reset this PC">
            <p className="mb-2">
              Puts the computer back to how it was at the start: emails, bank balance, posts, chats,
              saved files and settings.
            </p>
            {confirmReset ? (
              <span className="flex gap-2">
                <button
                  className="nes-btn is-error"
                  onClick={() => {
                    resetAllStores();
                    setPhase("boot");
                  }}
                >
                  Yes, reset everything
                </button>
                <button className="nes-btn" onClick={() => setConfirmReset(false)}>
                  Cancel
                </button>
              </span>
            ) : (
              <button className="nes-btn" onClick={() => setConfirmReset(true)}>
                Reset this PC...
              </button>
            )}
          </GroupBox>
        )}
      </div>
    </div>
  );
}
