import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { useNavigate, useParams, Link } from "react-router";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ImageInput } from "@/components/ui/image-input";
import { ArrowLeft, Loader2, Save, AlertCircle } from "lucide-react";
import { API_BASE_URL, getAuthHeaders } from "@/lib/api/api";
import { getEstampa } from "@/lib/api/estampas";

interface GraphicFormData {
  nome: string;
  estilosNomes: string;
}

export const EditGraphicPage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { register, handleSubmit, reset, formState: { errors, isSubmitting } } = useForm<GraphicFormData>();
  const [image, setImage] = useState<File | string | null>(null);
  const [formError, setFormError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) return;
    getEstampa(Number(id))
      .then((estampa) => {
        reset({
          nome: estampa.nome,
          estilosNomes: estampa.estilos?.map((e) => e.estilo.nome).join(", ") ?? "",
        });
        const imgUrl = estampa.imagens?.[0]?.id_externo_storage
          ? `${API_BASE_URL}/uploads/${estampa.imagens[0].id_externo_storage}`
          : null;
        setImage(imgUrl);
      })
      .catch(() => setFormError("Não foi possível carregar a estampa."))
      .finally(() => setLoading(false));
  }, [id, reset]);

  const onSubmit = async (data: GraphicFormData) => {
    setFormError(null);

    const estilosArray = data.estilosNomes
      .split(",")
      .map((s) => s.trim())
      .filter((s) => s.length > 0);

    if (estilosArray.length === 0) {
      setFormError("Por favor, adicione pelo menos um estilo válido.");
      return;
    }

    try {
      const formData = new FormData();
      formData.append("nome", data.nome);
      formData.append("estilosNomes", JSON.stringify(estilosArray));
      if (image instanceof File) {
        formData.append("image", image);
      }

      const response = await fetch(`${API_BASE_URL}/estampas/${id}`, {
        method: "PATCH",
        headers: getAuthHeaders(),
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => null);
        throw new Error(errorData?.message || "Erro ao atualizar estampa");
      }

      navigate("/admin/graphics");
    } catch (error: any) {
      setFormError(`Erro ao atualizar: ${error.message || "Erro desconhecido"}`);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="size-10 animate-spin text-pink-400" />
      </div>
    );
  }

  return (
    <div className="p-4 md:p-8 max-w-3xl mx-auto">
      <div className="flex items-center gap-4 mb-8">
        <Button variant="outline" size="icon" className="rounded-full shrink-0" asChild>
          <Link to="/admin/graphics">
            <ArrowLeft className="size-5 text-slate-600" />
          </Link>
        </Button>
        <h1 className="text-3xl font-black text-slate-800 tracking-tight">Editar Estampa</h1>
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
        <div className="space-y-2">
          <Label htmlFor="nome" className="text-slate-700 font-semibold">Nome da Estampa</Label>
          <Input
            id="nome"
            {...register("nome", { required: "O nome é obrigatório." })}
            placeholder="Ex: Caveira Mexicana Neon"
            className="h-11"
          />
          {errors.nome && <span className="text-red-500 text-sm font-medium">{errors.nome.message}</span>}
        </div>

        <div className="space-y-2">
          <Label htmlFor="estilosNomes" className="text-slate-700 font-semibold">Estilos (separados por vírgula)</Label>
          <Input
            id="estilosNomes"
            {...register("estilosNomes", { required: "Informe pelo menos um estilo." })}
            placeholder="Ex: Geek, Vintage, Minimalista"
            className="h-11"
          />
          <span className="text-sm text-slate-500">Estes estilos ajudarão os clientes a filtrar as estampas.</span>
          {errors.estilosNomes && <span className="text-red-500 text-sm font-medium">{errors.estilosNomes.message}</span>}
        </div>

        <div className="space-y-3 border-t border-slate-100 pt-6">
          <Label className="block text-slate-700 font-semibold text-lg">Imagem da Estampa</Label>
          <p className="text-sm text-slate-400">Deixe como está para manter a imagem atual, ou clique para substituir.</p>
          <div className="max-w-xs">
            <ImageInput
              value={image}
              onChange={setImage}
              onRemove={() => setImage(null)}
              placeholder="Clique para substituir"
            />
          </div>
        </div>

        <div className="flex justify-end pt-6 border-t border-slate-100">
          <Button
            type="submit"
            size="lg"
            className="w-full md:w-auto gap-2 h-12 px-8 text-base rounded-xl"
            disabled={isSubmitting}
          >
            {isSubmitting ? <Loader2 className="size-5 animate-spin" /> : <Save className="size-5" />}
            {isSubmitting ? "A Guardar..." : "Guardar Alterações"}
          </Button>
        </div>
      </form>
    </div>
  );
};