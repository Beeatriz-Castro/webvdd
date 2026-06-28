import { API_BASE_URL, getAuthHeaders } from "./api";
export { API_BASE_URL };

export interface Estilo {
  id: number;
  nome: string;
}

export interface ImagemEstampa {
  id: number;
  id_estampa: number;
  id_externo_storage: string;
}

export interface EstampaEstilo {
  id_estampa: number;
  id_estilo: number;
  estilo: Estilo;
}

export interface Estampa {
  id: number;
  nome: string;
  material: "NORMAL" | "UV";
  criado_em: string;
  imagens: Array<{ id: number; id_externo_storage: string }>;
  estilos: Array<{ estilo: { id: number; nome: string } }>;
  estilosNomes?: string | string[]; 
  id_externo_storage?: string; 
}

export interface CreateEstampaPayload {
  nome: string;
  estilosNomes: string[];
  image: File;
}

export interface UpdateEstampaPayload {
  nome?: string;
  estilosNomes?: string[];
  image?: File;
}

export interface ListEstampasParams {
  search?: string;
  estiloIds?: number[];
}

export async function getEstampa(id: number): Promise<Estampa> {
  const response = await fetch(`${API_BASE_URL}/estampas/${id}`);
  if (!response.ok) {
    throw new Error(`Erro ao buscar estampa: ${response.statusText}`);
  }
  return response.json();
}

export async function listEstilos(): Promise<Estilo[]> {
  const response = await fetch(`${API_BASE_URL}/estampas/estilos`);
  if (!response.ok) {
    throw new Error(`Erro ao listar estilos: ${response.statusText}`);
  }
  return response.json();
}

export async function listEstampas(params: ListEstampasParams = {}): Promise<Estampa[]> {
  const trimmedSearch = params.search?.trim();

  // Faz duas buscas em paralelo quando há estiloIds para garantir merge de resultados:
  // 1. Busca por nome (search)
  // 2. Busca por estilo (estiloIds)
  // Depois remove duplicatas por id
  const fetchByParams = async (p: { search?: string; estiloIds?: number[] }) => {
    const searchParams = new URLSearchParams();
    if (p.search) searchParams.append("search", p.search);
    if (p.estiloIds && p.estiloIds.length > 0) {
      searchParams.append("estiloIds", JSON.stringify(p.estiloIds));
    }
    const queryString = searchParams.toString();
    const response = await fetch(
      `${API_BASE_URL}/estampas${queryString ? `?${queryString}` : ""}`
    );
    if (!response.ok) throw new Error(`Erro ao listar estampas: ${response.statusText}`);
    return response.json() as Promise<Estampa[]>;
  };

  if (trimmedSearch && params.estiloIds && params.estiloIds.length > 0) {
    // Busca por nome e por estilo em paralelo, faz merge removendo duplicatas
    const [byName, byEstilo] = await Promise.all([
      fetchByParams({ search: trimmedSearch }),
      fetchByParams({ estiloIds: params.estiloIds }),
    ]);
    const map = new Map<number, Estampa>();
    [...byName, ...byEstilo].forEach((e) => map.set(e.id, e));
    return Array.from(map.values());
  }

  return fetchByParams({ search: trimmedSearch, estiloIds: params.estiloIds });
}

export async function createEstampa(data: CreateEstampaPayload): Promise<Estampa> {
  const formData = new FormData();
  formData.append("nome", data.nome);
  formData.append("estilosNomes", JSON.stringify(data.estilosNomes));
  formData.append("image", data.image);

  const response = await fetch(`${API_BASE_URL}/estampas`, {
    method: "POST",
    headers: getAuthHeaders(),
    body: formData,
  });
  
  if (!response.ok) {
    throw new Error(`Erro ao cadastrar estampa: ${response.statusText}`);
  }
  return response.json();
}

export async function updateEstampa(id: number, data: UpdateEstampaPayload): Promise<Estampa> {
  const formData = new FormData();

  if (data.nome !== undefined) formData.append("nome", data.nome);
  if (data.estilosNomes !== undefined) formData.append("estilosNomes", JSON.stringify(data.estilosNomes));
  if (data.image) formData.append("image", data.image);

  const response = await fetch(`${API_BASE_URL}/estampas/${id}`, {
    method: "PATCH",
    headers: getAuthHeaders(),
    body: formData,
  });

  if (!response.ok) {
    const body = await response.json().catch(() => null);
    throw new Error(body?.message || `Erro ao atualizar estampa: ${response.statusText}`);
  }

  return response.json();
}

export async function deleteEstampa(id: number): Promise<void> {
  const response = await fetch(`${API_BASE_URL}/estampas/${id}`, {
    method: "DELETE",
    headers: getAuthHeaders(),
  });
  
  if (!response.ok) {
    const body = await response.json().catch(() => null);
    throw new Error(body?.message || `Erro ao remover estampa: ${response.statusText}`);
  }
}
