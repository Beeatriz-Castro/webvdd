import { useState } from "react";
import { X } from "lucide-react";
import { Button } from "@/components/ui/button";

interface BaseSidebarProps {
  trigger?: React.ReactNode;
  logo: { src: string; alt: string; height?: string };
  children: React.ReactNode;
  headerClassName?: string;
}

export const BaseSidebar = ({ trigger, logo, children, headerClassName }: BaseSidebarProps) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <div onClick={() => setIsOpen(true)}>
        {trigger}
      </div>

      {isOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 md:hidden"
          onClick={() => setIsOpen(false)}
          aria-hidden="true"
        />
      )}

      <aside
        className={`fixed left-0 top-0 h-screen w-full max-w-[300px] bg-white shadow-lg flex flex-col transform transition-transform duration-300 ease-in-out z-50 px-5 py-7.5 overflow-y-auto md:hidden ${isOpen ? "translate-x-0" : "-translate-x-full"
          }`}
      >
        <div className={`flex items-center justify-between ${headerClassName || ""}`}>
          <img
            className={`${logo.height || "h-[50px]"} w-auto`}
            src={logo.src}
            alt={logo.alt}
          />
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setIsOpen(false)}
            className="h-10 w-10"
          >
            <X className="h-5 w-5" strokeWidth={1.5} />
          </Button>
        </div>

        {children}
      </aside>
    </>
  );
};
