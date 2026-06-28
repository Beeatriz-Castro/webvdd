import { useState, useEffect } from "react";
import { Link, Outlet, useLocation, useNavigate } from "react-router";
import { 
  Sparkles, ImageIcon, Shirt, LayoutDashboard, LogOut, Search, Bell, User, Menu, X 
} from "lucide-react";
import { useAuth } from "@/lib/auth-context";

const SEARCHABLE_PATHS = ["/admin/graphics", "/admin/models"];

export type AdminLayoutContext = {
  search: string;
  setSearch: (v: string) => void;
};

export const AdminLayout = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { signOut, user } = useAuth();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [search, setSearch] = useState("");

  useEffect(() => {
    setIsMobileMenuOpen(false);
    setSearch("");
  }, [location.pathname]);

  const isSearchable = SEARCHABLE_PATHS.some((p) => location.pathname.startsWith(p));

  const handleSignOut = async () => {
    await signOut();
    navigate("/signin", { replace: true });
  };

  const menuItems = [
    { path: "/admin", icon: LayoutDashboard, label: "Início" },
    { path: "/admin/graphics", icon: ImageIcon, label: "Estampas" },
    { path: "/admin/models", icon: Shirt, label: "Produtos" },
  ];

  return (
    <div className="flex h-screen w-full bg-[#fdf2f8] font-sans overflow-hidden">
      
      {isMobileMenuOpen && (
        <div 
          className="fixed inset-0 bg-slate-900/20 backdrop-blur-sm z-40 md:hidden transition-opacity"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}

      <aside 
        className={`fixed inset-y-0 left-0 w-72 bg-white border-r border-pink-100 flex flex-col shadow-2xl md:shadow-sm z-50 transform transition-transform duration-300 ease-in-out md:relative md:translate-x-0 ${
          isMobileMenuOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="h-20 flex items-center justify-between px-6 border-b border-pink-50/80">
          <div className="flex items-center gap-3">
            <div className="bg-pink-100 p-2.5 rounded-xl text-pink-500 shadow-sm border border-pink-50">
              <Sparkles size={22} />
            </div>
            <h1 className="text-2xl font-black text-slate-800 tracking-tight">
              Nor<span className="text-pink-500">DTF</span>
            </h1>
          </div>
          <button 
            className="md:hidden p-2 text-slate-400 hover:text-pink-500 hover:bg-pink-50 rounded-lg transition-colors"
            onClick={() => setIsMobileMenuOpen(false)}
          >
            <X size={24} />
          </button>
        </div>

        <nav className="flex-1 flex flex-col gap-1.5 px-4 py-6 overflow-y-auto custom-scrollbar">
          <p className="px-4 text-[11px] font-bold text-slate-400 uppercase tracking-widest mb-3">
            Menu Principal
          </p>
          
          {menuItems.map((item) => {
            const isActive = location.pathname === item.path || (item.path !== "/admin" && location.pathname.startsWith(item.path));
            
            return (
              <Link
                key={item.path}
                to={item.path}
                className={`flex items-center gap-3.5 px-4 py-3 rounded-2xl font-semibold transition-all duration-300 group ${
                  isActive 
                    ? "bg-pink-500 text-white shadow-lg shadow-pink-500/25" 
                    : "text-slate-500 hover:bg-pink-50/80 hover:text-pink-600"
                }`}
              >
                <item.icon 
                  size={20} 
                  className={`transition-colors ${isActive ? "text-white" : "text-slate-400 group-hover:text-pink-500"}`} 
                />
                {item.label}
              </Link>
            );
          })}
        </nav>

        <div className="p-4 border-t border-pink-50/80">
          <button
            onClick={handleSignOut}
            className="flex items-center gap-3.5 px-4 py-3 w-full rounded-2xl font-semibold text-slate-500 hover:bg-red-50 hover:text-red-600 transition-all duration-300 cursor-pointer group"
          >
            <LogOut size={20} className="text-slate-400 group-hover:text-red-500 transition-colors" />
            Sair
          </button>
        </div>
      </aside>

      <div className="flex-1 flex flex-col h-full relative overflow-hidden">
        
        <header className="h-20 bg-white/80 backdrop-blur-md flex items-center justify-between px-4 sm:px-8 border-b border-pink-100 shadow-sm z-10 sticky top-0">
          
          <div className="flex items-center gap-4 w-full">
            <button 
              className="md:hidden p-2.5 text-slate-500 hover:text-pink-500 hover:bg-pink-50 rounded-xl transition-colors shrink-0"
              onClick={() => setIsMobileMenuOpen(true)}
            >
              <Menu size={24} />
            </button>

            {isSearchable && (
              <div className="relative w-full max-w-md hidden sm:block group">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 size-5 transition-colors group-focus-within:text-pink-500" />
                <input 
                  type="text"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Pesquisar..."
                  className="w-full bg-slate-50/50 border border-slate-200 text-slate-700 px-12 py-2.5 rounded-full outline-none focus:ring-4 focus:ring-pink-50 focus:border-pink-300 focus:bg-white transition-all font-medium placeholder:text-slate-400"
                />
              </div>
            )}
          </div>

          <div className="flex items-center gap-3 sm:gap-5 ml-auto shrink-0">
            <button className="p-2.5 text-slate-500 bg-slate-50 rounded-full hover:bg-pink-50 hover:text-pink-500 transition-all duration-300 relative cursor-pointer border border-slate-100">
              <Bell size={20} />
            </button>
            
            <div className="h-8 w-px bg-slate-200 hidden sm:block"></div>
            
            <div className="flex items-center gap-3 cursor-pointer group">
              <div className="text-right hidden md:block transition-transform group-hover:-translate-x-0.5">
                <p className="text-sm font-bold text-slate-700">{user?.email?.split("@")[0] ?? "Admin"}</p>
                <p className="text-xs font-semibold text-pink-500">{user?.role ?? "Admin"}</p>
              </div>
              <div className="w-10 h-10 bg-pink-100 rounded-full flex items-center justify-center text-pink-600 font-bold border-2 border-white shadow-sm group-hover:shadow-md group-hover:scale-105 transition-all duration-300">
                <User size={20} />
              </div>
            </div>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto p-4 sm:p-8 bg-[#fdf2f8]/50 custom-scrollbar">
          <div className="max-w-7xl mx-auto w-full pb-10">
            <Outlet context={{ search, setSearch } satisfies AdminLayoutContext} />
          </div>
        </main>
        
      </div>
    </div>
  );
};