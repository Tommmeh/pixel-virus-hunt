import { useEffect, useState } from "react";
import { SCOUT_FRAMES, SCOUT_PALETTE, SIZE, type ScoutFrame } from "./scoutSprite";

/** Scout the magnifying-glass detective. Blinks every few seconds; `cheer` for the happy ending. */
export function Scout({ size = 96, cheer = false }: { size?: number; cheer?: boolean }) {
  const [blink, setBlink] = useState(false);
  useEffect(() => {
    let t: ReturnType<typeof setTimeout>;
    const loop = () => {
      t = setTimeout(
        () => {
          setBlink(true);
          t = setTimeout(() => {
            setBlink(false);
            loop();
          }, 160);
        },
        2600 + Math.random() * 2000,
      );
    };
    loop();
    return () => clearTimeout(t);
  }, []);

  const frame: ScoutFrame = cheer ? "cheer" : blink ? "blink" : "idle";
  const grid = SCOUT_FRAMES[frame];
  const rects = [];
  for (let y = 0; y < SIZE; y++)
    for (let x = 0; x < SIZE; x++) {
      const fill = SCOUT_PALETTE[grid[y]![x]!];
      if (fill) rects.push(<rect key={`${x}-${y}`} x={x} y={y} width={1} height={1} fill={fill} />);
    }
  return (
    <svg
      className="scout"
      width={size}
      height={size}
      viewBox={`0 0 ${SIZE} ${SIZE}`}
      shapeRendering="crispEdges"
      role="img"
      aria-label="Scout, your guide"
    >
      {rects}
    </svg>
  );
}
