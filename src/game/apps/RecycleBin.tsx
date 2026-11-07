import { useGame } from "../state";

export function RecycleBin() {
  const { state } = useGame();
  const n = state.removed.length + state.falseRemovals.length;
  return (
    <p className="text-[10px]">{n === 0 ? "Recycle Bin is empty." : `${n} item(s) deleted.`}</p>
  );
}
