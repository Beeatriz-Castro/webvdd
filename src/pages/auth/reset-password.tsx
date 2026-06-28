import { useState } from "react";
import { useForm } from "react-hook-form";
import { useNavigate, useSearchParams } from "react-router";
import { ShieldCheck, Loader2, AlertCircle, Eye, EyeOff, Lock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { resetPassword } from "@/lib/api/auth";

export const ResetPasswordPage = () => {
  const [searchParams] = useSearchParams();
  const token = searchParams.get("token"); // Apanha o token do URL
  const { register, handleSubmit, watch, formState: { errors, isSubmitting } } = useForm<{ novaSenha: string; confirmarSenha: string }>();
  const [formError, setFormError] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();

  const onSubmit = async (data: { novaSenha: string }) => {
    if (!token) {
      setFormError("Token inválido ou em falta. Por favor, solicite um novo link de recuperação.");
      return;
    }

    setFormError(null);
    try {
      await resetPassword({ token, novaSenha: data.novaSenha });
      alert("Palavra-passe alterada com sucesso!");
      navigate("/signin");
    } catch (error: any) {
      setFormError(error.message || "Erro ao redefinir a palavra-passe. O link pode ter expirado.");
    }
  };

  if (!token) {
    return (
      <main className="min-h-screen flex items-center justify-center bg-[#fdf2f8] p-4">
        <div className="bg-white p-8 rounded-3xl shadow-xl text-center max-w-sm">
          <AlertCircle className="size-12 text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-bold mb-2 text-slate-800">Link Inválido</h2>
          <p className="text-slate-500 font-medium">Não foi encontrado nenhum token de recuperação na morada.</p>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen flex items-center justify-center bg-[#fdf2f8] p-4 font-sans">
      <div className="w-full max-w-md">
        
        <div className="flex flex-col items-center justify-center mb-8 text-center">
          <div className="bg-pink-100 p-3.5 rounded-2xl text-pink-500 shadow-sm border border-pink-50 mb-4 animate-in zoom-in">
            <ShieldCheck size={32} />
          </div>
          <h1 className="text-3xl font-black text-slate-800 tracking-tight">Nova Palavra-passe</h1>
          <p className="text-slate-500 font-medium mt-2">Crie uma nova palavra-passe forte.</p>
        </div>

        <div className="bg-white p-8 rounded-[32px] shadow-xl shadow-pink-100/50 border border-pink-100">
          {formError && (
            <div className="mb-6 p-4 bg-red-50 text-red-600 rounded-2xl flex items-center gap-3">
              <AlertCircle className="size-5 shrink-0" />
              <p className="text-sm font-medium">{formError}</p>
            </div>
          )}

          <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-5">
            <div className="space-y-2">
              <Label htmlFor="novaSenha" className="text-slate-700 font-bold">Nova Palavra-passe</Label>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400 group-focus-within:text-pink-500">
                  <Lock className="size-5" />
                </div>
                <Input 
                  id="novaSenha" type={showPassword ? "text" : "password"} placeholder="••••••••"
                  className="pl-11 pr-11 h-12 rounded-xl focus-visible:ring-pink-100 focus-visible:border-pink-400"
                  {...register("novaSenha", { required: "A palavra-passe é obrigatória.", minLength: { value: 6, message: "Mínimo de 6 caracteres." }})} 
                />
                <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-400 hover:text-pink-500">
                  {showPassword ? <EyeOff className="size-5" /> : <Eye className="size-5" />}
                </button>
              </div>
              {errors.novaSenha && <span className="text-red-500 text-sm font-medium block">{errors.novaSenha.message}</span>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="confirmarSenha" className="text-slate-700 font-bold">Confirmar Nova Palavra-passe</Label>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400 group-focus-within:text-pink-500">
                  <Lock className="size-5" />
                </div>
                <Input 
                  id="confirmarSenha" type={showPassword ? "text" : "password"} placeholder="••••••••"
                  className="pl-11 pr-11 h-12 rounded-xl focus-visible:ring-pink-100 focus-visible:border-pink-400"
                  {...register("confirmarSenha", { 
                    required: "Confirme a nova palavra-passe.",
                    validate: (value) => value === watch("novaSenha") || "As palavras-passe não coincidem."
                  })} 
                />
              </div>
              {errors.confirmarSenha && <span className="text-red-500 text-sm font-medium block">{errors.confirmarSenha.message}</span>}
            </div>

            <Button type="submit" className="w-full h-12 mt-2 text-base font-bold rounded-xl" disabled={isSubmitting}>
              {isSubmitting ? <Loader2 className="size-5 animate-spin" /> : null}
              {isSubmitting ? "A Guardar..." : "Redefinir Palavra-passe"}
            </Button>
          </form>
        </div>
      </div>
    </main>
  );
};