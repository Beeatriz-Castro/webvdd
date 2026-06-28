import { useState, useEffect } from "react";
import { Link } from "react-router";
import { Sparkles, Search, ShoppingBag, Shirt, ArrowRight, Star, X, Loader2 } from "lucide-react";
import { API_BASE_URL } from "@/lib/api/api";

interface ProductImage {
  id_externo_storage: string;
  tipo_visualizacao: "APRESENTACAO" | "FRENTE" | "COSTAS";
}

interface Product {
  id: number;
  nome: string;
  preco: number | string;
  imagens?: ProductImage[];
}

export const PublicHomePage = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  useEffect(() => {
    const handler = setTimeout(async () => {
      setLoading(true);
      try {
        const url = new URL(`${API_BASE_URL}/produtos-personalizaveis`);
        url.searchParams.append("ativo", "true");
        if (search.trim()) url.searchParams.append("search", search.trim());
        const res = await fetch(url.toString());
        if (!res.ok) throw new Error();
        setProducts(await res.json());
      } catch {
        setProducts([]);
      } finally {
        setLoading(false);
      }
    }, 400);
    return () => clearTimeout(handler);
  }, [search]);

  return (
    <div className="min-h-screen bg-[#fdf2f8]">
      <header className="bg-white border-b border-pink-100 sticky top-0 z-50 shadow-sm">
        <div className="max-w-7xl mx-auto px-6 h-18 flex items-center justify-between py-4">
          <div className="flex items-center gap-2">
            <div className="bg-pink-100 p-2 rounded-xl text-pink-500">
              <Sparkles size={22} />
            </div>
            <span className="text-xl font-black text-pink-500 tracking-tight">NorDTF</span>
          </div>
          <div className="flex items-center gap-3">
            <Link
              to="/signin"
              className="text-sm font-semibold text-slate-600 hover:text-pink-500 transition-colors"
            >
              Entrar
            </Link>
            <Link
              to="/register"
              className="text-sm font-bold bg-pink-500 hover:bg-pink-600 text-white px-5 py-2.5 rounded-full transition-colors shadow-sm"
            >
              Criar conta
            </Link>
          </div>
        </div>
      </header>

      <section className="max-w-7xl mx-auto px-6 pt-16 pb-12 flex flex-col items-center text-center gap-6">
        <div className="bg-pink-100 text-pink-500 p-4 rounded-full shadow-sm ring-4 ring-pink-50">
          <Sparkles size={36} />
        </div>
        <h1 className="text-5xl md:text-6xl font-black text-slate-800 tracking-tight leading-tight max-w-3xl">
          Crie a camiseta{" "}
          <span className="text-pink-500">perfeita</span>{" "}
          para você
        </h1>
        <p className="text-slate-500 text-lg font-medium max-w-xl">
          Escolha o modelo, personalize com as nossas estampas exclusivas e receba uma peça única feita pra você.
        </p>
        <div className="flex items-center gap-3 flex-wrap justify-center">
          <Link
            to="/register"
            className="flex items-center gap-2 bg-pink-500 hover:bg-pink-600 text-white font-bold px-7 py-3.5 rounded-full transition-all shadow-md hover:shadow-lg hover:-translate-y-0.5"
          >
            Começar agora
            <ArrowRight size={18} />
          </Link>
          <Link
            to="/signin"
            className="flex items-center gap-2 bg-white text-slate-700 font-bold px-7 py-3.5 rounded-full border border-slate-200 hover:border-pink-300 hover:text-pink-500 transition-all"
          >
            Já tenho conta
          </Link>
        </div>

        <div className="flex items-center gap-8 mt-4 flex-wrap justify-center">
          {[
            { icon: <Star size={16} />, text: "Estampas exclusivas" },
            { icon: <ShoppingBag size={16} />, text: "Personalização fácil" },
            { icon: <Shirt size={16} />, text: "Vários modelos" },
          ].map(({ icon, text }) => (
            <div key={text} className="flex items-center gap-2 text-sm font-semibold text-slate-500">
              <span className="text-pink-400">{icon}</span>
              {text}
            </div>
          ))}
        </div>
      </section>

      <section className="max-w-7xl mx-auto px-6 pb-20">
        <div className="flex flex-col gap-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <h2 className="text-2xl font-black text-slate-800">Nossos produtos</h2>
              <p className="text-slate-400 font-medium text-sm">Escolha um modelo para personalizar</p>
            </div>
            <div className="relative w-full sm:w-72">
              <Search className="absolute left-4 inset-y-0 my-auto size-4 text-slate-400 pointer-events-none" />
              <input
                type="text"
                placeholder="Procurar modelo..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-10 pr-9 py-2.5 bg-white border-2 border-pink-100 rounded-full text-sm font-medium text-slate-700 placeholder:text-slate-300 outline-none focus:border-pink-400 transition-colors"
              />
              {search && (
                <button
                  onClick={() => setSearch("")}
                  className="absolute right-3 inset-y-0 my-auto text-slate-300 hover:text-pink-400 transition-colors"
                >
                  <X size={15} />
                </button>
              )}
            </div>
          </div>

          {loading ? (
            <div className="flex justify-center py-24">
              <Loader2 className="size-10 animate-spin text-pink-300" />
            </div>
          ) : products.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-24 text-center bg-white rounded-3xl border border-dashed border-pink-200">
              <Shirt className="size-14 text-pink-200 mb-4" />
              <p className="font-bold text-slate-500">Nenhum produto encontrado</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {products.map((product) => {
                const img =
                  product.imagens?.find((i) => i.tipo_visualizacao === "APRESENTACAO") ??
                  product.imagens?.[0];
                const imageUrl = img
                  ? `${API_BASE_URL}/uploads/${img.id_externo_storage}`
                  : null;

                return (
                  <div
                    key={product.id}
                    className="group flex flex-col bg-white rounded-3xl border border-slate-100 overflow-hidden hover:-translate-y-1 hover:shadow-xl hover:shadow-pink-100 hover:border-pink-200 transition-all duration-300"
                  >
                    <div className="aspect-[4/5] bg-slate-50 flex items-center justify-center overflow-hidden group-hover:bg-pink-50/30 transition-colors">
                      {imageUrl ? (
                        <img
                          src={imageUrl}
                          alt={product.nome}
                          className="w-full h-full object-contain p-6 group-hover:scale-105 transition-transform duration-500 drop-shadow-sm"
                          loading="lazy"
                        />
                      ) : (
                        <Shirt className="size-20 text-slate-200" />
                      )}
                    </div>
                    <div className="p-5 flex flex-col items-center text-center border-t border-slate-50">
                      <h3 className="font-bold text-slate-800 text-base line-clamp-1 mb-1">
                        {product.nome}
                      </h3>
                      <p className="text-lg font-black text-pink-500 mb-4">
                        {Number(product.preco).toLocaleString("pt-BR", {
                          style: "currency",
                          currency: "BRL",
                        })}
                      </p>
                      <Link
                        to="/register"
                        className="w-full text-sm font-bold text-pink-600 bg-pink-50 py-3 px-4 rounded-xl group-hover:bg-pink-500 group-hover:text-white transition-all duration-300 flex items-center justify-center gap-2"
                      >
                        Personalizar
                        <ArrowRight size={15} />
                      </Link>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </section>
    </div>
  );
};