import { useState, useEffect } from "react";
import { Link } from "react-router";
import { Search, Loader2, Shirt, ShoppingBag } from "lucide-react";
import { API_BASE_URL } from "@/lib/api/api";

export const CustomerModelsPage = () => {
  const [models, setModels] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  useEffect(() => {
    const fetchModels = async () => {
      setLoading(true);
      try {
        const url = new URL(`${API_BASE_URL}/produtos-personalizaveis`);
        url.searchParams.append("ativo", "true");
        if (search) url.searchParams.append("search", search);

        const response = await fetch(url.toString());
        if (!response.ok) throw new Error("Erro ao buscar produtos");
        
        const data = await response.json();
        setModels(data);
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };

    const handler = setTimeout(() => {
      fetchModels();
    }, 400);

    return () => clearTimeout(handler);
  }, [search]);

  return (
    <main className="min-h-screen p-8 max-w-7xl mx-auto flex flex-col gap-8 bg-[#fdf2f8]/30">
      <header className="flex flex-col gap-4 text-center items-center justify-center py-10">
        <div className="bg-pink-100 text-pink-500 p-4 rounded-full mb-2 shadow-sm">
          <ShoppingBag size={32} />
        </div>
        <h1 className="text-4xl md:text-5xl font-black text-gray-800 tracking-tight">
          Escolha a sua Camisola
        </h1>
        <p className="text-gray-500 font-medium max-w-lg text-lg">
          Selecione o modelo perfeito e transforme-o numa peça única com as nossas estampas mágicas.
        </p>
      </header>

      <div className="relative max-w-2xl mx-auto w-full">
        <div className="absolute inset-y-0 left-6 flex items-center pointer-events-none">
          <Search className="text-pink-300 size-5" />
        </div>
        <input
          type="text"
          placeholder="Procurar por nome do modelo..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full pl-14 pr-6 py-4 bg-white border-2 border-pink-50 rounded-full outline-none focus:border-pink-300 text-gray-700 font-medium shadow-sm transition-all"
        />
      </div>

      {loading ? (
        <div className="flex flex-col items-center justify-center py-20 gap-4 text-pink-400">
          <Loader2 className="size-12 animate-spin text-pink-300" />
        </div>
      ) : models.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <div className="bg-white p-6 rounded-full mb-4 shadow-sm border border-pink-50">
            <Shirt className="size-16 text-pink-200" />
          </div>
          <h2 className="text-2xl font-bold text-gray-500 mb-2">Nenhum modelo encontrado.</h2>
          <p className="text-gray-400">Tente procurar com outro termo.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8">
          {models.map((model) => {
            const imagemObj = model.imagens?.find((img: any) => img.tipo_visualizacao === "APRESENTACAO") || model.imagens?.[0];
            const imageUrl = imagemObj 
              ? `${API_BASE_URL}/uploads/${imagemObj.id_externo_storage}`
              : null;

            return (
              <Link 
                key={model.id}
                to={`/customer/models/${model.id}/customize`} 
                className="group flex flex-col bg-white rounded-[32px] border-4 border-transparent hover:border-pink-200 overflow-hidden hover:-translate-y-2 hover:shadow-[0_8px_30px_rgb(255,192,203,0.3)] transition-all duration-300"
              >
                <div className="aspect-[4/5] bg-pink-50/50 p-6 flex items-center justify-center relative overflow-hidden">
                  {imageUrl ? (
                    <img
                      src={imageUrl}
                      alt={model.nome}
                      className="w-full h-full object-contain group-hover:scale-105 transition-transform duration-500 drop-shadow-md"
                    />
                  ) : (
                    <Shirt className="size-20 text-pink-200" />
                  )}
                </div>
                
                <div className="p-6 flex flex-col gap-2 bg-white text-center">
                  <h3 className="font-bold text-gray-800 text-lg line-clamp-1">
                    {model.nome}
                  </h3>
                  <p className="text-xl font-black text-pink-500">
                    {Number(model.preco).toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}
                  </p>
                  <span className="mt-4 text-sm font-bold text-pink-500 bg-pink-50 py-3 rounded-full group-hover:bg-pink-500 group-hover:text-white transition-colors w-full inline-block">
                    Personalizar Agora
                  </span>
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </main>
  );
};  