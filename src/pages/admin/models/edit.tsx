import { useState, useEffect, useCallback } from "react";
import { useForm } from "react-hook-form";
import { useNavigate, useParams, Link } from "react-router";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { ColorCard, type ColorCardData } from "@/components/ui/color-card";
import { ArrowLeft, Loader2, Save, Plus, AlertCircle } from "lucide-react";
import {
  getCustomizableById,
  updatePersonalizavel,
  createCor,
  listCores,
  listTamanhos,
  type ProdutoPersonalizavel,
  type CreatePersonalizavelImagemPayload,
  type CreatePersonalizavelVariacaoPayload,
} from "@/lib/api/personalizaveis";
import { API_BASE_URL } from "@/lib/api/api";

interface ProductFormData {
  nome: string;
  preco: number;
}

const DEFAULT_SIZES = [
  { sigla: "PP", estoque: 0 },
  { sigla: "P", estoque: 0 },
  { sigla: "M", estoque: 0 },
  { sigla: "G", estoque: 0 },
  { sigla: "GG", estoque: 0 },
  { sigla: "XGG", estoque: 0 },
];

function extractFilename(url: string): string {
  // "http://localhost:3000/uploads/1234567890.png" → "1234567890.png"
  return url.split("/uploads/").pop() ?? url;
}

export const EditModelPage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [formError, setFormError] = useState<string | null>(null);
  const [colors, setColors] = useState<ColorCardData[]>([]);
  const { register, handleSubmit, reset, formState: { isSubmitting } } = useForm<ProductFormData>();

  const processProduct = useCallback((data: ProdutoPersonalizavel) => {
    const colorMap = new Map<number, ColorCardData>();

    data.imagens?.forEach((img) => {
      if (!colorMap.has(img.id_cor)) {
        colorMap.set(img.id_cor, {
          colorName: img.cor?.nome || "Sem nome",
          colorHex: img.cor?.hex_code || "#D9D9D9",
          presentationImage: null,
          frontImage: null,
          backImage: null,
          sizes: DEFAULT_SIZES.map((s) => ({ ...s })),
        });
      }
      const card = colorMap.get(img.id_cor)!;
      const imageUrl = `${API_BASE_URL}/uploads/${img.id_externo_storage}`;
      if (img.tipo_visualizacao === "APRESENTACAO") card.presentationImage = imageUrl;
      if (img.tipo_visualizacao === "FRENTE") card.frontImage = imageUrl;
      if (img.tipo_visualizacao === "COSTAS") card.backImage = imageUrl;
    });

    data.variacoes?.forEach((v) => {
      if (!colorMap.has(v.id_cor)) {
        colorMap.set(v.id_cor, {
          colorName: v.cor?.nome || "Sem nome",
          colorHex: v.cor?.hex_code || "#D9D9D9",
          presentationImage: null,
          frontImage: null,
          backImage: null,
          sizes: DEFAULT_SIZES.map((s) => ({ ...s })),
        });
      }
      if (v.tamanho) {
        const card = colorMap.get(v.id_cor)!;
        const sizeIndex = card.sizes.findIndex(
          (s) => s.sigla.toUpperCase() === v.tamanho!.sigla.toUpperCase()
        );
        if (sizeIndex >= 0) {
          card.sizes[sizeIndex].estoque = v.estoque;
        } else {
          card.sizes.push({ sigla: v.tamanho.sigla, estoque: v.estoque });
        }
      }
    });

    return Array.from(colorMap.values());
  }, []);

  useEffect(() => {
    const loadData = async () => {
      if (!id) return;
      try {
        setLoading(true);
        setError(null);
        const data = await getCustomizableById(Number(id));
        reset({ nome: data.nome, preco: data.preco });
        setColors(processProduct(data));
      } catch (err) {
        console.error("Erro ao carregar produto:", err);
        setError("Não foi possível carregar os dados deste produto.");
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, [id, reset, processProduct]);

  const onSubmit = async (data: ProductFormData) => {
    setFormError(null);

    const coresIncompletas = colors.some(
      (c) => !c.colorName || c.colorName.trim() === "" || !c.presentationImage
    );
    if (colors.length > 0 && coresIncompletas) {
      setFormError("Existem cores incompletas! Cada cor precisa ter nome e imagem de apresentação.");
      return;
    }

    try {
      const [coresCadastradas, tamanhosCadastrados] = await Promise.all([
        listCores(),
        listTamanhos(),
      ]);

      const arquivosFinais: File[] = [];
      const imagensPayload: CreatePersonalizavelImagemPayload[] = [];
      const variacoesPayload: CreatePersonalizavelVariacaoPayload[] = [];

      const processarImagem = (
        img: File | string | null,
        tipo: "APRESENTACAO" | "FRENTE" | "COSTAS",
        idCor: number
      ) => {
        if (!img) return;

        if (img instanceof File) {
          // Nova imagem enviada pelo usuário
          arquivosFinais.push(img);
          imagensPayload.push({ idCor, idExternoStorage: img.name, tipoVisualizacao: tipo });
        } else if (typeof img === "string") {
          // Imagem já existente — mantém o filename original
          const filename = extractFilename(img);
          imagensPayload.push({ idCor, idExternoStorage: filename, tipoVisualizacao: tipo });
        }
      };

      for (const colorData of colors) {
        let cor = coresCadastradas.find(
          (c) =>
            c.hex_code.toLowerCase() === colorData.colorHex.toLowerCase() ||
            c.nome.toLowerCase() === colorData.colorName.toLowerCase()
        );

        if (!cor) {
          cor = await createCor(colorData.colorName, colorData.colorHex);
          coresCadastradas.push(cor);
        }

        const idCor = cor.id;
        const sizes = colorData.sizes && colorData.sizes.length > 0
          ? colorData.sizes
          : DEFAULT_SIZES;

        for (const size of sizes) {
          if (size.estoque > 0) {
            const tamanho = tamanhosCadastrados.find(
              (t) => t.sigla.toUpperCase() === size.sigla.toUpperCase()
            );
            variacoesPayload.push({ idCor, idTamanho: tamanho?.id, estoque: size.estoque });
          }
        }

        if (!sizes.some((s) => s.estoque > 0)) {
          variacoesPayload.push({ idCor, estoque: 0 });
        }

        processarImagem(colorData.presentationImage, "APRESENTACAO", idCor);
        processarImagem(colorData.frontImage, "FRENTE", idCor);
        processarImagem(colorData.backImage, "COSTAS", idCor);
      }

      await updatePersonalizavel(
        Number(id),
        {
          nome: data.nome,
          preco: data.preco,
          imagens: imagensPayload,
          variacoes: variacoesPayload,
        },
        arquivosFinais
      );

      alert("Produto atualizado com sucesso!");
      navigate("/admin/models");
    } catch (err: any) {
      console.error("Erro ao salvar produto:", err);
      setFormError(`Erro ao salvar: ${err.message || "Tente novamente."}`);
    }
  };

  const addColor = () => {
    setColors((prev) => [
      ...prev,
      {
        colorName: "",
        colorHex: "#D9D9D9",
        presentationImage: null,
        frontImage: null,
        backImage: null,
        sizes: DEFAULT_SIZES.map((s) => ({ ...s })),
      },
    ]);
  };

  if (loading) {
    return (
      <div className="min-h-[50vh] flex justify-center items-center">
        <Loader2 className="animate-spin size-10 text-pink-400" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-20 text-center flex flex-col items-center gap-4">
        <p className="text-red-500 font-medium">{error}</p>
        <Button variant="outline" onClick={() => window.location.reload()}>
          Tentar novamente
        </Button>
      </div>
    );
  }

  return (
    <div className="p-4 md:p-8 max-w-5xl mx-auto">
      <div className="flex items-center gap-4 mb-8">
        <Button variant="outline" size="icon" className="rounded-full shrink-0" asChild>
          <Link to="/admin/models">
            <ArrowLeft className="size-5 text-slate-600" />
          </Link>
        </Button>
        <div>
          <h1 className="text-3xl font-black text-slate-800 tracking-tight">Editar Produto</h1>
          <p className="text-slate-500 text-sm mt-0.5">Atualize os dados, cores, tamanhos e estoque.</p>
        </div>
      </div>

      {formError && (
        <div className="mb-6 p-4 bg-red-50 text-red-700 rounded-2xl border border-red-100 flex items-center gap-3">
          <AlertCircle className="size-5 shrink-0" />
          <p className="text-sm font-medium">{formError}</p>
        </div>
      )}

      <form
        onSubmit={handleSubmit(onSubmit)}
        className="flex flex-col gap-8 bg-white p-6 md:p-10 rounded-3xl shadow-sm border border-slate-100"
      >
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <Label htmlFor="nome" className="text-slate-700 font-semibold">Nome do Produto</Label>
            <Input id="nome" placeholder="Ex: Camiseta Básica" className="h-11" {...register("nome", { required: true })} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="preco" className="text-slate-700 font-semibold">Preço (R$)</Label>
            <Input id="preco" type="number" step="0.01" placeholder="0.00" className="h-11" {...register("preco", { required: true, valueAsNumber: true })} />
          </div>
        </div>

        <div className="space-y-4 pt-4 border-t border-slate-100">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
            <div>
              <Label className="text-lg font-bold text-slate-800">Cores, Tamanhos e Estoque</Label>
              <p className="text-sm text-slate-500 mt-1">Gerencie as variações de cor com imagens e estoque por tamanho.</p>
            </div>
            <Button type="button" onClick={addColor} variant="secondary" className="gap-2 shrink-0">
              <Plus className="size-4" /> Adicionar Cor
            </Button>
          </div>

          {colors.length > 0 ? (
            <div className="flex flex-wrap gap-6 pt-2">
              {colors.map((c, i) => (
                <div key={i} className="animate-in fade-in zoom-in-95 duration-200">
                  <ColorCard
                    data={c}
                    initialSaved={!!c.presentationImage}
                    onChange={(newData) => {
                      const updated = [...colors];
                      updated[i] = newData;
                      setColors(updated);
                    }}
                    onDelete={() => setColors(colors.filter((_, idx) => idx !== i))}
                    onSave={() => {}}
                  />
                </div>
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-12 px-4 border-2 border-dashed border-slate-200 rounded-2xl bg-slate-50 text-center">
              <p className="text-sm font-semibold text-slate-700 mb-3">Nenhuma cor cadastrada</p>
              <Button type="button" onClick={addColor} variant="outline" size="sm">
                Adicionar Primeira Cor
              </Button>
            </div>
          )}
        </div>

        <div className="flex justify-end pt-6 border-t border-slate-100">
          <Button type="submit" size="lg" disabled={isSubmitting} className="gap-2 h-12 px-8 rounded-xl">
            {isSubmitting ? <Loader2 className="size-4 animate-spin" /> : <Save className="size-4" />}
            {isSubmitting ? "A Guardar..." : "Salvar Alterações"}
          </Button>
        </div>
      </form>
    </div>
  );
};