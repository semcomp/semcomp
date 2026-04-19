
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft, UserCog } from "lucide-react";
import { Tabs } from "@/constants/Tabs";
import { useNavigate } from "react-router-dom";

const sections = Tabs.map(tab => ({
  nomeSecao: tab.label,
  descricao: tab.description,
}));

export default function Sections() {

  const navigate = useNavigate();

  return (
    <section className="mx-auto w-full max-w-3xl px-4 py-8 md:px-6 md:py-10">
      <Card className="border-slate-800 bg-linear-to-br from-slate-900 via-slate-900 to-violet-950/30 overflow-hidden relative mb-5">
        <div className="absolute top-0 right-0 w-72 h-72 bg-violet-500/5 rounded-full blur-3xl pointer-events-none" />
        <CardHeader className="pb-4">
          <div className="flex items-center gap-2 mb-2">
            <UserCog className="w-4 h-4 text-violet-400" />
            <p className="text-xs uppercase tracking-[0.3em] text-violet-400 font-medium">Seções do Backoffice</p>
          </div>
          <CardTitle className="text-2xl md:text-3xl text-white font-semibold">
            Descubra as Seções do Backoffice
          </CardTitle>
          <CardDescription className="text-slate-400 mt-1">
           Veja as seções do backoffice, cada uma dedicada a um aspecto essencial da gestão da Semana da Computação, para facilitar a administração e controle de usuários, eventos, participações e permissões.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap items-center gap-3">
            <Button
              variant="ghost"
              size="sm"
              className="rounded-xl text-slate-400 hover:text-slate-200 hover:bg-slate-800 gap-2 px-3"
              onClick={() => navigate('/home')}
            >
              <ArrowLeft className="w-4 h-4" />
              Voltar
            </Button>
      
          </div>
        </CardContent>
      </Card>
      <Card className="border-slate-800 bg-linear-to-br from-slate-900 via-slate-900 to-sky-950/50  overflow-hidden relative">
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