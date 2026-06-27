/* eslint-disable react-hooks/set-state-in-effect */
import { useEffect, useState } from "react";
import { XIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { EstiloFilterSelect } from "@/components/filters/estilo-filter-select";

interface GraphicsFiltersModalProps {
  open: boolean;
  onClose: () => void;
  selectedStyles: string[];
  onStylesChange: (values: string[]) => void;
  options?: string[];
}

export function GraphicsFiltersModal({
  open,
  onClose,
  selectedStyles,
  onStylesChange,
  options,
}: GraphicsFiltersModalProps) {
  const [draftStyles, setDraftStyles] = useState<string[]>(selectedStyles);

  useEffect(() => {
    if (open) {
      setDraftStyles(selectedStyles);
    }
  }, [open, selectedStyles]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4 py-6">
      <div className="w-full max-w-md rounded-[10px] border border-border bg-background p-5 shadow-lg">
        <div className="flex items-center justify-between gap-4">
          <h3 className="text-base font-bold">Filtros</h3>
          <button
            type="button"
            onClick={onClose}
            className="rounded-full p-1 text-muted-foreground hover:text-foreground"
            aria-label="Fechar"
          >
            <XIcon className="size-4" />
          </button>
        </div>

        <div className="mt-4">
          <EstiloFilterSelect
            selected={draftStyles}
            onChange={setDraftStyles}
            options={options}
          />
        </div>

        <div className="mt-6 flex items-center justify-end gap-3">
          <Button
            type="button"
            variant="outline"
            className="h-9"
            onClick={() => setDraftStyles([])}
          >
            Limpar
          </Button>
          <Button
            type="button"
            className="h-9"
            onClick={() => {
              onStylesChange(draftStyles);
              onClose();
            }}
          >
            Aplicar
          </Button>
        </div>
      </div>
    </div>
  );
}
