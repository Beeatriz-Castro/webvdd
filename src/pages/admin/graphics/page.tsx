import { useState, useEffect } from "react";
import { Link } from "react-router";
import { Search, Plus, Filter, Heart, Sparkles, ImageIcon, Loader2 } from "lucide-react";
import { listEstampas, type Estampa } from "@/lib/api/estampas";
import { API_BASE_URL } from "@/lib/api/api";

export const AdminGraphicsPage = () => {
  const [estampas, setEstampas] = useState<Estampa[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  useEffect(() => {
    const fetchEstampas = async () => {
      setLoading(true);
      try {
        const data = await listEstampas({ search });
        setEstampas(data);
      } catch (error) {
        console.error("Erro ao buscar estampas:", error);
        setEstampas([]);
      } finally {
        setLoading(false);
      }
    };

    const handler = setTimeout(() => {
      fetchEstampas();
    }, 400);

    return () => clearTimeout(handler);
  }, [search]);

  return (
    <main className="min-h-screen p-8 max-w-7xl mx-auto flex flex-col gap-8">
      <header className="flex flex-col md:flex-row items-center justify-between gap-6 bg-white p-6 rounded-[32px] border-4 border-pink-100 shadow-sm">
        <div className="flex items-center gap-4">
          <div className="bg-pink-100 p-4 rounded-full">
            <Sparkles className="text-pink-500 size-8" />
          </div>
          <div>
            <h1 className="text-3xl font-extrabold text-pink-500 tracking-tight">
              Galeria de Estampas
            </h1>
            <p className="text-pink-400 font-medium">
              Gerencie as suas artes maravilhosas 🌸
            </p>
          </div>
        </div>

        <Link
          to="/admin/graphics/create"
          className="group flex items-center gap-2 bg-pink-400 hover:bg-pink-500 text-white px-6 py-4 rounded-full font-bold shadow-md hover:shadow-lg hover:-translate-y-1 transition-all duration-300"
        >
          <Plus className="size-5 group-hover:rotate-90 transition-transform" />
          Nova Arte
        </Link>
      </header>

      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <div className="absolute inset-y-0 left-6 flex items-center pointer-events-none">
            <Search className="text-pink-300 size-5" />
          </div>
          <input
            type="text"
            placeholder="Procurar uma estampa fofa..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-14 pr-6 py-4 bg-white border-4 border-pink-100 rounded-full outline-none focus:border-pink-300 text-pink-600 placeholder:text-pink-300 font-medium shadow-sm transition-colors"
          />
        </div>
      </div>

      {loading ? (
        <div className="flex flex-col items-center justify-center py-20 gap-4 text-pink-400">
          <Loader2 className="size-12 animate-spin text-pink-300" />
          <p className="font-bold text-lg animate-pulse">A carregar fofuras...</p>
        </div>
      ) : estampas.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-center bg-white rounded-[40px] border-4 border-dashed border-pink-200">
          <div className="bg-pink-50 p-6 rounded-full mb-4">
            <ImageIcon className="size-12 text-pink-300" />
          </div>
          <h2 className="text-2xl font-bold text-pink-500 mb-2">Poxa, nenhuma estampa encontrada!</h2>
          <p className="text-pink-400 font-medium max-w-md">
            Que tal adicionar uma nova arte maravilhosa para os seus clientes personalizarem?
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
          {estampas.map((estampa) => {
            // Constrói a URL usando a base da sua API e a pasta estática "uploads" liberada no NestJS
            const imageUrl = estampa.imagens?.[0]?.id_externo_storage
              ? `${API_BASE_URL}/uploads/${estampa.imagens[0].id_externo_storage}`
              : null;

            return (
              <div
                key={estampa.id}
                className="group flex flex-col bg-white rounded-[32px] border-4 border-pink-100 overflow-hidden hover:border-pink-300 hover:-translate-y-2 hover:shadow-[0_8px_30px_rgb(255,192,203,0.4)] transition-all duration-300 cursor-pointer"
              >
                <div className="aspect-square bg-pink-50 p-4 flex items-center justify-center relative overflow-hidden">
                  {imageUrl ? (
                    <img
                      src={imageUrl}
                      alt={estampa.nome}
                      className="w-full h-full object-contain group-hover:scale-105 transition-transform duration-500"
                    />
                  ) : (
                    <ImageIcon className="size-12 text-pink-200" />
                  )}
                  <button className="absolute top-4 right-4 bg-white/80 backdrop-blur-sm p-2 rounded-full opacity-0 group-hover:opacity-100 transition-opacity hover:bg-pink-100">
                    <Heart className="size-4 text-pink-400" />
                  </button>
                </div>

                <div className="p-5 flex flex-col flex-1 justify-between bg-white">
                  <div>
                    <h3 className="font-bold text-pink-600 text-lg line-clamp-1">
                      {estampa.nome}
                    </h3>
                    <p className="text-sm font-medium text-pink-300 mt-1 line-clamp-1">
                      {estampa.estilos?.map((e) => e.estilo?.nome).join(" • ") || "Sem estilo"}
                    </p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </main>
  );
};