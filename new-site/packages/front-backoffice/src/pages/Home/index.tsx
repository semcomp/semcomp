import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Card } from "@/components/ui/card";
import { BannerCard } from "@/components/BannerCard";
import { ArrowRight } from "lucide-react";
import { Tabs } from "@/constants/Tabs";

export default function HomePage() {
  const { user, permissions } = useAuth();
  const navigate = useNavigate();

  const hour = new Date().getHours();
  const greeting = hour < 12 ? "Bom dia" : hour < 18 ? "Boa tarde" : "Boa noite";

  const visibleTabs = Tabs.filter(tab =>
    permissions.some(p => p.section_name === tab.section && p.permission_type !== null)
  );

  return (
    <section className="mx-auto w-full max-w-7xl px-4 py-8 md:px-6 md:py-10 space-y-8">
      <BannerCard
        label="Painel"
        title={`${greeting}, ${user?.name?.split(" ")[0] ?? "Admin"} 👋`}
        description="Bem-vindo(a) ao Backoffice da Semcomp! Aqui é o local em que gerenciamos todos os aspectos da organização da Semana da Computação, desde o cadastro de eventos e palestrantes até a gestão de usuários e acesso ao sistema. Explore as seções abaixo para começar a administrar os recursos e garantir uma experiência incrível para todos os participantes!"
        cardClassName="rounded-2xl border-border bg-card p-6 md:p-8 text-justify"
      />

      {visibleTabs.length === 0 ? (
        <p className="text-center text-muted-foreground py-12">
          Você não possui permissão de acesso a nenhuma seção. Contate um administrador.
        </p>
      ) : (
        <div className="grid md:grid-cols-3 gap-4">
          {visibleTabs.map((item, index) => {
            const Icon: React.ReactNode = item.icon;
            return (
              <Card
                key={index}
                className="group cursor-pointer border-border transition-all duration-300 hover:-translate-y-1 hover:shadow-lg focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none overflow-hidden rounded-2xl"
                onClick={() => navigate(item.pageNavigate)}
                tabIndex={0}
                role="link"
                aria-label={`Acessar ${item.label}`}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") {
                    e.preventDefault();
                    navigate(item.pageNavigate);
                  }
                }}
              >
                <div className="px-5 pt-5 pb-3">
                  <div
                    className={`mb-3 flex h-12 w-12 items-center justify-center rounded-xl ${item.bg} text-primary transition-colors group-hover:${item.hoverBg} shadow-sm`}
                    aria-hidden="true"
                  >
                    {Icon}
                  </div>
                  <h3 className="text-base font-semibold text-foreground mb-1">{item.label}</h3>
                  <p className="text-sm text-muted-foreground max-w-full">{item.description}</p>
                </div>
                <div className="px-5 pb-5">
                  <div className="flex items-center gap-1.5 text-xs font-medium text-primary" aria-hidden="true">
                    Acessar <ArrowRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-1" />
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      )}
    </section>
  );
}
