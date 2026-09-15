import { useId } from "react";

type RejectionReasonInputProps = {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  required?: boolean;
};

/**
 * Campo reutilizável de texto para o motivo da rejeição/negativa,
 * usado no fluxo de aprovar/rejeitar comprovantes PAPFE e justificativas.
 */
export function RejectionReasonInput({
  value,
  onChange,
  placeholder = "Explique o motivo da rejeição para o participante...",
  required = true,
}: RejectionReasonInputProps) {
  const id = useId();
  return (
    <div className="space-y-1.5">
      <label
        htmlFor={id}
        className="text-sm font-medium text-foreground"
      >
        Motivo da rejeição {required && <span className="text-red-400">*</span>}
      </label>
      <textarea
        id={id}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        rows={4}
        required={required}
        className="bg-muted/40 border-muted/30 text-foreground focus-visible:ring-primary rounded-lg w-full min-h-24 max-h-48 resize-y px-3 py-2 text-sm"
      />
      <p className="text-xs text-muted-foreground">
        O participante verá este texto no site.
      </p>
    </div>
  );
}
