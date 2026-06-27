import { Link } from "react-router";
import modelSampleSrc from "@/assets/model-sample.png";
import {
  getProdutoCores,
  getProdutoImagemUrl,
  type ProdutoPersonalizavel,
} from "@/lib/api/modelos";

interface CustomerModelCardProps {
  product: ProdutoPersonalizavel;
}

export const CustomerModelCard = ({ product }: CustomerModelCardProps) => {
  const imageUrl = getProdutoImagemUrl(product) ?? modelSampleSrc;
  const cores = getProdutoCores(product);

  return (
    <div className="flex flex-col gap-3 group">
      <Link
        to={`/customer/models/view/${product.id}`}
        className="block overflow-hidden rounded-xl bg-[#F3F3F3]"
      >
        <img
          src={imageUrl}
          alt={product.nome}
          className="w-full aspect-[3/4] object-cover transition-transform duration-300 group-hover:scale-105"
        />
      </Link>

      <div className="flex flex-col gap-1">
        <h3 className="text-lg font-bold text-black">{product.nome}</h3>
        <p className="text-sm font-semibold text-gray-500">
          {product.categorias.map((cp) => cp.categoria.nome).join(", ") || "Sem categoria"}
        </p>

        <div className="flex items-center gap-2 mt-1">
          <div className="flex -space-x-1.5">
            {cores.length > 0 ? (
              cores.map((cor) => (
                <div
                  key={cor.hex}
                  className="size-5 rounded-full border-2 border-white shadow-sm"
                  style={{ backgroundColor: cor.hex }}
                  title={cor.name}
                />
              ))
            ) : (
              <div
                className="size-5 rounded-full border-2 border-white shadow-sm"
                style={{ backgroundColor: "#E5E7EB" }}
              />
            )}
          </div>
          <span className="text-xs font-medium text-gray-500">
            {cores.length > 0 ? "Cores disponiveis" : "Sem cores cadastradas"}
          </span>
        </div>
      </div>
    </div>
  );
};
