import { CrudTable, type CrudField } from "@/components/CrudTable";
import type { CrudItemType } from "@/types/CrudItem";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft, UserCog } from "lucide-react";

interface UserItem extends CrudItemType {
  email: string;
}

const sampleUsers: UserItem[] = [
  { id:"1", name: "Ana Beatriz Santos", email: "ana@gmail.com" },
  { id:"2", name: "Carlos Eduardo Lima", email: "carlos@gmail.com" },
  { id:"3", name: "Fernanda Oliveira", email: "fernanda@gmail.com" },
  { id:"4", name: "Gabriel Costa", email: "gabriel@gmail.com" },
  { id:"5", name: "Helena Martins", email: "helena@gmail.com" },
  { id:"6", name: "Igor Ferreira", email: "igor@gmail.com" },
  { id: "7", name: "Juliana Ramos", email: "juliana@gmail.com" },
  { id: "8", name: "Lucas Almeida", email: "lucas@gmail.com" },
  { id: "9", name: "Marina Pereira", email: "marina@gmail.com" },
  { id: "10", name: "Nicolas Barbosa", email: "nicolas@gmail.com" },
  { id: "11", name: "Olívia Souza", email: "olivia@gmail.com" },
  { id: "12", name: "Pedro Henrique Nunes", email: "pedro@gmail.com" },
];

const fields: CrudField[] = [
  { value: "name", label: "Nome", type: "text" },
  { value: "email", label: "E-mail", type: "text" },
  { value: "cargo", label: "Cargo", type: "text" },
  { value: "departamento", label: "Departamento", type: "badge", badgeVariants: {
    "TI": "bg-blue-500/20 text-blue-300 border border-blue-500/30",
    "Eventos": "bg-emerald-500/20 text-emerald-300 border border-emerald-500/30",
    "Marketing": "bg-pink-500/20 text-pink-300 border border-pink-500/30",
    "Financeiro": "bg-amber-500/20 text-amber-300 border border-amber-500/30",
    "Diretoria": "bg-violet-500/20 text-violet-300 border border-violet-500/30",
    "Comunicação": "bg-cyan-500/20 text-cyan-300 border border-cyan-500/30",
    "Operações": "bg-orange-500/20 text-orange-300 border border-orange-500/30",
  }},
  { value: "permissao", label: "Permissão", type: "badge", badgeVariants: {
    "Admin": "bg-rose-500/20 text-rose-300 border border-rose-500/30",
    "Moderador": "bg-violet-500/20 text-violet-300 border border-violet-500/30",
    "Editor": "bg-sky-500/20 text-sky-300 border border-sky-500/30",
    "Visualizador": "bg-slate-500/20 text-slate-300 border border-slate-500/30",
  }},
  { value: "status", label: "Status", type: "badge", badgeVariants: {
    "Ativo": "bg-emerald-500/20 text-emerald-300 border border-emerald-500/30",
    "Inativo": "bg-slate-600/40 text-slate-400 border border-slate-600/30",
  }},
];

export default function UsersCRUD() {
  const navigate = useNavigate();
  const [data, setData] = useState<CrudItemType[]>(sampleUsers);

  // TODO: Integrar com backend para persistência real dos dados no BD
  const handleEdit = (item: CrudItemType) => {
    setData(prev => prev.map(i => i.id === item.id ? item : i));
  };
  const handleDelete = (id: string) => setData(prev => prev.filter(i => i.id !== id));
  const handleCreate = (item: CrudItemType) => setData(prev => [...prev, { ...item, id: String(Date.now()) }]);


  return (
    <section className="mx-auto w-full max-w-7xl px-4 py-8 md:px-6 md:py-10 space-y-6 overflow-x-auto scrollbar-hide">
      {/* Header card situando a página */}
      <Card className="border-slate-800 bg-linear-to-br from-slate-900 via-slate-900 to-violet-950/30 overflow-hidden relative">
        <div className="absolute top-0 right-0 w-72 h-72 bg-violet-500/5 rounded-full blur-3xl pointer-events-none" />
        <CardHeader className="pb-4">
          <div className="flex items-center gap-2 mb-2">
            <UserCog className="w-4 h-4 text-violet-400" />
            <p className="text-xs uppercase tracking-[0.3em] text-violet-400 font-medium">Usuários</p>
          </div>
          <CardTitle className="text-2xl md:text-3xl text-white font-semibold">
            Gestão de Usuários para Acesso ao Backoffice da Semcomp
          </CardTitle>
          <CardDescription className="text-slate-400 mt-1">
            Cadastre e busque usuários do Backoffice, acesse e edite informações, mantenha controle sobre quem possui acesso ao painel Backoffice da Semana da Computação.
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

      {/* Tabela com os usuários do Backoffice */}
      <div className="rounded-xl border border-slate-800 bg-slate-900/80 p-5">
        <CrudTable
          data={data}
          fields={fields}
          onEdit={handleEdit}
          onDelete={handleDelete}
          onCreate={handleCreate}
          entityLabel="usuário"
        />
      </div>
    </section>
  );
}