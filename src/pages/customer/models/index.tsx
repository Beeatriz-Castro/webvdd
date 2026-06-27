import { useState, useEffect } from "react";
import { Link } from "react-router";
import { Search, Loader2, Shirt, ShoppingBag, X, AlertCircle } from "lucide-react";
import { API_BASE_URL } from "@/lib/api/api";
import { Button } from "@/components/ui/button";

interface ProductImage {
  id_externo_storage: string;
  tipo_visualizacao: "APRESENTACAO" | "FRENTE" | "COSTAS";
}

interface ProductModel {
  id: number;
  nome: string;
  preco: number | string;
  imagens?: ProductImage[];
}

export const CustomerModelsPage = () => {
  const [models, setModels] = useState<ProductModel[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState("");

  useEffect(() => {
    const abortController = new AbortController();

    const fetchModels = async () => {
      setLoading(true);
      setError(null);
      
      try {
        const url = new URL(`${API_BASE_URL}/produtos-personalizaveis`);
        url.searchParams.append("ativo", "true");
        if (search.trim()) url.searchParams.append("search", search.trim());

        const response = await fetch(url.toString(), {
          signal: abortController.signal
        });
        
        if (!response.ok) throw new Error("Não foi possível carregar os produtos.");
        
        const data = await response.json();
        setModels(data);
      } catch (err: any) {
        if (err.name === "AbortError") return;
        console.error(err);
        setError("Ocorreu um erro ao carregar os modelos. Por favor, tente novamente.");
      } finally {
        setLoading(false);
      }
    };
    
    const handler = setTimeout(() => {
      fetchModels();
    }, 400);

    return () => {
      clearTimeout(handler);
      abortController.abort();
    };
  }, [search]);

  return (
    <main className="min-h-screen p-6 md:p-8 max-w-7xl mx-auto flex flex-col gap-10 bg-[#fdf2f8]/30">
      
      <header className="flex flex-col gap-4 text-center items-center justify-center pt-8 pb-4">
        <div className="bg-pink-100 text-pink-500 p-4 rounded-full mb-2 shadow-sm ring-4 ring-pink-50">
          <ShoppingBag size={32} />
        </div>
        <h1 className="text-4xl md:text-5xl font-black text-slate-800 tracking-tight">
          Escolha a sua Camisola
        </h1>
        <p className="text-slate-500 font-medium max-w-lg text-lg">
          Selecione o modelo perfeito e transforme-o numa peça única com as nossas estampas exclusivas.
        </p>
      </header>

      <div className="relative max-w-2xl mx-auto w-full group">
        <div className="absolute inset-y-0 left-6 flex items-center pointer-events-none transition-colors group-focus-within:text-pink-500 text-slate-400">
          <Search className="size-5.5" />
        </div>
        
        <input
          type="text"
          aria-label="Pesquisar modelos"
          placeholder="Procurar por nome do modelo..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full pl-14 pr-12 py-4 bg-white border-2 border-pink-100 rounded-full outline-none focus:border-pink-400 focus:ring-4 focus:ring-pink-50 text-slate-700 font-medium shadow-sm transition-all text-lg placeholder:text-slate-300"
        />

        {search && (
          <button
            onClick={() => setSearch("")}
            className="absolute inset-y-0 right-4 flex items-center text-slate-300 hover:text-pink-500 transition-colors px-2"
            aria-label="Limpar pesquisa"
          >
            <X className="size-5" />
          </button>
        )}
      </div>

      {loading ? (
        <div className="flex flex-col items-center justify-center py-32 gap-4">
          <Loader2 className="size-10 animate-spin text-pink-400" />
          <p className="text-slate-400 font-medium animate-pulse">A procurar modelos...</p>
        </div>
      ) : error ? (
        <div className="flex flex-col items-center justify-center py-20 text-center gap-4">
          <div className="bg-red-50 p-6 rounded-full text-red-500 mb-2">
            <AlertCircle className="size-12" />
          </div>
          <h2 className="text-2xl font-bold text-slate-700">Oops! Algo correu mal.</h2>
          <p className="text-slate-500 max-w-md">{error}</p>
          <Button variant="outline" onClick={() => setSearch(search)} className="mt-4 border-pink-200 text-pink-600 hover:bg-pink-50">
            Tentar Novamente
          </Button>
        </div>
      ) : models.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-24 text-center">
          <div className="bg-white p-8 rounded-full mb-6 shadow-sm border border-pink-100">
            <Shirt className="size-16 text-pink-200" />
          </div>
          <h2 className="text-2xl font-bold text-slate-700 mb-2">Nenhum modelo encontrado</h2>
          <p className="text-slate-500 text-lg">
            Não conseguimos encontrar nada com "{search}".<br /> Tente utilizar outros termos.
          </p>
          <Button variant="link" onClick={() => setSearch("")} className="mt-4 text-pink-500">
            Limpar pesquisa
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 md:gap-8 pb-20">
          {models.map((model) => {
            const imagemObj = model.imagens?.find((img) => img.tipo_visualizacao === "APRESENTACAO") || model.imagens?.[0];
            const imageUrl = imagemObj 
              ? `${API_BASE_URL}/uploads/${imagemObj.id_externo_storage}`
              : null;

            return (
              <Link 
                key={model.id}
                to={`/customer/models/${model.id}`} 
                className="group flex flex-col bg-white rounded-3xl border border-slate-100 overflow-hidden hover:-translate-y-1 hover:shadow-xl hover:shadow-pink-100 hover:border-pink-200 transition-all duration-300"
              >
                <div className="aspect-[4/5] bg-slate-50 relative overflow-hidden flex items-center justify-center group-hover:bg-pink-50/30 transition-colors">
                  {imageUrl ? (
                    <img
                      src={imageUrl}
                      alt={`Visualização de ${model.nome}`}
                      className="w-full h-full object-contain p-6 group-hover:scale-105 transition-transform duration-500 drop-shadow-sm"
                      loading="lazy"
                    />
                  ) : (
                    <Shirt className="size-24 text-slate-200" />
                  )}
                </div>
                
                <div className="p-6 flex flex-col flex-1 bg-white text-center border-t border-slate-50">
                  <h3 className="font-bold text-slate-800 text-lg line-clamp-1 mb-1" title={model.nome}>
                    {model.nome}
                  </h3>
                  <p className="text-xl font-black text-pink-500 mb-6">
                    {Number(model.preco).toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}
                  </p>
                  <span className="mt-auto text-sm font-bold text-pink-600 bg-pink-50 py-3.5 px-4 rounded-xl group-hover:bg-pink-500 group-hover:text-white transition-all duration-300 w-full inline-flex items-center justify-center gap-2">
                    Personalizar
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