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
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/40 px-6">
      <div className="w-full max-w-sm rounded-2xl bg-[var(--card)] p-5">
        <p className="text-base">{message}</p>
        <div className="mt-5 flex justify-end gap-6 text-sm">
          <button type="button" className="text-[var(--muted)]" onClick={onCancel}>
            取消
          </button>
          <button type="button" className="font-semibold text-red-600" onClick={onConfirm}>
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
