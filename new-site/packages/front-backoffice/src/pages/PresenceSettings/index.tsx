import { useCallback, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Pencil, Plus, Save, Trash2, X } from "lucide-react";
import { BannerCard } from "@/components/BannerCard";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Notification } from "@/components/Notification";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tabs } from "@/constants/Tabs";
import { presenceSettingsAPI, type PresenceTypeWeight } from "@/api/presenceSettings";
import { useHasPermission } from "@/contexts/AuthContext";

type NotificationType = "success" | "warning";

export default function PresenceSettings() {
  const navigate = useNavigate();
  const canWrite = useHasPermission("Configurações Presença", "RW");
  const [rows, setRows] = useState<PresenceTypeWeight[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingKey, setEditingKey] = useState<string | null>(null);
  const [editTypeName, setEditTypeName] = useState("");
  const [editWeight, setEditWeight] = useState("");
  const [newTypeName, setNewTypeName] = useState("");
  const [newWeight, setNewWeight] = useState("1");
  const [busy, setBusy] = useState(false);
  const [notification, setNotification] = useState<{ message: string; type: NotificationType }>({
    message: "",
    type: "success",
  });

  const notify = (message: string, type: NotificationType = "success") =>
    setNotification({ message, type });

  const fetchAll = useCallback(async () => {
    try {
      setLoading(true);
      setRows(await presenceSettingsAPI.getAll());
    } catch {
      notify("Erro ao carregar pesos de presença.", "warning");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAll();
  }, [fetchAll]);

  const parseWeight = (value: string): number | null => {
    const parsed = Number(value.replace(",", "."));
    if (!Number.isFinite(parsed) || parsed < 0) return null;
    return parsed;
  };

  const handleCreate = async () => {
    const weight = parseWeight(newWeight);
    if (!newTypeName.trim() || weight === null) {
      notify("Informe um tipo válido e um peso numérico não negativo.", "warning");
      return;
    }
    setBusy(true);
    try {
      await presenceSettingsAPI.create(newTypeName.trim(), weight);
      setNewTypeName("");
      setNewWeight("1");
      await fetchAll();
      notify("Peso criado com sucesso! Presenças recalculadas automaticamente.");
    } catch (err: any) {
      notify(err?.response?.data?.error || err?.response?.data?.message || "Erro ao criar peso de presença.", "warning");
    } finally {
      setBusy(false);
    }
  };

  const startEditing = (row: PresenceTypeWeight) => {
    setEditingKey(row.type_name);
    setEditTypeName(row.type_name);
    setEditWeight(String(row.weight));
  };

  const cancelEditing = () => {
    setEditingKey(null);
    setEditTypeName("");
    setEditWeight("");
  };

  const handleUpdate = async () => {
    if (!editingKey) return;
    const weight = parseWeight(editWeight);
    if (!editTypeName.trim() || weight === null) {
      notify("Informe um tipo válido e um peso numérico não negativo.", "warning");
      return;
    }
    setBusy(true);
    try {
      await presenceSettingsAPI.update(editingKey, editTypeName.trim(), weight);
      cancelEditing();
      await fetchAll();
      notify("Peso atualizado com sucesso! Presenças recalculadas automaticamente.");
    } catch (err: any) {
      notify(err?.response?.data?.error || err?.response?.data?.message || "Erro ao atualizar peso de presença.", "warning");
    } finally {
      setBusy(false);
    }
  };

  const handleDelete = async (row: PresenceTypeWeight) => {
    setBusy(true);
    try {
      await presenceSettingsAPI.delete(row.type_name);
      await fetchAll();
      notify(`Peso do tipo "${row.type_name}" removido. Eventos desse tipo passam a valer 0.`);
    } catch (err: any) {
      notify(err?.response?.data?.error || err?.response?.data?.message || "Erro ao remover peso de presença.", "warning");
    } finally {
      setBusy(false);
    }
  };

  return (
    <section className="mx-auto w-full max-w-7xl px-4 py-8 md:px-6 md:py-10 space-y-6 overflow-x-auto scrollbar-hide">
      <BannerCard
        icon={Tabs.find(tab => tab.key === "presence-settings")?.icon}
        iconClassName="text-violet-400"
        label="Configurações Presença"
        title="Pesos de Presença por Tipo de Evento"
        description="Defina quanto vale a presença em cada tipo de evento. Palestra e vitrine entram na porcentagem; eventos concomitantes a eles herdam seus valores."
        onBack={() => navigate("/home")}
        cardClassName="border-slate-800 bg-linear-to-br from-slate-900 via-slate-900 to-violet-950/30 overflow-hidden relative"
        labelClassName="text-xs uppercase tracking-[0.3em] text-violet-400 font-medium"
        titleClassName="text-2xl md:text-3xl text-white font-semibold"
        descriptionClassName="text-slate-400 mt-1"
      />

      <div className="rounded-xl border border-border bg-card/80 p-5 space-y-5">
        {canWrite && (
          <div className="flex flex-wrap items-end gap-3">
            <div className="flex flex-col gap-1">
              <span className="text-muted-foreground text-xs font-semibold uppercase tracking-wider">Tipo do evento</span>
              <Input
                value={newTypeName}
                onChange={e => setNewTypeName(e.target.value)}
                placeholder="Ex.: Minicurso"
                className="w-56"
              />
            </div>
            <div className="flex flex-col gap-1">
              <span className="text-muted-foreground text-xs font-semibold uppercase tracking-wider">Peso</span>
              <Input
                value={newWeight}
                onChange={e => setNewWeight(e.target.value)}
                inputMode="decimal"
                className="w-24"
              />
            </div>
            <Button onClick={handleCreate} disabled={busy} className="gap-2">
              <Plus className="w-4 h-4" /> Adicionar
            </Button>
          </div>
        )}

        {loading ? (
          <p className="py-12 text-center text-muted-foreground">Carregando configurações…</p>
        ) : rows.length === 0 ? (
          <p className="py-12 text-center text-muted-foreground">Nenhum tipo configurado.</p>
        ) : (
          <Table>
            <TableHeader>
              <TableRow className="border-border bg-muted/30 hover:bg-muted/30">
                <TableHead className="text-muted-foreground text-xs font-semibold uppercase tracking-wider">
                  Tipo do evento
                </TableHead>
                <TableHead className="text-muted-foreground text-xs font-semibold uppercase tracking-wider w-32">
                  Peso
                </TableHead>
                {canWrite && (
                  <TableHead className="text-muted-foreground text-xs font-semibold uppercase tracking-wider w-40 text-right">
                    Ações
                  </TableHead>
                )}
              </TableRow>
            </TableHeader>
            <TableBody>
              {rows.map((row, i) => {
                const isEditing = editingKey === row.type_name;
                return (
                  <TableRow
                    key={row.type_name}
                    className={`border-border transition-colors hover:bg-muted/20 ${i % 2 === 0 ? "bg-transparent" : "bg-muted/10"}`}
                  >
                    <TableCell className="py-3 font-medium text-foreground whitespace-nowrap">
                      {isEditing ? (
                        <Input value={editTypeName} onChange={e => setEditTypeName(e.target.value)} className="w-56" />
                      ) : (
                        row.type_name
                      )}
                    </TableCell>
                    <TableCell className="py-3">
                      {isEditing ? (
                        <Input
                          value={editWeight}
                          onChange={e => setEditWeight(e.target.value)}
                          inputMode="decimal"
                          className="w-24"
                        />
                      ) : (
                        row.weight
                      )}
                    </TableCell>
                    {canWrite && (
                      <TableCell className="py-3">
                        <div className="flex justify-end gap-2">
                          {isEditing ? (
                            <>
                              <Button variant="outline" size="icon" onClick={handleUpdate} disabled={busy} aria-label="Salvar">
                                <Save className="w-4 h-4" />
                              </Button>
                              <Button variant="ghost" size="icon" onClick={cancelEditing} disabled={busy} aria-label="Cancelar">
                                <X className="w-4 h-4" />
                              </Button>
                            </>
                          ) : (
                            <>
                              <Button variant="outline" size="icon" onClick={() => startEditing(row)} disabled={busy} aria-label="Editar">
                                <Pencil className="w-4 h-4" />
                              </Button>
                              <Button variant="destructive" size="icon" onClick={() => handleDelete(row)} disabled={busy} aria-label="Remover">
                                <Trash2 className="w-4 h-4" />
                              </Button>
                            </>
                          )}
                        </div>
                      </TableCell>
                    )}
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        )}
      </div>

      <Notification
        message={notification.message}
        type={notification.type}
        visible={Boolean(notification.message)}
        onClose={() => setNotification(n => ({ ...n, message: "" }))}
      />
    </section>
  );
}
