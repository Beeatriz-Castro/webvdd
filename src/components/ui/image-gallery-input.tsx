import { PlusIcon } from "lucide-react";
import { ImageInput } from "./image-input";

interface ImageGalleryInputProps {
  images: (File | null)[];
  onChange: (images: (File | null)[]) => void;
}

export function ImageGalleryInput({ images, onChange }: ImageGalleryInputProps) {
  const handleImageChange = (index: number, file: File | null) => {
    if (file === null) {
      const next = images.filter((_, i) => i !== index);
      onChange(next);
      return;
    }
    const next = [...images];
    next[index] = file;
    onChange(next);
  };

  const handleAddSlot = () => {
    onChange([...images, null]);
  };

  return (
    <div className="flex gap-[10px] flex-wrap items-center">
      {images.map((image, index) => (
        <ImageInput
          key={index}
          value={image}
          onChange={(file) => handleImageChange(index, file)}
          containerClassName="size-[150px]"
        />
      ))}

      <button
        type="button"
        onClick={handleAddSlot}
        className="bg-background rounded-[6px] border border-border p-[9px] flex items-center justify-center hover:bg-muted transition-colors"
      >
        <PlusIcon className="size-3" />
      </button>
    </div>
  );
}
