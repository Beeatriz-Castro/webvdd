import { useLocation, Link } from "react-router";
import { navLinks } from "@/lib/nav-config";

export const Navbar = () => {
  const { pathname } = useLocation();

  return (
    <nav className="hidden md:block">
      <ul className="flex items-center gap-7">
        {navLinks.map((link) => (
          <li key={link.href}>
            <Link
              to={link.href}
              className={`block font-black text-lg rounded-lg hover:underline transition-all ${link.isActive(pathname)
                ? "text-[#FFAA00]"
                : "text-black"
                }`}
            >
              {link.label}
            </Link>
          </li>
        ))}
      </ul>
    </nav>
  );
};
