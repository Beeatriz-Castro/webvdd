const API_BASE_URL = "http://localhost:3000";

export interface CartItemPayload {
  productId?: number;
  productName?: string;
  color?: string;
  colorHex?: string;
  colorId?: number;
  printSide?: string;
  printPosition?: string;
  printSize?: string;
  artwork?: any;
  customGraphicUrl?: string;
  baseImageUrl?: string;
  quantities?: Record<string, number>;
  unitPrice?: number;
  placedGraphicsBySide?: Record<string, any[]>;
  artworks?: Array<{
    name: string;
    imageUrl: string;
    x: number;
    y: number;
    width: number;
    height: number;
  }>;
  layout?: {
    placedGraphics?: Array<{
      id: string;
      sourceType: "server" | "upload";
      name: string;
      imageUrl: string;
      bounds: {
        x: number;
        y: number;
        width: number;
        height: number;
      };
      aspectRatio?: number;
      imageAspectRatio?: number;
    }>;
  };
  layoutHeight?: number;
  calculatedMeters?: number;
}

export interface CartItemResponse {
  id: number;
  id_usuario: number;
  tipo: "PRODUTO_PERSONALIZAVEL" | "MATERIAL_IMPRESSAO";
  payload: CartItemPayload;
  preco_total: number;
  criado_em: string;
}

export interface AddPrintMaterialPayload {
  artworks: Array<{
    name: string;
    imageUrl: string;
    x: number;
    y: number;
    width: number;
    height: number;
  }>;
  layoutHeight: number;
  calculatedMeters: number;
  unitPrice: number;
  totalPrice: number;
  layout?: Record<string, unknown>;
}

export interface AddCustomProductPayload {
  productId: number;
  productName: string;
  color: string;
  colorHex?: string;
  colorId: number;
  printSide: string;
  printPosition: string;
  printSize: string;
  artwork: any;
  customGraphicUrl?: string;
  baseImageUrl?: string;
  quantities: Record<string, number>;
  unitPrice: number;
  totalPrice: number;
  placedGraphicsBySide?: Record<string, any[]>;
  layout?: {
    placedGraphics?: Array<{
      id: string;
      sourceType: "server" | "upload";
      name: string;
      imageUrl: string;
      bounds: {
        x: number;
        y: number;
        width: number;
        height: number;
      };
      aspectRatio?: number;
      imageAspectRatio?: number;
    }>;
  };
}

const authHeaders = (token: string) => ({
  "Content-Type": "application/json",
  Authorization: `Bearer ${token}`,
});

export async function addPrintMaterialToCart(
  token: string,
  data: AddPrintMaterialPayload,
): Promise<CartItemResponse> {
  const response = await fetch(`${API_BASE_URL}/cart/print-material`, {
    method: "POST",
    headers: authHeaders(token),
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    const body = await response.json().catch(() => null);
    throw new Error(body?.message || "Erro ao adicionar material a sacola.");
  }

  return response.json();
}

export async function addCustomProductToCart(
  token: string,
  data: AddCustomProductPayload,
): Promise<CartItemResponse> {
  const response = await fetch(`${API_BASE_URL}/cart/custom-product`, {
    method: "POST",
    headers: authHeaders(token),
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    const body = await response.json().catch(() => null);
    throw new Error(body?.message || "Erro ao adicionar produto a sacola.");
  }

  return response.json();
}

export async function getCart(token: string): Promise<CartItemResponse[]> {
  const response = await fetch(`${API_BASE_URL}/cart`, {
    headers: { Authorization: `Bearer ${token}` },
  });

  if (!response.ok) {
    throw new Error("Erro ao buscar sacola.");
  }

  return response.json();
}

export async function removeCartItem(
  token: string,
  itemId: number,
): Promise<void> {
  const response = await fetch(`${API_BASE_URL}/cart/${itemId}`, {
    method: "DELETE",
    headers: { Authorization: `Bearer ${token}` },
  });

  if (!response.ok) {
    throw new Error("Erro ao remover item da sacola.");
  }
}

export async function updateCartItemQuantity(
  token: string,
  itemId: number,
  quantities: Record<string, number>,
): Promise<CartItemResponse> {
  const response = await fetch(`${API_BASE_URL}/cart/${itemId}/quantity`, {
    method: "PATCH",
    headers: authHeaders(token),
    body: JSON.stringify({ quantities }),
  });

  if (!response.ok) {
    throw new Error("Erro ao atualizar quantidade.");
  }

  return response.json();
}

export async function uploadCustomizationSnapshot(
  token: string,
  blob: Blob,
): Promise<{ url: string }> {
  const formData = new FormData();
  formData.append("snapshot", blob, "snapshot.png");

  const response = await fetch(`${API_BASE_URL}/cart/upload-snapshot`, {
    method: "POST",
    headers: { Authorization: `Bearer ${token}` },
    body: formData,
  });

  if (!response.ok) {
    throw new Error("Erro ao enviar imagem de personalização.");
  }

  return response.json();
}
