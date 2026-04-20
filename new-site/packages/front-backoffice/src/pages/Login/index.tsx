import { useState } from "react";
import { Navigate, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import Notification from "@/components/Notification";
import { LockKeyhole, ShieldCheck } from "lucide-react";

type LocationState = {
  from?: { pathname?: string };
};

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const { isAuthenticated, login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const state = location.state as LocationState | null;
  const destination = state?.from?.pathname ?? "/home";

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!email.trim() || !password.trim()) {
      setErrorMessage("Preencha e-mail e senha para continuar.");
      return;
    }

    login(email, password);
    navigate(destination, { replace: true });
  };

  if (isAuthenticated) {
    return <Navigate to="/home" replace />;
  }

  return (
    <section className="relative flex min-h-[calc(100vh-73px)] items-center justify-center overflow-hidden bg-[#020617] px-4 py-12">
      {/* Background Decorativo */}
      <div className="absolute top-0 -left-1/4 h-96 w-96 rounded-full bg-sky-500/10 blur-[120px]" />
      <div className="absolute bottom-0 -right-1/4 h-96 w-96 rounded-full bg-indigo-500/10 blur-[120px]" />

      {/* Container Principal  */}
      <Card className="relative grid w-full max-w-5xl gap-0 overflow-hidden rounded-3xl border-slate-800 bg-slate-900/40 shadow-2xl backdrop-blur-sm md:grid-cols-[1fr_0.9fr] animate-in fade-in zoom-in-95 duration-500 p-0 border">
        
        {/* Lado Esquerdo: Branding/Info */}
        <div className="relative flex flex-col justify-between bg-slate-900/60 p-8 md:p-12">
          <div className="space-y-6">
            <div className="inline-flex h-12 w-12 items-center justify-center rounded-xl bg-sky-500/10 text-sky-400 ring-1 ring-sky-500/20">
              <ShieldCheck size={28} />
            </div>
            
            <div className="space-y-2">
              <p className="text-xs font-bold uppercase tracking-[0.4em] text-sky-400/80">Acesso Restrito</p>
              <CardTitle className="text-4xl font-extrabold tracking-tight text-white md:text-5xl lg:text-6xl border-none p-0 bg-transparent">
                SEMCOMP <span className="text-sky-500 text-3xl md:text-4xl block mt-2 font-medium opacity-90 underline underline-offset-8 decoration-sky-500/30">Backoffice</span>
              </CardTitle>
            </div>
            
            <CardDescription className="max-w-[320px] text-lg leading-relaxed text-slate-400 border-none p-0">
              Gerenciamento centralizado e seguro dos dados da Semana da Computação.
            </CardDescription>
          </div>

          <div className="mt-12 flex items-center gap-3 text-sm text-slate-500">
            <div className="h-2 w-2 rounded-full bg-sky-500 animate-pulse" />
            Toda sessão é monitorada visando à segurança e integridade dos dados.
          </div>
        </div>

        {/* Lado Direito: Formulário */}
        <div className="bg-white flex flex-col justify-center">
          <CardHeader className="p-8 pb-0 md:p-12 md:pb-0">
            <CardTitle className="text-2xl font-bold text-slate-900">Bem-vindo de volta</CardTitle>
            <CardDescription className="text-slate-500 mt-1">
              Insira suas credenciais administrativas
            </CardDescription>
          </CardHeader>

          <CardContent className="p-8 md:p-12">
            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-700 ml-1">E-mail</label>
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  placeholder="nome@exemplo.com"
                  className="h-12 rounded-xl text-black/80 border-slate-200 bg-slate-50 px-4 focus-visible:ring-sky-500/30"
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-700 ml-1">Senha</label>
                <Input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  placeholder="••••••••"
                  className="h-12 rounded-xl text-black/80 border-slate-200 bg-slate-50 px-4 focus-visible:ring-sky-500/30"
                />
                <div className="flex justify-end px-1">
                  <a href="#" className="text-xs text-sky-600 hover:underline">Esqueceu a senha?</a>
                </div>
              </div>

              <Button 
                type="submit" 
                className="group relative w-full h-12 overflow-hidden rounded-xl bg-slate-950 font-semibold transition-all hover:bg-sky-600 active:scale-[0.98] text-white"
              >
                <span className="flex items-center gap-2">
                  Acessar Painel
                  <LockKeyhole size={18} className="transition-transform group-hover:translate-x-1" />
                </span>
              </Button>
            </form>

            <p className="mt-8 text-center text-xs text-slate-400">
              &copy; {new Date().getFullYear()} Semcomp - Todos os direitos reservados.
            </p>
          </CardContent>
        </div>
      </Card>

      <Notification
        message={errorMessage}
        type="warning"
        visible={Boolean(errorMessage)}
        onClose={() => setErrorMessage("")}
      />
    </section>
  );
}