const API_BASE_URL = "http://localhost:3000";

export interface OrderSummary {
  id: number;
  dataPedido: string;
  statusPedido: string;
  valorTotal: number;
  totalItens: number;
  previewImageUrl: string | null;
}

export interface OrderItemDetail {
  id: number;
  tipo: "PRODUTO_PERSONALIZAVEL" | "MATERIAL_IMPRESSAO" | null;
  payload: Record<string, unknown> | null;
  quantidade: number;
  precoUnitario: number;
}

export interface OrderStatusEntry {
  status: string;
  alteradoEm: string;
}

export interface OrderDetails {
  id: number;
  dataPedido: string;
  statusPedido: string;
  valorTotal: number;
  itens: OrderItemDetail[];
  historicoStatus: OrderStatusEntry[];
}

export interface WhatsAppCartItem {
  name: string;
  price: number;
  quantity: number;
}

const authHeaders = (token: string) => ({
  "Content-Type": "application/json",
  Authorization: `Bearer ${token}`,
});

export async function listMyOrders(
  token: string,
): Promise<OrderSummary[]> {
  const response = await fetch(`${API_BASE_URL}/orders`, {
    headers: { Authorization: `Bearer ${token}` },
  });

  if (!response.ok) {
    throw new Error("Erro ao listar pedidos.");
  }

  return response.json();
}

export async function getMyOrderDetails(
  token: string,
  orderId: number,
): Promise<OrderDetails> {
  const response = await fetch(`${API_BASE_URL}/orders/${orderId}`, {
    headers: { Authorization: `Bearer ${token}` },
  });

  if (!response.ok) {
    throw new Error("Erro ao buscar detalhes do pedido.");
  }

  return response.json();
}

export async function createOrderFromCart(
  token: string,
): Promise<OrderDetails> {
  const response = await fetch(`${API_BASE_URL}/orders`, {
    method: "POST",
    headers: authHeaders(token),
  });

  if (!response.ok) {
    const body = await response.json().catch(() => null);
    throw new Error(body?.message || "Erro ao criar pedido.");
  }

  return response.json();
}

export const generateWhatsAppMessage = (
  orderId: string,
  items: WhatsAppCartItem[],
  totalValue: number,
  totalItensCount: number,
  method: string,
  installment?: string,
) => {
  const e_sol = String.fromCodePoint(9728);
  const e_cacto = String.fromCodePoint(127797);
  const e_caixa = String.fromCodePoint(128230);
  const e_grafico = String.fromCodePoint(128202);
  const e_seta = String.fromCodePoint(8627);
  const e_ponto = String.fromCodePoint(8226);
  const e_cartao = String.fromCodePoint(128179);
  const e_brilho = String.fromCodePoint(10024);

  let msg = `Ola NorDtf! ${e_sol}${e_cacto} Fiz um pedido no site e gostaria de combinar o pagamento e a entrega.\n\n`;
  msg += `${e_caixa} *PEDIDO CONCLUIDO: #${orderId}*\n-----------------------------------\n`;

  items.forEach((item) => {
    msg += `*${item.quantity}x ${item.name}*\n`;
    msg += `  ${e_seta} Subtotal: R$ ${(item.price * item.quantity).toFixed(2).replace(".", ",")}\n\n`;
  });

  msg += `-----------------------------------\n${e_grafico} *RESUMO DA COMPRA*\n`;
  msg += `${e_ponto} Total (${totalItensCount} itens): *R$ ${totalValue.toFixed(2).replace(".", ",")}*\n\n`;
  msg += `${e_cartao} *FORMA DE PAGAMENTO:*\n${e_ponto} ${method} ${installment ? `(${installment})` : ""}\n\n`;
  msg += `Aguardo o retorno para finalizarmos! ${e_brilho}`;

  return encodeURIComponent(msg);
};
