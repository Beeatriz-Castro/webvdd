import { Link, Outlet, useLocation } from "react-router";
import { 
  Sparkles, ImageIcon, Shirt, LayoutDashboard, LogOut, Search, Bell, User 
} from "lucide-react";

export const AdminLayout = () => {
  const location = useLocation();

  const menuItems = [
    { path: "/admin", icon: LayoutDashboard, label: "Início" },
    { path: "/admin/graphics", icon: ImageIcon, label: "Estampas" },
    { path: "/admin/models", icon: Shirt, label: "Produtos" },
  ];

  return (
    <div className="flex h-screen w-full bg-[#fdf2f8] font-sans">
      
      {/* BARRA LATERAL (SIDEBAR) */}
      <aside className="w-72 bg-white border-r border-pink-100 flex flex-col shadow-sm z-20 hidden md:flex">
        {/* Logo */}
        <div className="h-20 flex items-center gap-3 px-8 border-b border-pink-50">
          <div className="bg-pink-100 p-2 rounded-xl text-pink-500">
            <Sparkles size={24} />
          </div>
          <h1 className="text-2xl font-black text-pink-500 tracking-tight">NorDTF</h1>
        </div>

        {/* Menu */}
        <nav className="flex-1 flex flex-col gap-2 px-4 py-6">
          <p className="px-4 text-[11px] font-bold text-pink-300 uppercase tracking-widest mb-2">
            Menu Principal
          </p>
          {menuItems.map((item) => {
            const isActive = location.pathname === item.path || location.pathname.startsWith(item.path + '/');
            
            return (
              <Link
                key={item.path}
                to={item.path}
                className={`flex items-center gap-4 px-4 py-3.5 rounded-2xl font-bold transition-all duration-300 ${
                  isActive 
                    ? "bg-pink-500 text-white shadow-md shadow-pink-200 translate-x-1" 
                    : "text-gray-500 hover:bg-pink-50 hover:text-pink-600"
                }`}
              >
                <item.icon size={20} className={isActive ? "text-white" : "text-pink-300"} />
                {item.label}
              </Link>
            );
          })}
        </nav>

        {/* Botão Sair */}
        <div className="p-6 border-t border-pink-50">
          <button className="flex items-center gap-4 px-4 py-3 w-full rounded-2xl font-bold text-gray-500 hover:bg-red-50 hover:text-red-500 transition-colors cursor-pointer">
            <LogOut size={20} />
            Sair
          </button>
        </div>
      </aside>

      {/* ÁREA PRINCIPAL DA TELA */}
      <div className="flex-1 flex flex-col h-full overflow-hidden">
        
        {/* CABEÇALHO (TOP BAR) */}
        <header className="h-20 bg-white flex items-center justify-between px-8 border-b border-pink-100 shadow-sm z-10">
          
          {/* Barra de Pesquisa */}
          <div className="relative w-full max-w-md hidden sm:block">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-pink-300 size-5" />
            <input 
              type="text" 
              placeholder="Pesquisar..." 
              className="w-full bg-pink-50/50 border border-pink-100 text-gray-700 px-12 py-2.5 rounded-full outline-none focus:ring-2 focus:ring-pink-300 focus:bg-white transition-all font-medium placeholder:text-pink-300"
            />
          </div>

          {/* Perfil e Notificações */}
          <div className="flex items-center gap-4 ml-auto">
            <button className="p-2.5 text-pink-400 bg-pink-50 rounded-full hover:bg-pink-100 transition-colors relative cursor-pointer">
              <Bell size={20} />
              <span className="absolute top-2 right-2 w-2.5 h-2.5 bg-red-500 rounded-full border-2 border-pink-50"></span>
            </button>
            <div className="h-8 w-px bg-pink-100 mx-2 hidden sm:block"></div>
            <div className="flex items-center gap-3 cursor-pointer hover:opacity-80 transition-opacity">
              <div className="text-right hidden md:block">
                <p className="text-sm font-bold text-gray-700">Beatriz</p>
                <p className="text-xs font-semibold text-pink-400">Admin</p>
              </div>
              <div className="w-10 h-10 bg-pink-200 rounded-full flex items-center justify-center text-pink-600 font-bold border-2 border-white shadow-sm">
                <User size={20} />
              </div>
            </div>
          </div>
        </header>

        {/* ONDE AS PÁGINAS APARECEM */}
        <main className="flex-1 overflow-y-auto p-8">
          <div className="max-w-7xl mx-auto">
            <Outlet />
          </div>
        </main>
        
      </div>
    </div>
  );
};