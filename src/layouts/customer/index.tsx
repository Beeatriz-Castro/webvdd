import { useState } from "react";
import { Outlet, Link, useNavigate } from "react-router";
import { Sparkles, LogOut, User } from "lucide-react";
import { useAuth } from "@/lib/auth-context";

export const CustomerLayout = () => {
  const { signOut, user, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [showMenu, setShowMenu] = useState(false);

  const handleSignOut = async () => {
    await signOut();
    navigate("/signin", { replace: true });
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#fdf2f8]">
      <header className="bg-white shadow-sm border-b border-pink-100 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 h-20 flex justify-between items-center">
          <Link to="/customer/models" className="flex items-center gap-2">
            <div className="bg-pink-100 p-2 rounded-xl text-pink-500">
              <Sparkles size={24} />
            </div>
            <h1 className="text-2xl font-black text-pink-500 tracking-tight">NorDTF</h1>
          </Link>

          <nav className="flex items-center gap-3">
            {isAuthenticated ? (
              <div className="relative">
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
                    <div
                      className="fixed inset-0 z-10"
                      onClick={() => setShowMenu(false)}
                    />
                    <div className="absolute right-0 top-12 bg-white rounded-2xl shadow-xl border border-slate-100 py-2 min-w-[160px] z-20">
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
            ) : (
              <Link
                to="/signin"
                className="text-sm font-bold text-pink-500 hover:text-pink-600 transition-colors"
              >
                Entrar
              </Link>
            )}
          </nav>
        </div>
      </header>

      <main className="flex-1">
        <Outlet />
      </main>
    </div>
  );
};