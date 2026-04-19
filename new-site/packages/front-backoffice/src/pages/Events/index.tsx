import { CrudTable, type CrudField } from "@/components/CrudTable";
import type { CrudItemType } from "@/types/CrudItem";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { CalendarDays, ArrowLeft } from "lucide-react";
import { sampleEvents } from "@/mock/events";
import { fields } from "@/data/eventsCrudField";

export default function Events() {
  const navigate = useNavigate();
  const [data, setData] = useState<CrudItemType[]>(sampleEvents);

  const handleEdit = (item: CrudItemType) => {
    setData(prev => prev.map(i => i.id === item.id ? item : i));
  };
  const handleDelete = (id: string) => setData(data => data.filter(i => i.id !== id));
  const handleCreate = (item: CrudItemType) => setData(data => [...data, { ...item, id: String(Date.now()) }]);


  return (
    <section className="mx-auto w-full max-w-7xl px-4 py-8 md:px-6 md:py-10 space-y-6">
      {/* Header card situando a página em que está */}
      <Card className="border-slate-800 bg-linear-to-br from-slate-900 via-slate-900 to-sky-950/50 overflow-hidden relative">
        <div className="absolute top-0 right-0 w-72 h-72 bg-sky-500/5 rounded-full blur-3xl pointer-events-none" />
        <CardHeader className="pb-4">
          <div className="flex items-center gap-2 mb-2">
            <CalendarDays className="w-4 h-4 text-sky-400" />
            <p className="text-xs uppercase tracking-[0.3em] text-sky-400 font-medium">Eventos</p>
          </div>
          <CardTitle className="text-2xl md:text-3xl text-white font-semibold">
            Gerenciamento de Eventos
          </CardTitle>
          <CardDescription className="text-slate-400 mt-1">
            Cadastre, busque, edite e remova palestras, oficinas, workshops e cronograma da Semcomp.
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

      {/* Tabela de Eventos */}
      <div className="rounded-xl border border-slate-800 bg-slate-900/80 p-5">
        <CrudTable
          data={data}
          fields={fields}
          onEdit={handleEdit}
          onDelete={handleDelete}
          onCreate={handleCreate}
          entityLabel="evento"
        />
      </div>
    </section>
  );
}