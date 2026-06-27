export { API_BASE_URL } from "./api";

export type TipoVisualizacaoProduto = "APRESENTACAO" | "FRENTE" | "COSTAS";

export interface Categoria {
  id: number;
  nome: string;
}

export interface CategoriaProduto {
  id_categoria: number;
  id_produto: number;
  categoria: Categoria;
}

export interface ProdutoCor {
  id: number;
  nome: string;
  hex_code: string;
}

export interface ProdutoTamanho {
  id: number;
  sigla: string;
}

export interface ImagemProduto {
  id: number;
  id_produto: number;
  id_cor: number;
  id_externo_storage: string;
  tipo_visualizacao: TipoVisualizacaoProduto;
  cor?: ProdutoCor;
}

export interface ProdutoVariacao {
  id: number;
  id_produto: number;
  id_tamanho: number | null;
  id_cor: number;
  cor: ProdutoCor;
  tamanho: ProdutoTamanho | null;
}

export interface ProdutoPersonalizavel {
  id: number;
  nome: string;
  descricao: string | null;
  preco: number;
  criado_em: string;
  ativo: boolean;
  categorias: CategoriaProduto[];
  imagens: ImagemProduto[];
  variacoes: ProdutoVariacao[];
}

export interface ListModelosParams {
  search?: string;
  ativo?: boolean;
}

export function getProdutoImagemUrl(produto: ProdutoPersonalizavel, selectedColorHex?: string | null) {
  let imagem;
  if (selectedColorHex) {
    imagem = produto.imagens.find(
      (item) => item.tipo_visualizacao === "APRESENTACAO" && item.cor?.hex_code === selectedColorHex
    );
  }

  if (!imagem) {
    imagem = produto.imagens.find(
      (item) => item.tipo_visualizacao === "APRESENTACAO"
    ) ?? produto.imagens[0];
  }

  if (!imagem?.id_externo_storage) return null;

  return `${API_BASE_URL}/uploads/${imagem.id_externo_storage}`;
}

export interface ProdutoCorObject {
  hex: string;
  name: string;
}

export function getProdutoCores(produto: ProdutoPersonalizavel): ProdutoCorObject[] {
  const map = new Map<string, string>();
  
  produto.variacoes?.forEach((v) => {
    if (v.cor?.hex_code && v.cor?.nome) map.set(v.cor.hex_code, v.cor.nome);
  });
  
  produto.imagens?.forEach((img) => {
    if (img.cor?.hex_code && img.cor?.nome) map.set(img.cor.hex_code, img.cor.nome);
  });
  
  return Array.from(map.entries()).map(([hex, name]) => ({ hex, name }));
}

export async function listModelos(
  params: ListModelosParams = {},
): Promise<ProdutoPersonalizavel[]> {
  const searchParams = new URLSearchParams();
  const trimmedSearch = params.search?.trim();

  if (trimmedSearch) {
    searchParams.append("search", trimmedSearch);
  }

  if (typeof params.ativo === "boolean") {
    searchParams.append("ativo", String(params.ativo));
  }

  const queryString = searchParams.toString();
  const response = await fetch(
    `${API_BASE_URL}/produtos-personalizaveis${
      queryString ? `?${queryString}` : ""
    }`,
  );

  if (!response.ok) {
    throw new Error(`Erro ao listar modelos: ${response.statusText}`);
  }

  return response.json();
}

export async function getModeloById(
  id: number,
): Promise<ProdutoPersonalizavel> {
  const response = await fetch(
    `${API_BASE_URL}/produtos-personalizaveis/${id}`,
  );

  if (!response.ok) {
    throw new Error(`Erro ao buscar modelo: ${response.statusText}`);
  }

  return response.json();
}
