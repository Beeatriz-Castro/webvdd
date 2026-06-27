import { API_BASE_URL } from "./api";
export { API_BASE_URL }

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

export async function getEstampa(id: number): Promise<Estampa> {
  const response = await fetch(`${API_BASE_URL}/estampas/${id}`);
  if (!response.ok) {
    throw new Error(`Erro ao buscar estampa: ${response.statusText}`);
  }
  return response.json();
}

export interface ListEstampasParams {
  search?: string;
  estiloIds?: number[];
}

export async function listEstilos(): Promise<Estilo[]> {
  const response = await fetch(`${API_BASE_URL}/estampas/estilos`);
  if (!response.ok) {
    throw new Error(`Erro ao listar estilos: ${response.statusText}`);
  }
  return response.json();
}

export async function listEstampas(
  params: ListEstampasParams = {},
): Promise<Estampa[]> {
  const searchParams = new URLSearchParams();
  const trimmedSearch = params.search?.trim();

  if (trimmedSearch) {
    searchParams.append("search", trimmedSearch);
  }

  if (params.estiloIds && params.estiloIds.length > 0) {
    searchParams.append("estiloIds", JSON.stringify(params.estiloIds));
  }

  const queryString = searchParams.toString();
  const response = await fetch(
    `${API_BASE_URL}/estampas${queryString ? `?${queryString}` : ""}`,
  );
  if (!response.ok) {
    throw new Error(`Erro ao listar estampas: ${response.statusText}`);
  }
  return response.json();
}

export async function createEstampa(
  data: CreateEstampaPayload,
): Promise<Estampa> {
  const formData = new FormData();
  formData.append("nome", data.nome);
  formData.append("estilosNomes", JSON.stringify(data.estilosNomes));
  formData.append("image", data.image);

  const response = await fetch(`${API_BASE_URL}/estampas`, {
    method: "POST",
    body: formData,
  });
  if (!response.ok) {
    throw new Error(`Erro ao cadastrar estampa: ${response.statusText}`);
  }
  return response.json();
}

export async function updateEstampa(
  id: number,
  data: UpdateEstampaPayload,
): Promise<Estampa> {
  const formData = new FormData();

  if (data.nome !== undefined) {
    formData.append("nome", data.nome);
  }

  if (data.estilosNomes !== undefined) {
    formData.append("estilosNomes", JSON.stringify(data.estilosNomes));
  }

  if (data.image) {
    formData.append("image", data.image);
  }

  const response = await fetch(`${API_BASE_URL}/estampas/${id}`, {
    method: "PATCH",
    body: formData,
  });

  if (!response.ok) {
    const body = await response.json().catch(() => null);
    throw new Error(
      body?.message || `Erro ao atualizar estampa: ${response.statusText}`,
    );
  }

  return response.json();
}

export async function deleteEstampa(id: number): Promise<void> {
  const response = await fetch(`${API_BASE_URL}/estampas/${id}`, {
    method: "DELETE",
  });
  if (!response.ok) {
    const body = await response.json().catch(() => null);
    throw new Error(
      body?.message || `Erro ao remover estampa: ${response.statusText}`,
    );
  }
}
