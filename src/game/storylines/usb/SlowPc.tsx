// While the backdoor is running the whole PC stalls now and then: every click is swallowed for a
// moment and "VirusHuntOS is not responding" appears over whatever you were doing.
import { useEffect, useState } from "react";
import { PixelIcon } from "../../components/PixelIcon";
import { useIsSlow } from "../../system/health";

const FREEZE_FIRST_MS = 10_000;
const FREEZE_EVERY_MS = [12_000, 22_000] as const;
const FREEZE_FOR_MS = 1_800;

export function SlowPc() {
  const slow = useIsSlow();
  const [frozen, setFrozen] = useState(false);

  useEffect(() => {
    if (!slow) {
      setFrozen(false);
      return;
    }
    let freezeAt = 0;
    let thawAt = 0;
    let alive = true;

    const wait = () =>
      FREEZE_EVERY_MS[0] + Math.random() * (FREEZE_EVERY_MS[1] - FREEZE_EVERY_MS[0]);

    const schedule = (ms: number) => {
      freezeAt = window.setTimeout(() => {
        if (!alive) return;
        setFrozen(true);
        thawAt = window.setTimeout(() => {
          if (!alive) return;
          setFrozen(false);
          schedule(wait());
        }, FREEZE_FOR_MS);
      }, ms);
    };

    schedule(FREEZE_FIRST_MS);
    return () => {
      alive = false;
      clearTimeout(freezeAt);
      clearTimeout(thawAt);
    };
  }, [slow]);

  if (!slow || !frozen) return null;

  return (
    <div className="slow-freeze" role="status" aria-live="polite">
      <div className="slow-freeze-box">
        <PixelIcon name="warning" size={24} />
        <span>VirusHuntOS is not responding...</span>
      </div>
    </div>
  );
}
