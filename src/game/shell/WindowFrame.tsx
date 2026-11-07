import { useEffect, useRef, useState, type ReactNode } from "react";
import { PixelIcon } from "../components/PixelIcon";
import { wm, type Win } from "../system/windows";

interface Props {
  win: Win;
  active: boolean;
  /** Message boxes: no minimize/maximize, no resize. */
  dialog?: boolean;
  children: ReactNode;
}

/** PaneOS window chrome: title bar, min/max/close, drag, double-click maximize, resize grip. */
export function WindowFrame({ win, active, dialog, children }: Props) {
  const [shaking, setShaking] = useState(false);
  const firstShake = useRef(win.shake);

  useEffect(() => {
    if (win.shake === firstShake.current) return;
    setShaking(true);
    const t = setTimeout(() => setShaking(false), 600);
    return () => clearTimeout(t);
  }, [win.shake]);

  const startDrag = (e: React.PointerEvent) => {
    if (win.max || (e.target as HTMLElement).closest("button")) return;
    e.preventDefault();
    const ox = e.clientX - win.x;
    const oy = e.clientY - win.y;
    const move = (ev: PointerEvent) => {
      const x = Math.min(Math.max(ev.clientX - ox, 80 - win.w), window.innerWidth - 80);
      const y = Math.min(Math.max(ev.clientY - oy, 0), window.innerHeight - 60);
      wm.move(win.key, x, y);
    };
    const up = () => {
      window.removeEventListener("pointermove", move);
      window.removeEventListener("pointerup", up);
    };
    window.addEventListener("pointermove", move);
    window.addEventListener("pointerup", up);
  };

  const startResize = (e: React.PointerEvent) => {
    e.preventDefault();
    e.stopPropagation();
    const sx = e.clientX;
    const sy = e.clientY;
    const { w, h } = win;
    const move = (ev: PointerEvent) => wm.resize(win.key, w + ev.clientX - sx, h + ev.clientY - sy);
    const up = () => {
      window.removeEventListener("pointermove", move);
      window.removeEventListener("pointerup", up);
    };
    window.addEventListener("pointermove", move);
    window.addEventListener("pointerup", up);
  };

  const style = win.max
    ? { zIndex: win.z }
    : { left: win.x, top: win.y, width: win.w, height: win.h, zIndex: win.z };

  return (
    <div
      className={`xp-win ${active ? "is-active" : "is-inactive"} ${win.max ? "is-max" : ""} ${
        shaking ? "is-shaking" : ""
      } ${dialog ? "is-dialog" : ""}`}
      style={style}
      onPointerDown={() => wm.focus(win.key)}
      role="dialog"
      aria-label={win.title}
    >
      <div
        className="xp-title"
        onPointerDown={startDrag}
        onDoubleClick={() => !dialog && wm.toggleMax(win.key)}
      >
        <PixelIcon name={win.icon} size={16} />
        <span className="xp-title-text">{win.title}</span>
        <span className="xp-ctrls">
          {!dialog && (
            <>
              <button
                className="xp-ctrl"
                aria-label="Minimize"
                onClick={() => wm.minimize(win.key)}
              >
                <span className="glyph-min" />
              </button>
              <button
                className="xp-ctrl"
                aria-label={win.max ? "Restore" : "Maximize"}
                onClick={() => wm.toggleMax(win.key)}
              >
                <span className={win.max ? "glyph-restore" : "glyph-max"} />
              </button>
            </>
          )}
          <button className="xp-ctrl is-close" aria-label="Close" onClick={() => wm.close(win.key)}>
            <span className="glyph-close" />
          </button>
        </span>
      </div>
      <div className="xp-win-body">{children}</div>
      {!dialog && !win.max && <div className="xp-grip" onPointerDown={startResize} aria-hidden />}
    </div>
  );
}
