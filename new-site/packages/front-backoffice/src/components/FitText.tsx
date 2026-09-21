import { useFitText } from "@/hooks/useFitText";

interface FitTextProps {
  value: string;
  className?: string;
  minSize?: number;
}

/**
 * Texto em linha única que encolhe a fonte conforme necessário para caber no
 * pai. Usa o hook useFitText; `title` preserva o valor completo para leitura.
 */
export default function FitText({ value, className = "", minSize }: FitTextProps) {
  const ref = useFitText<HTMLParagraphElement>(value, minSize);

  return (
    <p ref={ref} className={`whitespace-nowrap ${className}`} title={value}>
      {value}
    </p>
  );
}