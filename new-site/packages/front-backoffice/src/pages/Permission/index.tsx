import { useCallback, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Pencil } from "lucide-react";
import { BannerCard } from "@/components/BannerCard";
import { Notification } from "@/components/Notification";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tabs } from "@/constants/Tabs";
import { permissionsAPI } from "@/api";
import type { BackofficePermission } from "@/types/APIResponseType";
import { useAuth } from "@/contexts/AuthContext";

// Keep in sync with backend/internal/permission/model.go (KnownSections)
const SECTIONS: { key: string; label: string }[] = [
  { key: "Eventos",             label: "Eventos" },
  { key: "Usuários Backoffice", label: "Usuários Backoffice" },
  { key: "Usuários Semcomp",    label: "Usuários Semcomp" },
  { key: "Participações",       label: "Participações" },
  { key: "Permissões",          label: "Permissões" },
  { key: "Páginas",             label: "Páginas" },
  { key: "Patrocinadores",       label: "Patrocinadores" },
];

type PermLevel = "R" | "RW" | "—";

const LEVEL_BADGE: Record<PermLevel, { label: string; cls: string }> = {
  RW:  { label: "RW", cls: "bg-emerald-700/80 text-white border-emerald-600" },
  R:   { label: "R",  cls: "bg-blue-700/80 text-white border-blue-600" },
  "—": { label: "—",  cls: "bg-muted/50 text-muted-foreground border-border" },
};

interface UserRow {
  email: string;
  perms: BackofficePermission[];
}

function levelOf(perms: BackofficePermission[], section: string): PermLevel {
  const found = perms.find(p => p.section_name === section);
  if (!found || !found.permission_type) return "—";
  return found.permission_type as PermLevel;
}

export default function PermissionsCRUD() {
  const navigate = useNavigate();
  const { user, refreshPermissions } = useAuth();
  const [rows, setRows] = useState<UserRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [editTarget, setEditTarget] = useState<UserRow | null>(null);
  const [editLevels, setEditLevels] = useState<Record<string, PermLevel>>({});
  const [saving, setSaving] = useState(false);
  const [notification, setNotification] = useState<{ message: string; type: "success" | "warning" }>({
    message: "",
    type: "success",
  });

  const notify = (message: string, type: "success" | "warning" = "success") =>
    setNotification({ message, type });

  const fetchAll = useCallback(async () => {
    try {
      setLoading(true);
      const perms = await permissionsAPI.getAll();

      const permsByEmail = new Map<string, BackofficePermission[]>();
      for (const p of perms) {
        const list = permsByEmail.get(p.user_email) ?? [];
        list.push(p);
        permsByEmail.set(p.user_email, list);
      }

      setRows([...permsByEmail.entries()].map(([email, userPerms]) => ({ email, perms: userPerms })));
    } catch {
      notify("Erro ao carregar permissões.", "warning");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchAll(); }, [fetchAll]);

  const openEdit = (row: UserRow) => {
    const levels: Record<string, PermLevel> = {};
    SECTIONS.forEach(({ key }) => { levels[key] = levelOf(row.perms, key); });
    setEditLevels(levels);
    setEditTarget(row);
  };

  const handleSave = async () => {
    if (!editTarget) return;
    setSaving(true);
    try {
      await Promise.all(
        SECTIONS.map(async ({ key }) => {
          const oldLevel = levelOf(editTarget.perms, key);
          const newLevel = editLevels[key] ?? "—";
          if (oldLevel === newLevel) return;

          await permissionsAPI.update(
            editTarget.email, key,
            editTarget.email, key,
            newLevel === "—" ? null : newLevel,
          );
        })
      );

      await fetchAll();
      if (editTarget.email === user?.email) {
        await refreshPermissions();
      }
      notify("Permissões atualizadas com sucesso!");
    } catch (err: any) {
      const message =
        err?.response?.data?.error ||
        err?.message ||
        "Erro ao salvar permissões.";
      notify(message, "warning");

    } finally {
      setSaving(false);
      setEditTarget(null);
    }
  };

  return (
    <section className="mx-auto w-full max-w-7xl px-4 py-8 md:px-6 md:py-10 space-y-6 overflow-x-auto scrollbar-hide">
      <BannerCard
        icon={Tabs.find(tab => tab.key === "permissions")?.icon}
        iconClassName="text-violet-400"
        label="Permissões"
        title="Gestão de Permissões de Acesso ao Backoffice"
        description="Defina o nível de acesso de cada usuário por seção. R = somente leitura, RW = leitura e escrita, — = sem acesso."
        onBack={() => navigate("/home")}
        cardClassName="border-slate-800 bg-linear-to-br from-slate-900 via-slate-900 to-violet-950/30 overflow-hidden relative"
        labelClassName="text-xs uppercase tracking-[0.3em] text-violet-400 font-medium"
        titleClassName="text-2xl md:text-3xl text-white font-semibold"
        descriptionClassName="text-slate-400 mt-1"
      />

      <div className="rounded-xl border border-border bg-card/80 p-5 overflow-x-auto">
        {loading ? (
          <p className="py-12 text-center text-muted-foreground">Carregando permissões…</p>
        ) : rows.length === 0 ? (
          <p className="py-12 text-center text-muted-foreground">Nenhum usuário encontrado.</p>
        ) : (
          <Table>
            <TableHeader>
              <TableRow className="border-border bg-muted/30 hover:bg-muted/30">
                <TableHead className="text-muted-foreground text-xs font-semibold uppercase tracking-wider">
                  Usuário
                </TableHead>
                {SECTIONS.map(({ key, label }) => (
                  <TableHead
                    key={key}
                    className="text-muted-foreground text-xs font-semibold uppercase tracking-wider whitespace-nowrap"
                  >
                    {label}
                  </TableHead>
                ))}
                <TableHead className="text-muted-foreground text-xs font-semibold uppercase tracking-wider w-20">
                  Ações
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {rows.map((row, i) => (
                <TableRow
                  key={row.email}
                  className={`border-border transition-colors hover:bg-muted/20 ${i % 2 === 0 ? "bg-transparent" : "bg-muted/10"}`}
                >
                  <TableCell className="py-3 font-medium text-foreground whitespace-nowrap">
                    {row.email}
                  </TableCell>
                  {SECTIONS.map(({ key }) => {
                    const level = levelOf(row.perms, key);
                    const { label, cls } = LEVEL_BADGE[level];
                    return (
                      <TableCell key={key} className="py-3">
                        <Badge className={`text-xs font-semibold px-2 py-0.5 border ${cls}`}>
                          {label}
                        </Badge>
                      </TableCell>
                    );
                  })}
                  <TableCell className="py-3">
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => openEdit(row)}
                      className="h-8 w-8 p-0 text-muted-foreground hover:text-primary hover:bg-primary/10 rounded-lg"
                      title="Editar permissões"
                    >
                      <Pencil className="w-3.5 h-3.5" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </div>

      <Dialog open={editTarget !== null} onOpenChange={() => setEditTarget(null)}>
        <DialogContent className="bg-card border-border text-foreground w-[95vw] sm:max-w-106.25 rounded-lg shadow-lg">
          <DialogHeader>
            <DialogTitle className="text-foreground">
              Permissões — {editTarget?.email ?? ""}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-3 py-2">
            {SECTIONS.map(({ key, label }) => (
              <div key={key} className="flex items-center justify-between gap-3">
                <label className="text-sm font-medium text-foreground shrink-0">{label}</label>
                <Select
                  value={editLevels[key] ?? "—"}
                  onValueChange={v => setEditLevels(prev => ({ ...prev, [key]: v as PermLevel }))}
                >
                  <SelectTrigger className="w-48 shrink-0 bg-muted/40 border-muted/30 text-foreground">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-white border-muted/30 shadow-md">
                    <SelectItem value="—" className="text-primary cursor-pointer">
                      Sem acesso (—)
                    </SelectItem>
                    <SelectItem value="R" className="text-primary cursor-pointer">
                      Leitura (R)
                    </SelectItem>
                    <SelectItem value="RW" className="text-primary cursor-pointer">
                      Leitura e Escrita (RW)
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>
            ))}
          </div>
          <DialogFooter className="gap-2">
            <Button variant="ghost" onClick={() => setEditTarget(null)} className="text-muted-foreground">
              Cancelar
            </Button>
            <Button
              className="bg-primary hover:bg-primary/90"
              onClick={handleSave}
              disabled={saving}
            >
              {saving ? "Salvando…" : "Salvar alterações"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Notification
        message={notification.message}
        type={notification.type}
        visible={Boolean(notification.message)}
        onClose={() => setNotification(n => ({ ...n, message: "" }))}
      />
    </section>
  );
}
