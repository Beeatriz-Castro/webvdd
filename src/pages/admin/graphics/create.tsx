import { useState } from "react";
import { useForm } from "react-hook-form";
import { useNavigate, Link } from "react-router";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ImageInput } from "@/components/ui/image-input";
import { ArrowLeft } from "lucide-react";

// Importe a função da sua API existente ou use o fetch diretamente
import { API_BASE_URL } from "@/lib/api/api"; 

interface GraphicFormData {
  nome: string;
  estilosNomes: string;
}

export const CreateGraphicPage = () => {
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<GraphicFormData>();
  const [image, setImage] = useState<File | null>(null);
  const navigate = useNavigate();

  const onSubmit = async (data: GraphicFormData) => {
    if (!image) {
      alert("Por favor, adicione a imagem da estampa.");
      return;
    }

    // Pega a string "Rock, Fofo, Geek", separa pelas vírgulas e remove espaços vazios
    const estilosArray = data.estilosNomes
      .split(",")
      .map(s => s.trim())
      .filter(s => s.length > 0);

    if (estilosArray.length === 0) {
      alert("Por favor, adicione pelo menos um estilo.");
      return;
    }

    try {
      const formData = new FormData();
      formData.append("nome", data.nome);
      // O backend usa JSON.parse(estilosNomesRaw), por isso temos de enviar como string JSON
      formData.append("estilosNomes", JSON.stringify(estilosArray));
      // O backend do NestJS espera a chave 'image' no FileInterceptor
      formData.append("image", image);

      // Chamada HTTP para o seu backend
      const response = await fetch(`${API_BASE_URL}/estampas`, {
        method: "POST",
        body: formData,
        // Não defina o Content-Type manualmente quando usa FormData
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Erro ao guardar estampa");
      }

      alert("Estampa registada com sucesso!");
      navigate("/admin/graphics"); // Redireciona de volta para a galeria
      
    } catch (error: any) {
      console.error(error);
      alert(`Erro ao registar: ${error.message}`);
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
      
      <form 
        onSubmit={handleSubmit(onSubmit)} 
        className="flex flex-col gap-6 bg-white p-8 rounded-[32px] border-4 border-pink-100 shadow-sm"
      >
        <div>
          <Label className="text-gray-700">Nome da Estampa</Label>
          <Input 
            {...register("nome", { required: "O nome é obrigatório." })} 
            placeholder="Ex: Caveira Mexicana Neon" 
            className="mt-2"
          />
          {errors.nome && <span className="text-red-500 text-sm mt-1 block">{errors.nome.message}</span>}
        </div>

        <div>
          <Label className="text-gray-700">Estilos (separados por vírgula)</Label>
          <Input 
            {...register("estilosNomes", { required: "Informe pelo menos um estilo." })} 
            placeholder="Ex: Geek, Vintage, Minimalista" 
            className="mt-2"
          />
          <span className="text-xs text-gray-400 mt-2 block font-medium">
            Estes estilos ajudarão os clientes a filtrar as estampas na loja.
          </span>
          {errors.estilosNomes && <span className="text-red-500 text-sm mt-1 block">{errors.estilosNomes.message}</span>}
        </div>

        <div>
          <Label className="mb-3 block text-gray-700">Ficheiro da Estampa</Label>
          <ImageInput
            value={image}
            onChange={setImage}
            onRemove={() => setImage(null)}
            placeholder="Fazer upload da arte"
          />
        </div>

        <Button 
          type="submit" 
          className="w-full mt-4" 
          disabled={isSubmitting}
        >
          {isSubmitting ? "A Guardar..." : "Registar Estampa"}
        </Button>
      </form>
    </div>
  );
};