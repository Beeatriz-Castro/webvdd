import { useState } from "react";
import { useForm } from "react-hook-form";
import { useNavigate, Link } from "react-router";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ImageInput } from "@/components/ui/image-input";
import { ArrowLeft, Loader2, Save, AlertCircle } from "lucide-react";
import { API_BASE_URL, getAuthHeaders } from "@/lib/api/api"; 

interface GraphicFormData {
  nome: string;
  estilosNomes: string;
}

export const CreateGraphicPage = () => {
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<GraphicFormData>();
  const [image, setImage] = useState<File | null>(null);
  const [formError, setFormError] = useState<string | null>(null);
  const navigate = useNavigate();

  const onSubmit = async (data: GraphicFormData) => {
    setFormError(null);
    
    if (!image) {
      setFormError("Por favor, adicione o ficheiro da estampa antes de continuar.");
      return;
    }

    const estilosArray = data.estilosNomes
      .split(",")
      .map(s => s.trim())
      .filter(s => s.length > 0);

    if (estilosArray.length === 0) {
      setFormError("Por favor, adicione pelo menos um estilo válido.");
      return;
    }

    try {
      const formData = new FormData();
      formData.append("nome", data.nome);
      formData.append("estilosNomes", JSON.stringify(estilosArray));
      formData.append("image", image);

      const response = await fetch(`${API_BASE_URL}/estampas`, {
        method: "POST",
        headers: getAuthHeaders(),
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Erro ao guardar estampa");
      }

      alert("Estampa registada com sucesso!");
      navigate("/admin/graphics");
      
    } catch (error: any) {
      console.error(error);
      setFormError(`Erro ao registar: ${error.message || "Erro desconhecido"}`);
    }
  };

  return (
    <div className="p-4 md:p-8 max-w-3xl mx-auto">
      <div className="flex items-center gap-4 mb-8">
        <Button variant="outline" size="icon" className="rounded-full shrink-0" asChild>
          <Link to="/admin/graphics">
            <ArrowLeft className="size-5 text-slate-600" />
          </Link>
        </Button>
        <h1 className="text-3xl font-black text-slate-800 tracking-tight">Registar Nova Arte</h1>
      </div>
      
      {formError && (
        <div className="mb-6 p-4 bg-red-50 text-red-700 rounded-2xl border border-red-100 flex items-center gap-3 animate-in fade-in">
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
            className="h-11 transition-shadow focus-visible:ring-primary/20"
          />
          {errors.nome && <span className="text-red-500 text-sm mt-1 block font-medium">{errors.nome.message}</span>}
        </div>

        <div className="space-y-2">
          <Label htmlFor="estilosNomes" className="text-slate-700 font-semibold">Estilos (separados por vírgula)</Label>
          <Input 
            id="estilosNomes"
            {...register("estilosNomes", { required: "Informe pelo menos um estilo." })} 
            placeholder="Ex: Geek, Vintage, Minimalista" 
            className="h-11 transition-shadow focus-visible:ring-primary/20"
          />
          <span className="text-sm text-slate-500 mt-2 block">
            Estes estilos ajudarão os clientes a filtrar as estampas na loja.
          </span>
          {errors.estilosNomes && <span className="text-red-500 text-sm mt-1 block font-medium">{errors.estilosNomes.message}</span>}
        </div>

        <div className="space-y-3 border-t border-slate-100 pt-6">
          <Label className="block text-slate-700 font-semibold text-lg">Ficheiro da Estampa</Label>
          <div className="max-w-xs">
            <ImageInput
              value={image}
              onChange={setImage}
              onRemove={() => setImage(null)}
              placeholder="Fazer upload da arte"
            />
          </div>
        </div>

        <div className="flex justify-end pt-6 mt-2 border-t border-slate-100">
          <Button 
            type="submit" 
            size="lg"
            className="w-full md:w-auto gap-2 h-12 px-8 text-base rounded-xl" 
            disabled={isSubmitting}
          >
            {isSubmitting ? <Loader2 className="size-5 animate-spin" /> : <Save className="size-5" />}
            {isSubmitting ? "A Guardar..." : "Registar Estampa"}
          </Button>
        </div>
      </form>
    </div>
  );
};