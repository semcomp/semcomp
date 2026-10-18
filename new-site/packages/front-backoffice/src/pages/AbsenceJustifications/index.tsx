import { useState, useMemo, useCallback, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { BannerCard } from "@/components/BannerCard";
import { CrudTable } from "@/components/CrudTable";
import type { CrudField, CrudQueryParams } from "@/components/CrudTable";
import type { CrudItemType } from "@/types/CrudItem";
import { Tabs } from "@/constants/Tabs";
import type {
  AbsenceJustificationType,
  AbsenceJustificationStatus,
} from "@/types/AbsenceJustificationType";
import { useNotification } from "@/contexts/NotificationContext";
import { useHasPermission } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { RejectionReasonInput } from "@/components/RejectionReasonInput";
import { Eye, Download } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { absenceJustificationsAPI } from "@/api/absenceJustifications";

const STATUS_LABEL: Record<AbsenceJustificationStatus, string> = {
  em_analise: "Em análise",
  aprovado: "Aprovado",
  negado: "Negado",
  documento_invalido: "Documento Inválido",
};

const STATUS_BADGE_CLASS: Record<AbsenceJustificationStatus, string> = {
  em_analise: "bg-amber-600 text-white border-amber-700",
  aprovado: "bg-emerald-700 text-white border-emerald-800",
  negado: "bg-red-700 text-white border-red-800",
  documento_invalido: "bg-orange-600 text-white border-orange-700",
};

const REASON_PREVIEW_LENGTH = 100;

const truncate = (text: string, max: number): string =>
  text.length > max ? `${text.slice(0, max).trimEnd()}…` : text;

function StatusBadge({ status }: { status: AbsenceJustificationStatus }) {
  return (
    <Badge className={STATUS_BADGE_CLASS[status]}>
      {STATUS_LABEL[status]}
    </Badge>
  );
}

type ModalState =
  | { open: false }
  | {
      open: true;
      justification: AbsenceJustificationType;
      attachmentUrl: string | null;
      loadingAttachment: boolean;
    };

const FIELDS: CrudField[] = [
  { value: "user_name", label: "Participante" },
  { value: "event_name", label: "Evento" },
  { value: "reason_preview", label: "Justificativa", searchable: false },
  { value: "submitted_at", label: "Enviado em", type: "date" },
  {
    value: "status",
    label: "Status",
    type: "select",
    selectVariants: {
      em_analise: STATUS_BADGE_CLASS.em_analise,
      aprovado: STATUS_BADGE_CLASS.aprovado,
      negado: STATUS_BADGE_CLASS.negado,
      documento_invalido: STATUS_BADGE_CLASS.documento_invalido,
    },
    selectLabels: STATUS_LABEL,
  },
];

interface AbsenceJustificationRow extends CrudItemType {
  user_name: string;
  event_name: string;
  reason_preview: string;
  submitted_at: string;
  status: string;
}

const toRow = (j: AbsenceJustificationType): AbsenceJustificationRow => ({
  id: String(j.id),
  user_name: j.user_name,
  event_name: j.event_name,
  reason_preview: truncate(j.reason, REASON_PREVIEW_LENGTH),
  submitted_at: j.submitted_at,
  status: j.status,
});

export default function AbsenceJustifications() {
  const canWrite = useHasPermission("Justificativas de Ausência", "RW");
  const navigate = useNavigate();
  const { showNotification } = useNotification();

  const [justifications, setJustifications] = useState<AbsenceJustificationType[]>([]);
  const [loading, setLoading] = useState(false);
  const [totalRecords, setTotalRecords] = useState(0);
  const [modal, setModal] = useState<ModalState>({ open: false });
  const [pendingDecision, setPendingDecision] =
    useState<AbsenceJustificationStatus | null>(null);
  const [rejectionReason, setRejectionReason] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const lastQueryRef = useRef<CrudQueryParams | null>(null);

  const fetchPage = useCallback(async (params: CrudQueryParams) => {
    setLoading(true);
    try {
      const result = await absenceJustificationsAPI.getAll(
        params.page,
        params.pageSize,
        params.sortField || "submitted_at",
        params.sortOrder || "desc",
        params.filterField || undefined,
        params.filterValue || undefined
      );
      setJustifications(result.absence_justifications);
      setTotalRecords(result.filtered_records);
    } catch {
      showNotification("Erro ao carregar justificativas de ausência", "error");
    } finally {
      setLoading(false);
    }
  }, [showNotification]);

  const handleQueryChange = useCallback((params: CrudQueryParams) => {
    lastQueryRef.current = params;
    fetchPage(params);
  }, [fetchPage]);

  const rows = useMemo(() => justifications.map(toRow), [justifications]);

  const openModal = async (justification: AbsenceJustificationType) => {
    setPendingDecision(null);
    setRejectionReason("");
    setModal({
      open: true,
      justification,
      attachmentUrl: null,
      loadingAttachment: true,
    });
    try {
      const blob = await absenceJustificationsAPI.getAttachment(justification.id);
      const url = URL.createObjectURL(blob);
      setModal({
        open: true,
        justification,
        attachmentUrl: url,
        loadingAttachment: false,
      });
    } catch {
      showNotification("Erro ao carregar o comprovante", "error");
      setModal((prev) =>
        prev.open ? { ...prev, loadingAttachment: false } : prev
      );
    }
  };

  const closeModal = () => {
    if (modal.open && modal.attachmentUrl)
      URL.revokeObjectURL(modal.attachmentUrl);
    setModal({ open: false });
    setPendingDecision(null);
    setRejectionReason("");
  };

  const handleAction = (item: CrudItemType) => {
    const justification = justifications.find((j) => String(j.id) === item.id);
    if (justification) openModal(justification);
  };

  const confirmDecision = async () => {
    if (!modal.open || !pendingDecision) return;
    if (pendingDecision === "negado" && !rejectionReason.trim()) {
      showNotification("Informe o motivo da negativa.", "warning");
      return;
    }
    setSubmitting(true);
    try {
      await absenceJustificationsAPI.updateStatus(
        modal.justification.id,
        pendingDecision,
        pendingDecision === "negado" ? rejectionReason.trim() : undefined
      );
      const updated = {
        ...modal.justification,
        status: pendingDecision,
        rejection_reason:
          pendingDecision === "negado" ? rejectionReason.trim() : null,
      };
      setModal({ ...modal, justification: updated });
      setJustifications((prev) =>
        prev.map((j) => (j.id === updated.id ? updated : j))
      );
      showNotification(
        pendingDecision === "aprovado"
          ? "Justificativa aprovada!"
          : pendingDecision === "negado"
            ? "Justificativa negada."
            : "Justificativa marcada como documento inválido.",
        pendingDecision === "aprovado" ? "success" : "warning"
      );
      setPendingDecision(null);
      setRejectionReason("");
    } catch (err: unknown) {
      const msg =
        (err as { response?: { data?: { message?: string } } })?.response
          ?.data?.message ?? "Erro ao atualizar a justificativa";
      showNotification(msg, "error");
    } finally {
      setSubmitting(false);
    }
  };

  const isImage = modal.open && modal.justification.attachment_content_type.startsWith("image/");
  const isPdf = modal.open && modal.justification.attachment_content_type === "application/pdf";

  return (
    <section className="mx-auto w-full max-w-7xl px-4 py-8 md:px-6 md:py-10 space-y-6 overflow-x-auto scrollbar-hide">
      <BannerCard
        icon={Tabs.find((t) => t.key === "absence-justifications")?.icon}
        iconClassName="text-violet-400"
        label="Justificativas de Ausência"
        title="Justificativas de Ausência"
        description="Revise as justificativas enviadas pelos participantes e aprove, negue ou marque como documento inválido cada uma."
        onBack={() => navigate("/home")}
        cardClassName="border-slate-800 bg-linear-to-br from-slate-900 via-slate-900 to-violet-950/30 overflow-hidden relative"
        labelClassName="text-xs uppercase tracking-[0.3em] text-violet-400 font-medium"
        titleClassName="text-2xl md:text-3xl text-white font-semibold"
        descriptionClassName="text-slate-400 mt-1"
      />

      <div className="rounded-xl border border-border bg-card/80 p-5">
        {loading && rows.length === 0 && (
          <div className="flex items-center justify-center py-12">
            <p className="text-slate-400">Carregando justificativas...</p>
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
          actionTitle="Ver justificativa"
          entityLabel="justificativa"
          totalRecords={totalRecords}
          onQueryChange={handleQueryChange}
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
                <DialogTitle>
                  Justificativa de {modal.justification.user_name}
                </DialogTitle>
                <p className="text-sm text-muted-foreground">
                  {modal.justification.user_email} · {modal.justification.event_name}
                </p>
              </DialogHeader>

              <div className="flex items-center gap-2 text-sm">
                <span className="text-muted-foreground">Status atual:</span>
                <StatusBadge status={modal.justification.status} />
              </div>

              {modal.justification.status === "negado" &&
                modal.justification.rejection_reason && (
                  <div className="space-y-1.5">
                    <p className="text-sm text-muted-foreground">
                      Motivo da negativa
                    </p>
                    <p className="text-sm text-foreground whitespace-pre-line rounded-lg border border-border bg-muted/30 p-3">
                      {modal.justification.rejection_reason}
                    </p>
                  </div>
                )}

              <div className="space-y-1.5">
                <p className="text-sm text-muted-foreground">Justificativa</p>
                <p className="text-sm text-foreground whitespace-pre-line rounded-lg border border-border bg-muted/30 p-3">
                  {modal.justification.reason}
                </p>
              </div>

              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <p className="text-sm text-muted-foreground">Comprovante</p>
                  {modal.attachmentUrl && (
                    <a
                      href={modal.attachmentUrl}
                      download={modal.justification.attachment_filename}
                      className="inline-flex items-center gap-1.5 text-xs text-primary hover:underline"
                    >
                      <Download className="w-3.5 h-3.5" />
                      Baixar
                    </a>
                  )}
                </div>
                <div className="w-full h-[50vh] rounded-lg overflow-hidden border border-border bg-muted/30">
                  {modal.loadingAttachment ? (
                    <div className="flex items-center justify-center h-full">
                      <p className="text-muted-foreground text-sm">Carregando comprovante...</p>
                    </div>
                  ) : modal.attachmentUrl && isImage ? (
                    <img
                      src={modal.attachmentUrl}
                      alt={`Comprovante de ${modal.justification.user_name}`}
                      className="w-full h-full object-contain"
                    />
                  ) : modal.attachmentUrl && isPdf ? (
                    <iframe
                      src={modal.attachmentUrl}
                      className="w-full h-full"
                      title={`Comprovante — ${modal.justification.user_name}`}
                    />
                  ) : modal.attachmentUrl ? (
                    <div className="flex items-center justify-center h-full">
                      <p className="text-muted-foreground text-sm">
                        Pré-visualização indisponível para este tipo de arquivo. Use o botão "Baixar".
                      </p>
                    </div>
                  ) : null}
                </div>
              </div>

              {canWrite && (
                <DialogFooter className="flex-col items-stretch gap-3 sm:flex-col sm:items-stretch">
                  {pendingDecision ? (
                    <div className="flex flex-col gap-3">
                      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                        <p className="text-sm text-foreground">
                          Confirma{" "}
                          {pendingDecision === "aprovado"
                            ? "aprovar"
                            : pendingDecision === "negado"
                              ? "negar"
                              : "marcar como documento inválido"}{" "}
                          esta justificativa?
                        </p>
                        <div className="flex gap-2 justify-end">
                          <Button
                            variant="ghost"
                            onClick={() => {
                              setPendingDecision(null);
                              setRejectionReason("");
                            }}
                            disabled={submitting}
                            className="text-muted-foreground"
                          >
                            Cancelar
                          </Button>
                          <Button
                            onClick={confirmDecision}
                            disabled={submitting}
                            className={
                              pendingDecision === "aprovado"
                                ? "bg-emerald-600 hover:bg-emerald-700 text-white"
                                : pendingDecision === "negado"
                                  ? "bg-red-600 hover:bg-red-700 text-white"
                                  : "bg-orange-600 hover:bg-orange-700 text-white"
                            }
                          >
                            Confirmar
                          </Button>
                        </div>
                      </div>
                      {pendingDecision === "negado" && (
                        <RejectionReasonInput
                          value={rejectionReason}
                          onChange={setRejectionReason}
                        />
                      )}
                    </div>
                  ) : (
                    <div className="flex gap-2 justify-end">
                      <Button
                        variant="outline"
                        onClick={() => setPendingDecision("negado")}
                        disabled={submitting || modal.justification.status === "negado"}
                        className="border-red-500/40 text-red-400 hover:bg-red-500/10"
                      >
                        Negar
                      </Button>
                      <Button
                        variant="outline"
                        onClick={() => setPendingDecision("documento_invalido")}
                        disabled={
                          submitting ||
                          modal.justification.status === "documento_invalido"
                        }
                        className="border-orange-500/40 text-orange-400 hover:bg-orange-500/10"
                      >
                        Documento Inválido
                      </Button>
                      <Button
                        onClick={() => setPendingDecision("aprovado")}
                        disabled={submitting || modal.justification.status === "aprovado"}
                        className="bg-emerald-600 hover:bg-emerald-700 text-white"
                      >
                        Aprovar
                      </Button>
                    </div>
                  )}
                </DialogFooter>
              )}
            </>
          )}
        </DialogContent>
      </Dialog>
    </section>
  );
}
