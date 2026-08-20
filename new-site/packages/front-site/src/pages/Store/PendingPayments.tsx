import { useCallback, useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowLeft, ChevronDown, RefreshCw, Wallet } from "lucide-react";
import { useTheme } from "@/contexts/useTheme";
import { useNotification } from "@/contexts/NotificationContext";
import { salesAPI, type SaleResponse } from "@/api/sales";
import { BASEURL } from "@/constants/ApiURL";
import PixQrCard from "@/components/PixQrCard";
import { isPendingSale } from "@/lib/pendingSale";

function formatBRL(value: number): string {
  return value.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

function formatItems(sale: SaleResponse): string {
  if (!sale.items?.length) return "Pedido";
  return sale.items
    .map((it) => `${it.quantity}x ${it.product?.name ?? "Produto"}`)
    .join(", ");
}

export default function PendingPaymentsPage() {
  const { isDarkMode } = useTheme();
  const { showNotification } = useNotification();

  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [sales, setSales] = useState<SaleResponse[]>([]);
  const [openId, setOpenId] = useState<number | null>(null);

  const esRef = useRef<EventSource | null>(null);

  const openSale = sales.find((s) => s.id === openId) ?? null;

  const removeSale = useCallback((id: number) => {
    setSales((prev) => prev.filter((s) => s.id !== id));
  }, []);

  // Busca o histórico e filtra apenas os pagamentos pendentes (PENDENTE e não expirado).
  useEffect(() => {
    let cancelled = false;
    salesAPI
      .getMySales()
      .then((all) => {
        if (cancelled) return;
        setSales(all.filter(isPendingSale));
      })
      .catch(() => {
        if (cancelled) return;
        setLoadError("Não foi possível carregar seus pagamentos. Tente novamente.");
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  // SSE de status da venda expandida (uma conexão por vez). Ao colapsar ou
  // desmontar, o cleanup fecha o EventSource.
  useEffect(() => {
    if (!openSale) return;
    const es = new EventSource(`${BASEURL}/api/sales/${openSale.id}/events`, {
      withCredentials: true,
    });
    esRef.current = es;
    es.onmessage = ({ data }) => {
      if (data === "PAGO") {
        showNotification("Pagamento confirmado!", "success");
        es.close();
        setOpenId(null);
        removeSale(openSale.id);
      } else if (data === "EXPIRADO") {
        showNotification("O tempo para pagamento expirou.", "warning");
        es.close();
        setOpenId(null);
        removeSale(openSale.id);
      } else if (data === "REJEITADO" || data === "CANCELADO" || data === "REEMBOLSADO") {
        showNotification("Este pagamento não foi aprovado.", "warning");
        es.close();
        setOpenId(null);
        removeSale(openSale.id);
      }
    };
    return () => es.close();
  }, [openSale, showNotification, removeSale]);

  // O countdown dentro do PixQrCard avisa quando o PIX expira no cliente.
  const handleStatusChange = useCallback(
    (status: string) => {
      if (status === "EXPIRADO" && openId != null) {
        showNotification("O tempo para pagamento expirou.", "warning");
        setOpenId(null);
        removeSale(openId);
      }
    },
    [openId, showNotification, removeSale]
  );

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
  if (loading) {
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

  // ─── Erro de carregamento ───────────────────────────────
  if (loadError) {
    return (
      <div className={`min-h-screen flex flex-col items-center justify-center gap-6 px-4 ${bg}`}>
        <motion.div
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: "spring", stiffness: 200, damping: 15 }}
          className="flex flex-col items-center gap-4 text-center"
        >
          <Wallet size={64} className={textMuted} />
          <h1 className={`text-2xl font-extrabold font-poppins ${textPrimary}`}>
            Não foi possível carregar seus pagamentos
          </h1>
          <p className={`text-sm max-w-xs ${textMuted}`}>{loadError}</p>
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

  // ─── Vazio ──────────────────────────────────────────────
  if (sales.length === 0) {
    return (
      <div className={`min-h-screen flex flex-col items-center justify-center gap-6 px-4 ${bg}`}>
        <motion.div
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: "spring", stiffness: 200, damping: 15 }}
          className="flex flex-col items-center gap-4 text-center"
        >
          <Wallet size={64} className={textMuted} />
          <h1 className={`text-2xl font-extrabold font-poppins ${textPrimary}`}>
            Nenhum pagamento pendente
          </h1>
          <p className={`text-sm max-w-xs ${textMuted}`}>
            Você não tem pagamentos PIX aguardando confirmação no momento.
          </p>
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

  // ─── Lista expansível de pagamentos pendentes ───────────
  return (
    <div className={`min-h-screen font-poppins ${bg} transition-colors duration-300`}>
      <div className="mx-auto max-w-lg px-4 pt-28 pb-16 flex flex-col gap-6">
        {/* Voltar */}
        <Link
          to="/loja"
          className={`self-start inline-flex items-center gap-1.5 text-sm font-medium ${textMuted} hover:text-semcompMidDarkBlue transition-colors`}
        >
          <ArrowLeft size={16} />
          Voltar à loja
        </Link>

        <div className="text-center">
          <h1 className={`text-2xl font-extrabold ${textPrimary}`}>Pagamentos pendentes</h1>
          <p className={`mt-1 text-sm ${textMuted}`}>
            Toque em um pedido para ver o QR Code e concluir o pagamento
          </p>
        </div>

        <div className="w-full space-y-4">
          {sales.map((sale) => {
            const isOpen = sale.id === openId;
            return (
              <div
                key={sale.id}
                className={`rounded-2xl border ${cardBorder} ${cardBg} ${cardShadow} overflow-hidden`}
              >
                {/* Cabeçalho (toggle) */}
                <button
                  type="button"
                  onClick={() => setOpenId(isOpen ? null : sale.id)}
                  className="w-full flex items-center justify-between gap-4 p-5 text-left cursor-pointer"
                >
                  <div className="min-w-0 flex flex-col gap-1">
                    <span className={`font-bold text-sm truncate ${textPrimary}`}>
                      {formatItems(sale)}
                    </span>
                    <span className={`text-xs ${textMuted}`}>
                      {new Date(sale.created_at).toLocaleDateString("pt-BR", {
                        day: "2-digit",
                        month: "long",
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </span>
                  </div>
                  <div className="shrink-0 flex items-center gap-3">
                    <span className={`text-sm font-extrabold ${textPrimary}`}>
                      {formatBRL(sale.total_amount)}
                    </span>
                    <span className="flex items-center gap-2">
                      <span className="relative flex h-2.5 w-2.5">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-yellow-400 opacity-75" />
                        <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-yellow-400" />
                      </span>
                      <span className={`text-xs font-semibold ${textMuted}`}>Pendente</span>
                    </span>
                    <ChevronDown
                      className={`text-semcompMidDarkBlue flex-shrink-0 transition-transform duration-300 ${isOpen ? "rotate-180" : ""}`}
                      size={20}
                    />
                  </div>
                </button>

                {/* Painel expandido: PixQrCard + SSE */}
                <div
                  className="grid transition-[grid-template-rows] duration-300 ease-out"
                  style={{ gridTemplateRows: isOpen ? "1fr" : "0fr" }}
                >
                  <div className="overflow-hidden">
                    {isOpen && (
                      <div className="px-5 pb-6 flex flex-col items-center gap-6">
                        <PixQrCard sale={sale} onStatusChange={handleStatusChange} />
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
