import { useWatch } from "react-hook-form";
import type {
  Control,
  UseFormRegister,
  UseFormSetValue,
} from "react-hook-form";
import { PlusIcon, MinusIcon } from "lucide-react";
import { useEffect } from "react";

interface StockCounterProps {
  control: Control<any>;
  register: UseFormRegister<any>;
  name: string;
  setValue: UseFormSetValue<any>;
}

export function StockCounter({ control, register, name, setValue }: StockCounterProps) {
  const rawValue = useWatch({
    control,
    name,
  });

  const stockValue = typeof rawValue === "number" ? rawValue : 0;

  const incrementStock = () => {
    setValue(name, stockValue + 1);
  };

  const decrementStock = () => {
    if (stockValue > 0) {
      setValue(name, stockValue - 1);
    }
  };

  useEffect(() => {
    if (rawValue === undefined || rawValue === null || rawValue === "") {
      setValue(name, 0);
    }
  }, [rawValue, name, setValue]);

  return (
    <div className="bg-background rounded-[3px] border border-border flex gap-[10px] items-center p-[2px]">
      <button type="button" onClick={decrementStock} className="size-3 text-muted-foreground hover:text-foreground transition-colors">
        <MinusIcon className="size-full" />
      </button>
      <input
        type="number"
        {...register(name, { valueAsNumber: true })}
        defaultValue={0}
        className="w-[30px] text-center font-semibold text-xs border-none outline-none bg-transparent [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
        min={0}
      />
      <button type="button" onClick={incrementStock} className="size-3 text-muted-foreground hover:text-foreground transition-colors">
        <PlusIcon className="size-full" />
      </button>
    </div>
  );
}
