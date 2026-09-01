import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { BannerCard } from "@/components/BannerCard";
import { Tabs } from "@/constants/Tabs";
import { Coffee, Presentation, ShoppingBag } from "lucide-react";
import { dashboardAPI } from "@/api/dashboard";
import type { DashboardResponse } from "@/api/dashboard";
import OverviewCard from "./components/OverviewCard";
import KitsCard from "./components/KitsCard";

const PlaceholderSections = [
  {
    key: "coffees",
    title: "Coffes vendidos",
    description: "Quantidade total de coffes vendidos.",
    icon: <Coffee className="w-5 h-5" />,
  },
  {
    key: "presence",
    title: "Presença em palestras",
    description: "Comparativo de presença entre as palestras.",
    icon: <Presentation className="w-5 h-5" />,
  },
  {
    key: "products",
    title: "Compras e produtos",
    description: "Quantidade, faturamento e ranking de itens vendidos.",
    icon: <ShoppingBag className="w-5 h-5" />,
  },
];

export default function DashboardPage() {
  const navigate = useNavigate();

  const [data, setData] = useState<DashboardResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    const fetchDashboard = async () => {
      try {
        setLoading(true);
        setError(null);
        const response = await dashboardAPI.get();
        if (!cancelled) setData(response);
      } catch {
        if (!cancelled) setError("Erro ao carregar os dados do dashboard");
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    fetchDashboard();

    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <section className="mx-auto w-full max-w-7xl px-4 py-8 md:px-6 md:py-10 space-y-8">
      <BannerCard
        icon={Tabs.find((t) => t.key === "dashboard")?.icon}
        iconClassName="text-sky-400"
        label="Dados"
        title="Dashboard de Dados"
        description="Métricas e dados da Semcomp em uma só tela, agrupados por tema."
        onBack={() => navigate("/home")}
        cardClassName="border-slate-800 bg-linear-to-br from-slate-900 via-slate-900 to-sky-950/40 overflow-hidden relative"
        labelClassName="text-xs uppercase tracking-[0.3em] text-sky-400 font-medium"
        titleClassName="text-2xl md:text-3xl text-white font-semibold"
        descriptionClassName="text-slate-400 mt-1"
      />

      {error && (
        <div className="rounded-lg bg-red-900/20 border border-red-700 p-4 text-red-200">{error}</div>
      )}

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        <OverviewCard data={data?.users} loading={loading && !data} />
        <KitsCard data={data?.kits} loading={loading && !data} />

        {PlaceholderSections.map((section) => (
          <Card
            key={section.key}
            className="border-border bg-card/80 rounded-2xl transition-colors hover:border-primary/40"
          >
            <CardHeader>
              <div className="mb-1 flex items-center gap-2">
                <span className="rounded-lg bg-primary/15 p-2 text-primary">{section.icon}</span>
                <CardTitle>{section.title}</CardTitle>
              </div>
              <CardDescription>{section.description}</CardDescription>
            </CardHeader>
          </Card>
        ))}
      </div>
    </section>
  );
}