import { useState } from "react";
import { Trash2, Pencil, Check, Image as ImageIcon, Plus, Minus } from "lucide-react";
import { ImageInput } from "@/components/ui/image-input";
import { ColorPicker } from "@/components/ui/color-picker";

export interface SizeStock {
  sigla: string;
  estoque: number;
}

export interface ColorCardData {
  colorName: string;
  colorHex: string;
  presentationImage: string | File | null;
  frontImage: string | File | null;
  backImage: string | File | null;
  sizes: SizeStock[];
}

const DEFAULT_SIZES: SizeStock[] = [
  { sigla: "PP", estoque: 0 },
  { sigla: "P", estoque: 0 },
  { sigla: "M", estoque: 0 },
  { sigla: "G", estoque: 0 },
  { sigla: "GG", estoque: 0 },
  { sigla: "XGG", estoque: 0 },
];

interface ColorCardProps {
  data: ColorCardData;
  onChange: (data: ColorCardData) => void;
  onDelete: () => void;
  onSave: () => void;
  onSavedChange?: (saved: boolean) => void;
  initialSaved?: boolean;
}

function getImageSrc(image: string | File | null): string | null {
  if (!image) return null;
  if (typeof image === "string") return image;
  return URL.createObjectURL(image);
}

export function ColorCard({
  data,
  onChange,
  onDelete,
  onSave,
  onSavedChange,
  initialSaved = false,
}: ColorCardProps) {
  const [isSaved, setIsSaved] = useState(initialSaved);

  const canSave = data.colorName.trim() !== "" && data.presentationImage !== null;

  const handleSave = () => {
    if (!canSave) return;
    setIsSaved(true);
    onSavedChange?.(true);
    onSave();
  };

  const handleEdit = () => {
    setIsSaved(false);
    onSavedChange?.(false);
  };

  const updateSizeStock = (sigla: string, delta: number) => {
    const newSizes = data.sizes.map((s) =>
      s.sigla === sigla ? { ...s, estoque: Math.max(0, s.estoque + delta) } : s
    );
    onChange({ ...data, sizes: newSizes });
  };

  const setSizeStockDirect = (sigla: string, value: number) => {
    const newSizes = data.sizes.map((s) =>
      s.sigla === sigla ? { ...s, estoque: Math.max(0, value) } : s
    );
    onChange({ ...data, sizes: newSizes });
  };

  const renderImagePreview = (image: string | File | null, alt: string) => {
    const src = getImageSrc(image);
    if (src) {
      return (
        <div className="w-full aspect-[6/7] max-w-[100px] rounded-xl overflow-hidden border border-slate-100 shadow-sm group relative">
          <img src={src} alt={alt} className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110" />
        </div>
      );
    }
    return (
      <div className="w-full aspect-[6/7] max-w-[100px] rounded-xl border-2 border-dashed border-slate-200 bg-slate-50 flex items-center justify-center">
        <ImageIcon className="size-5 text-slate-300" />
      </div>
    );
  };

  const renderImageSection = (editable: boolean) => (
    <div className="flex items-start justify-between gap-3 pt-3 border-t border-slate-100 mt-1">
      {(["presentationImage", "frontImage", "backImage"] as const).map((key, i) => {
        const labels = ["Apresentação", "Frente", "Costas"];
        return (
          <div key={key} className="flex flex-col items-center gap-2 flex-1">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider text-center leading-tight min-h-[28px] flex items-end justify-center">
              {labels[i]}
            </span>
            {editable ? (
              <ImageInput
                value={data[key]}
                onChange={(file) => onChange({ ...data, [key]: file })}
                onRemove={() => onChange({ ...data, [key]: null })}
                containerClassName="w-full aspect-[6/7] max-w-[100px] rounded-xl"
                placeholder="Upload"
                iconClassName="size-4"
              />
            ) : (
              renderImagePreview(data[key], labels[i])
            )}
          </div>
        );
      })}
    </div>
  );

  const sizes = data.sizes && data.sizes.length > 0 ? data.sizes : DEFAULT_SIZES;

  return (
    <div className={`bg-white rounded-2xl border ${isSaved ? "border-slate-200" : "border-pink-200 shadow-md shadow-pink-100/50"} p-4 flex flex-col gap-3 min-w-[320px] transition-all duration-300`}>
      {/* Cabeçalho */}
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-1 bg-slate-50 rounded-lg border border-slate-100 shadow-sm">
            <ColorPicker
              value={data.colorHex || "#D9D9D9"}
              onChange={(hex) => onChange({ ...data, colorHex: hex })}
              size={24}
              disabled={isSaved}
            />
          </div>
          {isSaved ? (
            <span className="text-sm font-bold text-slate-700">{data.colorName || "Sem nome"}</span>
          ) : (
            <input
              type="text"
              value={data.colorName}
              onChange={(e) => onChange({ ...data, colorName: e.target.value })}
              placeholder="Ex: Rosa Neon"
              className="bg-slate-50 border border-slate-200 rounded-lg px-3 py-1.5 text-sm font-medium min-w-[140px] outline-none focus:border-pink-400 focus:ring-2 focus:ring-pink-50 transition-all text-slate-700 placeholder:text-slate-400"
            />
          )}
        </div>
        <div className="flex items-center gap-2">
          {isSaved ? (
            <>
              <button type="button" onClick={handleEdit} className="p-2 text-slate-400 hover:text-pink-600 hover:bg-pink-50 rounded-lg transition-colors" title="Editar">
                <Pencil className="size-4" />
              </button>
              <button type="button" onClick={onDelete} className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors" title="Excluir">
                <Trash2 className="size-4" />
              </button>
            </>
          ) : (
            <>
              <button type="button" onClick={onDelete} className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors">
                <Trash2 className="size-4" />
              </button>
              <button
                type="button"
                onClick={handleSave}
                disabled={!canSave}
                className={`flex items-center gap-1.5 text-xs font-bold px-4 py-2 rounded-lg transition-all ${canSave ? "bg-pink-500 text-white hover:bg-pink-600 shadow-sm cursor-pointer" : "bg-slate-100 text-slate-400 cursor-not-allowed"}`}
              >
                <Check className="size-3.5" />
                Salvar
              </button>
            </>
          )}
        </div>
      </div>

      {/* Imagens */}
      {renderImageSection(!isSaved)}

      {/* Tamanhos e Estoque */}
      <div className="pt-3 border-t border-slate-100">
        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">
          Estoque por tamanho
        </p>
        <div className="grid grid-cols-3 gap-2">
          {sizes.map((size) => (
            <div
              key={size.sigla}
              className={`flex flex-col items-center gap-1.5 p-2 rounded-xl border transition-all ${
                size.estoque > 0 ? "border-pink-200 bg-pink-50" : "border-slate-100 bg-slate-50"
              } ${isSaved ? "opacity-70" : ""}`}
            >
              <span className={`text-[11px] font-black ${size.estoque > 0 ? "text-pink-600" : "text-slate-400"}`}>
                {size.sigla}
              </span>
              {isSaved ? (
                <span className="text-sm font-bold text-slate-600">{size.estoque}</span>
              ) : (
                <div className="flex items-center gap-1">
                  <button
                    type="button"
                    onClick={() => updateSizeStock(size.sigla, -1)}
                    className="size-5 rounded-md bg-white border border-slate-200 flex items-center justify-center text-slate-400 hover:text-pink-500 hover:border-pink-300 transition-colors"
                  >
                    <Minus className="size-2.5" />
                  </button>
                  <input
                    type="number"
                    value={size.estoque}
                    onChange={(e) => setSizeStockDirect(size.sigla, parseInt(e.target.value) || 0)}
                    className="w-8 text-center text-xs font-bold text-slate-700 bg-transparent outline-none [&::-webkit-inner-spin-button]:appearance-none"
                    min={0}
                  />
                  <button
                    type="button"
                    onClick={() => updateSizeStock(size.sigla, 1)}
                    className="size-5 rounded-md bg-white border border-slate-200 flex items-center justify-center text-slate-400 hover:text-pink-500 hover:border-pink-300 transition-colors"
                  >
                    <Plus className="size-2.5" />
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
        {!isSaved && (
          <p className="text-[10px] text-slate-400 mt-2">
            Total: {sizes.reduce((a, s) => a + s.estoque, 0)} unidades cadastradas
          </p>
        )}
      </div>
    </div>
  );
}