import { useState } from "react";
import { Outlet, Link, useNavigate, useLocation } from "react-router";
import { Sparkles, LogOut, User, ShoppingBag, ClipboardList, Shirt } from "lucide-react";
import { useAuth } from "@/lib/auth-context";

export const CustomerLayout = () => {
  const { signOut, user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [showMenu, setShowMenu] = useState(false);

  const handleSignOut = async () => {
    await signOut();
    navigate("/signin", { replace: true });
  };

  const navLinks = [
    { to: "/customer/models", label: "Produtos", icon: <Shirt size={17} /> },
    { to: "/customer/cart", label: "Sacola", icon: <ShoppingBag size={17} /> },
    { to: "/customer/orders", label: "Pedidos", icon: <ClipboardList size={17} /> },
  ];

  return (
    <div className="min-h-screen flex flex-col bg-[#fdf2f8]">
      <header className="bg-white shadow-sm border-b border-pink-100 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 h-20 flex justify-between items-center gap-6">
          <Link to="/customer/models" className="flex items-center gap-2 flex-shrink-0">
            <div className="bg-pink-100 p-2 rounded-xl text-pink-500">
              <Sparkles size={24} />
            </div>
            <h1 className="text-2xl font-black text-pink-500 tracking-tight">NorDTF</h1>
          </Link>

          <nav className="hidden sm:flex items-center gap-1">
            {navLinks.map(({ to, label, icon }) => {
              const active = location.pathname === to;
              return (
                <Link
                  key={to}
                  to={to}
                  className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-semibold transition-all ${
                    active ? "bg-pink-100 text-pink-600" : "text-slate-500 hover:bg-pink-50 hover:text-pink-500"
                  }`}
                >
                  {icon}
                  {label}
                </Link>
              );
            })}
          </nav>

          <div className="relative flex-shrink-0">
            <button
              onClick={() => setShowMenu(!showMenu)}
              className="flex items-center gap-2 p-2 rounded-full hover:bg-pink-50 transition-colors"
            >
              <div className="w-9 h-9 bg-pink-100 rounded-full flex items-center justify-center text-pink-600 font-bold border-2 border-white shadow-sm">
                <User size={18} />
              </div>
              <span className="text-sm font-semibold text-slate-700 hidden sm:block">
                {user?.email?.split("@")[0]}
              </span>
            </button>

            {showMenu && (
              <>
                <div className="fixed inset-0 z-10" onClick={() => setShowMenu(false)} />
                <div className="absolute right-0 top-12 bg-white rounded-2xl shadow-xl border border-slate-100 py-2 min-w-[180px] z-20">
                  <div className="sm:hidden border-b border-slate-100 pb-2 mb-2">
                    {navLinks.map(({ to, label, icon }) => (
                      <Link
                        key={to}
                        to={to}
                        onClick={() => setShowMenu(false)}
                        className="flex items-center gap-3 px-4 py-3 text-sm font-semibold text-slate-600 hover:bg-pink-50 hover:text-pink-500 transition-colors"
                      >
                        {icon}
                        {label}
                      </Link>
                    ))}
                  </div>
                  <button
                    onClick={() => { setShowMenu(false); handleSignOut(); }}
                    className="w-full flex items-center gap-3 px-4 py-3 text-sm font-semibold text-slate-600 hover:bg-red-50 hover:text-red-600 transition-colors"
                  >
                    <LogOut size={16} />
                    Sair
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      </header>

      <main className="flex-1">
        <Outlet />
      </main>
    </div>
  );
};