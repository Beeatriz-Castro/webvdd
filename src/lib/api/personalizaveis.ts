import { API_BASE_URL } from "./estampas";

export interface Categoria {
  id: number;
  nome: string;
}

export interface CategoriaProduto {
  id_categoria: number;
  id_produto: number;
  categoria: Categoria;
}

export interface Cor {
  id: number;
  nome: string;
  hex_code: string;
}

export interface Tamanho {
  id: number;
  sigla: string;
}

export interface ImagemProduto {
  id: number;
  id_produto: number;
  id_cor: number;
  id_externo_storage: string;
  tipo_visualizacao: "APRESENTACAO" | "FRENTE" | "COSTAS";
  cor: Cor;
}

export interface ProdutoVariacao {
  id: number;
  id_produto: number;
  id_cor: number;
  id_tamanho: number | null;
  estoque: number;
  cor: Cor;
  tamanho: Tamanho | null;
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

export interface ListPersonalizaveisParams {
  search?: string;
  categoriaId?: number;
  ativo?: boolean;
  precoMin?: number;
  precoMax?: number;
  tamanhoSiglas?: string[];
}

export async function listPersonalizaveis(
  params: ListPersonalizaveisParams = {}
): Promise<ProdutoPersonalizavel[]> {
  const searchParams = new URLSearchParams();
  const trimmedSearch = params.search?.trim();
  if (trimmedSearch) searchParams.append("search", trimmedSearch);
  if (params.categoriaId) searchParams.append("categoriaId", String(params.categoriaId));
  if (typeof params.ativo === "boolean") searchParams.append("ativo", String(params.ativo));
  if (params.precoMin !== undefined) searchParams.append("precoMin", String(params.precoMin));
  if (params.precoMax !== undefined) searchParams.append("precoMax", String(params.precoMax));
  if (params.tamanhoSiglas && params.tamanhoSiglas.length > 0)
    searchParams.append("tamanhoSiglas", JSON.stringify(params.tamanhoSiglas));

  const queryString = searchParams.toString();
  const response = await fetch(
    `${API_BASE_URL}/produtos-personalizaveis${queryString ? `?${queryString}` : ""}`
  );
  if (!response.ok) throw new Error(`Erro ao listar produtos: ${response.statusText}`);
  return response.json();
}

export async function listCategorias(): Promise<Categoria[]> {
  const response = await fetch(`${API_BASE_URL}/produtos-personalizaveis/categorias`);
  if (!response.ok) throw new Error(`Erro ao listar categorias: ${response.statusText}`);
  return response.json();
}

export async function createCategoria(nome: string): Promise<Categoria> {
  const response = await fetch(`${API_BASE_URL}/produtos-personalizaveis/categorias`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ nome }),
  });
  if (!response.ok) {
    const body = await response.json().catch(() => null);
    throw new Error(body?.message || `Erro ao criar categoria: ${response.statusText}`);
  }
  return response.json();
}

export async function listTamanhos(): Promise<Tamanho[]> {
  const response = await fetch(`${API_BASE_URL}/produtos-personalizaveis/tamanhos`);
  if (!response.ok) throw new Error(`Erro ao listar tamanhos: ${response.statusText}`);
  return response.json();
}

export async function listCores(): Promise<Cor[]> {
  const response = await fetch(`${API_BASE_URL}/produtos-personalizaveis/cores`);
  if (!response.ok) throw new Error(`Erro ao listar cores: ${response.statusText}`);
  return response.json();
}

export async function createCor(nome: string, hexCode: string): Promise<Cor> {
  const response = await fetch(`${API_BASE_URL}/produtos-personalizaveis/cores`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ nome, hexCode }),
  });
  if (!response.ok) {
    const body = await response.json().catch(() => null);
    throw new Error(body?.message || `Erro ao criar cor: ${response.statusText}`);
  }
  return response.json();
}

export interface CreatePersonalizavelImagemPayload {
  idCor: number;
  idExternoStorage: string;
  tipoVisualizacao: "APRESENTACAO" | "FRENTE" | "COSTAS";
}

export interface CreatePersonalizavelVariacaoPayload {
  idCor: number;
  idTamanho?: number;
  estoque?: number;
}

export interface CreatePersonalizavelPayload {
  nome: string;
  descricao?: string;
  preco: number;
  categorias: number[];
  imagens: CreatePersonalizavelImagemPayload[];
  variacoes: CreatePersonalizavelVariacaoPayload[];
}

export async function createPersonalizavel(
  data: CreatePersonalizavelPayload,
  arquivos: File[]
): Promise<ProdutoPersonalizavel> {
  const formData = new FormData();
  formData.append("dados", JSON.stringify(data));
  arquivos.forEach((file) => formData.append("arquivos", file));

  const response = await fetch(`${API_BASE_URL}/produtos-personalizaveis`, {
    method: "POST",
    body: formData,
  });
  if (!response.ok) {
    const body = await response.json().catch(() => null);
    throw new Error(body?.message || `Erro ao cadastrar produto: ${response.statusText}`);
  }
  return response.json();
}

export async function updatePersonalizavel(
  id: number,
  data: Partial<CreatePersonalizavelPayload>,
  arquivos: File[]
): Promise<ProdutoPersonalizavel> {
  const formData = new FormData();
  formData.append("dados", JSON.stringify(data));
  arquivos.forEach((file) => formData.append("arquivos", file));

  const response = await fetch(`${API_BASE_URL}/produtos-personalizaveis/${id}`, {
    method: "PATCH",
    body: formData,
  });
  if (!response.ok) {
    const body = await response.json().catch(() => null);
    throw new Error(body?.message || `Erro ao atualizar produto: ${response.statusText}`);
  }
  return response.json();
}

export async function deletePersonalizavel(id: number): Promise<void> {
  const response = await fetch(`${API_BASE_URL}/produtos-personalizaveis/${id}`, {
    method: "DELETE",
  });
  if (!response.ok) {
    const body = await response.json().catch(() => null);
    throw new Error(body?.message || `Erro ao remover produto: ${response.statusText}`);
  }
}

export async function togglePersonalizavelStatus(
  id: number,
  ativo: boolean
): Promise<ProdutoPersonalizavel> {
  const response = await fetch(`${API_BASE_URL}/produtos-personalizaveis/${id}/status`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ ativo }),
  });
  if (!response.ok) {
    const body = await response.json().catch(() => null);
    throw new Error(body?.message || `Erro ao alterar status: ${response.statusText}`);
  }
  return response.json();
}

export async function decrementStock(
  id: number,
  variacoes: Array<{ idCor: number; idTamanho: number; quantidade: number }>
): Promise<void> {
  const response = await fetch(`${API_BASE_URL}/produtos-personalizaveis/${id}/stock`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ variacoes }),
  });
  if (!response.ok) {
    const body = await response.json().catch(() => null);
    throw new Error(body?.message || `Erro ao atualizar estoque: ${response.statusText}`);
  }
}

export const getCustomizableById = async (id: number): Promise<ProdutoPersonalizavel> => {
  const response = await fetch(`${API_BASE_URL}/produtos-personalizaveis/${id}`);
  if (!response.ok) throw new Error("Falha ao buscar detalhes do produto");
  return response.json();
};