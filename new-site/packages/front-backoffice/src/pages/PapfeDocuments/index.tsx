import { useState, useEffect, useCallback, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { BannerCard } from "@/components/BannerCard";
import { CrudTable } from "@/components/CrudTable";
import type { CrudField } from "@/components/CrudTable";
import type { CrudItemType } from "@/types/CrudItem";
import { Tabs } from "@/constants/Tabs";
import { papfeAPI } from "@/api/users";
import type { PapfeDocumentInfo } from "@/api/users";
import { useNotification } from "@/contexts/NotificationContext";
import { useHasPermission } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Eye } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";

type ModalState =
  | { open: false }
  | { open: true; doc: PapfeDocumentInfo; blobUrl: string | null; loading: boolean };

function StatusBadge({ value }: { value: boolean | null }) {
  if (value === true)
    return <Badge className="bg-emerald-500/15 text-emerald-400 border-emerald-500/20">Aprovado</Badge>;
  if (value === false)
    return <Badge className="bg-red-500/15 text-red-400 border-red-500/20">Rejeitado</Badge>;
  return <Badge className="bg-amber-500/15 text-amber-400 border-amber-500/20">Pendente</Badge>;
}

const FIELDS: CrudField[] = [
  { value: "user_name", label: "Participante" },
  { value: "uploaded_at", label: "Enviado em", type: "date" },
  {
    value: "status",
    label: "Status",
    type: "select",
    selectVariants: {
      Pendente: "bg-amber-500/15 text-amber-400 border-amber-500/20",
      Aprovado: "bg-emerald-500/15 text-emerald-400 border-emerald-500/20",
      Rejeitado: "bg-red-500/15 text-red-400 border-red-500/20",
    },
  },
];

interface PapfeRow extends CrudItemType {
  user_name: string;
  user_email: string;
  uploaded_at: string;
  status: string;
}

const toRow = (doc: PapfeDocumentInfo): PapfeRow => ({
  id: String(doc.id),
  user_name: doc.user_name,
  user_email: doc.user_email,
  uploaded_at: doc.uploaded_at,
  status:
    doc.is_approved === true
      ? "Aprovado"
      : doc.is_approved === false
      ? "Rejeitado"
      : "Pendente",
});

export default function PapfeDocuments() {
  const canWrite = useHasPermission("PAPFE", "RW");
  const navigate = useNavigate();
  const { showNotification } = useNotification();

  const [documents, setDocuments] = useState<PapfeDocumentInfo[]>([]);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState<ModalState>({ open: false });
  const [approving, setApproving] = useState(false);

  const rows = useMemo(() => documents.map(toRow), [documents]);

  const fetchDocuments = useCallback(async () => {
    try {
      setLoading(true);
      const docs = await papfeAPI.getAll();
      setDocuments(docs);
    } catch {
      showNotification("Erro ao carregar comprovantes PAPFE", "error");
    } finally {
      setLoading(false);
    }
  }, [showNotification]);

  useEffect(() => {
    fetchDocuments();
  }, [fetchDocuments]);

  const openModal = async (doc: PapfeDocumentInfo) => {
    setModal({ open: true, doc, blobUrl: null, loading: true });
    try {
      const blob = await papfeAPI.getDocument(doc.user_number);
      const url = URL.createObjectURL(blob);
      setModal({ open: true, doc, blobUrl: url, loading: false });
    } catch {
      showNotification("Erro ao carregar o documento", "error");
      setModal({ open: false });
    }
  };

  const closeModal = () => {
    if (modal.open && modal.blobUrl) URL.revokeObjectURL(modal.blobUrl);
    setModal({ open: false });
  };

  const handleAction = (item: CrudItemType) => {
    const doc = documents.find((d) => String(d.id) === item.id);
    if (doc) openModal(doc);
  };

  const handleApproval = async (approved: boolean) => {
    if (!modal.open) return;
    setApproving(true);
    try {
      await papfeAPI.approve(modal.doc.user_number, approved);
      const updatedDoc = { ...modal.doc, is_approved: approved };
      setDocuments((prev) =>
        prev.map((d) => (d.id === modal.doc.id ? updatedDoc : d))
      );
      setModal({ ...modal, doc: updatedDoc });
      showNotification(
        approved ? "Comprovante aprovado!" : "Comprovante rejeitado.",
        approved ? "success" : "warning"
      );
    } catch (err: unknown) {
      const msg =
        (err as { response?: { data?: { error?: string } } })?.response?.data
          ?.error ?? "Erro ao atualizar aprovação";
      showNotification(msg, "error");
    } finally {
      setApproving(false);
    }
  };

  return (
    <section className="mx-auto w-full max-w-7xl px-4 py-8 md:px-6 md:py-10 space-y-6 overflow-x-auto scrollbar-hide">
      <BannerCard
        icon={Tabs.find((t) => t.key === "papfe")?.icon}
        iconClassName="text-violet-400"
        label="PAPFE"
        title="Comprovantes PAPFE"
        description="Revise os comprovantes enviados pelos participantes e aprove ou rejeite cada um."
        onBack={() => navigate("/home")}
        cardClassName="border-slate-800 bg-linear-to-br from-slate-900 via-slate-900 to-violet-950/30 overflow-hidden relative"
        labelClassName="text-xs uppercase tracking-[0.3em] text-violet-400 font-medium"
        titleClassName="text-2xl md:text-3xl text-white font-semibold"
        descriptionClassName="text-slate-400 mt-1"
      />

      <div className="rounded-xl border border-border bg-card/80 p-5">
        {loading && rows.length === 0 && (
          <div className="flex items-center justify-center py-12">
            <p className="text-slate-400">Carregando comprovantes...</p>
          </div>
        )}
        <CrudTable
          data={rows}
          fields={FIELDS}
          onEdit={() => {}}
          onDelete={() => {}}
          canWrite={false}
          onAction={handleAction}
          actionIcon={<Eye className="w-3.5 h-3.5" />}
          actionTitle="Ver documento"
          entityLabel="comprovante"
        />
      </div>

      <Dialog open={modal.open} onOpenChange={(open) => { if (!open) closeModal(); }}>
        <DialogContent
          className="sm:max-w-3xl w-full bg-slate-900 border-slate-700"
          showCloseButton
        >
          {modal.open && (
            <>
              <DialogHeader>
                <DialogTitle>Comprovante de {modal.doc.user_name}</DialogTitle>
                <p className="text-sm text-muted-foreground">{modal.doc.user_email}</p>
              </DialogHeader>

              <div className="flex items-center gap-2 text-sm">
                <span className="text-muted-foreground">Status atual:</span>
                <StatusBadge value={modal.doc.is_approved} />
              </div>

              <div className="w-full h-[60vh] rounded-lg overflow-hidden border border-border bg-muted/30">
                {modal.loading ? (
                  <div className="flex items-center justify-center h-full">
                    <p className="text-muted-foreground text-sm">Carregando documento...</p>
                  </div>
                ) : modal.blobUrl ? (
                  <iframe
                    src={modal.blobUrl}
                    className="w-full h-full"
                    title={`Comprovante PAPFE — ${modal.doc.user_name}`}
                  />
                ) : null}
              </div>

              {canWrite && (
                <DialogFooter>
                  <Button
                    variant="outline"
                    onClick={() => handleApproval(false)}
                    disabled={approving}
                    className="border-red-500/40 text-red-400 hover:bg-red-500/10"
                  >
                    Rejeitar
                  </Button>
                  <Button
                    onClick={() => handleApproval(true)}
                    disabled={approving || modal.doc.is_approved === true}
                    className="bg-emerald-600 hover:bg-emerald-700 text-white"
                  >
                    Aprovar
                  </Button>
                </DialogFooter>
              )}
            </>
          )}
        </DialogContent>
      </Dialog>
    </section>
  );
}
