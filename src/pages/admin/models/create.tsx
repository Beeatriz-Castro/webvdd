import { useState } from "react";
import { useForm } from "react-hook-form";
import { useNavigate, Link } from "react-router";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ColorCard, type ColorCardData } from "@/components/ui/color-card";
import { ArrowLeft, Loader2, Plus, Save, AlertCircle } from "lucide-react";
import { 
  createPersonalizavel, 
  createCor, 
  listCores,
  type CreatePersonalizavelImagemPayload,
  type CreatePersonalizavelVariacaoPayload 
} from "@/lib/api/personalizaveis";

interface ProductFormData {
  nome: string;
  preco: number;
}

export const CreateModelPage = () => {
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<ProductFormData>();
  const [colors, setColors] = useState<ColorCardData[]>([]);
  const [formError, setFormError] = useState<string | null>(null);
  const navigate = useNavigate();
  const onSubmit = async (data: ProductFormData) => {
    setFormError(null);

    if (colors.length === 0) {
      setFormError("Por favor, adicione pelo menos uma cor ao produto antes de finalizar.");
      return;
    }

    const coresNaoSalvas = colors.some(c => !c.colorName || c.colorName.trim() === "");
    if (coresNaoSalvas) {
      setFormError("Existem cores sem nome! Preencha o nome de todas as cores antes de continuar.");
      return;
    }

    try {
      const coresCadastradas = await listCores();
      const arquivosFinais: File[] = [];
      const imagensPayload: CreatePersonalizavelImagemPayload[] = [];
      const variacoesPayload: CreatePersonalizavelVariacaoPayload[] = [];
      const processarImagem = (
        img: File | string | null, 
        tipo: "APRESENTACAO" | "FRENTE" | "COSTAS", 
        idCor: number
      ) => {
        if (img && img instanceof File) {
          arquivosFinais.push(img);
          imagensPayload.push({
            idCor,
            idExternoStorage: img.name,
            tipoVisualizacao: tipo
          });
        }
      };

      for (const colorData of colors) {
        let cor = coresCadastradas.find(
          c => c.hex_code.toLowerCase() === colorData.colorHex.toLowerCase() ||
               c.nome.toLowerCase() === colorData.colorName.toLowerCase()
        );

        if (!cor) {
          cor = await createCor(colorData.colorName, colorData.colorHex);
          coresCadastradas.push(cor);
        }

        const idCor = cor.id;

        variacoesPayload.push({
          idCor: idCor,
          estoque: 10 
        });

        processarImagem(colorData.presentationImage, "APRESENTACAO", idCor);
        processarImagem(colorData.frontImage, "FRENTE", idCor);
        processarImagem(colorData.backImage, "COSTAS", idCor);
      }

      const payload = {
        nome: data.nome,
        preco: data.preco,
        categorias: [],
        imagens: imagensPayload,
        variacoes: variacoesPayload,
      };

      await createPersonalizavel(payload, arquivosFinais);

      alert("Produto registado com sucesso!");
      navigate("/admin");
      
    } catch (error: any) {
      console.error(error);
      setFormError(`Erro ao salvar produto: ${error.message || "Tente novamente mais tarde."}`);
    }
  };

  const addColor = () => {
    setFormError(null);
    setColors([
      ...colors, 
      { 
        colorName: "", 
        colorHex: "#D9D9D9", 
        presentationImage: null, 
        frontImage: null, 
        backImage: null 
      }
    ]);
  };

  return (
    <div className="p-4 md:p-8 max-w-5xl mx-auto min-h-screen">
      {/* Cabeçalho */}
      <div className="flex items-center gap-4 mb-8">
        <Button variant="outline" size="icon" className="rounded-full shrink-0" asChild>
          <Link to="/admin">
            <ArrowLeft className="size-5 text-slate-600" />
          </Link>
        </Button>
        <h1 className="text-3xl font-black text-slate-800 tracking-tight">Registar Nova Camisola</h1>
      </div>
      
      {formError && (
        <div className="mb-6 p-4 bg-red-50 text-red-700 rounded-2xl border border-red-100 flex items-center gap-3 animate-in fade-in slide-in-from-top-2">
          <AlertCircle className="size-5 shrink-0" />
          <p className="text-sm font-medium">{formError}</p>
        </div>
      )}

      <form 
        onSubmit={handleSubmit(onSubmit)} 
        className="flex flex-col gap-8 bg-white p-6 md:p-10 rounded-3xl shadow-sm border border-slate-100"
      >
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Input Nome */}
          <div className="space-y-2">
            <Label htmlFor="nome" className="text-slate-700 font-semibold">Nome do Produto</Label>
            <Input 
              id="nome"
              {...register("nome", { required: "O nome do produto é obrigatório." })} 
              placeholder="Ex: Camisola Oversized Algodão" 
              className="h-11 transition-shadow focus-visible:ring-primary/20"
            />
            {errors.nome && <span className="text-red-500 text-sm mt-1 block font-medium">{errors.nome.message}</span>}
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="preco" className="text-slate-700 font-semibold">Preço (R$)</Label>
            <Input 
              id="preco"
              type="number" 
              step="0.01"
              {...register("preco", { 
                required: "O preço é obrigatório.",
                valueAsNumber: true,
                min: { value: 0.1, message: "O preço deve ser superior a zero." }
              })} 
              placeholder="0.00" 
              className="h-11 transition-shadow focus-visible:ring-primary/20"
            />
            {errors.preco && <span className="text-red-500 text-sm mt-1 block font-medium">{errors.preco.message}</span>}
          </div>
        </div>

        <div className="space-y-4 pt-4 border-t border-slate-100">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
            <div>
              <Label className="text-lg font-bold text-slate-800">Cores e Imagens Disponíveis</Label>
              <p className="text-sm text-slate-500 mt-1">Adicione as variações de cor e as respetivas maquetes do produto.</p>
            </div>
            <Button type="button" onClick={addColor} variant="secondary" className="gap-2 shrink-0">
              <Plus className="size-4" /> Adicionar Cor
            </Button>
          </div>
          
          {colors.length > 0 ? (
            <div className="flex flex-wrap gap-6 pt-2">
              {colors.map((colorData, index) => (
                <div key={index} className="animate-in fade-in zoom-in-95 duration-200">
                  <ColorCard
                    data={colorData}
                    onChange={(newData) => {
                      const newColors = [...colors];
                      newColors[index] = newData;
                      setColors(newColors);
                    }}
                    onDelete={() => setColors(colors.filter((_, i) => i !== index))}
                    onSave={() => {}}
                  />
                </div>
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-12 px-4 border-2 border-dashed border-slate-200 rounded-2xl bg-slate-50 text-center">
              <div className="bg-white p-3 rounded-full shadow-sm border border-slate-100 mb-3">
                <Plus className="size-6 text-slate-400" />
              </div>
              <h3 className="text-sm font-semibold text-slate-700">Nenhuma cor adicionada</h3>
              <p className="text-sm text-slate-500 mt-1 mb-4 max-w-sm">
                Comece por adicionar a primeira variação de cor para este produto.
              </p>
              <Button type="button" onClick={addColor} variant="outline" size="sm">
                Adicionar Primeira Cor
              </Button>
            </div>
          )}
        </div>

        <div className="flex justify-end pt-6 mt-4 border-t border-slate-100">
          <Button 
            type="submit" 
            size="lg"
            className="w-full md:w-auto gap-2 h-12 px-8 text-base rounded-xl" 
            disabled={isSubmitting}
          >
            {isSubmitting ? <Loader2 className="size-5 animate-spin" /> : <Save className="size-5" />}
            {isSubmitting ? "A Guardar Produto..." : "Finalizar Registo"}
          </Button>
        </div>
      </form>
    </div>
  );
};