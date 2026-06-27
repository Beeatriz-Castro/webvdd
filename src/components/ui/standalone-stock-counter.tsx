import { PlusIcon, MinusIcon } from "lucide-react";

interface StandaloneStockCounterProps {
  value: number;
  onChange: (value: number) => void;
  min?: number;
}

export function StandaloneStockCounter({ value, onChange, min = 0 }: StandaloneStockCounterProps) {
  const increment = () => {
    onChange(value + 1);
  };

  const decrement = () => {
    if (value > min) {
      onChange(value - 1);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const num = parseInt(e.target.value, 10);
    if (!isNaN(num) && num >= min) {
      onChange(num);
    }
  };

  return (
    <div className="bg-background rounded-[3px] border border-border flex gap-[10px] items-center p-[2px]">
      <button type="button" onClick={decrement} className="size-4 flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors">
        <MinusIcon className="size-3" />
      </button>
      <input
        type="number"
        value={value}
        onChange={handleInputChange}
        className="w-[30px] text-center font-semibold text-sm border-none outline-none bg-transparent [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
        min={min}
      />
      <button type="button" onClick={increment} className="size-4 flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors">
        <PlusIcon className="size-3" />
      </button>
    </div>
  );
}
