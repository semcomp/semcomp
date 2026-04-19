import { CrudTable } from "@/components/CrudTable";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft, UserCog } from "lucide-react";
import type { ParticipationType } from "@/types/ParticipationType";
import { sampleParticipations } from "@/mock/participation";
import { fields } from "@/data/participationCrudField";
import type { CrudItemType } from "@/types/CrudItem";


export default function ParticipationCRUD() {
  const navigate = useNavigate();
  const [data, setData] = useState<ParticipationType[]>(sampleParticipations);

  const handleEdit = (item: CrudItemType) => {
    const participation = item as ParticipationType;
    setData(prev => prev.map(i => i.nameEvent === participation.nameEvent && i.nameUser === participation.nameUser ? participation : i));
  };
  const handleDelete = (id: string) => setData(prev => prev.filter(i => i.id !== id));
  const handleCreate = (item: CrudItemType) => setData(prev => [...prev, { ...(item as ParticipationType) }]);

  return (
    <section className="mx-auto w-full max-w-7xl px-4 py-8 md:px-6 md:py-10 space-y-6 overflow-x-auto scrollbar-hide">
      {/* Header card situando a página */}
      <Card className="border-slate-800 bg-linear-to-br from-slate-900 via-slate-900 to-violet-950/30 overflow-hidden relative">
        <div className="absolute top-0 right-0 w-72 h-72 bg-violet-500/5 rounded-full blur-3xl pointer-events-none" />
        <CardHeader className="pb-4">
          <div className="flex items-center gap-2 mb-2">
            <UserCog className="w-4 h-4 text-violet-400" />
            <p className="text-xs uppercase tracking-[0.3em] text-violet-400 font-medium">Participações</p>
          </div>
          <CardTitle className="text-2xl md:text-3xl text-white font-semibold">
            Gestão de Participações em Eventos da Semcomp
          </CardTitle>
          <CardDescription className="text-slate-400 mt-1">
            Cadastre e busque participações em eventos, acesse e edite informações, mantenha controle sobre as participações da Semana da Computação.
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

      {/* Tabela de participações */}
      <div className="rounded-xl border border-slate-800 bg-slate-900/80 p-5">
        <CrudTable
          data={data}
          fields={fields}
          onEdit={handleEdit}
          onDelete={handleDelete}
          onCreate={handleCreate}
          entityLabel="participação"
        />
      </div>
    </section>
  );
}