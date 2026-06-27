import { useEffect, useRef, useState } from "react";
import { ChevronDownIcon, XIcon } from "lucide-react";

interface EstiloFilterSelectProps {
  selected: string[];
  onChange: (values: string[]) => void;
  options?: string[];
  label?: string;
  placeholder?: string;
}

const defaultOptions = ["Geek", "Minimalista", "Retro", "Tipografia", "Vintage"];

export function EstiloFilterSelect({
  selected,
  onChange,
  options = defaultOptions,
  label = "Estilos",
  placeholder = "Selecione estilos",
}: EstiloFilterSelectProps) {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const toggleEstilo = (estilo: string) => {
    const next = selected.includes(estilo)
      ? selected.filter((item) => item !== estilo)
      : [...selected, estilo];

    onChange(next);
  };

  return (
    <div className="flex flex-col w-full" ref={containerRef}>
      <label className="font-medium text-sm">{label}</label>
      <div className="relative">
        <button
          type="button"
          onClick={() => setIsOpen((prev) => !prev)}
          className="bg-background min-h-[30px] rounded-[6px] border border-border px-[5px] w-full flex items-center justify-between gap-1"
        >
          <div className="flex-1 flex items-center gap-1 flex-wrap py-[2px]">
            {selected.length > 0 ? (
              selected.map((estilo) => (
                <span
                  key={estilo}
                  className="inline-flex items-center gap-1 bg-primary text-primary-foreground text-[10px] font-medium px-2 py-[2px] rounded-full"
                >
                  {estilo}
                  <XIcon
                    className="size-2.5 cursor-pointer hover:opacity-70"
                    onClick={(event) => {
                      event.stopPropagation();
                      onChange(selected.filter((item) => item !== estilo));
                    }}
                  />
                </span>
              ))
            ) : (
              <span className="text-xs text-muted-foreground">{placeholder}</span>
            )}
          </div>
          <ChevronDownIcon
            className={`size-3 text-foreground shrink-0 transition-transform ${isOpen ? "rotate-180" : ""}`}
          />
        </button>

        {isOpen && (
          <div className="absolute top-full left-0 bg-background border border-border rounded-b-[6px] w-full z-10 shadow-md">
            <div className="flex flex-col p-[6px]">
              {options.length === 0 ? (
                <p className="text-xs text-muted-foreground px-[10px] py-[6px]">
                  Sem opcoes disponiveis
                </p>
              ) : (
                options.map((estilo) => (
                  <div
                    key={estilo}
                    className="flex items-center justify-between px-[10px] py-[4px] cursor-pointer hover:bg-muted rounded-[4px] transition-colors"
                    onClick={() => toggleEstilo(estilo)}
                  >
                    <div className="flex items-center gap-2 flex-1">
                      <div
                        className={`size-4 rounded border border-border flex items-center justify-center transition-colors shrink-0 ${selected.includes(estilo)
                            ? "bg-primary border-primary"
                            : "bg-background"
                          }`}
                      >
                        {selected.includes(estilo) && (
                          <svg
                            className="size-3 text-primary-foreground"
                            viewBox="0 0 12 12"
                            fill="none"
                          >
                            <path
                              d="M2.5 6L5 8.5L9.5 4"
                              stroke="currentColor"
                              strokeWidth="1.5"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                            />
                          </svg>
                        )}
                      </div>
                      <p className="text-xs">{estilo}</p>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
