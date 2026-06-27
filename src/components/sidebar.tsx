import { useLocation, Link } from "react-router";
import { navLinks } from "@/lib/nav-config";
import { BrushIcon } from "./sidebar/brush-icon";
import { BaseSidebar } from "./sidebar/base-sidebar";

export const Sidebar = ({ trigger }: { trigger?: React.ReactNode }) => {
  const { pathname } = useLocation();

  return (
    <BaseSidebar
      trigger={trigger}
      logo={{ src: "/brand/logotype.svg", alt: "nor-dtf logotype" }}
      headerClassName="border-b"
    >
      <nav className="flex-1 py-[100px]">
        <ul className="space-y-12.5">
          {navLinks.map((link) => (
            <li key={link.href} className="flex items-center gap-5">
              <BrushIcon isActive={link.isActive(pathname)} />
              <Link
                to={link.href}
                className={`block font-black text-sm rounded-lg transition-colors ${link.isActive(pathname)
                  ? "text-primary"
                  : "text-black"
                  }`}
              >
                {link.label}
              </Link>
            </li>
          ))}
        </ul>
      </nav>
    </BaseSidebar>
  );
};
