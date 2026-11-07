import { MALWARE } from "../malware";
import { useGame } from "../state";

/** Components of active infections that haven't been removed yet (dormant — empty until consequences return). */
export function useInfectedComponents() {
  const { state } = useGame();
  return MALWARE.filter((m) => state.infections.includes(m.id))
    .flatMap((m) => m.components)
    .filter((c) => !state.removed.includes(c.id));
}
