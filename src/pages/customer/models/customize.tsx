import { useState, useEffect, useMemo } from "react";
import { useParams, Link, useNavigate } from "react-router";
import {
  ArrowLeft, ShoppingBag, Loader2, AlertCircle, Check,
  ChevronLeft, ChevronRight, Minus, Plus, Shirt
} from "lucide-react";
import { API_BASE_URL } from "@/lib/api/api";
import {
  getCustomizableById,
  listTamanhos,
  type ProdutoPersonalizavel,
  type Tamanho,
  type Cor,
} from "@/lib/api/personalizaveis";
import { listEstampas, listEstilos, type Estampa, type Estilo } from "@/lib/api/estampas";
import { addCustomProductToCart } from "@/lib/api/cart";
import { useAuth } from "@/lib/auth-context";

type FaceView = "APRESENTACAO" | "FRENTE" | "COSTAS";

const FACE_LABELS: Record<FaceView, string> = {
  APRESENTACAO: "Apresentação",
  FRENTE: "Frente",
  COSTAS: "Costas",
};

export const CustomerCustomizePage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { token } = useAuth();
  const [produto, setProduto] = useState<ProdutoPersonalizavel | null>(null);
  const [loadingProduto, setLoadingProduto] = useState(true);
  const [errorProduto, setErrorProduto] = useState<string | null>(null);
  const [selectedColor, setSelectedColor] = useState<Cor | null>(null);
  const [selectedFace, setSelectedFace] = useState<FaceView>("APRESENTACAO");
  const [selectedEstampa, setSelectedEstampa] = useState<Estampa | null>(null);
  const [quantities, setQuantities] = useState<Record<string, number>>({});
  const [estampas, setEstampas] = useState<Estampa[]>([]);
  const [estilos, setEstilos] = useState<Estilo[]>([]);
  const [selectedEstilos, setSelectedEstilos] = useState<number[]>([]);
  const [searchEstampa, setSearchEstampa] = useState("");
  const [loadingEstampas, setLoadingEstampas] = useState(true);
  const [estampaPage, setEstampaPage] = useState(0);
  const [tamanhos, setTamanhos] = useState<Tamanho[]>([]);
  const [addingToCart, setAddingToCart] = useState(false);
  const [cartSuccess, setCartSuccess] = useState(false);
  const [cartError, setCartError] = useState<string | null>(null);

  const ESTAMPAS_PER_PAGE = 8;

  useEffect(() => {
    if (!id) return;
    setLoadingProduto(true);
    getCustomizableById(Number(id))
      .then((data: ProdutoPersonalizavel) => {
        setProduto(data);
        // seleciona a primeira cor com variação disponível
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
      .then(setEstampas)
      .catch(() => setEstampas([]))
      .finally(() => setLoadingEstampas(false));
  }, [searchEstampa, selectedEstilos]);

  useEffect(() => {
    listEstilos().then(setEstilos).catch(() => {});
    listTamanhos().then(setTamanhos).catch(() => {});
  }, []);

  function getCoresUnicas(p: ProdutoPersonalizavel): Cor[] {
    const map = new Map<number, Cor>();
    p.variacoes?.forEach((v) => {
      if (v.cor && !map.has(v.cor.id)) map.set(v.cor.id, v.cor);
    });
    p.imagens?.forEach((img) => {
      if (img.cor && !map.has(img.cor.id)) map.set(img.cor.id, img.cor);
    });
    return Array.from(map.values());
  }

  const currentImageUrl = useMemo(() => {
    if (!produto || !selectedColor) return null;
    const imagem =
      produto.imagens.find(
        (img) =>
          img.id_cor === selectedColor.id &&
          img.tipo_visualizacao === selectedFace
      ) ??
      produto.imagens.find(
        (img) => img.tipo_visualizacao === selectedFace
      ) ??
      produto.imagens.find(
        (img) => img.id_cor === selectedColor.id
      ) ??
      produto.imagens[0];
    return imagem ? `${API_BASE_URL}/uploads/${imagem.id_externo_storage}` : null;
  }, [produto, selectedColor, selectedFace]);

  const facesDisponiveis = useMemo<FaceView[]>(() => {
    if (!produto || !selectedColor) return [];
    const faces = produto.imagens
      .filter((img) => img.id_cor === selectedColor.id)
      .map((img) => img.tipo_visualizacao);
    const unique = Array.from(new Set(faces)) as FaceView[];
    // garante ordem: APRESENTACAO > FRENTE > COSTAS
    return (["APRESENTACAO", "FRENTE", "COSTAS"] as FaceView[]).filter((f) =>
      unique.includes(f)
    );
  }, [produto, selectedColor]);

  useEffect(() => {
    if (facesDisponiveis.length > 0 && !facesDisponiveis.includes(selectedFace)) {
      setSelectedFace(facesDisponiveis[0]);
    }
  }, [facesDisponiveis, selectedFace]);

  const tamanhosDisponiveis = useMemo(() => {
    if (!produto || !selectedColor) return [];
    return produto.variacoes
      .filter((v) => v.id_cor === selectedColor.id && v.tamanho)
      .map((v) => v.tamanho!);
  }, [produto, selectedColor]);

  useEffect(() => {
    const init: Record<string, number> = {};
    tamanhosDisponiveis.forEach((t) => { init[t.sigla] = 0; });
    setQuantities(init);
  }, [tamanhosDisponiveis]);

  const estampasPaginadas = useMemo(() => {
    const start = estampaPage * ESTAMPAS_PER_PAGE;
    return estampas.slice(start, start + ESTAMPAS_PER_PAGE);
  }, [estampas, estampaPage]);

  const totalPages = Math.ceil(estampas.length / ESTAMPAS_PER_PAGE);
  const totalQtd = Object.values(quantities).reduce((a, b) => a + b, 0);
  const totalPreco = produto ? Number(produto.preco) * totalQtd : 0;

  const handleAddToCart = async () => {
    if (!produto || !selectedColor) return;

    if (totalQtd === 0) {
      setCartError("Selecione ao menos uma unidade antes de adicionar ao carrinho.");
      return;
    }

    if (!token) {
      setCartError("Precisas estar autenticado para adicionar ao carrinho.");
      return;
    }

    setAddingToCart(true);
    setCartError(null);

    try {
      const estampaImageUrl = selectedEstampa?.imagens?.[0]?.id_externo_storage
        ? `${API_BASE_URL}/uploads/${selectedEstampa.imagens[0].id_externo_storage}`
        : undefined;

      await addCustomProductToCart(token, {
        productId: produto.id,
        productName: produto.nome,
        color: selectedColor.nome,
        colorHex: selectedColor.hex_code,
        colorId: selectedColor.id,
        printSide: selectedFace,
        printPosition: "CENTRO",
        printSize: "MEDIO",
        artwork: selectedEstampa
          ? { id: selectedEstampa.id, nome: selectedEstampa.nome }
          : null,
        customGraphicUrl: estampaImageUrl,
        baseImageUrl: currentImageUrl ?? undefined,
        quantities,
        unitPrice: Number(produto.preco),
        totalPrice: totalPreco,
      });

      setCartSuccess(true);
      setTimeout(() => setCartSuccess(false), 3000);
    } catch (err: any) {
      setCartError(err.message || "Erro ao adicionar ao carrinho.");
    } finally {
      setAddingToCart(false);
    }
  };

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
        <div className="bg-red-50 p-6 rounded-full text-red-400">
          <AlertCircle className="size-12" />
        </div>
        <h2 className="text-2xl font-bold text-slate-700">Produto não encontrado</h2>
        <p className="text-slate-500">{errorProduto}</p>
        <Link
          to="/customer/models"
          className="mt-2 flex items-center gap-2 text-pink-500 font-semibold hover:text-pink-600 transition-colors"
        >
          <ArrowLeft className="size-4" /> Voltar aos modelos
        </Link>
      </div>
    );
  }

  const coresUnicas = getCoresUnicas(produto);

  return (
    <div className="min-h-screen bg-[#fdf2f8]/40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 pt-6">
        <Link
          to="/customer/models"
          className="inline-flex items-center gap-2 text-sm font-semibold text-slate-400 hover:text-pink-500 transition-colors"
        >
          <ArrowLeft className="size-4" />
          Voltar aos modelos
        </Link>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 flex flex-col gap-10">
        <section className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12">

          <div className="flex flex-col gap-4">
            <div className="relative bg-white rounded-3xl border border-pink-100 shadow-sm overflow-hidden aspect-square flex items-center justify-center p-8">
              {currentImageUrl ? (
                <img
                  key={currentImageUrl}
                  src={currentImageUrl}
                  alt={`${produto.nome} — ${selectedFace}`}
                  className="w-full h-full object-contain drop-shadow-md"
                />
              ) : (
                <Shirt className="size-32 text-slate-200" />
              )}

              {selectedEstampa && (
                <div className="absolute bottom-4 left-4 bg-white/90 backdrop-blur-sm rounded-2xl px-3 py-2 flex items-center gap-2 border border-pink-100 shadow-sm">
                  {selectedEstampa.imagens?.[0] && (
                    <img
                      src={`${API_BASE_URL}/uploads/${selectedEstampa.imagens[0].id_externo_storage}`}
                      alt={selectedEstampa.nome}
                      className="size-8 object-contain rounded-lg"
                    />
                  )}
                  <span className="text-xs font-bold text-pink-600 max-w-[120px] truncate">
                    {selectedEstampa.nome}
                  </span>
                </div>
              )}
            </div>

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
                  >
                    {FACE_LABELS[face]}
                  </button>
                ))}
              </div>
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
                    <button
                      key={cor.id}
                      onClick={() => setSelectedColor(cor)}
                      title={cor.nome}
                      className={`relative size-9 rounded-full transition-all border-2 ${
                        selectedColor?.id === cor.id
                          ? "border-pink-500 scale-110 shadow-lg"
                          : "border-transparent hover:border-pink-300 hover:scale-105"
                      }`}
                      style={{ backgroundColor: cor.hex_code }}
                    >
                      {selectedColor?.id === cor.id && (
                        <span className="absolute inset-0 flex items-center justify-center">
                          <Check
                            className="size-4 drop-shadow"
                            style={{ color: isLight(cor.hex_code) ? "#1e293b" : "#ffffff" }}
                          />
                        </span>
                      )}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {tamanhosDisponiveis.length > 0 ? (
              <div>
                <p className="text-sm font-bold text-slate-600 mb-3 uppercase tracking-wider">
                  Quantidade por tamanho
                </p>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  {tamanhosDisponiveis.map((tamanho) => {
                    const qty = quantities[tamanho.sigla] ?? 0;
                    return (
                      <div
                        key={tamanho.id}
                        className={`flex flex-col items-center gap-2 p-3 rounded-2xl border-2 transition-all ${
                          qty > 0
                            ? "border-pink-400 bg-pink-50"
                            : "border-slate-200 bg-white"
                        }`}
                      >
                        <span className={`text-sm font-black ${qty > 0 ? "text-pink-600" : "text-slate-500"}`}>
                          {tamanho.sigla}
                        </span>
                        <div className="flex items-center gap-1">
                          <button
                            onClick={() =>
                              setQuantities((prev) => ({
                                ...prev,
                                [tamanho.sigla]: Math.max(0, (prev[tamanho.sigla] ?? 0) - 1),
                              }))
                            }
                            className="size-7 rounded-lg bg-slate-100 hover:bg-pink-100 hover:text-pink-600 flex items-center justify-center transition-colors"
                          >
                            <Minus className="size-3.5" />
                          </button>
                          <span className="w-8 text-center text-sm font-bold text-slate-700 tabular-nums">
                            {qty}
                          </span>
                          <button
                            onClick={() =>
                              setQuantities((prev) => ({
                                ...prev,
                                [tamanho.sigla]: (prev[tamanho.sigla] ?? 0) + 1,
                              }))
                            }
                            className="size-7 rounded-lg bg-slate-100 hover:bg-pink-100 hover:text-pink-600 flex items-center justify-center transition-colors"
                          >
                            <Plus className="size-3.5" />
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            ) : (
              <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200">
                <p className="text-sm font-semibold text-slate-500 text-center">
                  Sem tamanhos cadastrados para esta cor.
                </p>
              </div>
            )}

            <div className="mt-auto pt-4 border-t border-pink-100 flex flex-col gap-3">
              {totalQtd > 0 && (
                <div className="flex items-center justify-between text-sm">
                  <span className="text-slate-500 font-medium">
                    {totalQtd} {totalQtd === 1 ? "unidade" : "unidades"}
                  </span>
                  <span className="font-black text-slate-800 text-lg">
                    {totalPreco.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}
                  </span>
                </div>
              )}

              {cartError && (
                <p className="text-sm text-red-600 font-medium bg-red-50 px-4 py-2.5 rounded-xl border border-red-100">
                  {cartError}
                </p>
              )}

              <button
                onClick={handleAddToCart}
                disabled={addingToCart || cartSuccess}
                className={`w-full flex items-center justify-center gap-2.5 py-4 rounded-2xl font-bold text-base transition-all ${
                  cartSuccess
                    ? "bg-emerald-500 text-white shadow-lg shadow-emerald-200"
                    : "bg-pink-500 hover:bg-pink-600 text-white shadow-lg shadow-pink-200 hover:shadow-pink-300 hover:-translate-y-0.5 disabled:opacity-60 disabled:cursor-not-allowed disabled:translate-y-0"
                }`}
              >
                {addingToCart ? (
                  <Loader2 className="size-5 animate-spin" />
                ) : cartSuccess ? (
                  <Check className="size-5" />
                ) : (
                  <ShoppingBag className="size-5" />
                )}
                {addingToCart
                  ? "A adicionar..."
                  : cartSuccess
                  ? "Adicionado com sucesso!"
                  : "Adicionar ao carrinho"}
              </button>
            </div>
          </div>
        </section>

        <section className="flex flex-col gap-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h2 className="text-2xl font-black text-slate-800">Escolha uma Estampa</h2>
              <p className="text-slate-400 font-medium mt-0.5">Opcional — pode adicionar sem estampa</p>
            </div>

            {selectedEstampa && (
              <button
                onClick={() => setSelectedEstampa(null)}
                className="text-sm font-semibold text-slate-400 hover:text-red-500 transition-colors flex items-center gap-1.5"
              >
                <span className="size-4 rounded-full bg-slate-200 flex items-center justify-center text-xs leading-none">✕</span>
                Remover estampa
              </button>
            )}
          </div>

          {estilos.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {estilos.map((estilo) => {
                const active = selectedEstilos.includes(estilo.id);
                return (
                  <button
                    key={estilo.id}
                    onClick={() =>
                      setSelectedEstilos((prev) =>
                        active ? prev.filter((id) => id !== estilo.id) : [...prev, estilo.id]
                      )
                    }
                    className={`px-4 py-2 rounded-full text-sm font-bold border transition-all ${
                      active
                        ? "bg-pink-500 text-white border-pink-500 shadow-sm"
                        : "bg-white text-slate-500 border-slate-200 hover:border-pink-300 hover:text-pink-500"
                    }`}
                  >
                    {estilo.nome}
                  </button>
                );
              })}
            </div>
          )}

          <div className="relative max-w-sm">
            <input
              type="text"
              placeholder="Procurar estampa..."
              value={searchEstampa}
              onChange={(e) => { setSearchEstampa(e.target.value); setEstampaPage(0); }}
              className="w-full pl-4 pr-4 py-3 bg-white border-2 border-pink-100 rounded-full outline-none focus:border-pink-400 focus:ring-4 focus:ring-pink-50 text-slate-700 font-medium text-sm placeholder:text-slate-300 transition-all"
            />
          </div>

          {loadingEstampas ? (
            <div className="flex items-center justify-center py-16 gap-3 text-pink-400">
              <Loader2 className="size-8 animate-spin" />
              <span className="font-medium animate-pulse">A carregar estampas...</span>
            </div>
          ) : estampas.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-center bg-white rounded-3xl border-2 border-dashed border-pink-200">
              <p className="text-slate-400 font-semibold">Nenhuma estampa encontrada.</p>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-4 xl:grid-cols-4 gap-4">
                {estampasPaginadas.map((estampa) => {
                  const imgUrl = estampa.imagens?.[0]?.id_externo_storage
                    ? `${API_BASE_URL}/uploads/${estampa.imagens[0].id_externo_storage}`
                    : null;
                  const isSelected = selectedEstampa?.id === estampa.id;

                  return (
                    <button
                      key={estampa.id}
                      onClick={() => setSelectedEstampa(isSelected ? null : estampa)}
                      className={`group relative flex flex-col rounded-2xl border-2 overflow-hidden transition-all duration-200 text-left ${
                        isSelected
                          ? "border-pink-500 shadow-lg shadow-pink-200 scale-[1.02]"
                          : "border-slate-200 bg-white hover:border-pink-300 hover:shadow-md hover:-translate-y-0.5"
                      }`}
                    >
                      <div className={`aspect-square flex items-center justify-center p-3 ${isSelected ? "bg-pink-50" : "bg-slate-50"}`}>
                        {imgUrl ? (
                          <img
                            src={imgUrl}
                            alt={estampa.nome}
                            className="w-full h-full object-contain group-hover:scale-105 transition-transform duration-300"
                          />
                        ) : (
                          <Shirt className="size-10 text-slate-300" />
                        )}
                      </div>

                      {isSelected && (
                        <div className="absolute top-2 right-2 bg-pink-500 text-white rounded-full size-6 flex items-center justify-center shadow-sm">
                          <Check className="size-3.5" />
                        </div>
                      )}

                      <div className="p-3 bg-white">
                        <p className={`text-sm font-bold line-clamp-1 ${isSelected ? "text-pink-600" : "text-slate-700"}`}>
                          {estampa.nome}
                        </p>
                        <p className="text-xs text-slate-400 mt-0.5 line-clamp-1">
                          {estampa.estilos?.map((e) => e.estilo?.nome).join(" · ") || "—"}
                        </p>
                      </div>
                    </button>
                  );
                })}
              </div>

              {totalPages > 1 && (
                <div className="flex items-center justify-center gap-3 pt-2">
                  <button
                    onClick={() => setEstampaPage((p) => Math.max(0, p - 1))}
                    disabled={estampaPage === 0}
                    className="size-10 rounded-full bg-white border-2 border-slate-200 flex items-center justify-center text-slate-500 hover:border-pink-300 hover:text-pink-500 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
                  >
                    <ChevronLeft className="size-5" />
                  </button>
                  <span className="text-sm font-semibold text-slate-500">
                    {estampaPage + 1} / {totalPages}
                  </span>
                  <button
                    onClick={() => setEstampaPage((p) => Math.min(totalPages - 1, p + 1))}
                    disabled={estampaPage >= totalPages - 1}
                    className="size-10 rounded-full bg-white border-2 border-slate-200 flex items-center justify-center text-slate-500 hover:border-pink-300 hover:text-pink-500 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
                  >
                    <ChevronRight className="size-5" />
                  </button>
                </div>
              )}
            </>
          )}
        </section>
      </div>
    </div>
  );
};

function isLight(hex: string): boolean {
  const c = hex.replace("#", "");
  const r = parseInt(c.substring(0, 2), 16);
  const g = parseInt(c.substring(2, 4), 16);
  const b = parseInt(c.substring(4, 6), 16);
  return (r * 299 + g * 587 + b * 114) / 1000 > 128;
}
