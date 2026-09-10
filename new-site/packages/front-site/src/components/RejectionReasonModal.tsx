import type { ReactNode } from "react";
import Modal from "@/components/ui/Modal";

type RejectionReasonModalProps = {
  open: boolean;
  onClose: () => void;
  /** Título curto, ex: "Comprovante PAPFE" ou "Justificativa de ausência". */
  title: string;
  /** Badge de status já renderizado pelo chamador. */
  statusBadge: ReactNode;
  /** Motivo da negativa/rejeição (só existe quando negado). */
  rejectionReason: string;
};

/**
 * Modal reutilizável que exibe o status de um documento e o motivo da negativa
 * registrado pela organização. Usado tanto para o PAPFE quanto para a
 * justificativa de ausência.
 */
export default function RejectionReasonModal({
  open,
  onClose,
  title,
  statusBadge,
  rejectionReason,
}: RejectionReasonModalProps) {
  return (
    <Modal open={open} onClose={onClose} title={title} size="sm">
      <div className="flex flex-col gap-4">
        <div className="flex items-center gap-2">
          <span className="text-sm text-gray-500 dark:text-gray-400">
            Status:
          </span>
          {statusBadge}
        </div>

        {rejectionReason.trim() ? (
          <div>
            <p className="mb-1.5 text-sm font-semibold text-gray-700 dark:text-gray-200">
              Motivo da negativa
            </p>
            <p className="w-full whitespace-pre-line text-base text-gray-900 dark:text-gray-100">
              {rejectionReason}
            </p>
          </div>
        ) : (
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Nenhum motivo registrado.
          </p>
        )}

        <button
          onClick={onClose}
          className="mt-1 rounded-lg bg-semcompDarkBlue px-6 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-semcompMidDarkBlue dark:bg-semcompOffWhite dark:text-semcompDarkBlue dark:hover:bg-white"
        >
          Fechar
        </button>
      </div>
    </Modal>
  );
}
