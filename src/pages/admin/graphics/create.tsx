import { useState } from "react";
import { useForm } from "react-hook-form";
import { useNavigate, Link } from "react-router";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ImageInput } from "@/components/ui/image-input";
import { ArrowLeft, Loader2, Save, AlertCircle } from "lucide-react";
import { API_BASE_URL } from "@/lib/api/api"; 

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
    <div className="p-8 max-w-2xl mx-auto">
      <div className="flex items-center gap-4 mb-6">
        <Button variant="ghost" size="icon" className="bg-white rounded-full hover:bg-pink-50" asChild>
          <Link to="/admin/graphics">
            <ArrowLeft className="size-5 text-pink-500" />
          </Link>
        </Button>
        <h1 className="text-2xl font-black text-gray-800">Registar Nova Arte</h1>
      </div>
      
      {formError && (
        <div className="mb-6 p-4 bg-red-50 text-red-600 rounded-[16px] border border-red-100 flex items-center gap-3">
          <AlertCircle className="size-5 flex-shrink-0" />
          <p className="text-sm font-medium">{formError}</p>
        </div>
      )}

      <form 
        onSubmit={handleSubmit(onSubmit)} 
        className="flex flex-col gap-6 bg-white p-8 rounded-[32px] border-4 border-pink-100 shadow-sm"
      >
        <div>
          <Label htmlFor="nome" className="text-gray-700 font-semibold">Nome da Estampa</Label>
          <Input 
            id="nome"
            {...register("nome", { required: "O nome é obrigatório." })} 
            placeholder="Ex: Caveira Mexicana Neon" 
            className="mt-2"
          />
          {errors.nome && <span className="text-red-500 text-sm mt-1 block font-medium">{errors.nome.message}</span>}
        </div>

        <div>
          <Label htmlFor="estilosNomes" className="text-gray-700 font-semibold">Estilos (separados por vírgula)</Label>
          <Input 
            id="estilosNomes"
            {...register("estilosNomes", { required: "Informe pelo menos um estilo." })} 
            placeholder="Ex: Geek, Vintage, Minimalista" 
            className="mt-2"
          />
          <span className="text-xs text-gray-400 mt-2 block font-medium">
            Estes estilos ajudarão os clientes a filtrar as estampas na loja.
          </span>
          {errors.estilosNomes && <span className="text-red-500 text-sm mt-1 block font-medium">{errors.estilosNomes.message}</span>}
        </div>

        <div>
          <Label className="mb-3 block text-gray-700 font-semibold">Ficheiro da Estampa</Label>
          <ImageInput
            value={image}
            onChange={setImage}
            onRemove={() => setImage(null)}
            placeholder="Fazer upload da arte"
          />
        </div>

        <Button 
          type="submit" 
          className="w-full mt-4 gap-2 h-12 text-md rounded-xl" 
          disabled={isSubmitting}
        >
          {isSubmitting ? <Loader2 className="size-5 animate-spin" /> : <Save className="size-5" />}
          {isSubmitting ? "A Guardar..." : "Registar Estampa"}
        </Button>
      </form>
    </div>
  );
};