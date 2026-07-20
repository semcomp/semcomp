import { useCallback, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { BannerCard } from "@/components/BannerCard";
import { Notification } from "@/components/Notification";
import { Switch } from "@/components/ui/switch";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tabs } from "@/constants/Tabs";
import { pagesAPI } from "@/api";
import type { PageAvailability } from "@/types/APIResponseType";
import { useHasPermission } from "@/contexts/AuthContext";

export default function PagesAvailabilityCRUD() {
  const navigate = useNavigate();
  const canWrite = useHasPermission("Páginas", "RW");
  const [rows, setRows] = useState<PageAvailability[]>([]);
  const [loading, setLoading] = useState(true);
  const [savingPage, setSavingPage] = useState<string | null>(null);
  const [notification, setNotification] = useState<{ message: string; type: "success" | "warning" }>({
    message: "",
    type: "success",
  });

  const notify = (message: string, type: "success" | "warning" = "success") =>
    setNotification({ message, type });

  const fetchAll = useCallback(async () => {
    try {
      setLoading(true);
      const pages = await pagesAPI.getAll();
      setRows([...pages].sort((a, b) => a.page.localeCompare(b.page)));
    } catch {
      notify("Erro ao carregar páginas.", "warning");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchAll(); }, [fetchAll]);

  const handleToggle = async (page: string, available: boolean) => {
    const previous = rows;
    setRows(rs => rs.map(r => (r.page === page ? { ...r, available } : r)));
    setSavingPage(page);
    try {
      await pagesAPI.setAvailability(page, available);
      notify(`Página "${page}" ${available ? "habilitada" : "desabilitada"} com sucesso!`);
    } catch (err: any) {
      setRows(previous);
      const message =
        err?.response?.data?.error ||
        err?.message ||
        "Erro ao atualizar disponibilidade da página.";
      notify(message, "warning");
    } finally {
      setSavingPage(null);
    }
  };

  return (
    <section className="mx-auto w-full max-w-7xl px-4 py-8 md:px-6 md:py-10 space-y-6 overflow-x-auto scrollbar-hide">
      <BannerCard
        icon={Tabs.find(tab => tab.key === "pages-availability")?.icon}
        iconClassName="text-violet-400"
        label="Páginas"
        title="Feature Toggle — Disponibilidade de Páginas"
        description="Habilite ou desabilite páginas do site público."
        onBack={() => navigate("/home")}
        cardClassName="border-slate-800 bg-linear-to-br from-slate-900 via-slate-900 to-violet-950/30 overflow-hidden relative"
        labelClassName="text-xs uppercase tracking-[0.3em] text-violet-400 font-medium"
        titleClassName="text-2xl md:text-3xl text-white font-semibold"
        descriptionClassName="text-slate-400 mt-1"
      />

      <div className="rounded-xl border border-border bg-card/80 p-5 overflow-x-auto">
        {loading ? (
          <p className="py-12 text-center text-muted-foreground">Carregando páginas…</p>
        ) : rows.length === 0 ? (
          <p className="py-12 text-center text-muted-foreground">Nenhuma página registrada.</p>
        ) : (
          <Table>
            <TableHeader>
              <TableRow className="border-border bg-muted/30 hover:bg-muted/30">
                <TableHead className="text-muted-foreground text-xs font-semibold uppercase tracking-wider">
                  Página
                </TableHead>
                <TableHead className="text-muted-foreground text-xs font-semibold uppercase tracking-wider w-32">
                  Disponível
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {rows.map((row, i) => (
                <TableRow
                  key={row.page}
                  className={`border-border transition-colors hover:bg-muted/20 ${i % 2 === 0 ? "bg-transparent" : "bg-muted/10"}`}
                >
                  <TableCell className="py-3 font-medium text-foreground capitalize whitespace-nowrap">
                    {row.page}
                  </TableCell>
                  <TableCell className="py-3">
                    <Switch
                      checked={row.available}
                      disabled={!canWrite || savingPage === row.page}
                      onCheckedChange={checked => handleToggle(row.page, checked)}
                      aria-label={`Alternar disponibilidade de ${row.page}`}
                    />
                  </TableCell>
                </TableRow>
              ))}
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
