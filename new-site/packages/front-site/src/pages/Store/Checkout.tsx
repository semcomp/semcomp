import { useEffect, useState, useCallback, useRef } from "react";
import { useLocation, useNavigate, Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { useTheme } from "@/contexts/useTheme";
import { useCart } from "@/contexts/CartContext";
import { paymentAPI, type PixPaymentResponse } from "@/api/payment";
import { salesAPI } from "@/api/sales";
import {
  CheckCircle2,
  XCircle,
  Copy,
  Check,
  ArrowLeft,
  Clock,
  RefreshCw,
  FlaskConical,
} from "lucide-react";

const POLL_INTERVAL_MS = 4000;

function secondsUntil(iso: string): number {
  return Math.max(0, Math.floor((new Date(iso).getTime() - Date.now()) / 1000));
}

function formatBRL(value: number) {
  return value.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

function formatCountdown(seconds: number) {
  const m = Math.floor(seconds / 60).toString().padStart(2, "0");
  const s = (seconds % 60).toString().padStart(2, "0");
  return `${m}:${s}`;
}

type Status = "loading" | "pending" | "approved" | "rejected" | "expired";

export default function CheckoutPage() {
  const { isDarkMode } = useTheme();
  const { clearCart, subtotal, items } = useCart();
  const location = useLocation();
  const navigate = useNavigate();

  const navState = location.state as { pixData?: PixPaymentResponse; dietaryRestrictions?: string } | null;

  const [pixData, setPixData] = useState<PixPaymentResponse | null>(
    navState?.pixData ?? null
  );

  // Restrições alimentares informadas no carrinho. Guardadas em ref porque precisam
  // sobreviver até o momento de registrar a venda (finalizeSale), inclusive após o
  // carrinho já ter sido limpo.
  const dietaryRestrictionsRef = useRef(navState?.dietaryRestrictions ?? "");
  const [status, setStatus] = useState<Status>(pixData ? "pending" : "loading");
  const [copied, setCopied] = useState(false);
  const [countdown, setCountdown] = useState(() =>
    pixData?.expiration_date ? secondsUntil(pixData.expiration_date) : 0
  );
  const [error, setError] = useState<string | null>(null);

  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const countdownRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Guarda o último snapshot não-vazio do carrinho, já que ele é limpo
  // (clearCart) assim que a venda é registrada com sucesso.
  const itemsSnapshotRef = useRef(items);
  useEffect(() => {
    if (items.length > 0) {
      itemsSnapshotRef.current = items;
    }
  }, [items]);

  // Evita registrar a mesma venda duas vezes (ex: efeito rodando de novo em StrictMode).
  const saleCreatedRef = useRef(false);
  const [saleError, setSaleError] = useState<string | null>(null);

  useEffect(() => {
    if (pixData || items.length === 0) return;
    if (!pixData && subtotal === 0) {
      navigate("/loja/carrinho", { replace: true });
      return;
    }
    paymentAPI
      .createPix(
        items.map((i) => ({ product_id: Number(i.id), quantity: i.quantity })),
        "Semcomp - Compra de produtos"
      )
      .then((data) => {
        setPixData(data);
        setCountdown(secondsUntil(data.expiration_date));
        setStatus("pending");
      })
      .catch(() => {
        setError("Não foi possível gerar o código PIX. Tente novamente.");
        setStatus("rejected");
      });
  }, []);

  // Countdown timer
  useEffect(() => {
    if (status !== "pending") return;
    if (countdown <= 0) {
      setStatus("expired");
      return;
    }
    countdownRef.current = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(countdownRef.current!);
          setStatus("expired");
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(countdownRef.current!);
  }, [status]);

  // Polling de status
  useEffect(() => {
    if (!pixData || status !== "pending") return;
    pollRef.current = setInterval(async () => {
      try {
        const { status: s } = await paymentAPI.getStatus(pixData.payment_id);
        if (s === "approved") {
          setStatus("approved");
          clearInterval(pollRef.current!);
          clearInterval(countdownRef.current!);
        } else if (s === "rejected" || s === "refunded") {
          setStatus("rejected");
          clearInterval(pollRef.current!);
          clearInterval(countdownRef.current!);
        }
      } catch {
        // falha no poll: não interrompe, tenta novamente no próximo tick
      }
    }, POLL_INTERVAL_MS);
    return () => clearInterval(pollRef.current!);
  }, [pixData, status]);

  // Registra a venda (POST /api/sales) e só então limpa o carrinho.
  // Chamada tanto pelo fluxo normal (pagamento aprovado via polling)
  // quanto pelo botão de teste que bypassa a análise do pagamento.
  const finalizeSale = useCallback(
    async (checkoutItems: typeof items) => {
      if (saleCreatedRef.current) return;
      saleCreatedRef.current = true;
      setSaleError(null);

      try {
        await salesAPI.create({
          items: checkoutItems.map((i) => ({
            product_id: Number(i.id),
            quantity: i.quantity,
          })),
          payment_method: "PIX",
          status: "PAGO",
          dietary_restrictions: dietaryRestrictionsRef.current,
        });
        clearCart();
      } catch (err) {
        console.error("Erro ao registrar a venda após o pagamento", err);
        saleCreatedRef.current = false; // permite tentar novamente
        setSaleError(
          "Pagamento aprovado, mas houve um erro ao registrar seu pedido. Entre em contato com a organização informando o ocorrido."
        );
      }
    },
    [clearCart]
  );

  useEffect(() => {
    if (status === "approved") {
      finalizeSale(itemsSnapshotRef.current);
    }
  }, [status, finalizeSale]);

  // ─── Botão de teste: aprova o pagamento sem esperar a análise real ───
  const handleBypassApproval = useCallback(() => {
    if (pollRef.current) clearInterval(pollRef.current);
    if (countdownRef.current) clearInterval(countdownRef.current);
    setStatus("approved");
  }, []);

  const handleCopy = useCallback(() => {
    if (!pixData?.qr_code) return;
    navigator.clipboard.writeText(pixData.qr_code).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    });
  }, [pixData]);

  // ─── Cores ──────────────────────────────────────────────
  const bg = isDarkMode
    ? "bg-gradient-to-b from-semcompAlmostDarkBlue via-semcompDarkBlue to-semcompDarkBlue/80"
    : "bg-gradient-to-b from-semcompMidLightBlue to-semcompMidLightBlue/20";
  const cardBg = isDarkMode ? "bg-semcompMidDarkBlue" : "bg-white";
  const cardBorder = isDarkMode ? "border-white/10" : "border-semcompMidLightBlue/20";
  const cardShadow = isDarkMode
    ? "shadow-[0_8px_40px_rgba(0,0,0,0.5)]"
    : "shadow-[0_8px_40px_rgba(53,123,163,0.1)]";
  const textPrimary = isDarkMode ? "text-semcompOffWhite" : "text-semcompDarkBlue";
  const textMuted = isDarkMode ? "text-semcompOffWhite/70" : "text-semcompDarkBlue/70";
  const codeBoxBg = isDarkMode ? "bg-black/30" : "bg-semcompMidLightBlue/10";

  // ─── Loading ────────────────────────────────────────────
  if (status === "loading") {
    return (
      <div className={`min-h-screen flex items-center justify-center ${bg}`}>
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
        >
          <RefreshCw size={40} className="text-semcompMidLightBlue" />
        </motion.div>
      </div>
    );
  }

  // ─── Aprovado ───────────────────────────────────────────
  if (status === "approved") {
    return (
      <div className={`min-h-screen flex flex-col items-center justify-center gap-6 px-4 ${bg}`}>
        <motion.div
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: "spring", stiffness: 200, damping: 15 }}
          className="flex flex-col items-center gap-4 text-center"
        >
          <CheckCircle2 size={80} className="text-green-400" />
          <h1 className={`text-3xl font-extrabold font-poppins ${textPrimary}`}>
            Pagamento confirmado!
          </h1>
          <p className={`text-sm max-w-xs ${textMuted}`}>
            Seu pagamento PIX foi aprovado.
          </p>
          {saleError && (
            <p className="text-sm max-w-xs font-semibold text-red-400">
              {saleError}
            </p>
          )}
          <Link
            to="/loja"
            className="mt-4 inline-flex items-center gap-2 rounded-full bg-semcompMidDarkBlue px-8 py-3 text-sm font-bold text-white shadow-md hover:brightness-110 transition-all"
          >
            <ArrowLeft size={16} />
            Voltar à loja
          </Link>
        </motion.div>
      </div>
    );
  }

  // ─── Rejeitado / Expirado ───────────────────────────────
  if (status === "rejected" || status === "expired") {
    const isExpired = status === "expired";
    return (
      <div className={`min-h-screen flex flex-col items-center justify-center gap-6 px-4 ${bg}`}>
        <motion.div
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: "spring", stiffness: 200, damping: 15 }}
          className="flex flex-col items-center gap-4 text-center"
        >
          <XCircle size={80} className="text-red-400" />
          <h1 className={`text-3xl font-extrabold font-poppins ${textPrimary}`}>
            {isExpired ? "PIX expirado" : "Pagamento não aprovado"}
          </h1>
          <p className={`text-sm max-w-xs ${textMuted}`}>
            {error ?? (isExpired
              ? "O tempo para pagamento expirou. Volte ao carrinho e tente novamente."
              : "Seu pagamento foi recusado. Verifique os dados e tente novamente.")}
          </p>
          <Link
            to="/loja/carrinho"
            className="mt-4 inline-flex items-center gap-2 rounded-full bg-semcompMidDarkBlue px-8 py-3 text-sm font-bold text-white shadow-md hover:brightness-110 transition-all"
          >
            <ArrowLeft size={16} />
            Voltar ao carrinho
          </Link>
        </motion.div>
      </div>
    );
  }

  // ─── Pending: tela principal do PIX ─────────────────────
  return (
    <div className={`min-h-screen font-poppins ${bg} transition-colors duration-300`}>
      <div className="mx-auto max-w-lg px-4 pt-28 pb-16 flex flex-col items-center gap-6">

        {/* Voltar */}
        <Link
          to="/loja/carrinho"
          className={`self-start inline-flex items-center gap-1.5 text-sm font-medium ${textMuted} hover:text-semcompMidDarkBlue transition-colors`}
        >
          <ArrowLeft size={16} />
          Voltar ao carrinho
        </Link>

        {/* Card principal */}
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className={`w-full rounded-3xl border ${cardBorder} ${cardBg} ${cardShadow} p-6 sm:p-8 flex flex-col items-center gap-6`}
        >
          {/* Cabeçalho */}
          <div className="text-center">
            <h1 className={`text-2xl font-extrabold ${textPrimary}`}>Pagamento via PIX</h1>
            <p className={`mt-1 text-sm ${textMuted}`}>
              Escaneie o QR Code ou copie o código abaixo
            </p>
          </div>

          {/* Valor */}
          <div className={`rounded-2xl px-6 py-3 text-center ${isDarkMode ? "bg-white/5" : "bg-semcompMidLightBlue/10"}`}>
            <p className={`text-xs font-bold uppercase tracking-widest mb-1 ${textMuted}`}>Total</p>
            <p className={`text-3xl font-extrabold ${textPrimary}`}>
              {formatBRL(pixData?.amount ?? subtotal)}
            </p>
          </div>

          {/* QR Code */}
          {pixData?.qr_code_base64 ? (
            <div className={`rounded-2xl border-4 ${isDarkMode ? "border-white/10 bg-white" : "border-semcompMidLightBlue/30 bg-white"} p-3 shadow-inner`}>
              <img
                src={`data:image/png;base64,${pixData.qr_code_base64}`}
                alt="QR Code PIX"
                className="w-48 h-48 sm:w-56 sm:h-56 object-contain"
              />
            </div>
          ) : (
            <div className={`w-56 h-56 rounded-2xl border-2 border-dashed ${cardBorder} flex items-center justify-center`}>
              <RefreshCw size={32} className={`${textMuted} animate-spin`} />
            </div>
          )}

          {/* PIX Copia e Cola */}
          <div className="w-full space-y-2">
            <p className={`text-xs font-bold uppercase tracking-widest ${textMuted}`}>
              PIX Copia e Cola
            </p>
            <div className={`flex items-center gap-2 rounded-xl border ${cardBorder} ${codeBoxBg} px-4 py-3`}>
              <p className={`flex-1 text-xs font-mono truncate ${textPrimary}`}>
                {pixData?.qr_code ?? "Gerando código..."}
              </p>
              <button
                type="button"
                onClick={handleCopy}
                disabled={!pixData?.qr_code}
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
        </motion.div>

        {/* Instruções */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          className={`w-full rounded-2xl border ${cardBorder} ${cardBg} ${cardShadow} p-5`}
        >
          <h2 className={`text-xs font-bold uppercase tracking-widest mb-3 ${textPrimary}`}>Como pagar</h2>
          <ol className={`space-y-2 text-sm ${textPrimary}`}>
            {[
              "Abra o app do seu banco e acesse a seção PIX",
              "Escolha \"Pagar com QR Code\" e escaneie a imagem",
              "Ou copie o código acima e use a opção \"PIX Copia e Cola\"",
              "Confirme o valor e conclua o pagamento",
            ].map((step, i) => (
              <li key={i} className="flex items-start gap-3">
                <span className={`shrink-0 w-5 h-5 rounded-full flex items-center justify-center text-[11px] font-bold bg-semcompMidDarkBlue text-white`}>
                  {i + 1}
                </span>
                <span className={isDarkMode ? "text-semcompOffWhite/80" : "text-semcompDarkBlue/80"}>{step}</span>
              </li>
            ))}
          </ol>
        </motion.div>

        {/* apagar */}
        <button
            type="button"
            onClick={handleBypassApproval}
            className="mt-2 inline-flex items-center gap-2 rounded-full border border-dashed border-yellow-500 px-4 py-2 text-xs font-bold text-yellow-500 hover:bg-yellow-500/10 transition-all cursor-pointer"
          >
            <FlaskConical size={14} />
            [DEV] Aprovar pagamento sem análise
          </button>

      </div>
    </div>
  );
}