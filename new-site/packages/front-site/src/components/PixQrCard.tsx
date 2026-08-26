import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { AlertTriangle, Check, Clock, Copy } from "lucide-react";
import { useTheme } from "@/contexts/useTheme";
import type { SaleResponse } from "@/api/sales";

function formatCountdown(seconds: number) {
  const m = Math.floor(seconds / 60).toString().padStart(2, "0");
  const s = (seconds % 60).toString().padStart(2, "0");
  return `${m}:${s}`;
}

// PixExpiration não é persistido no banco (transitório no backend): ao recarregar
// a venda do histórico (ex: tela de pagamentos pendentes), usa a janela padrão
// de 30min a partir da criação.
function getPixExpiration(sale: SaleResponse): number {
  if (sale.pix_expiration) return new Date(sale.pix_expiration).getTime();
  return new Date(sale.created_at).getTime() + 30 * 60 * 1000;
}

type Props = {
  sale: SaleResponse;
  onStatusChange?: (status: string) => void;
};

// PixQrCard encapsula o bloco de pagamento PIX (imagem do QR code, código
// copia-e-cola e countdown). Usado pelo checkout e pela lista de pagamentos
// pendentes, mantendo a mesma identidade visual.
export default function PixQrCard({ sale, onStatusChange }: Props) {
  const { isDarkMode } = useTheme();

  const [copied, setCopied] = useState(false);
  const [countdown, setCountdown] = useState(() =>
    Math.max(0, Math.floor((getPixExpiration(sale) - Date.now()) / 1000))
  );
  const countdownRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const cardBorder = isDarkMode ? "border-white/10" : "border-semcompMidLightBlue/20";
  const textPrimary = isDarkMode ? "text-semcompOffWhite" : "text-semcompDarkBlue";
  const textMuted = isDarkMode ? "text-semcompOffWhite/70" : "text-semcompDarkBlue/70";
  const codeBoxBg = isDarkMode ? "bg-black/30" : "bg-semcompMidLightBlue/10";

  // Venda sem QR (copia-e-cola e/ou imagem) não é pagável: mostra aviso em vez
  // de spinner infinito + botão copiar desabilitado.
  const hasQR = !!sale.qr_code && !!sale.qr_code_base64;

  // Countdown: expira o PIX quando o tempo zera. O onStatusChange permite que o
  // pai (checkout ou lista de pendentes) reaja ao EXPIRADO. Só roda quando há QR.
  useEffect(() => {
    if (!hasQR) return;
    if (countdown <= 0) {
      onStatusChange?.("EXPIRADO");
      return;
    }
    countdownRef.current = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(countdownRef.current!);
          onStatusChange?.("EXPIRADO");
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(countdownRef.current!);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleCopy = () => {
    if (!sale.qr_code) return;
    navigator.clipboard.writeText(sale.qr_code).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    });
  };

  if (!hasQR) {
    return (
      <div className={`w-full rounded-2xl border-2 border-dashed ${cardBorder} px-5 py-8 flex flex-col items-center gap-3 text-center`}>
        <AlertTriangle size={32} className={textMuted} />
        <p className={`text-sm font-bold ${textPrimary}`}>Pagamento não gerado</p>
        <p className={`text-xs ${textMuted}`}>
          O código PIX não foi gerado para este pedido. Refazer o pedido.
        </p>
      </div>
    );
  }

  return (
    <>
      {/* QR Code */}
      <div className={`rounded-2xl border-4 ${isDarkMode ? "border-white/10 bg-white" : "border-semcompMidLightBlue/30 bg-white"} p-3 shadow-inner`}>
        <img
          src={`data:image/png;base64,${sale.qr_code_base64}`}
          alt="QR Code PIX"
          className="w-48 h-48 sm:w-56 sm:h-56 object-contain"
        />
      </div>

      {/* PIX Copia e Cola */}
      <div className="w-full space-y-2">
        <p className={`text-xs font-bold uppercase tracking-widest ${textMuted}`}>
          PIX Copia e Cola
        </p>
        <div className={`flex items-center gap-2 rounded-xl border ${cardBorder} ${codeBoxBg} px-4 py-3`}>
          <p className={`flex-1 text-xs font-mono truncate ${textPrimary}`}>
            {sale.qr_code ?? "Gerando código..."}
          </p>
          <button
            type="button"
            onClick={handleCopy}
            disabled={!sale.qr_code}
            aria-label="Copiar código PIX"
            className={`shrink-0 flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-bold transition-all cursor-pointer
              ${copied
                ? "bg-green-500/20 text-green-400"
                : "bg-semcompMidDarkBlue/80 text-white hover:brightness-110"
              } disabled:opacity-40`}
          >
            <AnimatePresence mode="wait" initial={false}>
              {copied ? (
                <motion.span
                  key="check"
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  exit={{ scale: 0 }}
                  className="flex items-center gap-1"
                >
                  <Check size={13} /> Copiado
                </motion.span>
              ) : (
                <motion.span
                  key="copy"
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  exit={{ scale: 0 }}
                  className="flex items-center gap-1"
                >
                  <Copy size={13} /> Copiar
                </motion.span>
              )}
            </AnimatePresence>
          </button>
        </div>
      </div>

      {/* Countdown + status */}
      <div className="w-full flex items-center justify-between">
        <div className={`flex items-center gap-2 text-sm ${textMuted}`}>
          <Clock size={15} />
          <span>Expira em <span className={`font-bold ${countdown < 120 ? "text-red-400" : textPrimary}`}>{formatCountdown(countdown)}</span></span>
        </div>
        <div className="flex items-center gap-2 text-sm">
          <span className="relative flex h-2.5 w-2.5">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-yellow-400 opacity-75" />
            <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-yellow-400" />
          </span>
          <span className={`text-xs font-semibold ${textMuted}`}>Aguardando pagamento</span>
        </div>
      </div>
    </>
  );
}
