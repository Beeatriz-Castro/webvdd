import { useRef, useEffect, useState } from "react";
import { ImageIcon, X } from "lucide-react";

interface ImageInputProps {
  value?: string | File | null;
  onChange?: (file: File | null) => void;
  onRemove?: () => void;
  containerClassName?: string;
  placeholder?: string;
  iconClassName?: string;
}

export const ImageInput = ({
  value = null,
  onChange,
  onRemove,
  containerClassName = "aspect-square w-[120px] h-[120px] sm:w-[150px] sm:h-[150px]",
  placeholder = "Imagem do produto",
  iconClassName = "size-6",
}: ImageInputProps) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  useEffect(() => {
    if (!value) {
      setPreviewUrl(null);
      return;
    }

    if (typeof value === "string") {
      setPreviewUrl(value);
      return;
    }

    const url = URL.createObjectURL(value);
    setPreviewUrl(url);

    return () => URL.revokeObjectURL(url);
  }, [value]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && file.type.startsWith("image/")) {
      onChange?.(file);
    }
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleRemove = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onRemove) {
      onRemove();
    } else {
      onChange?.(null);
    }
  };

  const handleClick = () => {
    fileInputRef.current?.click();
  };

  return (
    <div
      className={`relative border rounded-[6px] overflow-hidden group ${
        value ? "cursor-pointer" : "cursor-pointer hover:border-black"
      } ${containerClassName}`}
      onClick={value ? handleClick : handleClick}
    >
      {previewUrl ? (
        <>
          <img
            src={previewUrl}
            alt="Preview"
            className="w-full h-full object-cover"
          />
          <button
            type="button"
            onClick={handleRemove}
            className="absolute top-0.5 right-0.5 p-0.5 bg-white/80 hover:bg-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
          >
            <X className="size-3 text-red-500" />
          </button>
        </>
      ) : (
        <div className="flex flex-col items-center justify-center gap-[4px] size-full transition-all">
          <ImageIcon className={`text-muted-foreground group-hover:text-black transition-all ${iconClassName}`} />
          {placeholder && (
            <span className="text-muted-foreground font-medium text-xs text-center group-hover:text-black transition-all">
              {placeholder}
            </span>
          )}
        </div>
      )}
      <input
        ref={fileInputRef}
        className="hidden"
        type="file"
        accept="image/*"
        onChange={handleFileChange}
      />
    </div>
  );
};
