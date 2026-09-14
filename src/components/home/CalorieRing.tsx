type CalorieRingProps = {
  current: number;
  goal?: number;
};

export function CalorieRing({ current, goal }: CalorieRingProps) {
  const size = 220;
  const stroke = 16;
  const radius = (size - stroke) / 2;
  const circumference = 2 * Math.PI * radius;
  const progress = goal && goal > 0 ? Math.min(current / goal, 1) : 0;
  const offset = circumference * (1 - progress);

  return (
    <div className="relative mx-auto h-[220px] w-[220px]">
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} aria-hidden>
        <defs>
          <linearGradient id="kcalRing" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="var(--accent-cyan)" />
            <stop offset="100%" stopColor="var(--accent-violet)" />
          </linearGradient>
        </defs>
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
          stroke="url(#kcalRing)"
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
            <div className="ft-num text-[2.75rem] font-bold leading-none text-[var(--foreground)]">
              {current}
            </div>
            <div className="mt-1 text-sm font-medium text-[var(--accent-cyan)]">kcal</div>
            <div className="mt-1 text-xs text-[var(--muted)]">
              / {goal} 目标
            </div>
          </>
        ) : (
          <>
            <div className="text-xs font-medium uppercase tracking-wide text-[var(--muted)]">
              今日已摄入
            </div>
            <div className="ft-num mt-1 text-[2.75rem] font-bold leading-none">
              {current}
            </div>
            <div className="mt-1 text-sm font-medium text-[var(--accent-cyan)]">kcal</div>
          </>
        )}
      </div>
    </div>
  );
}
