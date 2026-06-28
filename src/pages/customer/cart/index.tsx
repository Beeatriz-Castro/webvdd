import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router";
import { ShoppingBag, Trash2, Loader2, ArrowRight, PackageOpen } from "lucide-react";
import { getCart, removeFromCart, createOrder, type CartItem } from "@/lib/local-cart";

export const CustomerCartPage = () => {
  const navigate = useNavigate();
  const [items, setItems] = useState<CartItem[]>([]);
  const [checkingOut, setCheckingOut] = useState(false);

  useEffect(() => {
    setItems(getCart());
  }, []);

  const handleRemove = (id: string) => {
    removeFromCart(id);
    setItems(getCart());
  };

  const handleCheckout = async () => {
    if (items.length === 0) return;
    setCheckingOut(true);
    try {
      createOrder(items);
      navigate("/customer/orders");
    } finally {
      setCheckingOut(false);
    }
  };

  const total = items.reduce((acc, i) => acc + i.totalPrice, 0);

  return (
    <main className="min-h-screen p-6 md:p-8 max-w-4xl mx-auto flex flex-col gap-8">
      <header className="flex items-center gap-4 pt-4">
        <div className="bg-pink-100 p-3 rounded-full text-pink-500">
          <ShoppingBag size={26} />
        </div>
        <div>
          <h1 className="text-3xl font-black text-slate-800">Minha Sacola</h1>
          <p className="text-slate-400 font-medium text-sm">
            {items.length} {items.length === 1 ? "item" : "itens"}
          </p>
        </div>
      </header>

      {items.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-28 text-center bg-white rounded-3xl border-2 border-dashed border-pink-100">
          <PackageOpen className="size-16 text-pink-200 mb-4" />
          <h2 className="text-xl font-bold text-slate-600 mb-2">Sacola vazia</h2>
          <p className="text-slate-400 mb-6">Adicione produtos para continuar.</p>
          <Link
            to="/customer/models"
            className="flex items-center gap-2 bg-pink-500 hover:bg-pink-600 text-white font-bold px-6 py-3 rounded-full transition-colors"
          >
            Ver produtos
            <ArrowRight size={16} />
          </Link>
        </div>
      ) : (
        <div className="flex flex-col gap-4">
          {items.map((item) => (
            <div
              key={item.id}
              className="flex items-center gap-4 bg-white rounded-2xl border border-slate-100 p-4 shadow-sm"
            >
              <div className="w-20 h-20 bg-pink-50 rounded-xl flex-shrink-0 overflow-hidden flex items-center justify-center">
                {item.previewDataUrl || item.baseImageUrl ? (
                  <img
                    src={item.previewDataUrl ?? item.baseImageUrl ?? ""}
                    alt="preview"
                    className="w-full h-full object-contain p-2"
                  />
                ) : (
                  <ShoppingBag className="size-8 text-pink-200" />
                )}
              </div>

              <div className="flex-1 min-w-0">
                <p className="font-bold text-slate-800 line-clamp-1">{item.productName}</p>
                <p className="text-sm text-slate-400 font-medium">Cor: {item.color}</p>
                {item.estampaNome && (
                  <p className="text-sm text-pink-500 font-medium">🎨 {item.estampaNome}</p>
                )}
                <div className="flex flex-wrap gap-1 mt-1">
                  {Object.entries(item.quantities).filter(([, q]) => q > 0).map(([sigla, qty]) => (
                    <span key={sigla} className="text-xs font-bold bg-pink-50 text-pink-600 px-2 py-0.5 rounded-full border border-pink-100">
                      {sigla}: {qty}
                    </span>
                  ))}
                </div>
              </div>

              <div className="flex items-center gap-4 flex-shrink-0">
                <p className="font-black text-pink-500 text-lg">
                  {item.totalPrice.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}
                </p>
                <button
                  onClick={() => handleRemove(item.id)}
                  className="p-2 rounded-xl text-slate-300 hover:text-red-500 hover:bg-red-50 transition-colors"
                >
                  <Trash2 className="size-4" />
                </button>
              </div>
            </div>
          ))}

          <div className="bg-white rounded-2xl border border-slate-100 p-6 shadow-sm mt-2">
            <div className="flex items-center justify-between mb-4">
              <span className="text-slate-500 font-semibold">Total</span>
              <span className="text-2xl font-black text-pink-500">
                {total.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}
              </span>
            </div>
            <button
              onClick={handleCheckout}
              disabled={checkingOut}
              className="w-full flex items-center justify-center gap-2 bg-pink-500 hover:bg-pink-600 disabled:opacity-60 text-white font-bold py-4 rounded-2xl transition-colors shadow-md"
            >
              {checkingOut ? (
                <Loader2 className="size-5 animate-spin" />
              ) : (
                <>
                  Finalizar pedido
                  <ArrowRight size={18} />
                </>
              )}
            </button>
          </div>
        </div>
      )}
    </main>
  );
};