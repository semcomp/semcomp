import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs } from "@/constants/Tabs";
import { useNavigate } from "react-router-dom";
import { BannerCard } from "@/components/BannerCard";

const sections = Tabs.map(tab => ({
  nomeSecao: tab.label,
  descricao: tab.description,
}));

export default function Sections() {

  const navigate = useNavigate();

  return (
    <section className="mx-auto w-full max-w-3xl px-4 py-8 md:px-6 md:py-10">

      <BannerCard
        icon={Tabs.find(tab => tab.key === "sections")?.icon}
        iconClassName="text-violet-400"
        label="Seções"
        title="Explore as Seções do Backoffice"
        description="Descubra as seções do backoffice, cada uma dedicada a um aspecto essencial da gestão da Semana da Computação, para facilitar a administração e controle de usuários, eventos, participações e permissões."
        onBack={() => navigate('/home')}
        cardClassName="border-slate-800 bg-linear-to-br from-slate-900 via-slate-900 to-violet-950/30 overflow-hidden relative"
        labelClassName="text-xs uppercase tracking-[0.3em] text-violet-400 font-medium"
        titleClassName="text-2xl md:text-3xl text-white font-semibold"
        descriptionClassName="text-slate-400 mt-1"
      ></BannerCard>
     
      <Card className="border-slate-800 mt-6 bg-linear-to-br from-slate-900 via-slate-900 to-sky-950/50  overflow-hidden relative">
        <CardHeader>
          <CardTitle className="text-2xl md:text-3xl text-white font-semibold">Seções do Backoffice</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="min-w-full border-separate border-spacing-y-2">
              <thead>
                <tr>
                  <th className="text-left text-slate-400 text-xs font-semibold uppercase tracking-wider px-4 py-2">Nome da Seção</th>
                  <th className="text-left text-slate-400 text-xs font-semibold uppercase tracking-wider px-4 py-2">Descrição</th>
                </tr>
              </thead>
              <tbody>
                {sections.map((sec, idx) => (
                  <tr key={idx} className="bg-slate-900/70 hover:bg-slate-800/60 transition-colors">
                    <td className="px-4 py-3 text-white font-medium">{sec.nomeSecao}</td>
                    <td className="px-4 py-3 text-slate-300">{sec.descricao}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </section>
  );
}