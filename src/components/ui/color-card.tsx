import { useState } from "react";
import { Trash2, Pencil, Check, Image as ImageIcon } from "lucide-react";
import { ImageInput } from "@/components/ui/image-input";
import { ColorPicker } from "@/components/ui/color-picker";

export interface ColorCardData {
  colorName: string;
  colorHex: string;
  presentationImage: string | File | null;
  frontImage: string | File | null;
  backImage: string | File | null;
}

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
  initialSaved = false 
}: ColorCardProps) {
  const [isSaved, setIsSaved] = useState(initialSaved);

  // Regra: Exige Nome da Cor e Imagem de Apresentação
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

  const renderImagePreview = (image: string | File | null, alt: string) => {
    const src = getImageSrc(image);
    
    if (src) {
      return (
        <div className="w-full aspect-[6/7] max-w-[100px] rounded-xl overflow-hidden border border-slate-100 shadow-sm group relative">
          <img src={src} alt={alt} className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110" />
        </div>
      );
    }
    
    // Placeholder elegante para quando não houver imagem no modo "Salvo"
    return (
      <div className="w-full aspect-[6/7] max-w-[100px] rounded-xl border-2 border-dashed border-slate-200 bg-slate-50 flex items-center justify-center">
        <ImageIcon className="size-5 text-slate-300" />
      </div>
    );
  };

  const renderImageSection = (editable: boolean) => (
    <div className="flex items-start justify-between gap-3 pt-3 border-t border-slate-100 mt-1">
      <div className="flex flex-col items-center gap-2 flex-1">
        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider text-center leading-tight min-h-[28px] flex items-end justify-center">
          Apresentação
        </span>
        {editable ? (
          <ImageInput
            value={data.presentationImage}
            onChange={(file) => onChange({ ...data, presentationImage: file })}
            onRemove={() => onChange({ ...data, presentationImage: null })}
            containerClassName="w-full aspect-[6/7] max-w-[100px] rounded-xl"
            placeholder="Upload"
            iconClassName="size-4"
          />
        ) : (
          renderImagePreview(data.presentationImage, "Apresentação")
        )}
      </div>
      
      <div className="flex flex-col items-center gap-2 flex-1">
        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider text-center leading-tight min-h-[28px] flex items-end justify-center">
          Frente
        </span>
        {editable ? (
          <ImageInput
            value={data.frontImage}
            onChange={(file) => onChange({ ...data, frontImage: file })}
            onRemove={() => onChange({ ...data, frontImage: null })}
            containerClassName="w-full aspect-[6/7] max-w-[100px] rounded-xl"
            placeholder="Upload"
            iconClassName="size-4"
          />
        ) : (
          renderImagePreview(data.frontImage, "Frente")
        )}
      </div>
      
      <div className="flex flex-col items-center gap-2 flex-1">
        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider text-center leading-tight min-h-[28px] flex items-end justify-center">
          Costas
        </span>
        {editable ? (
          <ImageInput
            value={data.backImage}
            onChange={(file) => onChange({ ...data, backImage: file })}
            onRemove={() => onChange({ ...data, backImage: null })}
            containerClassName="w-full aspect-[6/7] max-w-[100px] rounded-xl"
            placeholder="Upload"
            iconClassName="size-4"
          />
        ) : (
          renderImagePreview(data.backImage, "Costas")
        )}
      </div>
    </div>
  );

  return (
    <div className={`bg-white rounded-2xl border ${isSaved ? 'border-slate-200' : 'border-pink-200 shadow-md shadow-pink-100/50'} p-4 flex flex-col gap-3 min-w-[320px] transition-all duration-300`}>
      
      {/* Cabeçalho do Card (Cor, Nome e Ações) */}
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
              <button
                type="button"
                onClick={handleEdit}
                className="p-2 text-slate-400 hover:text-pink-600 hover:bg-pink-50 rounded-lg transition-colors"
                title="Editar Cor"
              >
                <Pencil className="size-4" />
              </button>
              <button
                type="button"
                onClick={onDelete}
                className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                title="Excluir Cor"
              >
                <Trash2 className="size-4" />
              </button>
            </>
          ) : (
            <>
              <button
                type="button"
                onClick={onDelete}
                className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                title="Excluir Cor"
              >
                <Trash2 className="size-4" />
              </button>
              <button
                type="button"
                onClick={handleSave}
                disabled={!canSave}
                className={`flex items-center gap-1.5 text-xs font-bold px-4 py-2 rounded-lg transition-all ${
                  canSave
                    ? "bg-pink-500 text-white hover:bg-pink-600 shadow-sm cursor-pointer"
                    : "bg-slate-100 text-slate-400 cursor-not-allowed"
                }`}
              >
                <Check className="size-3.5" />
                Salvar
              </button>
            </>
          )}
        </div>
      </div>

      {/* Seção de Imagens */}
      {renderImageSection(!isSaved)}
    </div>
  );
}