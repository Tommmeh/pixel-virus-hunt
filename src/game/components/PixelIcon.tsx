import { ICONS, PALETTE } from "./icons";

interface Props {
  /** Key in ICONS. Anything else (e.g. an emoji) is rendered as text. */
  name: string;
  size?: number;
  className?: string;
}

/** Crisp pixel-art icon. Falls back to rendering `name` as text so emoji still work. */
export function PixelIcon({ name, size = 32, className = "" }: Props) {
  const grid = ICONS[name];
  if (!grid) {
    return (
      <span
        className={`pixel-icon ${className}`}
        style={{ fontSize: size * 0.85, lineHeight: 1, width: size, height: size }}
        aria-hidden
      >
        {name}
      </span>
    );
  }
  const rects = [];
  for (let y = 0; y < grid.length; y++) {
    const row = grid[y]!;
    for (let x = 0; x < row.length; x++) {
      const fill = PALETTE[row[x]!];
      if (fill) rects.push(<rect key={`${x}-${y}`} x={x} y={y} width={1} height={1} fill={fill} />);
    }
  }
  return (
    <svg
      className={`pixel-icon ${className}`}
      width={size}
      height={size}
      viewBox="0 0 16 16"
      shapeRendering="crispEdges"
      aria-hidden
    >
      {rects}
    </svg>
  );
}
