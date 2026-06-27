import { useEffect, useState } from "react";
import { XIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { EstiloFilterSelect } from "@/components/filters/estilo-filter-select";

const ALL_SIZES = ["P", "M", "G", "GG", "G1", "G2"];

export interface ModelsFiltersState {
  categoriaId: number | undefined;
  precoMin: number | undefined;
  precoMax: number | undefined;
  tamanhoSiglas: string[];
  ativo: boolean | undefined;
}

interface ModelsFiltersModalProps {
  open: boolean;
  onClose: () => void;
  filters: ModelsFiltersState;
  onApply: (filters: ModelsFiltersState) => void;
  categoryOptions: { id: number; nome: string }[];
  priceRange: { min: number; max: number };
}

export function ModelsFiltersModal({
  open,
  onClose,
  filters,
  onApply,
  categoryOptions,
  priceRange,
}: ModelsFiltersModalProps) {
  const [draft, setDraft] = useState<ModelsFiltersState>(filters);

  useEffect(() => {
    if (open) {
      setDraft(filters);
    }
  }, [open, filters]);

  if (!open) return null;

  const selectedCategoryName = draft.categoriaId
    ? categoryOptions.find((c) => c.id === draft.categoriaId)?.nome
    : undefined;

  const effectiveMin = draft.precoMin ?? priceRange.min;
  const effectiveMax = draft.precoMax ?? priceRange.max;

  const toggleSize = (sigla: string) => {
    setDraft((prev) => {
      const has = prev.tamanhoSiglas.includes(sigla);
      return {
        ...prev,
        tamanhoSiglas: has
          ? prev.tamanhoSiglas.filter((s) => s !== sigla)
          : [...prev.tamanhoSiglas, sigla],
      };
    });
  };

  const formatPrice = (value: number) =>
    value.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4 py-6">
      <div className="w-full max-w-md rounded-[10px] border border-border bg-background p-5 shadow-lg">
        <div className="flex items-center justify-between gap-4">
          <h3 className="text-base font-bold">Filtrar Personalizaveis</h3>
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
            selected={selectedCategoryName ? [selectedCategoryName] : []}
            onChange={(values) => {
              const name = values[values.length - 1];
              const cat = categoryOptions.find((c) => c.nome === name);
              setDraft((prev) => ({
                ...prev,
                categoriaId: cat ? cat.id : undefined,
              }));
            }}
            options={categoryOptions.map((c) => c.nome)}
            label="Categorias"
            placeholder="Seleciona uma opcao"
          />
        </div>

        <div className="mt-4">
          <p className="font-medium text-sm">Preco</p>
          <p className="text-xs text-muted-foreground mt-1">
            {formatPrice(effectiveMin)} - {formatPrice(effectiveMax)}
          </p>
          <div className="mt-2 relative h-6 flex items-center">
            <div className="absolute left-0 right-0 h-[6px] bg-muted rounded-full" />
            <div
              className="absolute h-[6px] bg-primary rounded-full"
              style={{
                left: `${priceRange.max > priceRange.min ? ((effectiveMin - priceRange.min) / (priceRange.max - priceRange.min)) * 100 : 0}%`,
                right: `${priceRange.max > priceRange.min ? 100 - ((effectiveMax - priceRange.min) / (priceRange.max - priceRange.min)) * 100 : 0}%`,
              }}
            />
            <input
              type="range"
              min={priceRange.min}
              max={priceRange.max}
              step={1}
              value={effectiveMin}
              onChange={(e) =>
                setDraft((prev) => ({
                  ...prev,
                  precoMin: Math.min(Number(e.target.value), effectiveMax),
                }))
              }
              className="absolute w-full appearance-none bg-transparent pointer-events-none [&::-webkit-slider-thumb]:pointer-events-auto [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:border-2 [&::-webkit-slider-thumb]:border-primary [&::-webkit-slider-thumb]:bg-background [&::-webkit-slider-thumb]:cursor-pointer [&::-moz-range-thumb]:pointer-events-auto [&::-moz-range-thumb]:appearance-none [&::-moz-range-thumb]:h-4 [&::-moz-range-thumb]:w-4 [&::-moz-range-thumb]:rounded-full [&::-moz-range-thumb]:border-2 [&::-moz-range-thumb]:border-primary [&::-moz-range-thumb]:bg-background [&::-moz-range-thumb]:cursor-pointer"
              style={{ zIndex: 3 }}
            />
            <input
              type="range"
              min={priceRange.min}
              max={priceRange.max}
              step={1}
              value={effectiveMax}
              onChange={(e) =>
                setDraft((prev) => ({
                  ...prev,
                  precoMax: Math.max(Number(e.target.value), effectiveMin),
                }))
              }
              className="absolute w-full appearance-none bg-transparent pointer-events-none [&::-webkit-slider-thumb]:pointer-events-auto [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:border-2 [&::-webkit-slider-thumb]:border-primary [&::-webkit-slider-thumb]:bg-background [&::-webkit-slider-thumb]:cursor-pointer [&::-moz-range-thumb]:pointer-events-auto [&::-moz-range-thumb]:appearance-none [&::-moz-range-thumb]:h-4 [&::-moz-range-thumb]:w-4 [&::-moz-range-thumb]:rounded-full [&::-moz-range-thumb]:border-2 [&::-moz-range-thumb]:border-primary [&::-moz-range-thumb]:bg-background [&::-moz-range-thumb]:cursor-pointer"
              style={{ zIndex: 4 }}
            />
          </div>
        </div>

        <div className="mt-4">
          <div className="flex flex-wrap gap-2">
            {ALL_SIZES.map((size) => {
              const selected = draft.tamanhoSiglas.includes(size);
              return (
                <button
                  key={size}
                  type="button"
                  onClick={() => toggleSize(size)}
                  className={`min-w-[56px] h-[56px] flex items-center justify-center rounded-[6px] border text-base font-bold transition-colors ${
                    selected
                      ? "border-primary bg-primary text-primary-foreground"
                      : "border-border bg-background text-foreground hover:bg-muted"
                  }`}
                >
                  {size}
                </button>
              );
            })}
          </div>
        </div>

        <div className="mt-4">
          <p className="font-medium text-sm mb-2">Status</p>
          <div className="flex gap-2">
            {[
              { label: "Todos", value: undefined },
              { label: "Ativos", value: true },
              { label: "Inativos", value: false },
            ].map((opt) => {
              const selected = draft.ativo === opt.value;
              return (
                <button
                  key={opt.label}
                  type="button"
                  onClick={() =>
                    setDraft((prev) => ({ ...prev, ativo: opt.value }))
                  }
                  className={`px-4 h-8 rounded-[6px] border text-sm font-medium transition-colors ${
                    selected
                      ? "border-primary bg-primary text-primary-foreground"
                      : "border-border bg-background text-foreground hover:bg-muted"
                  }`}
                >
                  {opt.label}
                </button>
              );
            })}
          </div>
        </div>

        <div className="mt-6 flex items-center justify-end gap-3">
          <Button
            type="button"
            variant="outline"
            className="h-9"
            onClick={onClose}
          >
            Cancelar
          </Button>
          <Button
            type="button"
            className="h-9"
            onClick={() => {
              onApply(draft);
              onClose();
            }}
          >
            Aplicar filtro
          </Button>
        </div>
      </div>
    </div>
  );
}
