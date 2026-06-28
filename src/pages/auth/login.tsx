import { useState } from "react";
import { useForm } from "react-hook-form";
import { useNavigate, Link } from "react-router";
import { Sparkles, Loader2, AlertCircle, Eye, EyeOff, Lock, Mail } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { login, type LoginPayload } from "@/lib/api/auth";
import { useAuth } from "@/lib/auth-context";

export const LoginPage = () => {
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<LoginPayload>();
  const [formError, setFormError] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();
  const { signIn } = useAuth();

  const onSubmit = async (data: LoginPayload) => {
    setFormError(null);
    try {
      const response = await login(data);
      
      signIn(response.accessToken, response.user);

      if (response.user.role === "ADMIN") {
        navigate("/admin");
      } else {
        navigate("/customer");
      }
    } catch (error: any) {
      console.error(error);
      setFormError(error.message || "Credenciais inválidas. Por favor, tente novamente.");
    }
  };

  return (
    <main className="min-h-screen flex items-center justify-center bg-[#fdf2f8] p-4 font-sans">
      <div className="w-full max-w-md">
        
        {/* Logótipo / Cabeçalho */}
        <div className="flex flex-col items-center justify-center mb-8 text-center">
          <div className="bg-pink-100 p-3.5 rounded-2xl text-pink-500 shadow-sm border border-pink-50 mb-4 animate-in zoom-in duration-500">
            <Sparkles size={32} />
          </div>
          <h1 className="text-3xl font-black text-slate-800 tracking-tight">
            Bem-vindo à Nor<span className="text-pink-500">DTF</span>
          </h1>
          <p className="text-slate-500 font-medium mt-2">
            Inicie sessão para aceder à sua conta
          </p>
        </div>

        <div className="bg-white p-8 rounded-[32px] shadow-xl shadow-pink-100/50 border border-pink-100">
          
          {formError && (
            <div className="mb-6 p-4 bg-red-50 text-red-600 rounded-2xl border border-red-100 flex items-center gap-3 animate-in fade-in slide-in-from-top-2">
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
                  id="email"
                  type="email"
                  placeholder="o-seu-email@exemplo.com"
                  className="pl-11 h-12 rounded-xl transition-shadow focus-visible:ring-pink-100 focus-visible:border-pink-400 text-base"
                  {...register("email", { 
                    required: "O e-mail é obrigatório.",
                    pattern: {
                      value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                      message: "Endereço de e-mail inválido."
                    }
                  })} 
                />
              </div>
              {errors.email && <span className="text-red-500 text-sm font-medium block">{errors.email.message}</span>}
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="senha" className="text-slate-700 font-bold">Palavra-passe</Label>
                <Link to="/forgot-password" className="text-sm font-bold text-pink-500 hover:text-pink-600 hover:underline transition-colors">
                  Esqueceu-se?
                </Link>
              </div>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400 group-focus-within:text-pink-500 transition-colors">
                  <Lock className="size-5" />
                </div>
                <Input 
                  id="senha"
                  type={showPassword ? "text" : "password"}
                  placeholder="••••••••"
                  className="pl-11 pr-11 h-12 rounded-xl transition-shadow focus-visible:ring-pink-100 focus-visible:border-pink-400 text-base"
                  {...register("senha", { required: "A palavra-passe é obrigatória." })} 
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-400 hover:text-pink-500 transition-colors"
                  aria-label={showPassword ? "Ocultar palavra-passe" : "Mostrar palavra-passe"}
                >
                  {showPassword ? <EyeOff className="size-5" /> : <Eye className="size-5" />}
                </button>
              </div>
              {errors.senha && <span className="text-red-500 text-sm font-medium block">{errors.senha.message}</span>}
            </div>

            <Button 
              type="submit" 
              className="w-full h-12 mt-2 text-base font-bold rounded-xl gap-2 shadow-md shadow-pink-200 hover:shadow-lg transition-all"
              disabled={isSubmitting}
            >
              {isSubmitting ? <Loader2 className="size-5 animate-spin" /> : null}
              {isSubmitting ? "A iniciar sessão..." : "Iniciar Sessão"}
            </Button>
          </form>

          <div className="mt-8 text-center text-sm font-medium text-slate-500">
            Ainda não tem uma conta?{" "}
            <Link to="/register" className="text-pink-500 font-bold hover:text-pink-600 hover:underline transition-colors">
              Registe-se aqui
            </Link>
          </div>
        </div>
      </div>
    </main>
  );
};