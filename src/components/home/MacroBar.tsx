type MacroBarProps = {
  label: string;
  current: number;
  goal?: number;
};

export function MacroBar({ label, current, goal }: MacroBarProps) {
  const percent =
    goal && goal > 0 ? Math.min((current / goal) * 100, 100) : 0;

  return (
    <div className="grid grid-cols-[3rem_1fr_auto] items-center gap-3 text-sm">
      <span>{label}</span>
      {goal && goal > 0 ? (
        <div className="h-2.5 overflow-hidden rounded-full bg-[var(--bar-track)]">
          <div
            className="h-full rounded-full bg-[var(--bar-fill)]"
            style={{ width: `${percent}%` }}
          />
        </div>
      ) : (
        <div />
      )}
      <span className="tabular-nums text-[var(--muted)]">
        {goal && goal > 0 ? `${current} / ${goal}g` : `${current}g`}
      </span>
    </div>
  );
}
