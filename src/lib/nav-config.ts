import type { ReactNode } from "react";

export interface NavLink {
  label: string;
  href: string;
  isActive: (pathname: string) => boolean;
  icon?: (isActive: boolean) => ReactNode;
}

export const navLinks: NavLink[] = [
  {
    label: "Produtos personalizaveis",
    href: "/customer/models",
    isActive: (pathname) => pathname === "/customer/models",
  },
  {
    label: "Estampas",
    href: "/customer/graphics",
    isActive: (pathname) => pathname === "/customer/graphics",
  },
  {
    label: "Painel Admin",
    href: "/admin/models",
    isActive: (pathname) => pathname.startsWith("/admin"),
  },
];
