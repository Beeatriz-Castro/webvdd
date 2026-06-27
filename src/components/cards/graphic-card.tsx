import { Link } from "react-router";
import { Button } from "@/components/ui/button";
import { API_BASE_URL, type Estampa } from "@/lib/api/estampas";

interface GraphicCardProps {
  estampa: Estampa;
}

export const GraphicCard = ({ estampa }: GraphicCardProps) => {
  const estilosLabel = estampa.estilos
    .map((e) => e.estilo.nome)
    .join(" | ");

  const imageUrl = estampa.imagens[0]?.id_externo_storage
    ? `${API_BASE_URL}/uploads/${estampa.imagens[0].id_externo_storage}`
    : null;

  return (
    <div className="flex flex-col gap-2">
      <Link to={`/admin/graphics/view/${estampa.id}`} className="group">
        <div className="rounded-t-[10px] aspect-[3/4] bg-gray-100 flex items-center justify-center overflow-hidden transition-opacity group-hover:opacity-90">
          {imageUrl ? (
            <img
              src={imageUrl}
              alt={estampa.nome}
              className="w-full h-full object-cover"
            />
          ) : (
            <span className="text-muted-foreground text-sm text-center px-2">
              Sem imagem
            </span>
          )}
        </div>
      </Link>

      <div>
        <h3 className="text-base font-bold">
          {estampa.nome}
        </h3>

        {estilosLabel && (
          <span className="text-xs font-bold text-muted-foreground">
            {estilosLabel}
          </span>
        )}
      </div>

      <Button asChild className="!bg-white text-base" variant="outline">
        <Link to={`/admin/graphics/view/${estampa.id}`}>Editar</Link>
      </Button>
    </div>
  );
}
