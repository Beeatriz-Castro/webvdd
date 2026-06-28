import { useState, useEffect } from "react";
import { getOrders, type LocalOrder } from "@/lib/local-cart";
import { ClipboardList, PackageOpen, ChevronRight, ShoppingBag } from "lucide-react";

const STATUS_LABEL: Record<string, string> = {
  PENDENTE: "Pendente",
  CONFIRMADO: "Confirmado",
  EM_PRODUCAO: "Em produção",
  ENVIADO: "Enviado",
  ENTREGUE: "Entregue",
  CANCELADO: "Cancelado",
};

const STATUS_COLOR: Record<string, string> = {
  PENDENTE: "bg-yellow-100 text-yellow-700",
  CONFIRMADO: "bg-blue-100 text-blue-700",
  EM_PRODUCAO: "bg-purple-100 text-purple-700",
  ENVIADO: "bg-indigo-100 text-indigo-700",
  ENTREGUE: "bg-green-100 text-green-700",
  CANCELADO: "bg-red-100 text-red-600",
};

export const CustomerOrdersPage = () => {
  const [orders, setOrders] = useState<LocalOrder[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);

  useEffect(() => {
    setOrders(getOrders());
  }, []);

  return (
    <main className="min-h-screen p-6 md:p-8 max-w-4xl mx-auto flex flex-col gap-8">
      <header className="flex items-center gap-4 pt-4">
        <div className="bg-pink-100 p-3 rounded-full text-pink-500">
          <ClipboardList size={26} />
        </div>
        <div>
          <h1 className="text-3xl font-black text-slate-800">Meus Pedidos</h1>
          <p className="text-slate-400 font-medium text-sm">Acompanhe o histórico das suas compras</p>
        </div>
      </header>

      {orders.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-28 text-center bg-white rounded-3xl border-2 border-dashed border-pink-100">
          <PackageOpen className="size-16 text-pink-200 mb-4" />
          <h2 className="text-xl font-bold text-slate-600 mb-2">Nenhum pedido ainda</h2>
          <p className="text-slate-400">Os seus pedidos aparecerão aqui após a compra.</p>
        </div>
      ) : (
        <div className="flex flex-col gap-4">
          {orders.map((order) => {
            const isOpen = selectedId === order.id;
            const statusLabel = STATUS_LABEL[order.status] ?? order.status;
            const statusColor = STATUS_COLOR[order.status] ?? "bg-slate-100 text-slate-600";
            const firstItem = order.itens[0];

            return (
              <div key={order.id} className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
                <button
                  onClick={() => setSelectedId(isOpen ? null : order.id)}
                  className="w-full flex items-center gap-4 p-5 hover:bg-slate-50 transition-colors text-left"
                >
                  <div className="w-14 h-14 bg-pink-50 rounded-xl flex-shrink-0 overflow-hidden flex items-center justify-center">
                    {firstItem?.previewDataUrl || firstItem?.baseImageUrl ? (
                      <img
                        src={firstItem.previewDataUrl ?? firstItem.baseImageUrl ?? ""}
                        alt="preview"
                        className="w-full h-full object-contain p-1"
                      />
                    ) : (
                      <ShoppingBag className="size-6 text-pink-200" />
                    )}
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-bold text-slate-800">Pedido #{order.id.slice(-6)}</span>
                      <span className={`text-xs font-bold px-2.5 py-1 rounded-full ${statusColor}`}>
                        {statusLabel}
                      </span>
                    </div>
                    <p className="text-sm text-slate-400 mt-0.5">
                      {new Date(order.dataPedido).toLocaleDateString("pt-BR", {
                        day: "2-digit", month: "long", year: "numeric",
                      })}
                      {" · "}
                      {order.itens.length} {order.itens.length === 1 ? "item" : "itens"}
                    </p>
                  </div>

                  <div className="flex items-center gap-3 flex-shrink-0">
                    <span className="font-black text-pink-500">
                      {order.valorTotal.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}
                    </span>
                    <ChevronRight size={18} className={`text-slate-300 transition-transform ${isOpen ? "rotate-90" : ""}`} />
                  </div>
                </button>

                {isOpen && (
                  <div className="border-t border-slate-100 px-5 py-4 bg-slate-50 flex flex-col gap-3">
                    <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Itens do pedido</p>
                    {order.itens.map((item) => (
                      <div key={item.id} className="flex items-center gap-3 bg-white rounded-xl p-3 border border-slate-100">
                        <div className="w-12 h-12 bg-pink-50 rounded-lg flex-shrink-0 overflow-hidden flex items-center justify-center">
                          {item.previewDataUrl || item.baseImageUrl ? (
                            <img src={item.previewDataUrl ?? item.baseImageUrl ?? ""} alt="preview" className="w-full h-full object-contain p-1" />
                          ) : (
                            <ShoppingBag className="size-5 text-pink-200" />
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-bold text-slate-700 text-sm line-clamp-1">{item.productName}</p>
                          <p className="text-xs text-slate-400">{item.color}{item.estampaNome ? ` · 🎨 ${item.estampaNome}` : ""}</p>
                          <div className="flex flex-wrap gap-1 mt-1">
                            {Object.entries(item.quantities).filter(([, q]) => q > 0).map(([sigla, qty]) => (
                              <span key={sigla} className="text-xs font-bold bg-pink-50 text-pink-600 px-1.5 py-0.5 rounded-full">{sigla}: {qty}</span>
                            ))}
                          </div>
                        </div>
                        <span className="font-black text-pink-500 text-sm flex-shrink-0">
                          {item.totalPrice.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}
                        </span>
                      </div>
                    ))}
                    <div className="flex justify-between pt-2 border-t border-slate-200">
                      <span className="text-sm font-semibold text-slate-500">Total</span>
                      <span className="font-black text-pink-500">
                        {order.valorTotal.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}
                      </span>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </main>
  );
};