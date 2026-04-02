import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { CalendarDays, Users, ArrowRight } from "lucide-react";

export default function HomePage() {
  const { user } = useAuth();
  const navigate = useNavigate();

  const hour = new Date().getHours();
  const greeting = hour < 12 ? "Bom dia" : hour < 18 ? "Boa tarde" : "Boa noite";

  return (
    <section className="mx-auto w-full max-w-7xl px-4 py-8 md:px-6 md:py-10 space-y-8">
      {/* Bem-vindos banner */}
      <div className="relative overflow-hidden rounded-2xl border border-slate-800 bg-linear-to-br from-slate-900 via-slate-900 to-sky-950/40 p-6 md:p-8">
        <div className="absolute top-0 right-0 w-96 h-96 bg-sky-500/8 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-1/3 w-64 h-64 bg-violet-500/5 rounded-full blur-3xl pointer-events-none" />
					<div className="relative">
						<h2 className="text-3xl md:text-4xl font-semibold text-white mb-2">
							{greeting}, {user?.name?.split(" ")[0] ?? "Admin"} 👋
						</h2>
					</div>
						<p className="text-slate-400 text-base w-full text-justify">
							Bem-vindo ao Backoffice da Semcomp! Aqui é o local em que gerenciamos todos os aspectos da organização da Semana da Computação, desde o cadastro de eventos e palestrantes até a gestão de usuários e acesso ao sistema. Explore as seções abaixo para começar a administrar os recursos e garantir uma experiência incrível para todos os participantes!
						</p>
      	</div>
    

      {/* CRUD cards */}
      <div className="grid md:grid-cols-3 gap-4">
        <Card className="border-slate-800 bg-slate-900/50 hover:bg-slate-900 transition-all hover:border-sky-800/50 group cursor-pointer hover:scale-105 duration-1000" onClick={() => navigate('/events')}>
          <CardHeader className="pb-3">
            <div className="w-10 h-10 rounded-xl bg-sky-500/10 flex items-center justify-center text-sky-400 mb-2 group-hover:bg-sky-500/20 transition-colors">
              <CalendarDays className="w-5 h-5" />
            </div>
            <CardTitle className="text-base text-white">Eventos</CardTitle>
            <CardDescription className="text-slate-500 text-sm">Acesse os eventos acadêmicos que compõem a Semana da Computação.</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-1.5 text-sky-400 text-xs font-medium">
              Acessar <ArrowRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-0.5" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-slate-800 bg-slate-900/50 hover:bg-slate-900 transition-all hover:border-violet-800/50 group cursor-pointer hover:scale-105 duration-1000" onClick={() => navigate('/semcompusers')}>
          <CardHeader className="pb-3">
            <div className="w-10 h-10 rounded-xl bg-violet-500/10 flex items-center justify-center text-violet-400 mb-2 group-hover:bg-violet-500/20 transition-colors">
              <Users className="w-5 h-5" />
            </div>
            <CardTitle className="text-base text-white">Usuários da Semcomp</CardTitle>
            <CardDescription className="text-slate-500 text-sm">Acesse e gerencie os paricipantes da Semana da Computação.</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-1.5 text-violet-400 text-xs font-medium">
              Acessar <ArrowRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-0.5" />
            </div>
          </CardContent>
        </Card>

				<Card className="border-slate-800 bg-slate-900/50 hover:bg-slate-900 transition-all hover:border-violet-800/50 group cursor-pointer hover:scale-105 duration-1000" onClick={() => navigate('/backofficeusers')}>
					<CardHeader className="pb-3">
            <div className="w-10 h-10 rounded-xl bg-violet-500/10 flex items-center justify-center text-cyan-400 mb-2 group-hover:bg-violet-500/20 transition-colors">
              <Users className="w-5 h-5" />
            </div>
            <CardTitle className="text-base text-white">Usuários do Backoffice</CardTitle>
            <CardDescription className="text-slate-500 text-sm">Gerencie perfis, permissões e controle de acesso ao sistema de administração do Backoffice.</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-1.5 text-cyan-400 text-xs font-medium">
              Acessar <ArrowRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-0.5" />
            </div>
          </CardContent>
				</Card>

      </div>
    </section>
  );
}