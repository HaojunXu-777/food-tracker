type CalorieRingProps = {
  current: number;
  goal?: number;
};

export function CalorieRing({ current, goal }: CalorieRingProps) {
  const size = 220;
  const stroke = 14;
  const radius = (size - stroke) / 2;
  const circumference = 2 * Math.PI * radius;
  const progress = goal && goal > 0 ? Math.min(current / goal, 1) : 0;
  const offset = circumference * (1 - progress);

  return (
    <div className="relative mx-auto h-[220px] w-[220px]">
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} aria-hidden>
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="var(--ring-track)"
          strokeWidth={stroke}
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="var(--ring-fill)"
          strokeWidth={stroke}
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          transform={`rotate(-90 ${size / 2} ${size / 2})`}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
        {goal && goal > 0 ? (
          <>
            <div className="text-4xl font-semibold tracking-tight">{current}</div>
            <div className="mt-1 text-sm text-[var(--muted)]">kcal</div>
            <div className="mt-1 text-sm text-[var(--muted)]">/ {goal}</div>
          </>
        ) : (
          <>
            <div className="text-sm text-[var(--muted)]">今日已摄入</div>
            <div className="mt-1 text-4xl font-semibold tracking-tight">{current}</div>
            <div className="mt-1 text-sm text-[var(--muted)]">kcal</div>
          </>
        )}
      </div>
    </div>
  );
}
