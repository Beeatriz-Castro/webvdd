import { ClothingHangerIcon } from "@/components/icons/clothing-hander";
import GraphicsIcon from "@/components/icons/graphics";
import type { NavLink } from "@/lib/nav-config";
import { Eye } from "lucide-react";

export const adminNavLinks: NavLink[] = [
  {
    label: "Produtos personalizaveis",
    href: "/admin/models",
    isActive: (pathname) => pathname === "/admin/models",
    icon: () => <ClothingHangerIcon />
  },
  {
    label: "Estampas",
    href: "/admin/graphics",
    isActive: (pathname) => pathname.startsWith("/admin/graphics"),
    icon: () => <GraphicsIcon />
  },
  {
    label: "Visao Cliente",
    href: "/customer/models",
    isActive: (pathname) => pathname.startsWith("/customer"),
    icon: () => <Eye className="w-6 h-6" strokeWidth={1.5} />
  },
];
