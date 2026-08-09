import { useState } from "react";
import Modal from "@/components/ui/Modal";
import FileUpload from "@/components/file-upload";
import { useNotification } from "@/contexts/NotificationContext";
import { cn } from "@/lib/utils";

export type JustifyAbsenceStatus = "em_analise" | "aprovado" | "negado";

const STATUS_LABEL: Record<JustifyAbsenceStatus, string> = {
  em_analise: "Em análise",
  aprovado: "Aprovado",
  negado: "Negado",
};

const STATUS_BADGE_CLASS: Record<JustifyAbsenceStatus, string> = {
  em_analise: "bg-amber-500/15 text-amber-500 border-amber-500/20",
  aprovado: "bg-emerald-500/15 text-emerald-500 border-emerald-500/20",
  negado: "bg-red-500/15 text-red-500 border-red-500/20",
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
  const [reason, setReason] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [status, setStatus] = useState<JustifyAbsenceStatus | null>(null);

  const handleClose = () => {
    setReason("");
    setSubmitting(false);
    setStatus(null);
    onClose();
  };

  const handleSubmit = async () => {
    if (!reason.trim()) {
      showNotification("Escreva o motivo da ausência.", "warning");
      return;
    }

    setSubmitting(true);
    await new Promise((resolve) => setTimeout(resolve, 800));
    setSubmitting(false);
    setStatus("em_analise");
    onSubmitted?.("em_analise");
    showNotification("Justificativa enviada! Ficará em análise.", "success");
  };

  return (
    <Modal
      open={open}
      onClose={handleClose}
      title="Justificar Ausência"
      size="sm"
    >
      {status ? (
        <div className="flex flex-col items-center gap-4 py-6 text-center">
          <JustifyAbsenceStatusBadge status={status} />
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
      ) : (
        <div className="flex flex-col gap-4">
          <div>
            <label className="mb-1.5 block text-xs font-semibold text-gray-700 dark:text-gray-200">
              Motivo da ausência *
            </label>
            <textarea
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="Descreva o motivo da sua ausência..."
              required
              rows={4}
              className="w-full resize-none rounded-md border border-gray-300 bg-white p-3 text-sm text-gray-900 outline-none transition-colors focus:border-semcompMidDarkBlue placeholder:text-gray-400 dark:border-white/20 dark:bg-gray-800 dark:text-gray-100 dark:focus:border-semcompOffWhite"
            />
          </div>

          <div>
            <label className="mb-1.5 block text-xs font-semibold text-gray-700 dark:text-gray-200">
              Comprovante de ausência
            </label>
            <FileUpload
              key={open ? "justify-file-open" : "justify-file-closed"}
              onChange={() => {}}
              accept=".pdf,.jpg,.jpeg,.png,.webp"
              maxSizeMB={10}
              label="Arraste o comprovante ou clique para selecionar"
              helperText="PDF, JPEG, PNG ou WebP · máx. 10 MB"
            />
          </div>

          <button
            onClick={handleSubmit}
            disabled={submitting}
            className="mt-2 rounded-lg bg-semcompDarkBlue px-6 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-semcompMidDarkBlue disabled:cursor-not-allowed disabled:opacity-50 dark:bg-semcompOffWhite dark:text-semcompDarkBlue dark:hover:bg-white"
          >
            {submitting ? "Enviando..." : "Enviar Justificativa"}
          </button>

          <p className="text-xs text-gray-500 dark:text-gray-400">
            * A justificativa será avaliada pela organização.
          </p>
        </div>
      )}
    </Modal>
  );
}
