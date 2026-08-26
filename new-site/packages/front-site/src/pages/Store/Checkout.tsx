import { useEffect, useState, useRef } from "react";
import { useLocation, useNavigate, Link } from "react-router-dom";
import { motion } from "framer-motion";
import { useTheme } from "@/contexts/useTheme";
import { useCart } from "@/contexts/CartContext";
import { salesAPI, type SaleResponse } from "@/api/sales";
import PixQrCard from "@/components/PixQrCard";
import { BASEURL } from "@/constants/ApiURL";
import {
  CheckCircle2,
  XCircle,
  ArrowLeft,
  RefreshCw,
} from "lucide-react";

function formatBRL(value: number) {
  return value.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

type Status = "loading" | "pending" | "approved" | "rejected" | "expired";

export default function CheckoutPage() {
  const { isDarkMode } = useTheme();
  const { clearCart, subtotal, items } = useCart();
  const location = useLocation();
  const navigate = useNavigate();

  const navState = location.state as { sale?: SaleResponse; dietaryRestrictions?: string } | null;

  const [sale, setSale] = useState<SaleResponse | null>(
    navState?.sale ?? null
  );

  // Restrições alimentares informadas no carrinho. Guardadas em ref para
  // sobreviverem até o envio da venda, inclusive após o carrinho ser limpo.
  const dietaryRestrictionsRef = useRef(navState?.dietaryRestrictions ?? "");
  const [status, setStatus] = useState<Status>(sale ? "pending" : "loading");
  const [error, setError] = useState<string | null>(null);

  const esRef = useRef<EventSource | null>(null);

  useEffect(() => {
    if (sale || items.length === 0) return;
    if (subtotal === 0) {
      navigate("/loja/carrinho", { replace: true });
      return;
    }
    // Reload da página sem sale no location.state: recria a venda + cobrança PIX.
    salesAPI
      .create({
        items: items.map((i) => ({ product_id: Number(i.id), quantity: i.quantity })),
        payment_method: "PIX",
        dietary_restrictions: dietaryRestrictionsRef.current,
      })
      .then((s) => {
        setSale(s);
        setStatus("pending");
      })
      .catch(() => {
        setError("Não foi possível gerar o código PIX. Tente novamente.");
        setStatus("rejected");
      });
  }, []);

  // SSE de status (substitui polling). O countdown do PIX vive no PixQrCard.
  useEffect(() => {
    if (!sale || status !== "pending") return;
    const es = new EventSource(`${BASEURL}/api/sales/${sale.id}/events`, {
      withCredentials: true,
    });
    esRef.current = es;
    es.onmessage = ({ data }) => {
      if (data === "PAGO") {
        setStatus("approved");
        es.close();
      } else if (data === "REJEITADO" || data === "REEMBOLSADO" || data === "CANCELADO") {
        setStatus("rejected");
        es.close();
      } else if (data === "EXPIRADO") {
        setStatus("expired");
        es.close();
      }
    };
    return () => es.close();
  }, [sale, status]);

  // A venda já foi criada no "Finalizar Pedido" (POST /api/sales, status PENDENTE).
  // Ao aprovar, apenas limpamos o carrinho — o status da venda é atualizado para
  // PAGO pelo webhook do Mercado Pago (ou manualmente no backoffice, em dev).
  useEffect(() => {
    if (status === "approved") {
      clearCart();
    }
  }, [status, clearCart]);


  // O countdown do PIX (dentro do PixQrCard) avisa o pai quando expira.
  const handleStatusChange = (statusChanged: string) => {
    if (statusChanged === "EXPIRADO") setStatus("expired");
  };

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
          {sale && (
            <p className={`text-xs ${textMuted}`}>
              Pedido registrado.
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
              {formatBRL(sale?.total_amount ?? subtotal)}
            </p>
          </div>

          {/* QR Code + Copia e Cola + Countdown */}
          {sale && <PixQrCard sale={sale} onStatusChange={handleStatusChange} />}

          <div className="text-center">
            <p className={`mt-1 text-sm ${textMuted}`}>
              Destinatário: Eduarda Almeida
            </p>
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
      </div>
    </div>
  );
}