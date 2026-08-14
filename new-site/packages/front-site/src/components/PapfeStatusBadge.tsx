import { cn } from "@/lib/utils";
import type { PapfeStatus } from "@/types/PapfeDocumentType";

const STATUS_LABEL: Record<PapfeStatus, string> = {
  aprovado: "Aprovado",
  rejeitado: "Rejeitado",
  pendente: "Pendente",
};

const STATUS_BADGE_CLASS: Record<PapfeStatus, string> = {
  aprovado: "bg-emerald-700 text-white border-emerald-800",
  rejeitado: "bg-red-700 text-white border-red-800",
  pendente: "bg-amber-600 text-white border-amber-700",
};

export function PapfeStatusBadge({ status }: { status: PapfeStatus }) {
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

export { STATUS_LABEL as PAPFE_STATUS_LABEL };
