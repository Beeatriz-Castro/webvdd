import { useState } from "react";
import { Link } from "react-router";
import { Button } from "@/components/ui/button";
import { Pencil, Image as ImageIcon, Loader2, Trash2 } from "lucide-react";
import type { ProdutoPersonalizavel } from "@/lib/api/personalizaveis";
import { 
  togglePersonalizavelStatus, 
  deletePersonalizavel
} from "@/lib/api/personalizaveis";
import { API_BASE_URL } from "@/lib/api/api"; 

interface ModelCardProps {
  product: ProdutoPersonalizavel;
  onStatusChange?: (id: number, ativo: boolean) => void;
  onDelete?: (id: number) => void;
}

export const ModelCard = ({ product, onStatusChange, onDelete }: ModelCardProps) => {
  const [active, setActive] = useState(product.ativo);
  const [loading, setLoading] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const presentationImage = product.imagens?.find(
    (img) => img.tipo_visualizacao === "APRESENTACAO"
  );
  
  const imageUrl = presentationImage?.id_externo_storage
    ? `${API_BASE_URL}/uploads/${presentationImage.id_externo_storage}`
    : null;

  const categoryNames = product.categorias?.length 
    ? product.categorias.map((cp) => cp.categoria.nome).join(", ")
    : "Sem categoria";

  const formattedPrice = Number(product.preco).toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL",
  });

  const handleToggle = async (newStatus: boolean) => {
    if (loading || active === newStatus) return;
    
    const previousStatus = active;
    setActive(newStatus);
    setLoading(true);
    
    try {
      await togglePersonalizavelStatus(product.id, newStatus);
      onStatusChange?.(product.id, newStatus);
    } catch (error) {
      console.error("Erro ao alterar status:", error);
      setActive(previousStatus);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!window.confirm(`Tem a certeza que deseja excluir o produto "${product.nome}"? Esta ação não pode ser desfeita.`)) {
      return;
    }

    setIsDeleting(true);
    try {
      await deletePersonalizavel(product.id);
      onDelete?.(product.id);
    } catch (error) {
      console.error("Erro ao excluir produto:", error);
      alert("Não foi possível excluir o produto. Ele pode ter pedidos vinculados.");
      setIsDeleting(false);
    }
  };

  return (
    <div className={`group flex flex-col bg-white rounded-3xl border border-slate-100 overflow-hidden transition-all duration-300 ${isDeleting ? 'opacity-50 pointer-events-none scale-95' : 'hover:shadow-xl hover:shadow-pink-100/50 hover:border-pink-200'}`}>
      
      <div className="aspect-square bg-slate-50 relative overflow-hidden flex items-center justify-center p-4">
        {imageUrl ? (
          <img
            src={imageUrl} // CORREÇÃO 3: Faltava o atributo src nesta imagem!
            className="w-full h-full object-contain rounded-2xl group-hover:scale-105 transition-transform duration-500"
            alt={product.nome}
            loading="lazy"
          />
        ) : (
          <ImageIcon className="size-12 text-slate-300" />
        )}
      </div>

      <div className="p-5 flex flex-col flex-1 gap-4">
        <div className="flex items-center p-1 bg-slate-100/80 rounded-xl relative">
          {loading && (
            <div className="absolute inset-0 bg-white/50 z-10 flex items-center justify-center rounded-xl">
              <Loader2 className="size-4 animate-spin text-slate-400" />
            </div>
          )}
          <button
            onClick={() => handleToggle(true)}
            disabled={loading}
            className={`flex-1 py-1.5 text-sm font-semibold rounded-lg transition-all duration-200 ${active ? "bg-white text-emerald-600 shadow-sm ring-1 ring-emerald-600/10" : "text-slate-400 hover:text-slate-600"}`}
          >
            Ativo
          </button>
          <button
            onClick={() => handleToggle(false)}
            disabled={loading}
            className={`flex-1 py-1.5 text-sm font-semibold rounded-lg transition-all duration-200 ${!active ? "bg-white text-slate-700 shadow-sm ring-1 ring-slate-200" : "text-slate-400 hover:text-slate-600"}`}
          >
            Inativo
          </button>
        </div>

        <div className="flex flex-col flex-1">
          <h3 className="text-lg font-bold text-slate-800 line-clamp-1">{product.nome}</h3>
          <span className="text-sm font-medium text-slate-400 mb-2 line-clamp-1">{categoryNames}</span>
          <p className="text-xl font-black text-pink-500 mt-auto">{formattedPrice}</p>
        </div>

        <div className="flex gap-2 mt-2">
          <Button asChild variant="outline" className="flex-1 gap-2 rounded-xl border-slate-200 text-slate-600 hover:border-pink-300 hover:text-pink-600 hover:bg-pink-50 transition-colors">
            <Link to={`/admin/models/edit/${product.id}`}>
              <Pencil className="size-4" />
              Editar
            </Link>
          </Button>
          
          <Button 
            variant="outline" 
            onClick={handleDelete}
            className="px-3 rounded-xl border-slate-200 text-slate-400 hover:border-red-200 hover:text-red-600 hover:bg-red-50 transition-colors"
            title="Excluir produto"
          >
            {isDeleting ? <Loader2 className="size-4 animate-spin" /> : <Trash2 className="size-4" />}
          </Button>
        </div>
      </div>
    </div>
  );
};