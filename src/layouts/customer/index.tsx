import { Outlet, Link } from "react-router";
import { Sparkles, ShoppingBag } from "lucide-react";

export const CustomerLayout = () => {
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

          <nav className="flex items-center gap-4">
             <Link 
               to="/customer/cart" 
               className="p-3 text-pink-400 bg-pink-50 rounded-full hover:bg-pink-100 transition-colors"
             >
               <ShoppingBag size={20} />
             </Link>
          </nav>
        </div>
      </header>

      <main className="flex-1">
        <Outlet />
      </main>
    </div>
  );
};