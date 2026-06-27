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
  confirmVariant = "outline",
}: ConfirmDialogProps) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="bg-background rounded-[10px] border border-border max-w-md w-full mx-4 shadow-lg overflow-hidden">
        <div className="p-6">
          {title && (
            <h2 className="font-bold text-xl mb-2">
              {title}
            </h2>
          )}
          <p className="text-sm mb-6 text-muted-foreground whitespace-pre-line">
            {message}
          </p>
          <div className="flex gap-3 justify-center">
            <Button
              type="button"
              variant="outline"
              onClick={onConfirm}
              className="h-[37px] min-w-[160px]"
            >
              {confirmLabel}
            </Button>
            <Button
              type="button"
              onClick={onCancel}
              className={`h-[37px] min-w-[160px] ${confirmVariant === "warning"
                ? "bg-primary text-primary-foreground hover:bg-primary/80 border-primary"
                : ""
                }`}
            >
              {cancelLabel}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
