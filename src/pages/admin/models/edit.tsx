import { useState, useEffect, useCallback } from "react";
import { useForm } from "react-hook-form";
import { useNavigate, useParams, Link } from "react-router";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { ColorCard, type ColorCardData } from "@/components/ui/color-card";
import { ArrowLeft, Loader2, Save } from "lucide-react";
import { getCustomizableById, updatePersonalizavel, createCor, listCores } from "@/lib/api/personalizaveis";
import type { CreatePersonalizavelImagemPayload, CreatePersonalizavelVariacaoPayload } from "@/lib/api/personalizaveis";
import { API_BASE_URL } from "@/lib/api/api";

interface ProductFormData {
  nome: string;
  preco: number;
}

interface ProductImage {
  id_cor: number;
  id_externo_storage: string;
  tipo_visualizacao: "APRESENTACAO" | "FRENTE" | "COSTAS";
  cor?: {
    nome: string;
    hex_code: string;
  };
}

export const EditModelPage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [colors, setColors] = useState<ColorCardData[]>([]);
  const { register, handleSubmit, reset, formState: { isSubmitting } } = useForm<ProductFormData>();
  const processImages = useCallback((imagens: ProductImage[]) => {
    const colorMap = new Map<number, ColorCardData>();
    
    imagens?.forEach((img) => {
      if (!colorMap.has(img.id_cor)) {
        colorMap.set(img.id_cor, {
          colorName: img.cor?.nome || "Sem nome",
          colorHex: img.cor?.hex_code || "#D9D9D9",
          presentationImage: null,
          frontImage: null,
          backImage: null
        });
      }
      
      const card = colorMap.get(img.id_cor)!;
      const imageUrl = `${API_BASE_URL}/uploads/${img.id_externo_storage}`;
      
      if (img.tipo_visualizacao === "APRESENTACAO") card.presentationImage = imageUrl;
      if (img.tipo_visualizacao === "FRENTE") card.frontImage = imageUrl;
      if (img.tipo_visualizacao === "COSTAS") card.backImage = imageUrl;
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
        
        reset({
          nome: data.nome,
          preco: data.preco
        });

        if (data.imagens) {
          setColors(processImages(data.imagens));
        }
      } catch (err) {
        console.error("Erro ao carregar produto:", err);
        setError("Não foi possível carregar os dados deste produto.");
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [id, reset, processImages]);

  const onSubmit = async (data: ProductFormData) => {
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
          imagensPayload.push({ idCor, idExternoStorage: img.name, tipoVisualizacao: tipo });
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

        variacoesPayload.push({ idCor: cor.id });
        processarImagem(colorData.presentationImage, "APRESENTACAO", cor.id);
        processarImagem(colorData.frontImage, "FRENTE", cor.id);
        processarImagem(colorData.backImage, "COSTAS", cor.id);
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
      alert(`Erro ao salvar: ${err.message || "Tente novamente."}`);
    }
  };

  if (loading) {
    return (
      <div className="min-h-[50vh] flex justify-center items-center">
        <Loader2 className="animate-spin size-10 text-primary" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-20 text-center flex flex-col items-center gap-4">
        <p className="text-destructive font-medium">{error}</p>
        <Button variant="outline" onClick={() => window.location.reload()}>
          Tentar novamente
        </Button>
      </div>
    );
  }

  return (
    <div className="p-8 max-w-4xl mx-auto">
      <div className="flex items-center gap-4 mb-8">
        <Link to="/admin/models" className="hover:text-primary transition-colors">
          <ArrowLeft className="size-6" />
        </Link>
        <h1 className="text-3xl font-black tracking-tight">Editar Produto</h1>
      </div>
      
      {/* Adição do onSubmit no form */}
      <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <Label htmlFor="nome">Nome do Produto</Label>
            <Input id="nome" placeholder="Ex: Camiseta Básica" {...register("nome", { required: true })} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="preco">Preço (R$)</Label>
            <Input id="preco" type="number" step="0.01" placeholder="0.00" {...register("preco", { required: true })} />
          </div>
        </div>

        <div className="space-y-4">
          <Label className="text-lg font-semibold border-b pb-2 flex">Cores e Imagens</Label>
          
          {colors.length > 0 ? (
            <div className="flex flex-wrap gap-4 pt-2">
              {colors.map((c, i) => (
                <ColorCard 
                  key={i} 
                  data={c} 
                  initialSaved={true}
                  onChange={() => {}} 
                  onDelete={() => {}} 
                  onSave={() => {}} 
                />
              ))}
            </div>
          ) : (
            <p className="text-muted-foreground text-sm py-4">
              Nenhuma imagem cadastrada para este modelo.
            </p>
          )}
        </div>

        <div className="flex justify-end pt-6 border-t">
          <Button type="submit" disabled={isSubmitting} className="gap-2">
            {isSubmitting ? <Loader2 className="size-4 animate-spin" /> : <Save className="size-4" />}
            {isSubmitting ? "Salvando..." : "Salvar Alterações"}
          </Button>
        </div>
      </form>
    </div>
  );
};