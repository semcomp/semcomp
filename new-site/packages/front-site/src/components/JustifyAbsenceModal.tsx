import { useEffect, useState } from "react";
import Modal from "@/components/ui/Modal";
import FileUpload from "@/components/file-upload";
import { useNotification } from "@/contexts/NotificationContext";
import { absenceJustificationsAPI } from "@/api";
import type {
  AbsenceJustificationType,
  AbsenceJustificationStatus,
} from "@/types/AbsenceJustificationType";
import { cn } from "@/lib/utils";

export type JustifyAbsenceStatus = AbsenceJustificationStatus;

const STATUS_LABEL: Record<JustifyAbsenceStatus, string> = {
  em_analise: "Em análise",
  aprovado: "Aprovado",
  negado: "Negado",
  documento_invalido: "Documento Inválido",
};

const STATUS_BADGE_CLASS: Record<JustifyAbsenceStatus, string> = {
  em_analise: "bg-amber-600 text-white border-amber-700",
  aprovado: "bg-emerald-700 text-white border-emerald-800",
  negado: "bg-red-700 text-white border-red-800",
  documento_invalido: "bg-orange-600 text-white border-orange-700",
};

export function JustifyAbsenceStatusBadge({
  status,
}: {
  status: JustifyAbsenceStatus;
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full border px-3 py-1 text-xs font-medium",
        STATUS_BADGE_CLASS[status]
      )}
    >
      {STATUS_LABEL[status]}
    </span>
  );
}

const HELP_TEXT = (
  <div className="text-sm leading-relaxed text-gray-600 dark:text-gray-300">
    <p>
      Se você possui compromissos de trabalho (estágio) ou acadêmicos (como
      congressos) na semana do evento, anexe seu comprovante abaixo para
      análise de abono de faltas (total ou parcial), seguindo as normas de
      frequência da USP.
    </p>
    <ul className="mt-2 list-inside list-disc space-y-0.5">
      <li>
        <span className="font-semibold">Estágio/Trabalho:</span> Comprovante de
        estágio ou contrato.
      </li>
      <li>
        <span className="font-semibold">Congressos/Eventos:</span> Comprovante
        de artigo aceito.
      </li>
    </ul>
    <p className="mt-2">Abonos parciais serão notificados por e-mail.</p>
  </div>
);

type JustifyAbsenceModalProps = {
  open: boolean;
  onClose: () => void;
  onSubmitted?: (status: JustifyAbsenceStatus) => void;
};

export default function JustifyAbsenceModal({
  open,
  onClose,
  onSubmitted,
}: JustifyAbsenceModalProps) {
  const { showNotification } = useNotification();
  const [loading, setLoading] = useState(false);
  const [justification, setJustification] =
    useState<AbsenceJustificationType | null>(null);
  const [reason, setReason] = useState("");
  const [existingFile, setExistingFile] = useState<File | null>(null);
  const [newFile, setNewFile] = useState<File | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const canEdit =
    justification !== null &&
    (justification.status === "em_analise" ||
      justification.status === "documento_invalido");
  const isReadOnly =
    justification !== null &&
    (justification.status === "aprovado" || justification.status === "negado");

  useEffect(() => {
    if (!open) return;

    let cancelled = false;
    setLoading(true);
    setSubmitted(false);
    setJustification(null);
    setReason("");
    setExistingFile(null);
    setNewFile(null);

    (async () => {
      try {
        const existing = await absenceJustificationsAPI.getMine();
        if (cancelled) return;
        if (existing) {
          setJustification(existing);
          setReason(existing.reason);

          if (existing.attachment_filename) {
            const blob = await absenceJustificationsAPI.getAttachment(existing.id);
            if (cancelled || !blob) return;
            const file = new File([blob], existing.attachment_filename, {
              type: existing.attachment_content_type,
            });
            setExistingFile(file);
          }
        }
      } catch {
        if (!cancelled) {
          showNotification("Erro ao carregar a justificativa.", "error");
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [open, showNotification]);

  const handleClose = () => {
    setLoading(false);
    setJustification(null);
    setReason("");
    setExistingFile(null);
    setNewFile(null);
    setSubmitting(false);
    setSubmitted(false);
    onClose();
  };

  const handleSubmit = async () => {
    if (!reason.trim()) {
      showNotification("Escreva o motivo da ausência.", "warning");
      return;
    }

    setSubmitting(true);
    try {
      if (canEdit && justification) {
        await absenceJustificationsAPI.update(justification.id, {
          reason: reason.trim(),
          file: newFile ?? undefined,
        });
        showNotification("Justificativa atualizada! Continuará em análise.", "success");
      } else {
        if (!newFile) {
          showNotification("Anexe o comprovante para análise.", "warning");
          setSubmitting(false);
          return;
        }
        await absenceJustificationsAPI.submit({
          reason: reason.trim(),
          file: newFile,
        });
        showNotification("Justificativa enviada! Ficará em análise.", "success");
      }
      setSubmitted(true);
      onSubmitted?.("em_analise");
    } catch (err: unknown) {
      const data = (err as { response?: { data?: { error?: string; message?: string } } })
        ?.response?.data;
      const msg =
        data?.error ||
        data?.message ||
        (err as { message?: string })?.message ||
        "Erro ao enviar a justificativa";
      showNotification(msg, "error");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Modal
      open={open}
      onClose={handleClose}
      title="Justificar Ausência"
      size="md"
    >
      {loading ? (
        <div className="py-10 text-center text-sm text-gray-500 dark:text-gray-400">
          Carregando...
        </div>
      ) : submitted ? (
        <div className="flex flex-col items-center gap-4 py-6 text-center">
          <JustifyAbsenceStatusBadge status="em_analise" />
          <p className="text-sm text-gray-700 dark:text-gray-200 leading-relaxed">
            Sua justificativa foi enviada e está em análise. Assim que a
            organização decidir, você poderá acompanhar o resultado aqui.
          </p>
          <button
            onClick={handleClose}
            className="mt-2 rounded-lg bg-semcompDarkBlue px-6 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-semcompMidDarkBlue dark:bg-semcompOffWhite dark:text-semcompDarkBlue dark:hover:bg-white"
          >
            Fechar
          </button>
        </div>
      ) : isReadOnly ? (
        <div className="flex flex-col gap-4">
          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-500 dark:text-gray-400">
              Status atual:
            </span>
            <JustifyAbsenceStatusBadge status={justification!.status} />
          </div>

          <div>
            <p className="mb-1.5 text-sm font-semibold text-gray-700 dark:text-gray-200">
              Motivo da ausência
            </p>
            <p className="w-full whitespace-pre-line rounded-md border border-gray-300 bg-gray-50 p-3 text-base text-gray-900 dark:border-white/20 dark:bg-gray-800 dark:text-gray-100">
              {justification!.reason}
            </p>
          </div>

          <div>
            <p className="mb-1.5 text-sm font-semibold text-gray-700 dark:text-gray-200">
              Comprovante enviado
            </p>
            <p className="text-sm text-gray-700 dark:text-gray-200">
              {justification!.attachment_filename ||
                "Nenhum comprovante enviado."}
            </p>
          </div>

          <p className="text-xs text-gray-500 dark:text-gray-400">
            {justification!.status === "aprovado"
              ? "Sua justificativa foi aprovada."
              : "Sua justificativa foi negada."}
          </p>
        </div>
      ) : (
        <div className="flex flex-col gap-4">
          {HELP_TEXT}

          {justification?.status === "documento_invalido" && (
            <div className="flex items-center gap-2 rounded-md border border-orange-700/30 bg-orange-700/10 px-3 py-2">
              <JustifyAbsenceStatusBadge status="documento_invalido" />
              <p className="text-xs text-gray-600 dark:text-gray-300">
                O comprovante enviado foi considerado inválido. Anexe um documento
                válido abaixo para reenviar para análise.
              </p>
            </div>
          )}

          <div>
            <label className="mb-1.5 block text-sm font-semibold text-gray-700 dark:text-gray-200">
              Motivo da ausência *
            </label>
            <textarea
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="Descreva o motivo da sua ausência..."
              required
              rows={4}
              className="w-full resize-none rounded-md border border-gray-300 bg-white p-3 text-base text-gray-900 outline-none transition-colors focus:border-semcompMidDarkBlue placeholder:text-gray-400 dark:border-white/20 dark:bg-gray-800 dark:text-gray-100 dark:focus:border-semcompOffWhite"
            />
          </div>

          <div>
            <label className="mb-1.5 block text-sm font-semibold text-gray-700 dark:text-gray-200">
              Comprovante de ausência
            </label>
            {canEdit && existingFile && (
              <p className="mb-2 text-sm text-gray-500 dark:text-gray-400">
                Comprovante enviado:{" "}
                <span className="font-medium">{existingFile.name}</span>. Se
                quiser, anexe um novo abaixo para substituí-lo.
              </p>
            )}
            <FileUpload
              key={open ? `justify-file-open-${existingFile?.name ?? ""}` : "justify-file-closed"}
              defaultFile={canEdit ? existingFile : null}
              onChange={(file) => setNewFile(file)}
              accept=".pdf,.jpg,.jpeg,.png,.webp"
              maxSizeMB={10}
              label={
                canEdit
                  ? "Clique para substituir o comprovante"
                  : "Arraste o comprovante ou clique para selecionar"
              }
              helperText="PDF, JPEG, PNG ou WebP · máx. 10 MB"
            />
          </div>

          <button
            onClick={handleSubmit}
            disabled={submitting}
            className="mt-2 rounded-lg bg-semcompDarkBlue px-6 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-semcompMidDarkBlue disabled:cursor-not-allowed disabled:opacity-50 dark:bg-semcompOffWhite dark:text-semcompDarkBlue dark:hover:bg-white"
          >
            {submitting
              ? "Enviando..."
              : canEdit
                ? "Salvar Alterações"
                : "Enviar Justificativa"}
          </button>

          <p className="text-xs text-gray-500 dark:text-gray-400">
            * A justificativa será avaliada pela organização.
          </p>
        </div>
      )}
    </Modal>
  );
}
