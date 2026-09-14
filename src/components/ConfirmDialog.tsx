"use client";

type ConfirmDialogProps = {
  open: boolean;
  message: string;
  confirmLabel?: string;
  onCancel: () => void;
  onConfirm: () => void;
};

export function ConfirmDialog({
  open,
  message,
  confirmLabel = "删除",
  onCancel,
  onConfirm,
}: ConfirmDialogProps) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-[rgba(26,21,72,0.55)] px-6 backdrop-blur-[2px]">
      <div className="w-full max-w-sm rounded-[1.35rem] bg-white p-5 shadow-[var(--shadow-card)]">
        <p className="text-base font-medium leading-relaxed">{message}</p>
        <div className="mt-5 flex justify-end gap-3">
          <button
            type="button"
            className="rounded-full px-4 py-2 text-sm font-medium text-[var(--muted)]"
            onClick={onCancel}
          >
            取消
          </button>
          <button
            type="button"
            className="rounded-full bg-[rgba(240,115,168,0.14)] px-4 py-2 text-sm font-semibold text-[var(--accent-pink)]"
            onClick={onConfirm}
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
