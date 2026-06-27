import { useState } from "react";
import { useForm } from "react-hook-form";
import { useNavigate } from "react-router";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ColorCard, type ColorCardData } from "@/components/ui/color-card";
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
  const navigate = useNavigate();

  const onSubmit = async (data: ProductFormData) => {
    if (colors.length === 0) {
      alert("Por favor, adicione pelo menos uma cor ao produto antes de finalizar.");
      return;
    }

    const coresNaoSalvas = colors.some(c => !c.colorName || c.colorName.trim() === "");
    if (coresNaoSalvas) {
      alert("Você tem cores sem nome! Preencha o nome e salve os cartões de cor antes de continuar.");
      return;
    }

    try {
      const coresCadastradas = await listCores();
      
      const arquivosFinais: File[] = [];
      const imagensPayload: CreatePersonalizavelImagemPayload[] = [];
      const variacoesPayload: CreatePersonalizavelVariacaoPayload[] = [];

      for (const colorData of colors) {
        let cor = coresCadastradas.find(
          c => c.hex_code.toLowerCase() === colorData.colorHex.toLowerCase() ||
               c.nome.toLowerCase() === colorData.colorName.toLowerCase()
        );

        if (!cor) {
          cor = await createCor(colorData.colorName, colorData.colorHex);
          coresCadastradas.push(cor); // Atualiza o cache local
        }

        const idCor = cor.id;

        variacoesPayload.push({
          idCor: idCor,
          estoque: 10 
        });

        const processarImagem = (img: File | string | null, tipo: "APRESENTACAO" | "FRENTE" | "COSTAS") => {
          if (img && img instanceof File) {
            arquivosFinais.push(img);
            imagensPayload.push({
              idCor: idCor,
              idExternoStorage: img.name,
              tipoVisualizacao: tipo
            });
          }
        };

        processarImagem(colorData.presentationImage, "APRESENTACAO");
        processarImagem(colorData.frontImage, "FRENTE");
        processarImagem(colorData.backImage, "COSTAS");
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
      alert(`Erro ao salvar produto: ${error.message}`);
    }
  };

  const addColor = () => {
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
    <div className="p-8 max-w-4xl mx-auto">
      <h1 className="text-2xl font-black mb-6">Registar Nova Camisola</h1>
      
      <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label>Nome do Produto</Label>
            <Input 
              {...register("nome", { required: "O nome do produto é obrigatório." })} 
              placeholder="Ex: Camisola Oversized Algodão" 
            />
            {errors.nome && <span className="text-red-500 text-sm mt-1 block">{errors.nome.message}</span>}
          </div>
          
          <div>
            <Label>Preço (R$)</Label>
            <Input 
              type="number" 
              step="0.01"
              {...register("preco", { 
                required: "O preço é obrigatório.",
                valueAsNumber: true,
                min: { value: 0.1, message: "O preço deve ser superior a zero." }
              })} 
              placeholder="0,00" 
            />
            {errors.preco && <span className="text-red-500 text-sm mt-1 block">{errors.preco.message}</span>}
          </div>
        </div>

        <div>
          <div className="flex items-center justify-between mb-4">
            <Label>Cores e Imagens Disponíveis</Label>
            <Button type="button" onClick={addColor} variant="outline" size="sm">
              + Adicionar Cor
            </Button>
          </div>
          
          <div className="flex flex-wrap gap-4">
            {colors.map((colorData, index) => (
              <ColorCard
                key={index}
                data={colorData}
                onChange={(newData) => {
                  const newColors = [...colors];
                  newColors[index] = newData;
                  setColors(newColors);
                }}
                onDelete={() => setColors(colors.filter((_, i) => i !== index))}
                onSave={() => {}}
              />
            ))}
          </div>
        </div>

        <Button type="submit" className="w-full mt-6" disabled={isSubmitting}>
          {isSubmitting ? "A Guardar..." : "Finalizar Registo"}
        </Button>
      </form>
    </div>
  );
};