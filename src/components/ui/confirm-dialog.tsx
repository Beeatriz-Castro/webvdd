import { Button } from "@/components/ui/button";

interface ConfirmDialogProps {
  open: boolean;
  title?: string;
  message: string;
  confirmLabel: string;
  cancelLabel: string;
  onConfirm: () => void;
  onCancel: () => void;
  confirmVariant?: "outline" | "destructive" | "warning";
}

export function ConfirmDialog({
  open,
  title,
  message,
  confirmLabel,
  cancelLabel,
  onConfirm,
  onCancel,
}: ConfirmDialogProps) {
  if (!open) return null;

  return (
    <div
      className="fixed inset-0 flex items-center justify-center bg-black/50 px-4"
      style={{ zIndex: 9999 }}
      onClick={onCancel}
    >
      <div
        className="bg-white rounded-2xl max-w-sm w-full shadow-xl p-6 flex flex-col gap-4"
        onClick={(e) => e.stopPropagation()}
      >
        {title && (
          <h2 className="font-bold text-lg text-slate-800">{title}</h2>
        )}
        <p className="text-sm text-slate-500 leading-relaxed">{message}</p>
        <div className="flex gap-3 justify-end mt-2">
          <Button
            type="button"
            variant="outline"
            onClick={onCancel}
            className="rounded-xl"
          >
            {cancelLabel}
          </Button>
          <Button
            type="button"
            onClick={(e) => { e.stopPropagation(); onConfirm(); }}
            className="rounded-xl bg-red-500 hover:bg-red-600 text-white border-0"
          >
            {confirmLabel}
          </Button>
        </div>
      </div>
    </div>
  );
}