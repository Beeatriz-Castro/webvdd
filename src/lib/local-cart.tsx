export interface CartItem {
  id: string;
  productId: number;
  productName: string;
  color: string;
  colorHex: string;
  faceView: string;
  estampaNome: string | null;
  baseImageUrl: string | null;
  previewDataUrl: string | null;
  quantities: Record<string, number>;
  unitPrice: number;
  totalPrice: number;
  addedAt: string;
}

export interface LocalOrder {
  id: string;
  dataPedido: string;
  status: "PENDENTE" | "CONFIRMADO" | "EM_PRODUCAO" | "ENVIADO" | "ENTREGUE" | "CANCELADO";
  itens: CartItem[];
  valorTotal: number;
}

const CART_KEY = "nordtf_cart";
const ORDERS_KEY = "nordtf_orders";

export function getCart(): CartItem[] {
  try {
    return JSON.parse(localStorage.getItem(CART_KEY) ?? "[]");
  } catch {
    return [];
  }
}

export function addToCart(item: Omit<CartItem, "id" | "addedAt">): CartItem {
  const cart = getCart();
  const newItem: CartItem = {
    ...item,
    id: crypto.randomUUID(),
    addedAt: new Date().toISOString(),
  };
  localStorage.setItem(CART_KEY, JSON.stringify([...cart, newItem]));
  return newItem;
}

export function removeFromCart(id: string): void {
  const cart = getCart().filter((i) => i.id !== id);
  localStorage.setItem(CART_KEY, JSON.stringify(cart));
}

export function clearCart(): void {
  localStorage.removeItem(CART_KEY);
}

export function getOrders(): LocalOrder[] {
  try {
    return JSON.parse(localStorage.getItem(ORDERS_KEY) ?? "[]");
  } catch {
    return [];
  }
}

export function createOrder(items: CartItem[]): LocalOrder {
  const orders = getOrders();
  const order: LocalOrder = {
    id: String(Date.now()),
    dataPedido: new Date().toISOString(),
    status: "PENDENTE",
    itens: items,
    valorTotal: items.reduce((acc, i) => acc + i.totalPrice, 0),
  };
  localStorage.setItem(ORDERS_KEY, JSON.stringify([order, ...orders]));
  clearCart();
  return order;
}