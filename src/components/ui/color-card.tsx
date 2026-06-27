import { useState } from "react";
import { Trash2Icon } from "lucide-react";
import { ImageInput } from "@/components/ui/image-input";
import { ColorPicker } from "@/components/ui/color-picker";
import BrushIcon from "@/components/icons/brush";

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

export function ColorCard({ data, onChange, onDelete, onSave, onSavedChange, initialSaved = false }: ColorCardProps) {
  const [isSaved, setIsSaved] = useState(initialSaved);

  // REGRA CORRIGIDA: Agora só exige Nome da Cor e Imagem de Apresentação
  const canSave = 
    data.colorName.trim() !== "" && 
    data.presentationImage !== null;

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
        <div className="w-full aspect-[6/7] max-w-[100px] rounded-[6px] overflow-hidden border border-border">
          <img src={src} alt={alt} className="w-full h-full object-cover" />
        </div>
      );
    }
    return (
      <div className="w-full aspect-[6/7] max-w-[100px] rounded-[6px] border border-border bg-muted" />
    );
  };

  const renderImageSection = (editable: boolean) => (
    <div className="flex items-start justify-between gap-2">
      <div className="flex flex-col items-center gap-1 flex-1">
        <span className="text-[10px] text-muted-foreground text-center leading-tight min-h-[28px] flex items-start justify-center">
          Apresentação
        </span>
        {editable ? (
          <ImageInput
            value={data.presentationImage}
            onChange={(file) => onChange({ ...data, presentationImage: file })}
            onRemove={() => onChange({ ...data, presentationImage: null })}
            containerClassName="w-full aspect-[6/7] max-w-[100px]"
            placeholder="Imagem do produto"
            iconClassName="size-4"
          />
        ) : (
          renderImagePreview(data.presentationImage, "Apresentação")
        )}
      </div>
      <div className="flex flex-col items-center gap-1 flex-1">
        <span className="text-[10px] text-muted-foreground text-center leading-tight min-h-[28px] flex items-start justify-center">
          Personalização<br />(Frente)
        </span>
        {editable ? (
          <ImageInput
            value={data.frontImage}
            onChange={(file) => onChange({ ...data, frontImage: file })}
            onRemove={() => onChange({ ...data, frontImage: null })}
            containerClassName="w-full aspect-[6/7] max-w-[100px]"
            placeholder="Imagem do produto"
            iconClassName="size-4"
          />
        ) : (
          renderImagePreview(data.frontImage, "Frente")
        )}
      </div>
      <div className="flex flex-col items-center gap-1 flex-1">
        <span className="text-[10px] text-muted-foreground text-center leading-tight min-h-[28px] flex items-start justify-center">
          Personalização<br />(Costa)
        </span>
        {editable ? (
          <ImageInput
            value={data.backImage}
            onChange={(file) => onChange({ ...data, backImage: file })}
            onRemove={() => onChange({ ...data, backImage: null })}
            containerClassName="w-full aspect-[6/7] max-w-[100px]"
            placeholder="Imagem do produto"
            iconClassName="size-4"
          />
        ) : (
          renderImagePreview(data.backImage, "Costa")
        )}
      </div>
    </div>
  );

  return (
    <div className="bg-background rounded-[6px] border border-border p-3 flex flex-col gap-3 min-w-[200px]">
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <ColorPicker
            value={data.colorHex || "#D9D9D9"}
            onChange={(hex) => onChange({ ...data, colorHex: hex })}
            size={20}
            disabled={isSaved}
          />
          {isSaved ? (
            <span className="text-sm font-medium">{data.colorName || "Sem nome"}</span>
          ) : (
            <input
              type="text"
              value={data.colorName}
              onChange={(e) => onChange({ ...data, colorName: e.target.value })}
              placeholder="Nome da cor"
              className="bg-background border border-border rounded-[6px] px-2 py-1 text-xs min-w-[120px] outline-none focus:border-foreground transition-colors"
            />
          )}
        </div>

        <div className="flex items-center gap-2">
          {isSaved ? (
            <>
              <button
                type="button"
                onClick={handleEdit}
                className="text-muted-foreground hover:text-foreground transition-colors"
              >
                <BrushIcon className="size-4" />
              </button>
              <button
                type="button"
                onClick={onDelete}
                className="text-destructive hover:text-destructive/80 transition-colors"
              >
                <Trash2Icon className="size-4" />
              </button>
            </>
          ) : (
            <>
              <button
                type="button"
                onClick={onDelete}
                className="text-destructive hover:text-destructive/80 transition-colors"
              >
                <Trash2Icon className="size-4" />
              </button>
              <button
                type="button"
                onClick={handleSave}
                disabled={!canSave}
                className={`text-xs font-bold px-3 py-1 rounded-[4px] transition-colors ${canSave
                  ? "bg-primary text-primary-foreground hover:bg-primary/80 cursor-pointer"
                  : "bg-muted text-muted-foreground cursor-not-allowed"
                  }`}
              >
                Salvar
              </button>
            </>
          )}
        </div>
      </div>

      {renderImageSection(!isSaved)}
    </div>
  );
}