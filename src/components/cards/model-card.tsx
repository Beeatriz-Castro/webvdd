import { useState } from "react";
import { Link } from "react-router";
import { Button } from "@/components/ui/button";
import { Pencil, Image as ImageIcon, Loader2 } from "lucide-react";
import { API_BASE_URL } from "@/lib/api/estampas";
import type { ProdutoPersonalizavel } from "@/lib/api/personalizaveis";
import { togglePersonalizavelStatus } from "@/lib/api/personalizaveis";
import modelSampleSrc from "../../assets/model-sample.png";

interface ModelCardProps {
  product: ProdutoPersonalizavel;
  onStatusChange?: (id: number, ativo: boolean) => void;
}

export const ModelCard = ({ product, onStatusChange }: ModelCardProps) => {
  const [active, setActive] = useState(product.ativo);
  const [loading, setLoading] = useState(false);

  const presentationImage = product.imagens?.find(
    (img) => img.tipo_visualizacao === "APRESENTACAO"
  );

  const imageUrl = presentationImage
    ? `${API_BASE_URL}/uploads/${presentationImage.id_externo_storage}`
    : modelSampleSrc;

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
      console.error("Erro ao alterar status do produto:", error);
      setActive(previousStatus); // Reverte a UI se a API falhar
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="group flex flex-col bg-white rounded-3xl border border-slate-100 overflow-hidden hover:shadow-xl hover:shadow-pink-100/50 hover:border-pink-200 transition-all duration-300">
      
      <div className="aspect-square bg-slate-50 relative overflow-hidden flex items-center justify-center p-4">
        {imageUrl ? (
          <img
            className="w-full h-full object-cover rounded-2xl group-hover:scale-105 transition-transform duration-500 shadow-sm"
            src={imageUrl}
            alt={`Fotografia de ${product.nome}`}
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
            className={`flex-1 py-1.5 text-sm font-semibold rounded-lg transition-all duration-200 ${
              active 
                ? "bg-white text-emerald-600 shadow-sm ring-1 ring-emerald-600/10" 
                : "text-slate-400 hover:text-slate-600"
            }`}
          >
            Ativo
          </button>
          <button
            onClick={() => handleToggle(false)}
            disabled={loading}
            className={`flex-1 py-1.5 text-sm font-semibold rounded-lg transition-all duration-200 ${
              !active 
                ? "bg-white text-slate-700 shadow-sm ring-1 ring-slate-200" 
                : "text-slate-400 hover:text-slate-600"
            }`}
          >
            Inativo
          </button>
        </div>

        <div className="flex flex-col flex-1">
          <h3 className="text-lg font-bold text-slate-800 line-clamp-1" title={product.nome}>
            {product.nome}
          </h3>
          <span className="text-sm font-medium text-slate-400 mb-2 line-clamp-1">
            {categoryNames}
          </span>
          <p className="text-xl font-black text-pink-500 mt-auto">
            {formattedPrice}
          </p>
        </div>

        <Button 
          asChild 
          variant="outline" 
          className="w-full gap-2 rounded-xl border-slate-200 text-slate-600 hover:border-pink-300 hover:text-pink-600 hover:bg-pink-50 transition-colors"
        >
          <Link to={`/admin/models/edit/${product.id}`}>
            <Pencil className="size-4" />
            Editar Produto
          </Link>
        </Button>
      </div>
    </div>
  );
};