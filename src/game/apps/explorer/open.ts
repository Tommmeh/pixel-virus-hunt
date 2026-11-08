// "Double-click a file": decide which program opens it. Shared by Explorer and desktop icons.
import { emit } from "../../system/events";
import { baseName, getNode, normalizePath } from "../../system/fs";
import { wm } from "../../system/windows";

export function openPath(path: string) {
  const p = normalizePath(path);
  const node = getNode(p);
  if (!node) {
    wm.alert({ title: baseName(p), text: `VirusHuntOS cannot find '${p}'.`, icon: "error" });
    return;
  }
  if (node.type === "folder") {
    wm.open("explorer", { path: p });
    return;
  }
  emit({ type: "file.open", path: p });
  switch (node.kind) {
    case "text":
      wm.open("notepad", { path: p }, { key: `notepad:${p.toLowerCase()}` });
      return;
    case "program":
      if (node.app) wm.open(node.app);
      return;
    case "system":
      wm.alert({ title: node.name, text: "Access is denied.", icon: "error" });
      return;
    case "image":
      wm.alert({
        title: "VirusHuntOS Picture Viewer",
        text: `The picture '${node.name}' can't be shown because the viewer isn't installed yet.`,
        icon: "info",
      });
      return;
    case "audio":
      wm.alert({
        title: "Media Player",
        text: `There is no media player installed to play '${node.name}'.`,
        icon: "info",
      });
      return;
    case "doc":
      wm.alert({
        title: "VirusHuntOS",
        text: `VirusHuntOS cannot open this file:\n\n${node.name}\n\nTo open this file, VirusHuntOS needs to know what program created it.`,
        icon: "warning",
      });
  }
}
