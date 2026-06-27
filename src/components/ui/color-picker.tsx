import { useRef } from "react";

interface ColorPickerProps {
  value: string;
  onChange: (hex: string) => void;
  size?: number;
  disabled?: boolean;
}

export function ColorPicker({ value, onChange, size = 20, disabled = false }: ColorPickerProps) {
  const inputRef = useRef<HTMLInputElement>(null);

  const handleClick = () => {
    if (disabled) return;
    inputRef.current?.click();
  };

  return (
    <div className="relative">
      <button
        type="button"
        onClick={handleClick}
        className="rounded-full border border-border shrink-0 cursor-pointer transition-transform hover:scale-110"
        style={{ backgroundColor: value, width: size, height: size }}
      />
      <input
        ref={inputRef}
        type="color"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="absolute opacity-0 w-0 h-0 pointer-events-none"
        disabled={disabled}
      />
    </div>
  );
}
