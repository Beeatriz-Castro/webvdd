import { useState, useEffect, useMemo, useRef, useCallback } from "react";
import { useParams, Link, useNavigate } from "react-router";
import {
  ArrowLeft, ShoppingBag, Loader2, AlertCircle, Check,
  ChevronLeft, ChevronRight, Minus, Plus, Shirt, Send,
  Package, MessageCircle, ChevronDown, ChevronUp,
  Download, RotateCcw, ZoomIn, ZoomOut, Move,
} from "lucide-react";
import { API_BASE_URL } from "@/lib/api/api";
import {
  getCustomizableById,
  type ProdutoPersonalizavel,
  type Cor,
} from "@/lib/api/personalizaveis";
import { listEstampas, listEstilos, type Estampa, type Estilo } from "@/lib/api/estampas";

type FaceView = "APRESENTACAO" | "FRENTE" | "COSTAS";
type Step = "customize" | "summary";

const FACE_LABELS: Record<FaceView, string> = {
  APRESENTACAO: "Apresentação",
  FRENTE: "Frente",
  COSTAS: "Costas",
};

const WHATSAPP_NUMBER = "5589994082151";

interface StampPlacement {
  x: number; 
  y: number; 
  scale: number; 
}

interface SelectedItem {
  produto: ProdutoPersonalizavel;
  cor: Cor;
  estampa: Estampa | null;
  stampPlacement: StampPlacement | null;
  previewDataUrl: string | null;
  quantities: Record<string, number>;
  faceView: FaceView;
  imageUrl: string | null;
}

function isLight(hex: string): boolean {
  const c = hex.replace("#", "");
  const r = parseInt(c.substring(0, 2), 16);
  const g = parseInt(c.substring(2, 4), 16);
  const b = parseInt(c.substring(4, 6), 16);
  return (r * 299 + g * 587 + b * 114) / 1000 > 128;
}

function buildWhatsAppMessage(items: SelectedItem[]): string {
  const grandTotal = items.reduce((acc, item) => {
    const qtd = Object.values(item.quantities).reduce((a, b) => a + b, 0);
    return acc + Number(item.produto.preco) * qtd;
  }, 0);

  let msg = `Olá NorDTF! ✨\n\nFiz um pedido no site e gostaria de combinar a entrega.\n\n`;
  msg += `🛍️ *RESUMO DO PEDIDO*\n`;
  msg += `━━━━━━━━━━━━━━━━━━\n\n`;

  items.forEach((item, i) => {
    const qtdTotal = Object.values(item.quantities).reduce((a, b) => a + b, 0);
    const subtotal = Number(item.produto.preco) * qtdTotal;
    msg += `👕 *${i + 1}. ${item.produto.nome}*\n`;
    msg += `   Cor: ${item.cor.nome}\n`;
    if (item.estampa) msg += `   🎨 Estampa: ${item.estampa.nome}\n`;
    else msg += `   Sem estampa\n`;
    msg += `   📐 Tamanhos:\n`;
    Object.entries(item.quantities).filter(([, qty]) => qty > 0)
      .forEach(([sigla, qty]) => { msg += `      • ${sigla}: ${qty} und.\n`; });
    msg += `   Subtotal: *R$ ${subtotal.toFixed(2).replace(".", ",")}*\n\n`;
  });

  msg += `━━━━━━━━━━━━━━━━━━\n`;
  msg += `💰 *TOTAL: R$ ${grandTotal.toFixed(2).replace(".", ",")}*\n\n`;
  msg += `Aguardo o retorno para combinarmos a entrega! ✨`;
  return msg;
}

interface StampEditorProps {
  shirtImageUrl: string;
  stampImageUrl: string | null;
  placement: StampPlacement;
  onChange: (p: StampPlacement) => void;
  canvasRef: React.RefObject<HTMLCanvasElement | null>;
}

function StampEditor({ shirtImageUrl, stampImageUrl, placement, onChange, canvasRef }: StampEditorProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const dragging = useRef(false);
  const dragStart = useRef({ mx: 0, my: 0, ox: 0, oy: 0 });

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const SIZE = 600;
    canvas.width = SIZE;
    canvas.height = SIZE;
    ctx.clearRect(0, 0, SIZE, SIZE);

    const shirtImg = new Image();
    shirtImg.crossOrigin = "anonymous";
    shirtImg.src = shirtImageUrl;
    shirtImg.onload = () => {
      ctx.drawImage(shirtImg, 0, 0, SIZE, SIZE);
      if (!stampImageUrl) return;

      const stampImg = new Image();
      stampImg.crossOrigin = "anonymous";
      stampImg.src = stampImageUrl;
      stampImg.onload = () => {
        const stampSize = SIZE * 0.25 * placement.scale;
        const px = (placement.x / 100) * SIZE - stampSize / 2;
        const py = (placement.y / 100) * SIZE - stampSize / 2;
        ctx.drawImage(stampImg, px, py, stampSize, stampSize);
      };
    };
  }, [shirtImageUrl, stampImageUrl, placement, canvasRef]);

  const getRelativePos = (e: React.MouseEvent | React.TouchEvent) => {
    const rect = containerRef.current!.getBoundingClientRect();
    const clientX = "touches" in e ? e.touches[0].clientX : e.clientX;
    const clientY = "touches" in e ? e.touches[0].clientY : e.clientY;
    return {
      x: ((clientX - rect.left) / rect.width) * 100,
      y: ((clientY - rect.top) / rect.height) * 100,
    };
  };

  const onMouseDown = (e: React.MouseEvent) => {
    if (!stampImageUrl) return;
    dragging.current = true;
    dragStart.current = { mx: e.clientX, my: e.clientY, ox: placement.x, oy: placement.y };
    e.preventDefault();
  };

  const onMouseMove = useCallback((e: MouseEvent) => {
    if (!dragging.current || !containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const dx = ((e.clientX - dragStart.current.mx) / rect.width) * 100;
    const dy = ((e.clientY - dragStart.current.my) / rect.height) * 100;
    onChange({
      ...placement,
      x: Math.min(100, Math.max(0, dragStart.current.ox + dx)),
      y: Math.min(100, Math.max(0, dragStart.current.oy + dy)),
    });
  }, [placement, onChange]);

  const onMouseUp = useCallback(() => { dragging.current = false; }, []);

  useEffect(() => {
    window.addEventListener("mousemove", onMouseMove);
    window.addEventListener("mouseup", onMouseUp);
    return () => {
      window.removeEventListener("mousemove", onMouseMove);
      window.removeEventListener("mouseup", onMouseUp);
    };
  }, [onMouseMove, onMouseUp]);

  const onTouchStart = (e: React.TouchEvent) => {
    if (!stampImageUrl) return;
    dragging.current = true;
    const pos = getRelativePos(e);
    dragStart.current = { mx: e.touches[0].clientX, my: e.touches[0].clientY, ox: pos.x, oy: pos.y };
  };

  const onTouchMove = (e: React.TouchEvent) => {
    if (!dragging.current || !containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const dx = ((e.touches[0].clientX - dragStart.current.mx) / rect.width) * 100;
    const dy = ((e.touches[0].clientY - dragStart.current.my) / rect.height) * 100;
    onChange({
      ...placement,
      x: Math.min(100, Math.max(0, dragStart.current.ox + dx)),
      y: Math.min(100, Math.max(0, dragStart.current.oy + dy)),
    });
  };

  const stampSize = `${25 * placement.scale}%`;

  return (
    <div
      ref={containerRef}
      className="relative w-full aspect-square bg-white rounded-3xl border-2 border-pink-100 shadow-sm overflow-hidden select-none"
      onMouseDown={onMouseDown}
      onTouchStart={onTouchStart}
      onTouchMove={onTouchMove}
      onTouchEnd={() => { dragging.current = false; }}
      style={{ cursor: stampImageUrl ? "grab" : "default" }}
    >
      <img
        src={shirtImageUrl}
        alt="Camisa"
        className="absolute inset-0 w-full h-full object-contain p-6 pointer-events-none"
        crossOrigin="anonymous"
      />

      {stampImageUrl && (
        <img
          src={stampImageUrl}
          alt="Estampa"
          className="absolute pointer-events-none drop-shadow-lg"
          crossOrigin="anonymous"
          style={{
            width: stampSize,
            height: stampSize,
            left: `calc(${placement.x}% - ${25 * placement.scale / 2}%)`,
            top: `calc(${placement.y}% - ${25 * placement.scale / 2}%)`,
            objectFit: "contain",
          }}
        />
      )}

      <canvas ref={canvasRef} className="hidden" />

      {stampImageUrl && (
        <div className="absolute bottom-3 left-1/2 -translate-x-1/2 bg-black/40 text-white text-xs font-semibold px-3 py-1.5 rounded-full backdrop-blur-sm pointer-events-none">
          Arraste para posicionar
        </div>
      )}

      {!stampImageUrl && (
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl px-4 py-3 border border-pink-100 shadow-sm text-center">
            <p className="text-sm font-bold text-slate-500">Escolha uma estampa abaixo</p>
            <p className="text-xs text-slate-400 mt-0.5">para posicioná-la na camisa</p>
          </div>
        </div>
      )}
    </div>
  );
}

export const CustomerCustomizePage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [step, setStep] = useState<Step>("customize");
  const [produto, setProduto] = useState<ProdutoPersonalizavel | null>(null);
  const [loadingProduto, setLoadingProduto] = useState(true);
  const [errorProduto, setErrorProduto] = useState<string | null>(null);
  const [selectedColor, setSelectedColor] = useState<Cor | null>(null);
  const [selectedFace, setSelectedFace] = useState<FaceView>("APRESENTACAO");
  const [selectedEstampa, setSelectedEstampa] = useState<Estampa | null>(null);
  const [quantities, setQuantities] = useState<Record<string, number>>({});
  const [stampPlacement, setStampPlacement] = useState<StampPlacement>({ x: 50, y: 40, scale: 1 });
  const [estampas, setEstampas] = useState<Estampa[]>([]);
  const [estilos, setEstilos] = useState<Estilo[]>([]);
  const [selectedEstilos, setSelectedEstilos] = useState<number[]>([]);
  const [searchEstampa, setSearchEstampa] = useState("");
  const [loadingEstampas, setLoadingEstampas] = useState(true);
  const [estampaPage, setEstampaPage] = useState(0);
  const [showEstampas, setShowEstampas] = useState(false);

  const [cartItems, setCartItems] = useState<SelectedItem[]>([]);
  const [orderError, setOrderError] = useState<string | null>(null);
  const [generatingPng, setGeneratingPng] = useState(false);

  const ESTAMPAS_PER_PAGE = 8;

  useEffect(() => {
    if (!id) return;
    setLoadingProduto(true);
    getCustomizableById(Number(id))
      .then((data: ProdutoPersonalizavel) => {
        setProduto(data);
        const coresUnicas = getCoresUnicas(data);
        if (coresUnicas.length > 0) setSelectedColor(coresUnicas[0]);
      })
      .catch(() => setErrorProduto("Não foi possível carregar o produto."))
      .finally(() => setLoadingProduto(false));
  }, [id]);

  useEffect(() => {
    setLoadingEstampas(true);
    setEstampaPage(0);
    listEstampas({ search: searchEstampa, estiloIds: selectedEstilos.length ? selectedEstilos : undefined })
      .then(setEstampas).catch(() => setEstampas([]))
      .finally(() => setLoadingEstampas(false));
  }, [searchEstampa, selectedEstilos]);

  useEffect(() => {
    listEstilos().then(setEstilos).catch(() => {});
  }, []);

  function getCoresUnicas(p: ProdutoPersonalizavel): Cor[] {
    const map = new Map<number, Cor>();
    p.variacoes?.forEach((v) => { if (v.cor && !map.has(v.cor.id)) map.set(v.cor.id, v.cor); });
    p.imagens?.forEach((img) => { if (img.cor && !map.has(img.cor.id)) map.set(img.cor.id, img.cor); });
    return Array.from(map.values());
  }

  const currentImageUrl = useMemo(() => {
    if (!produto || !selectedColor) return null;
    const imagem =
      produto.imagens.find((img) => img.id_cor === selectedColor.id && img.tipo_visualizacao === selectedFace) ??
      produto.imagens.find((img) => img.tipo_visualizacao === selectedFace) ??
      produto.imagens.find((img) => img.id_cor === selectedColor.id) ??
      produto.imagens[0];
    return imagem ? `${API_BASE_URL}/uploads/${imagem.id_externo_storage}` : null;
  }, [produto, selectedColor, selectedFace]);

  const facesDisponiveis = useMemo<FaceView[]>(() => {
    if (!produto || !selectedColor) return [];
    const faces = produto.imagens.filter((img) => img.id_cor === selectedColor.id).map((img) => img.tipo_visualizacao);
    const unique = Array.from(new Set(faces)) as FaceView[];
    return (["APRESENTACAO", "FRENTE", "COSTAS"] as FaceView[]).filter((f) => unique.includes(f));
  }, [produto, selectedColor]);

  useEffect(() => {
    if (facesDisponiveis.length > 0 && !facesDisponiveis.includes(selectedFace)) {
      setSelectedFace(facesDisponiveis[0]);
    }
  }, [facesDisponiveis, selectedFace]);

  useEffect(() => {
    setStampPlacement({ x: 50, y: 40, scale: 1 });
  }, [selectedEstampa?.id, selectedFace]);

  const tamanhosDisponiveis = useMemo(() => {
    if (!produto || !selectedColor) return [];
    return produto.variacoes
      .filter((v) => v.id_cor === selectedColor.id && v.tamanho)
      .map((v) => ({ tamanho: v.tamanho!, estoque: v.estoque }));
  }, [produto, selectedColor]);

  useEffect(() => {
    const init: Record<string, number> = {};
    tamanhosDisponiveis.forEach(({ tamanho }) => { init[tamanho.sigla] = 0; });
    setQuantities(init);
  }, [tamanhosDisponiveis]);

  const estampasPaginadas = useMemo(() => {
    const start = estampaPage * ESTAMPAS_PER_PAGE;
    return estampas.slice(start, start + ESTAMPAS_PER_PAGE);
  }, [estampas, estampaPage]);

  const totalPages = Math.ceil(estampas.length / ESTAMPAS_PER_PAGE);
  const totalQtd = Object.values(quantities).reduce((a, b) => a + b, 0);
  const totalPreco = produto ? Number(produto.preco) * totalQtd : 0;

  const stampImageUrl = useMemo(() => {
    if (!selectedEstampa?.imagens?.[0]) return null;
    return `${API_BASE_URL}/uploads/${selectedEstampa.imagens[0].id_externo_storage}`;
  }, [selectedEstampa]);

  const generatePreviewPng = (): Promise<string | null> => {
    return new Promise((resolve) => {
      const canvas = canvasRef.current;
      if (!canvas || !currentImageUrl) { resolve(null); return; }

      const SIZE = 600;
      canvas.width = SIZE;
      canvas.height = SIZE;
      const ctx = canvas.getContext("2d");
      if (!ctx) { resolve(null); return; }
      ctx.clearRect(0, 0, SIZE, SIZE);

      const shirtImg = new Image();
      shirtImg.crossOrigin = "anonymous";
      shirtImg.src = currentImageUrl;
      shirtImg.onload = () => {
        ctx.drawImage(shirtImg, 0, 0, SIZE, SIZE);
        if (!stampImageUrl) {
          resolve(canvas.toDataURL("image/png"));
          return;
        }
        const stampImg = new Image();
        stampImg.crossOrigin = "anonymous";
        stampImg.src = stampImageUrl;
        stampImg.onload = () => {
          const stampSize = SIZE * 0.25 * stampPlacement.scale;
          const px = (stampPlacement.x / 100) * SIZE - stampSize / 2;
          const py = (stampPlacement.y / 100) * SIZE - stampSize / 2;
          ctx.drawImage(stampImg, px, py, stampSize, stampSize);
          resolve(canvas.toDataURL("image/png"));
        };
        stampImg.onerror = () => resolve(canvas.toDataURL("image/png"));
      };
      shirtImg.onerror = () => resolve(null);
    });
  };

  const handleDownloadPng = async () => {
    setGeneratingPng(true);
    const dataUrl = await generatePreviewPng();
    if (dataUrl) {
      const a = document.createElement("a");
      a.href = dataUrl;
      a.download = `${produto?.nome ?? "camisa"}-personalizada.png`;
      a.click();
    }
    setGeneratingPng(false);
  };

  const handleAddToCart = async () => {
    if (!produto || !selectedColor) return;
    if (totalQtd === 0) { setOrderError("Selecione ao menos uma unidade antes de continuar."); return; }

    for (const [sigla, qty] of Object.entries(quantities)) {
      if (qty === 0) continue;
      const variacao = tamanhosDisponiveis.find((t) => t.tamanho.sigla === sigla);
      if (variacao && qty > variacao.estoque) {
        setOrderError(`Estoque insuficiente para o tamanho ${sigla}. Disponível: ${variacao.estoque} unidade(s).`);
        return;
      }
    }

    setOrderError(null);
    const previewDataUrl = await generatePreviewPng();

    const newItem: SelectedItem = {
      produto,
      cor: selectedColor,
      estampa: selectedEstampa,
      stampPlacement: selectedEstampa ? { ...stampPlacement } : null,
      previewDataUrl,
      quantities: { ...quantities },
      faceView: selectedFace,
      imageUrl: currentImageUrl,
    };

    setCartItems((prev) => [...prev, newItem]);
    setStep("summary");
  };

  const handleSendWhatsApp = () => {
    if (cartItems.length === 0) return;
    const msg = buildWhatsAppMessage(cartItems);
    window.open(`https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(msg)}`, "_blank");
  };

  const removeItem = (index: number) => setCartItems((prev) => prev.filter((_, i) => i !== index));

  const grandTotal = cartItems.reduce((acc, item) => {
    const qtd = Object.values(item.quantities).reduce((a, b) => a + b, 0);
    return acc + Number(item.produto.preco) * qtd;
  }, 0);

  if (loadingProduto) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center gap-4">
        <Loader2 className="size-10 animate-spin text-pink-400" />
        <p className="text-slate-400 font-medium animate-pulse">A carregar produto...</p>
      </div>
    );
  }

  if (errorProduto || !produto) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center gap-4 text-center px-4">
        <div className="bg-red-50 p-6 rounded-full text-red-400"><AlertCircle className="size-12" /></div>
        <h2 className="text-2xl font-bold text-slate-700">Produto não encontrado</h2>
        <p className="text-slate-500">{errorProduto}</p>
        <Link to="/customer/models" className="mt-2 flex items-center gap-2 text-pink-500 font-semibold hover:text-pink-600">
          <ArrowLeft className="size-4" /> Voltar aos modelos
        </Link>
      </div>
    );
  }

  const coresUnicas = getCoresUnicas(produto);

  if (step === "summary") {
    return (
      <div className="min-h-screen bg-[#fdf2f8]/40">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 py-8 flex flex-col gap-6">
          <div className="flex items-center gap-3">
            <button onClick={() => setStep("customize")} className="p-2 rounded-full hover:bg-pink-100 text-slate-500 hover:text-pink-500 transition-colors">
              <ArrowLeft className="size-5" />
            </button>
            <div>
              <h1 className="text-2xl font-black text-slate-800">Resumo do Pedido</h1>
              <p className="text-slate-500 text-sm">Revise os itens e envie pelo WhatsApp</p>
            </div>
          </div>

          {cartItems.length === 0 ? (
            <div className="bg-white rounded-3xl border border-slate-100 p-12 text-center flex flex-col items-center gap-4">
              <Package className="size-12 text-slate-200" />
              <p className="font-semibold text-slate-500">Nenhum item adicionado</p>
              <button onClick={() => setStep("customize")} className="text-sm text-pink-500 font-bold hover:underline">Voltar e personalizar</button>
            </div>
          ) : (
            <div className="flex flex-col gap-4">
              {cartItems.map((item, index) => {
                const qtdTotal = Object.values(item.quantities).reduce((a, b) => a + b, 0);
                const subtotal = Number(item.produto.preco) * qtdTotal;
                return (
                  <div key={index} className="bg-white rounded-2xl border border-slate-100 p-5 flex gap-4 shadow-sm">
                    <div className="size-20 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-center overflow-hidden shrink-0">
                      {item.previewDataUrl ? (
                        <img src={item.previewDataUrl} alt={item.produto.nome} className="w-full h-full object-contain" />
                      ) : item.imageUrl ? (
                        <img src={item.imageUrl} alt={item.produto.nome} className="w-full h-full object-contain p-2" />
                      ) : (
                        <Shirt className="size-8 text-slate-200" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2">
                        <h3 className="font-bold text-slate-800 truncate">{item.produto.nome}</h3>
                        <button onClick={() => removeItem(index)} className="text-slate-300 hover:text-red-500 transition-colors text-xs font-bold shrink-0">remover</button>
                      </div>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="size-4 rounded-full border border-slate-200 shrink-0" style={{ backgroundColor: item.cor.hex_code }} />
                        <span className="text-sm text-slate-500">{item.cor.nome}</span>
                        {item.estampa && <><span className="text-slate-300">·</span><span className="text-sm text-pink-600 font-medium">🎨 {item.estampa.nome}</span></>}
                      </div>
                      <div className="flex flex-wrap gap-1.5 mt-2">
                        {Object.entries(item.quantities).filter(([, qty]) => qty > 0).map(([sigla, qty]) => (
                          <span key={sigla} className="inline-flex items-center gap-1 px-2 py-0.5 bg-pink-50 text-pink-700 text-xs font-bold rounded-full border border-pink-100">{sigla}: {qty}</span>
                        ))}
                      </div>
                      <div className="flex items-center justify-between mt-2">
                        <span className="text-xs text-slate-400">{qtdTotal} und. × {Number(item.produto.preco).toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}</span>
                        <span className="font-black text-slate-800">{subtotal.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}</span>
                      </div>
                    </div>
                  </div>
                );
              })}
              <button onClick={() => setStep("customize")} className="flex items-center justify-center gap-2 py-3.5 rounded-2xl border-2 border-dashed border-pink-200 text-pink-500 font-semibold text-sm hover:border-pink-400 hover:bg-pink-50 transition-all">
                <Plus className="size-4" /> Adicionar outro item
              </button>
            </div>
          )}

          {cartItems.length > 0 && (
            <div className="bg-white rounded-3xl border border-slate-100 p-6 shadow-sm flex flex-col gap-4">
              <div className="flex items-center justify-between">
                <span className="text-slate-500 font-medium">Total ({cartItems.reduce((acc, item) => acc + Object.values(item.quantities).reduce((a, b) => a + b, 0), 0)} itens)</span>
                <span className="text-2xl font-black text-slate-800">{grandTotal.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}</span>
              </div>
              <div className="bg-emerald-50 rounded-2xl p-4 border border-emerald-100">
                <p className="text-sm text-emerald-700 font-medium">📱 Ao clicar em "Enviar Pedido", você será redirecionado para o WhatsApp com todas as informações do pedido já preenchidas.</p>
              </div>
              <button onClick={handleSendWhatsApp} className="w-full flex items-center justify-center gap-3 py-4 bg-emerald-500 hover:bg-emerald-600 text-white font-bold text-lg rounded-2xl shadow-lg shadow-emerald-200 hover:-translate-y-0.5 transition-all">
                <MessageCircle className="size-6" /> Enviar Pedido pelo WhatsApp
              </button>
              <button onClick={() => navigate("/customer/models")} className="w-full py-3 text-slate-400 font-semibold text-sm hover:text-slate-600 transition-colors">Continuar comprando</button>
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#fdf2f8]/40">
      <canvas ref={canvasRef} className="hidden" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 pt-6">
        <Link to="/customer/models" className="inline-flex items-center gap-2 text-sm font-semibold text-slate-400 hover:text-pink-500 transition-colors">
          <ArrowLeft className="size-4" /> Voltar aos modelos
        </Link>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 flex flex-col gap-10">
        <section className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12">

          <div className="flex flex-col gap-4">
            {currentImageUrl ? (
              <StampEditor
                shirtImageUrl={currentImageUrl}
                stampImageUrl={stampImageUrl}
                placement={stampPlacement}
                onChange={setStampPlacement}
                canvasRef={canvasRef}
              />
            ) : (
              <div className="w-full aspect-square bg-white rounded-3xl border-2 border-pink-100 flex items-center justify-center">
                <Shirt className="size-32 text-slate-200" />
              </div>
            )}

            {selectedEstampa && currentImageUrl && (
              <div className="bg-white rounded-2xl border border-slate-100 p-4 flex flex-col gap-3">
                <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Ajustar estampa</p>
                <div className="flex items-center gap-3">
                  <span className="text-xs font-semibold text-slate-500 w-14">Tamanho</span>
                  <button
                    onClick={() => setStampPlacement((p) => ({ ...p, scale: Math.max(0.3, p.scale - 0.1) }))}
                    className="size-8 rounded-lg bg-slate-100 hover:bg-pink-100 hover:text-pink-600 flex items-center justify-center transition-colors"
                  ><ZoomOut className="size-4" /></button>
                  <div className="flex-1 h-2 bg-slate-100 rounded-full overflow-hidden">
                    <div className="h-full bg-pink-400 rounded-full transition-all" style={{ width: `${((stampPlacement.scale - 0.3) / 2.7) * 100}%` }} />
                  </div>
                  <button
                    onClick={() => setStampPlacement((p) => ({ ...p, scale: Math.min(3, p.scale + 0.1) }))}
                    className="size-8 rounded-lg bg-slate-100 hover:bg-pink-100 hover:text-pink-600 flex items-center justify-center transition-colors"
                  ><ZoomIn className="size-4" /></button>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => setStampPlacement({ x: 50, y: 40, scale: 1 })}
                    className="flex items-center gap-1.5 text-xs font-semibold text-slate-400 hover:text-pink-500 transition-colors px-3 py-2 rounded-lg hover:bg-pink-50"
                  ><RotateCcw className="size-3.5" /> Resetar posição</button>
                  <button
                    onClick={() => setStampPlacement((p) => ({ ...p, x: 50, y: 40 }))}
                    className="flex items-center gap-1.5 text-xs font-semibold text-slate-400 hover:text-pink-500 transition-colors px-3 py-2 rounded-lg hover:bg-pink-50"
                  ><Move className="size-3.5" /> Centralizar</button>
                </div>
              </div>
            )}

            {facesDisponiveis.length > 1 && (
              <div className="flex gap-2">
                {facesDisponiveis.map((face) => (
                  <button
                    key={face}
                    onClick={() => setSelectedFace(face)}
                    className={`flex-1 py-2.5 rounded-xl text-sm font-bold transition-all border ${
                      selectedFace === face
                        ? "bg-pink-500 text-white border-pink-500 shadow-md shadow-pink-200"
                        : "bg-white text-slate-500 border-slate-200 hover:border-pink-300 hover:text-pink-500"
                    }`}
                  >{FACE_LABELS[face]}</button>
                ))}
              </div>
            )}

            {currentImageUrl && (
              <button
                onClick={handleDownloadPng}
                disabled={generatingPng}
                className="flex items-center justify-center gap-2 py-3 rounded-xl border-2 border-slate-200 text-slate-500 hover:border-pink-300 hover:text-pink-500 hover:bg-pink-50 font-semibold text-sm transition-all disabled:opacity-50"
              >
                {generatingPng ? <Loader2 className="size-4 animate-spin" /> : <Download className="size-4" />}
                {generatingPng ? "Gerando..." : "Baixar prévia em PNG"}
              </button>
            )}
          </div>

          <div className="flex flex-col gap-6">
            <div>
              <h1 className="text-3xl font-black text-slate-800 tracking-tight">{produto.nome}</h1>
              <p className="text-2xl font-black text-pink-500 mt-1">
                {Number(produto.preco).toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}
                <span className="text-sm font-semibold text-slate-400 ml-2">/ unidade</span>
              </p>
            </div>

            {coresUnicas.length > 0 && (
              <div>
                <p className="text-sm font-bold text-slate-600 mb-3 uppercase tracking-wider">
                  Cor — <span className="text-pink-500 normal-case font-semibold">{selectedColor?.nome}</span>
                </p>
                <div className="flex flex-wrap gap-3">
                  {coresUnicas.map((cor) => (
                    <button key={cor.id} onClick={() => setSelectedColor(cor)} title={cor.nome}
                      className={`relative size-9 rounded-full transition-all border-2 ${selectedColor?.id === cor.id ? "border-pink-500 scale-110 shadow-lg" : "border-transparent hover:border-pink-300 hover:scale-105"}`}
                      style={{ backgroundColor: cor.hex_code }}
                    >
                      {selectedColor?.id === cor.id && (
                        <span className="absolute inset-0 flex items-center justify-center">
                          <Check className="size-4 drop-shadow" style={{ color: isLight(cor.hex_code) ? "#1e293b" : "#ffffff" }} />
                        </span>
                      )}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {tamanhosDisponiveis.length > 0 ? (
              <div>
                <p className="text-sm font-bold text-slate-600 mb-3 uppercase tracking-wider">Quantidade por tamanho</p>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  {tamanhosDisponiveis.map(({ tamanho, estoque }) => {
                    const qty = quantities[tamanho.sigla] ?? 0;
                    const semEstoque = estoque === 0;
                    return (
                      <div key={tamanho.id} className={`flex flex-col items-center gap-2 p-3 rounded-2xl border-2 transition-all ${semEstoque ? "border-slate-100 bg-slate-50 opacity-50" : qty > 0 ? "border-pink-400 bg-pink-50" : "border-slate-200 bg-white"}`}>
                        <span className={`text-sm font-black ${qty > 0 ? "text-pink-600" : "text-slate-500"}`}>{tamanho.sigla}</span>
                        {semEstoque ? (
                          <span className="text-[10px] font-bold text-slate-400 uppercase">Esgotado</span>
                        ) : (
                          <>
                            <div className="flex items-center gap-1">
                              <button onClick={() => setQuantities((prev) => ({ ...prev, [tamanho.sigla]: Math.max(0, (prev[tamanho.sigla] ?? 0) - 1) }))} className="size-7 rounded-lg bg-slate-100 hover:bg-pink-100 hover:text-pink-600 flex items-center justify-center transition-colors"><Minus className="size-3.5" /></button>
                              <span className="w-8 text-center text-sm font-bold text-slate-700 tabular-nums">{qty}</span>
                              <button onClick={() => setQuantities((prev) => ({ ...prev, [tamanho.sigla]: Math.min(estoque, (prev[tamanho.sigla] ?? 0) + 1) }))} disabled={qty >= estoque} className="size-7 rounded-lg bg-slate-100 hover:bg-pink-100 hover:text-pink-600 flex items-center justify-center transition-colors disabled:opacity-40 disabled:cursor-not-allowed"><Plus className="size-3.5" /></button>
                            </div>
                            <span className="text-[10px] text-slate-400">{estoque} disp.</span>
                          </>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            ) : (
              <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200">
                <p className="text-sm font-semibold text-slate-500 text-center">Sem tamanhos cadastrados para esta cor.</p>
              </div>
            )}

            {selectedEstampa && (
              <div className="flex items-center gap-3 p-3 bg-pink-50 rounded-2xl border border-pink-100">
                {stampImageUrl && <img src={stampImageUrl} alt={selectedEstampa.nome} className="size-12 object-contain rounded-xl bg-white border border-pink-100 p-1" />}
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-bold text-pink-400 uppercase tracking-wider">Estampa selecionada</p>
                  <p className="text-sm font-bold text-slate-700 truncate">{selectedEstampa.nome}</p>
                </div>
                <button onClick={() => setSelectedEstampa(null)} className="text-slate-400 hover:text-red-500 transition-colors p-1">✕</button>
              </div>
            )}

            {/* Total + ações */}
            <div className="mt-auto pt-4 border-t border-pink-100 flex flex-col gap-3">
              {totalQtd > 0 && (
                <div className="flex items-center justify-between text-sm">
                  <span className="text-slate-500 font-medium">{totalQtd} {totalQtd === 1 ? "unidade" : "unidades"}</span>
                  <span className="font-black text-slate-800 text-lg">{totalPreco.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}</span>
                </div>
              )}
              {orderError && <p className="text-sm text-red-600 font-medium bg-red-50 px-4 py-2.5 rounded-xl border border-red-100">{orderError}</p>}
              <button onClick={handleAddToCart} disabled={totalQtd === 0} className="w-full flex items-center justify-center gap-2.5 py-4 rounded-2xl font-bold text-base transition-all bg-pink-500 hover:bg-pink-600 text-white shadow-lg shadow-pink-200 hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed disabled:translate-y-0">
                <ShoppingBag className="size-5" /> Adicionar ao Pedido
              </button>
              {cartItems.length > 0 && (
                <button onClick={() => setStep("summary")} className="w-full flex items-center justify-center gap-2 py-3 rounded-2xl font-bold text-sm text-emerald-600 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 transition-all">
                  <Send className="size-4" /> Ver pedido ({cartItems.length} {cartItems.length === 1 ? "item" : "itens"}) →
                </button>
              )}
            </div>
          </div>
        </section>

        <section className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden">
          <button onClick={() => setShowEstampas(!showEstampas)} className="w-full flex items-center justify-between p-6 hover:bg-slate-50 transition-colors">
            <div className="text-left">
              <h2 className="text-xl font-black text-slate-800">Escolha uma Estampa</h2>
              <p className="text-slate-400 font-medium text-sm mt-0.5">Selecione e arraste para posicionar na camisa</p>
            </div>
            <div className="flex items-center gap-2">
              {selectedEstampa && <span className="text-xs font-bold text-pink-500 bg-pink-50 px-2 py-1 rounded-full border border-pink-100">{selectedEstampa.nome}</span>}
              {showEstampas ? <ChevronUp className="size-5 text-slate-400" /> : <ChevronDown className="size-5 text-slate-400" />}
            </div>
          </button>

          {showEstampas && (
            <div className="p-6 pt-0 flex flex-col gap-5">
              {estilos.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {estilos.map((estilo) => {
                    const active = selectedEstilos.includes(estilo.id);
                    return (
                      <button key={estilo.id}
                        onClick={() => setSelectedEstilos((prev) => active ? prev.filter((i) => i !== estilo.id) : [...prev, estilo.id])}
                        className={`px-4 py-2 rounded-full text-sm font-bold border transition-all ${active ? "bg-pink-500 text-white border-pink-500 shadow-sm" : "bg-white text-slate-500 border-slate-200 hover:border-pink-300 hover:text-pink-500"}`}
                      >{estilo.nome}</button>
                    );
                  })}
                </div>
              )}

              <input type="text" placeholder="Procurar estampa..." value={searchEstampa}
                onChange={(e) => { setSearchEstampa(e.target.value); setEstampaPage(0); }}
                className="w-full max-w-sm pl-4 pr-4 py-3 bg-slate-50 border-2 border-pink-100 rounded-full outline-none focus:border-pink-400 focus:ring-4 focus:ring-pink-50 text-slate-700 font-medium text-sm placeholder:text-slate-300 transition-all"
              />

              {loadingEstampas ? (
                <div className="flex items-center justify-center py-12 gap-3 text-pink-400">
                  <Loader2 className="size-8 animate-spin" />
                  <span className="font-medium animate-pulse">A carregar estampas...</span>
                </div>
              ) : estampas.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-12 text-center border-2 border-dashed border-pink-200 rounded-2xl">
                  <p className="text-slate-400 font-semibold">Nenhuma estampa encontrada.</p>
                </div>
              ) : (
                <>
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                    {estampasPaginadas.map((estampa) => {
                      const imgUrl = estampa.imagens?.[0]?.id_externo_storage
                        ? `${API_BASE_URL}/uploads/${estampa.imagens[0].id_externo_storage}`
                        : null;
                      const isSelected = selectedEstampa?.id === estampa.id;
                      return (
                        <button key={estampa.id}
                          onClick={() => { setSelectedEstampa(isSelected ? null : estampa); if (!showEstampas) setShowEstampas(true); }}
                          className={`group relative flex flex-col rounded-2xl border-2 overflow-hidden transition-all duration-200 text-left ${isSelected ? "border-pink-500 shadow-lg shadow-pink-200 scale-[1.02]" : "border-slate-200 bg-white hover:border-pink-300 hover:shadow-md hover:-translate-y-0.5"}`}
                        >
                          <div className={`aspect-square flex items-center justify-center p-3 ${isSelected ? "bg-pink-50" : "bg-slate-50"}`}>
                            {imgUrl ? <img src={imgUrl} alt={estampa.nome} className="w-full h-full object-contain group-hover:scale-105 transition-transform duration-300" /> : <Shirt className="size-10 text-slate-300" />}
                          </div>
                          {isSelected && <div className="absolute top-2 right-2 bg-pink-500 text-white rounded-full size-6 flex items-center justify-center shadow-sm"><Check className="size-3.5" /></div>}
                          <div className="p-3 bg-white">
                            <p className={`text-sm font-bold line-clamp-1 ${isSelected ? "text-pink-600" : "text-slate-700"}`}>{estampa.nome}</p>
                            <p className="text-xs text-slate-400 mt-0.5 line-clamp-1">{estampa.estilos?.map((e) => e.estilo?.nome).join(" · ") || "—"}</p>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                  {totalPages > 1 && (
                    <div className="flex items-center justify-center gap-3 pt-2">
                      <button onClick={() => setEstampaPage((p) => Math.max(0, p - 1))} disabled={estampaPage === 0} className="size-10 rounded-full bg-white border-2 border-slate-200 flex items-center justify-center text-slate-500 hover:border-pink-300 hover:text-pink-500 disabled:opacity-40 disabled:cursor-not-allowed transition-all"><ChevronLeft className="size-5" /></button>
                      <span className="text-sm font-semibold text-slate-500">{estampaPage + 1} / {totalPages}</span>
                      <button onClick={() => setEstampaPage((p) => Math.min(totalPages - 1, p + 1))} disabled={estampaPage >= totalPages - 1} className="size-10 rounded-full bg-white border-2 border-slate-200 flex items-center justify-center text-slate-500 hover:border-pink-300 hover:text-pink-500 disabled:opacity-40 disabled:cursor-not-allowed transition-all"><ChevronRight className="size-5" /></button>
                    </div>
                  )}
                </>
              )}
            </div>
          )}
        </section>
      </div>
    </div>
  );
};