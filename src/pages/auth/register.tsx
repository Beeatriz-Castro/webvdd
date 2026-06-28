import { useState } from "react";
import { useForm } from "react-hook-form";
import { useNavigate, Link } from "react-router";
import { Sparkles, Loader2, AlertCircle, Eye, EyeOff, Lock, Mail, UserPlus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { register as registerApi, type RegisterPayload } from "@/lib/api/auth";

export const RegisterPage = () => {
  const { register, handleSubmit, watch, formState: { errors, isSubmitting } } = useForm<RegisterPayload>();
  const [formError, setFormError] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();

  const onSubmit = async (data: RegisterPayload) => {
    setFormError(null);
    try {
      await registerApi(data);
      alert("Conta criada com sucesso! Por favor, inicie sessão.");
      navigate("/signin");
    } catch (error: any) {
      setFormError(error.message || "Erro ao criar conta. Tente novamente.");
    }
  };

  return (
    <main className="min-h-screen flex items-center justify-center bg-[#fdf2f8] p-4 font-sans">
      <div className="w-full max-w-md">
        
        <div className="flex flex-col items-center justify-center mb-8 text-center">
          <div className="bg-pink-100 p-3.5 rounded-2xl text-pink-500 shadow-sm border border-pink-50 mb-4 animate-in zoom-in duration-500">
            <UserPlus size={32} />
          </div>
          <h1 className="text-3xl font-black text-slate-800 tracking-tight">
            Criar Conta
          </h1>
          <p className="text-slate-500 font-medium mt-2">
            Junte-se à NorDTF e personalize a sua moda
          </p>
        </div>

        <div className="bg-white p-8 rounded-[32px] shadow-xl shadow-pink-100/50 border border-pink-100">
          {formError && (
            <div className="mb-6 p-4 bg-red-50 text-red-600 rounded-2xl flex items-center gap-3 animate-in fade-in">
              <AlertCircle className="size-5 shrink-0" />
              <p className="text-sm font-medium">{formError}</p>
            </div>
          )}

          <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-5">
            <div className="space-y-2">
              <Label htmlFor="email" className="text-slate-700 font-bold">E-mail</Label>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400 group-focus-within:text-pink-500 transition-colors">
                  <Mail className="size-5" />
                </div>
                <Input 
                  id="email" type="email" placeholder="o-seu-email@exemplo.com"
                  className="pl-11 h-12 rounded-xl focus-visible:ring-pink-100 focus-visible:border-pink-400"
                  {...register("email", { required: "O e-mail é obrigatório." })} 
                />
              </div>
              {errors.email && <span className="text-red-500 text-sm font-medium block">{errors.email.message}</span>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="senha" className="text-slate-700 font-bold">Palavra-passe</Label>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400 group-focus-within:text-pink-500">
                  <Lock className="size-5" />
                </div>
                <Input 
                  id="senha" type={showPassword ? "text" : "password"} placeholder="••••••••"
                  className="pl-11 pr-11 h-12 rounded-xl focus-visible:ring-pink-100 focus-visible:border-pink-400"
                  {...register("senha", { 
                    required: "A palavra-passe é obrigatória.",
                    minLength: { value: 6, message: "A palavra-passe deve ter pelo menos 6 caracteres." }
                  })} 
                />
                <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-400 hover:text-pink-500">
                  {showPassword ? <EyeOff className="size-5" /> : <Eye className="size-5" />}
                </button>
              </div>
              {errors.senha && <span className="text-red-500 text-sm font-medium block">{errors.senha.message}</span>}
            </div>

            <div className="space-y-2">
                <Label htmlFor="nome" className="text-slate-700 font-bold">Nome completo</Label>
                 <Input
                    id="nome"
                    placeholder="O seu nome"
                    className="h-12 rounded-xl"
                {...register("nome", { required: "O nome é obrigatório." })}
            />
                {errors.nome && <span className="text-red-500 text-sm font-medium block">{errors.nome.message}</span>}
            </div>

            <div className="space-y-2">
                <Label htmlFor="cpf" className="text-slate-700 font-bold">CPF</Label>
                <Input
                    id="cpf"
                    placeholder="000.000.000-00"
                    className="h-12 rounded-xl"
                    {...register("cpf", { required: "O CPF é obrigatório." })}
            />
                    {errors.cpf && <span className="text-red-500 text-sm font-medium block">{errors.cpf.message}</span>}
            </div>
            <div className="space-y-2">
              <Label htmlFor="confirmarSenha" className="text-slate-700 font-bold">Confirmar Palavra-passe</Label>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400 group-focus-within:text-pink-500">
                  <Lock className="size-5" />
                </div>
                <Input 
                  id="confirmarSenha" type={showPassword ? "text" : "password"} placeholder="••••••••"
                  className="pl-11 pr-11 h-12 rounded-xl focus-visible:ring-pink-100 focus-visible:border-pink-400"
                  {...register("confirmarSenha", { 
                    required: "Confirme a sua palavra-passe.",
                    validate: (value) => value === watch("senha") || "As palavras-passe não coincidem."
                  })} 
                />
              </div>
              {errors.confirmarSenha && <span className="text-red-500 text-sm font-medium block">{errors.confirmarSenha.message}</span>}
            </div>

            <Button type="submit" className="w-full h-12 mt-2 text-base font-bold rounded-xl" disabled={isSubmitting}>
              {isSubmitting ? <Loader2 className="size-5 animate-spin" /> : null}
              {isSubmitting ? "A criar conta..." : "Registar-me"}
            </Button>
          </form>

          <div className="mt-8 text-center text-sm font-medium text-slate-500">
            Já tem uma conta?{" "}
            <Link to="/signin" className="text-pink-500 font-bold hover:text-pink-600 hover:underline">
              Iniciar sessão
            </Link>
          </div>
        </div>
      </div>
    </main>
  );
};