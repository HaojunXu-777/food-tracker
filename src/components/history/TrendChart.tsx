type Point = {
  date: string;
  value: number | null;
};

type TrendChartProps = {
  points: Point[];
  fillEmptyWithZero: boolean;
  formatY?: (value: number) => string;
  color?: string;
};

function niceMax(value: number): number {
  if (value <= 0) return 1;
  const magnitude = 10 ** Math.floor(Math.log10(value));
  const normalized = value / magnitude;
  const nice = normalized <= 1 ? 1 : normalized <= 2 ? 2 : normalized <= 5 ? 5 : 10;
  return nice * magnitude;
}

export function TrendChart({
  points,
  fillEmptyWithZero,
  formatY = (value) => String(Math.round(value)),
  color = "var(--accent-cyan)",
}: TrendChartProps) {
  const width = 320;
  const height = 160;
  const padL = 36;
  const padR = 8;
  const padT = 12;
  const padB = 24;
  const innerW = width - padL - padR;
  const innerH = height - padT - padB;
  const count = Math.max(points.length - 1, 1);

  const numeric = points
    .map((point) => (fillEmptyWithZero ? (point.value ?? 0) : point.value))
    .filter((value): value is number => value != null);

  const max = fillEmptyWithZero
    ? niceMax(Math.max(0, ...numeric))
    : numeric.length
      ? Math.max(...numeric) + Math.max((Math.max(...numeric) - Math.min(...numeric)) * 0.2, 0.4)
      : 1;
  const min = fillEmptyWithZero
    ? 0
    : numeric.length
      ? Math.max(0, Math.min(...numeric) - Math.max((Math.max(...numeric) - Math.min(...numeric)) * 0.2, 0.4))
      : 0;

  function xAt(index: number): number {
    return padL + (index / count) * innerW;
  }

  function yAt(value: number): number {
    const span = max - min || 1;
    return padT + innerH * (1 - (value - min) / span);
  }

  const linePoints = points
    .map((point, index) => {
      const value = fillEmptyWithZero ? (point.value ?? 0) : point.value;
      if (value == null) return null;
      return { x: xAt(index), y: yAt(value), date: point.date };
    })
    .filter((point): point is { x: number; y: number; date: string } => point != null);

  const path = linePoints
    .map((point, index) => `${index === 0 ? "M" : "L"} ${point.x} ${point.y}`)
    .join(" ");

  const areaPath =
    linePoints.length > 0
      ? `${path} L ${linePoints[linePoints.length - 1].x} ${padT + innerH} L ${linePoints[0].x} ${padT + innerH} Z`
      : "";

  const ticks = [max, (max + min) / 2, min];
  const labelEvery = points.length > 10 ? Math.ceil(points.length / 7) : 1;
  const gradId = `trend-${color.replace(/[^a-zA-Z0-9]/g, "")}`;

  return (
    <svg viewBox={`0 0 ${width} ${height}`} className="h-40 w-full" aria-hidden>
      <defs>
        <linearGradient id={gradId} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity="0.28" />
          <stop offset="100%" stopColor={color} stopOpacity="0.02" />
        </linearGradient>
      </defs>
      {ticks.map((tick) => (
        <g key={tick}>
          <line
            x1={padL}
            x2={width - padR}
            y1={yAt(tick)}
            y2={yAt(tick)}
            stroke="var(--line)"
            strokeWidth="1"
          />
          <text
            x={padL - 6}
            y={yAt(tick) + 3}
            textAnchor="end"
            fontSize="10"
            fill="var(--muted)"
          >
            {formatY(tick)}
          </text>
        </g>
      ))}
      {areaPath ? <path d={areaPath} fill={`url(#${gradId})`} /> : null}
      {path ? (
        <path d={path} fill="none" stroke={color} strokeWidth="2.25" strokeLinecap="round" strokeLinejoin="round" />
      ) : null}
      {linePoints.map((point) => (
        <circle key={point.date} cx={point.x} cy={point.y} r="3.5" fill={color} stroke="#fff" strokeWidth="1.5" />
      ))}
      {points.map((point, index) =>
        index % labelEvery === 0 || index === points.length - 1 ? (
          <text
            key={`label-${point.date}`}
            x={xAt(index)}
            y={height - 6}
            textAnchor="middle"
            fontSize="10"
            fill="var(--muted)"
          >
            {Number(point.date.slice(8, 10))}
          </text>
        ) : null,
      )}
    </svg>
  );
}
