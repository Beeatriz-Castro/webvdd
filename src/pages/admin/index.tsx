import { Link } from "react-router";
import { Shirt, ImageIcon, LayoutDashboard } from "lucide-react";

export const AdminDashboard = () => {
  return (
    <div className="flex flex-col gap-8">
      <div>
        <h1 className="text-3xl font-extrabold text-pink-500">Dashboard</h1>
        <p className="text-pink-400 font-medium">Bem-vinda de volta, Beatriz!</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Link 
          to="/admin/models" 
          className="bg-white p-8 rounded-[32px] border-4 border-pink-100 hover:border-pink-300 transition-all flex items-center gap-6 group hover:-translate-y-1 shadow-sm"
        >
          <div className="bg-pink-100 p-5 rounded-2xl text-pink-500 group-hover:scale-110 transition-transform">
            <Shirt size={40} />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-gray-800">Produtos</h2>
            <p className="text-gray-500 font-medium mt-1">Gerir camisolas e opções</p>
          </div>
        </Link>

        <Link 
          to="/admin/graphics" 
          className="bg-white p-8 rounded-[32px] border-4 border-pink-100 hover:border-pink-300 transition-all flex items-center gap-6 group hover:-translate-y-1 shadow-sm"
        >
          <div className="bg-pink-100 p-5 rounded-2xl text-pink-500 group-hover:scale-110 transition-transform">
            <ImageIcon size={40} />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-gray-800">Estampas</h2>
            <p className="text-gray-500 font-medium mt-1">Gerir galeria de artes</p>
          </div>
        </Link>
      </div>
    </div>
  );
};