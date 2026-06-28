import { useState } from "react";
import { useForm } from "react-hook-form";
import { Link } from "react-router";
import { Mail, Loader2, AlertCircle, KeyRound, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { forgotPassword } from "@/lib/api/auth";

export const ForgotPasswordPage = () => {
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<{ email: string }>();
  const [formError, setFormError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const onSubmit = async (data: { email: string }) => {
    setFormError(null);
    try {
      await forgotPassword(data);
      setSuccess(true);
    } catch (error: any) {
      setFormError(error.message || "Erro ao solicitar recuperação. Tente novamente.");
    }
  };

  return (
    <main className="min-h-screen flex items-center justify-center bg-[#fdf2f8] p-4 font-sans">
      <div className="w-full max-w-md">
        
        <div className="flex flex-col items-center justify-center mb-8 text-center">
          <div className="bg-pink-100 p-3.5 rounded-2xl text-pink-500 shadow-sm border border-pink-50 mb-4">
            <KeyRound size={32} />
          </div>
          <h1 className="text-3xl font-black text-slate-800 tracking-tight">Recuperar Conta</h1>
          <p className="text-slate-500 font-medium mt-2">
            Insira o seu e-mail para receber um link de redefinição.
          </p>
        </div>

        <div className="bg-white p-8 rounded-[32px] shadow-xl shadow-pink-100/50 border border-pink-100">
          
          {success ? (
            <div className="text-center animate-in zoom-in-95 duration-300">
              <CheckCircle2 className="size-16 text-emerald-500 mx-auto mb-4" />
              <h2 className="text-xl font-bold text-slate-800 mb-2">E-mail Enviado!</h2>
              <p className="text-slate-500 font-medium mb-6">
                Se este e-mail estiver registado, receberá as instruções em breve. Verifique também o spam.
              </p>
              <Button asChild className="w-full h-12 text-base font-bold rounded-xl" variant="outline">
                <Link to="/signin">Voltar ao Login</Link>
              </Button>
            </div>
          ) : (
            <>
              {formError && (
                <div className="mb-6 p-4 bg-red-50 text-red-600 rounded-2xl flex items-center gap-3">
                  <AlertCircle className="size-5 shrink-0" />
                  <p className="text-sm font-medium">{formError}</p>
                </div>
              )}

              <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-5">
                <div className="space-y-2">
                  <Label htmlFor="email" className="text-slate-700 font-bold">E-mail da Conta</Label>
                  <div className="relative group">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400 group-focus-within:text-pink-500">
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

                <Button type="submit" className="w-full h-12 mt-2 text-base font-bold rounded-xl" disabled={isSubmitting}>
                  {isSubmitting ? <Loader2 className="size-5 animate-spin" /> : null}
                  {isSubmitting ? "A Enviar..." : "Enviar Link de Recuperação"}
                </Button>
              </form>
              
              <div className="mt-8 text-center text-sm font-medium text-slate-500">
                Lembrou-se da palavra-passe? <Link to="/signin" className="text-pink-500 font-bold hover:underline">Voltar ao Login</Link>
              </div>
            </>
          )}
        </div>
      </div>
    </main>
  );
};