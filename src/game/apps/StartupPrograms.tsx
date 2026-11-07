import { LEGIT_STARTUP } from "../malware";
import { useGame } from "../state";
import { useInfectedComponents } from "./infected";

export function StartupPrograms() {
  const { state, dispatch } = useGame();
  const comps = useInfectedComponents();
  const items = [
    ...LEGIT_STARTUP.filter((s) => !state.falseRemovals.includes(s.id)).map((s) => ({
      ...s,
      bad: false,
    })),
    ...comps.flatMap((c) => (c.kind === "startup" ? [{ ...c, bad: true }] : [])),
  ].sort((a, b) => a.name.localeCompare(b.name));
  return (
    <div className="text-[10px]">
      <p className="mb-2">Programs that run when Windows starts:</p>
      <table className="xp-table">
        <thead>
          <tr>
            <th>Item</th>
            <th>Command</th>
            <th></th>
          </tr>
        </thead>
        <tbody>
          {items.map((i) => (
            <tr key={i.id}>
              <td>{i.name}</td>
              <td className="break-all">{i.command}</td>
              <td>
                <button
                  className="nes-btn is-warning btn-xs"
                  onClick={() => dispatch({ type: i.bad ? "REMOVE" : "REMOVE_LEGIT", id: i.id })}
                >
                  Remove
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
