type MacroBarProps = {
  label: string;
  current: number;
  goal?: number;
  color?: string;
};

export function MacroBar({
  label,
  current,
  goal,
  color = "var(--accent-cyan)",
}: MacroBarProps) {
  const percent =
    goal && goal > 0 ? Math.min((current / goal) * 100, 100) : 0;

  return (
    <div className="space-y-2">
      <div className="flex items-end justify-between gap-3">
        <div className="flex items-center gap-2">
          <span
            className="h-2.5 w-2.5 rounded-full"
            style={{ background: color }}
            aria-hidden
          />
          <span className="text-sm font-medium text-[var(--foreground)]">
            {label}
          </span>
        </div>
        <span className="ft-num text-sm font-semibold tabular-nums text-[var(--foreground)]">
          {goal && goal > 0 ? (
            <>
              {current}
              <span className="font-normal text-[var(--muted)]"> / {goal}g</span>
            </>
          ) : (
            <>{current}g</>
          )}
        </span>
      </div>
      {goal && goal > 0 ? (
        <div className="h-2.5 overflow-hidden rounded-full bg-[var(--bar-track)]">
          <div
            className="h-full rounded-full transition-[width] duration-300"
            style={{ width: `${percent}%`, background: color }}
          />
        </div>
      ) : (
        <div className="h-2.5 overflow-hidden rounded-full bg-[var(--bar-track)]">
          <div
            className="h-full w-1/3 rounded-full opacity-40"
            style={{ background: color }}
          />
        </div>
      )}
    </div>
  );
}
