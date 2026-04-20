import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Card } from "@/components/ui/card";
import { ArrowRight } from "lucide-react";
import { Tabs } from "@/constants/Tabs";

export default function HomePage() {
  const { user } = useAuth();
  const navigate = useNavigate();

  const hour = new Date().getHours();
  const greeting = hour < 12 ? "Bom dia" : hour < 18 ? "Boa tarde" : "Boa noite";

  return (
    <section className="mx-auto w-full max-w-7xl px-4 py-8 md:px-6 md:py-10 space-y-8">
      {/* Bem-vindos banner */}
      <div className="relative overflow-hidden rounded-2xl border border-app bg-linear-to-br from-slate-900 via-slate-900 to-sky-950/60 p-6 md:p-8 card-surface">
        <div className="absolute top-0 right-0 w-96 h-96 bg-[color-mix(in_oklab,var(--sc-primary)_10%,transparent)] rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-1/3 w-64 h-64 bg-[color-mix(in_oklab,var(--sc-accent)_6%,transparent)] rounded-full blur-3xl pointer-events-none" />
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
      {Tabs.map((item, index) => {
        const Icon: React.ReactNode = item.icon;
        return (
          <Card
            key={index}
            className={`group cursor-pointer border-(--border) transition-all duration-300 hover:-translate-y-0.5 hover:border-[color-mix(in_oklab,var(--primary)_45%,transparent)] focus-visible:ring-2 focus-visible:ring-(--primary) focus-visible:outline-none`}
            onClick={() => navigate(item.pageNavigate)}
            
            // --- ACESSIBILIDADE ---
            tabIndex={0} // Permite focar com a tecla Tab
            role="link" // Indica que o card age como um link de navegação
            aria-label={`Acessar ${item.label}`} // Melhora a leitura para cegos
            onKeyDown={(e) => {
              if (e.key === "Enter" || e.key === " ") {
                e.preventDefault();
                navigate(item.pageNavigate);
              }
            }}
          >
            <div className="px-5 pt-5 pb-3">
              <div className={`mb-2 flex h-10 w-10 items-center justify-center rounded-xl ${item.bg} text-primary transition-colors group-hover:${item.hoverBg}`} aria-hidden="true">
                {Icon}
              </div>
              <h3 className="text-base font-semibold text-app">{item.label}</h3>
              <p className="text-sm muted">{item.description}</p>
            </div>
            <div className="px-5 pb-5">
              <div className={`flex items-center gap-1.5 text-xs font-medium text-primary`} aria-hidden="true">
                Acessar <ArrowRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-0.5" />
              </div>
            </div>
          </Card>
        );
      })}
    </div>
    </section>
  );
}