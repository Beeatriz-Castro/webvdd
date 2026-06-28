import { useEffect, useState } from "react";
import { Link, useOutletContext } from "react-router";
import { Plus, Shirt, Loader2, Tag } from "lucide-react";
import { listPersonalizaveis, listCategorias, type ProdutoPersonalizavel, type Categoria } from "@/lib/api/personalizaveis";
import { ModelCard } from "@/components/cards/model-card";
import type { AdminLayoutContext } from "@/layouts/admin";

export const AdminModelsPage = () => {
  const [models, setModels] = useState<ProdutoPersonalizavel[]>([]);
  const [categorias, setCategorias] = useState<Categoria[]>([]);
  const [selectedCategoria, setSelectedCategoria] = useState<number | undefined>(undefined);
  const [loading, setLoading] = useState(true);

  const { search } = useOutletContext<AdminLayoutContext>();

  useEffect(() => {
    listCategorias().then(setCategorias).catch(() => {});
  }, []);

  useEffect(() => {
    setLoading(true);
    const handler = setTimeout(async () => {
      try {
        const data = await listPersonalizaveis({
          search,
          categoriaId: selectedCategoria,
        });
        setModels(data);
      } catch (error) {
        console.error("Falha ao carregar produtos:", error);
      } finally {
        setLoading(false);
      }
    }, 400);
    return () => clearTimeout(handler);
  }, [search, selectedCategoria]);

  const handleDelete = (id: number) => {
    setModels((prev) => prev.filter((m) => m.id !== id));
  };

  const handleStatusChange = (id: number, ativo: boolean) => {
    setModels((prev) => prev.map((m) => (m.id === id ? { ...m, ativo } : m)));
  };

  return (
    <div className="p-8 max-w-7xl mx-auto flex flex-col gap-8">
      <header className="flex items-center justify-between bg-white p-6 rounded-[32px] border-4 border-pink-100 shadow-sm">
        <div>
          <h1 className="text-3xl font-extrabold text-pink-500">Meus Produtos</h1>
          <p className="text-pink-400 font-medium">Gerencie as camisas cadastradas</p>
        </div>
        <Link
          to="/admin/models/create"
          className="flex items-center gap-2 bg-pink-400 hover:bg-pink-500 text-white px-6 py-4 rounded-full font-bold shadow-md transition-all"
        >
          <Plus size={20} />
          Novo Produto
        </Link>
      </header>

      {/* Filtro por categoria */}
      {categorias.length > 0 && (
        <div className="flex items-center gap-2 flex-wrap">
          <Tag className="size-4 text-slate-400 shrink-0" />
          <button
            onClick={() => setSelectedCategoria(undefined)}
            className={`px-4 py-2 rounded-full text-sm font-bold border transition-all ${
              selectedCategoria === undefined
                ? "bg-pink-500 text-white border-pink-500 shadow-sm"
                : "bg-white text-slate-500 border-slate-200 hover:border-pink-300 hover:text-pink-500"
            }`}
          >
            Todas
          </button>
          {categorias.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setSelectedCategoria(cat.id === selectedCategoria ? undefined : cat.id)}
              className={`px-4 py-2 rounded-full text-sm font-bold border transition-all ${
                selectedCategoria === cat.id
                  ? "bg-pink-500 text-white border-pink-500 shadow-sm"
                  : "bg-white text-slate-500 border-slate-200 hover:border-pink-300 hover:text-pink-500"
              }`}
            >
              {cat.nome}
            </button>
          ))}
        </div>
      )}

      {loading ? (
        <div className="flex justify-center py-20">
          <Loader2 className="size-10 animate-spin text-pink-400" />
        </div>
      ) : models.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-center bg-white rounded-[40px] border-4 border-dashed border-pink-200">
          <Shirt className="size-12 text-pink-300 mb-4" />
          {search || selectedCategoria ? (
            <>
              <h2 className="text-2xl font-bold text-pink-500 mb-2">Nenhum produto encontrado</h2>
              <p className="text-pink-400">Tente outros filtros de pesquisa.</p>
            </>
          ) : (
            <>
              <h2 className="text-2xl font-bold text-pink-500 mb-2">Nenhum produto ainda</h2>
              <p className="text-pink-400">Cadastre a sua primeira camisa para a ver aqui.</p>
            </>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {models.map((model) => (
            <ModelCard
              key={model.id}
              product={model}
              onDelete={handleDelete}
              onStatusChange={handleStatusChange}
            />
          ))}
        </div>
      )}
    </div>
  );
};