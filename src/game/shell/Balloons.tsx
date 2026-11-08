import { PixelIcon } from "../components/PixelIcon";
import { dismiss, useBalloons } from "../system/notify";
import { wm } from "../system/windows";

/** XP-style notification balloons above the tray. */
export function Balloons() {
  const list = useBalloons();
  if (list.length === 0) return null;
  return (
    <div className="balloons">
      {list.map((b) => (
        <div
          key={b.id}
          className="nes-balloon from-right balloon"
          role="status"
          onClick={() => {
            dismiss(b.id);
            if (b.open) wm.open(b.open.app, b.open.args, { key: b.open.key, title: b.open.title });
          }}
        >
          <div className="balloon-head">
            <PixelIcon name={b.icon} size={16} />
            <b>{b.title}</b>
            <button
              className="balloon-x"
              aria-label="Close notification"
              onClick={(e) => {
                e.stopPropagation();
                dismiss(b.id);
              }}
            >
              ×
            </button>
          </div>
          <p>{b.text}</p>
        </div>
      ))}
    </div>
  );
}
