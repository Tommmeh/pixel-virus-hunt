import { useRef, type ReactNode } from "react";

interface Props {
  title: string;
  x: number;
  y: number;
  z: number;
  width?: number;
  laggy?: boolean;
  onMove: (x: number, y: number) => void;
  onFocus: () => void;
  onClose?: () => void;
  onMinimize?: () => void;
  children: ReactNode;
  variant?: "default" | "alert";
}

export function Window({ title, x, y, z, width = 520, laggy, onMove, onFocus, onClose, onMinimize, children, variant }: Props) {
  const last = useRef(0);
  const start = (e: React.PointerEvent) => {
    if ((e.target as HTMLElement).closest("button")) return;
    onFocus();
    const ox = e.clientX - x;
    const oy = e.clientY - y;
    const move = (ev: PointerEvent) => {
      const now = performance.now();
      if (laggy && now - last.current < 280) return; // infection symptom: choppy dragging
      last.current = now;
      onMove(Math.max(0, ev.clientX - ox), Math.max(0, ev.clientY - oy));
    };
    const up = () => {
      window.removeEventListener("pointermove", move);
      window.removeEventListener("pointerup", up);
    };
    window.addEventListener("pointermove", move);
    window.addEventListener("pointerup", up);
  };
  return (
    <div className={`win ${variant === "alert" ? "win-alert" : ""}`} style={{ left: x, top: y, zIndex: z, width }} onPointerDown={onFocus}>
      <div className="win-title" onPointerDown={start}>
        <span className="truncate">{title}</span>
        <span className="flex gap-1">
          {onMinimize && (
            <button className="win-ctrl" onClick={onMinimize} aria-label="Minimize">_</button>
          )}
          {onClose && (
            <button className="win-ctrl" onClick={onClose} aria-label="Close">x</button>
          )}
        </span>
      </div>
      <div className="win-body">{children}</div>
    </div>
  );
}
