import { useEffect } from "react";
import { PixelIcon } from "../../components/PixelIcon";
import { playDing, playError } from "../../components/sound";
import { wm, type Win } from "../../system/windows";

/** VirusHuntOS message box — opened with wm.alert({ title, text, icon }). */
export function MessageBox({ win }: { win: Win }) {
  const icon = win.args?.["icon"] ?? "info";
  useEffect(() => {
    if (icon === "info") playDing();
    else playError();
  }, [icon]);
  return (
    <div className="msgbox">
      <div className="msgbox-body">
        <PixelIcon
          name={icon === "info" ? "info" : icon === "error" ? "error" : "warning"}
          size={32}
        />
        <p>{win.args?.["text"]}</p>
      </div>
      <div className="msgbox-actions">
        <button className="nes-btn is-primary" autoFocus onClick={() => wm.close(win.key)}>
          OK
        </button>
      </div>
    </div>
  );
}

export function RecycleBin() {
  return (
    <div className="explorer">
      <div className="explorer-main">
        <aside className="task-pane">
          <div className="task-box">
            <h4>Recycle Bin Tasks</h4>
            <p className="opacity-60">Empty the Recycle Bin</p>
          </div>
        </aside>
        <div className="explorer-view">
          <p className="empty-note">The Recycle Bin is empty.</p>
        </div>
      </div>
      <div className="os-status">0 object(s)</div>
    </div>
  );
}
