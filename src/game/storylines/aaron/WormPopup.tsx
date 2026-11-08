// One PhotoWorm pop-up window. Every button just closes it — in swarm mode that spawns two more.
import { PixelIcon } from "../../components/PixelIcon";
import { wm, type Win } from "../../system/windows";
import { popupContent } from "./story";

const ICON = { ad: "trophy", slow: "taskmgr", virus: "warning", error: "error" } as const;

export function WormPopup({ win }: { win: Win }) {
  const c = popupContent(Number(win.args?.["level"] ?? 0));
  return (
    <div className={`worm-popup is-${c.tier}`}>
      <div className="worm-body">
        <PixelIcon name={ICON[c.tier]} size={32} />
        <p>{c.text}</p>
      </div>
      <div className="worm-actions">
        {c.buttons.map((b, i) => (
          <button
            key={b}
            className={`nes-btn is-small ${i === 0 ? (c.tier === "ad" ? "is-success" : c.tier === "error" ? "" : "is-warning") : ""}`}
            onClick={() => wm.close(win.key)}
          >
            {b}
          </button>
        ))}
      </div>
    </div>
  );
}
