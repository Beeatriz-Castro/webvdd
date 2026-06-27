import { Button } from "@/components/ui/button";
import { useState } from "react";
import clsx from "clsx";
import { Link } from "react-router";
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

  const presentationImage = product.imagens.find(
    (img) => img.tipo_visualizacao === "APRESENTACAO"
  );

  const imageUrl = presentationImage
    ? `${API_BASE_URL}/uploads/${presentationImage.id_externo_storage}`
    : modelSampleSrc;

  const categoryNames = product.categorias
    .map((cp) => cp.categoria.nome)
    .join(", ");

  const formattedPrice = product.preco.toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL",
  });

  const handleToggle = async (newStatus: boolean) => {
    if (loading || active === newStatus) return;
    setLoading(true);
    try {
      await togglePersonalizavelStatus(product.id, newStatus);
      setActive(newStatus);
      onStatusChange?.(product.id, newStatus);
    } catch {
      // silently fail
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col gap-2">
      <img
        className="rounded-[10px] aspect-square object-cover"
        src={imageUrl}
        alt={product.nome}
      />

      <div className="w-full flex items-center rounded-[10px] overflow-hidden">
        <Button
          className={clsx({
            "shrink-0 flex-1 rounded-none hover:bg-slate-50": true,
            "bg-[#00C853] hover:!bg-[#00C853CC]": active,
          })}
          variant={"ghost"}
          onClick={() => handleToggle(true)}
          disabled={loading}
        >
          Ativo
        </Button>
        <Button
          className={clsx({
            "shrink-0 flex-1 rounded-none hover:bg-slate-50": true,
            "bg-[#00C853] hover:!bg-[#00C853CC]": !active,
          })}
          variant={"ghost"}
          onClick={() => handleToggle(false)}
          disabled={loading}
        >
          Inativo
        </Button>
      </div>

      <div>
        <h3 className="text-xl font-bold">{product.nome}</h3>
        <span className="text-sm text-muted-foreground">
          {categoryNames || "Sem categoria"}
        </span>
        <p className="text-base font-semibold">{formattedPrice}</p>
      </div>

      <Button asChild className="!bg-white text-base" variant={"outline"}>
        <Link to={`/admin/models/edit/${product.id}`}>Editar</Link>
      </Button>
    </div>
  );
};
