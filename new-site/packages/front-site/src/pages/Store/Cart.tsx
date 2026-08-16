import { Link, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { useState } from "react";
import { useTheme } from "@/contexts/useTheme";
import useWindowDimensions from "@/hooks/useWindowDimensions";
import { useCart } from "@/contexts/CartContext";
import { paymentAPI } from "@/api/payment";
import { useNotification } from "@/contexts/NotificationContext";
import {
  ShoppingBag,
  Trash2,
  Minus,
  Plus,
  ArrowLeft,
  ArrowRight,
  Store,
  X,
  ZoomIn,
} from "lucide-react";

const fadeIn = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5 } },
};

const staggerList = {
  visible: { transition: { staggerChildren: 0.06 } },
};

function formatBRL(value: number): string {
  return value.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

function formatDateTime(iso: string): string {
  return new Date(iso).toLocaleDateString("pt-BR", {
    day: "2-digit",
    month: "long",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export default function CartPage() {
  const { isDarkMode } = useTheme();
  const { width } = useWindowDimensions();
  const { items, removeItem, updateQuantity, clearCart, subtotal, totalItems } = useCart();
  const navigate = useNavigate();
  const { showNotification } = useNotification();
  const [checkoutLoading, setCheckoutLoading] = useState(false);
  const [dietaryRestrictions, setDietaryRestrictions] = useState("");
  const [zoomedImage, setZoomedImage] = useState<{ url: string; alt: string } | null>(null);

  const handleCheckout = async () => {
    setCheckoutLoading(true);
    try {
      const pixData = await paymentAPI.createPix(
        items.map((i) => ({ product_id: Number(i.id), quantity: i.quantity })),
        "Semcomp - Compra de produtos"
      );
      navigate("/loja/checkout", { state: { pixData, dietaryRestrictions } });
    } catch {
      showNotification("Erro ao gerar PIX. Tente novamente.", "warning");
    } finally {
      setCheckoutLoading(false);
    }
  };

  const bgColor = isDarkMode
    ? "bg-gradient-to-b from-semcompAlmostDarkBlue via-semcompDarkBlue to-semcompDarkBlue/80"
    : "bg-gradient-to-b from-semcompMidLightBlue to-semcompMidLightBlue/20";
  const textColor = isDarkMode ? "text-semcompOffWhite" : "text-semcompDarkBlue";
  const mutedText = isDarkMode ? "text-semcompOffWhite/60" : "text-semcompDarkBlue/60";
  const cardBg = isDarkMode ? "bg-semcompMidDarkBlue" : "bg-white";
  const cardBorder = isDarkMode ? "border-white/10" : "border-semcompMidLightBlue/20";
  const cardShadow = isDarkMode
    ? "shadow-[0_8px_40px_rgba(0,0,0,0.5)] hover:shadow-[0_12px_48px_rgba(0,0,0,0.65)]"
    : "shadow-[0_8px_40px_rgba(53,123,163,0.08)] hover:shadow-[0_12px_48px_rgba(53,123,163,0.12)]";
  const btnSolid = isDarkMode
    ? "bg-semcompOffWhite text-semcompMidDarkBlue hover:bg-gray-200 hover:shadow-[0_0_24px_rgba(255,255,255,0.25)]"
    : "bg-semcompMidLightBlue text-semcompOffWhite hover:bg-semcompMidDarkBlue hover:shadow-[0_0_18px_rgba(53,123,163,0.22)]";
  const headingSize = width > 768 ? "text-4xl" : "text-2xl";
  const gradientFrom = isDarkMode ? "from-semcompMidLightBlue" : "from-semcompDarkBlue";
  const gradientVia = isDarkMode ? "via-semcompMidLightBlue/80" : "via-semcompMidDarkBlue/90";
  const gradientTo = isDarkMode ? "to-semcompLightBlue" : "to-semcompMidDarkBlue/60";
  const divider = isDarkMode ? "border-white/10" : "border-semcompMidLightBlue/30";

  // ─── Carrinho vazio ─────────────────────────────────────
  if (items.length === 0) {
    return (
      <div className={`w-full min-h-screen font-poppins ${bgColor} transition-colors duration-300 flex flex-col items-center justify-center`}>
        <motion.div
          initial="hidden"
          animate="visible"
          variants={fadeIn}
          className="flex flex-col items-center gap-6 px-4 text-center"
        >
          <div className="rounded-full p-8 shadow-[0_6px_32px_rgba(0,0,0,0.12)]">
            <ShoppingBag size={72} className={mutedText} />
          </div>

          <h1 className={`${headingSize} font-extrabold`}>
            <span className={`${textColor} font-poppins`}>CARRINHO</span>{" "}
            <span className={`bg-clip-text font-poppins text-transparent bg-linear-to-r ${gradientFrom} ${gradientVia} ${gradientTo}`}>
              VAZIO
            </span>
          </h1>

          <p className={`max-w-xs ${isDarkMode ? "text-semcompOffWhite/60" : "text-semcompMidDarkBlue"}`}>
            Explore nosso catálogo e adicione seus produtos favoritos.
          </p>

          <Link
            to="/loja"
            className={`mt-2 inline-flex items-center gap-2 rounded-full px-8 py-3 text-sm font-bold transition-all duration-300 shadow-md ${btnSolid}`}
          >
            <ArrowLeft size={18} />
            Ver catálogo
          </Link>
        </motion.div>
      </div>
    );
  }

  return (
    <div className={`w-full min-h-screen font-poppins ${bgColor} transition-colors duration-300`}>
      {/* ── Header ───────────────────────────────────── */}
      <section className="pt-28 pb-8 md:pt-36 md:pb-12">
        <div className="mx-auto max-w-[80%]">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={fadeIn}
          >
            <Link
              to="/loja"
              className={`mb-4 inline-flex items-center gap-1.5 text-sm font-medium ${mutedText} hover:text-semcompMidDarkBlue transition-colors`}
            >
              <ArrowLeft size={16} />
              Continuar comprando
            </Link>

            <h1 className={`${headingSize} font-extrabold mb-2`}>
              <span className="text-semcompOffWhite font-poppins">MEU</span>{" "}
              <span className={`bg-clip-text font-poppins text-transparent bg-linear-to-r ${gradientFrom} ${gradientVia} ${gradientTo}`}>
                CARRINHO
              </span>
            </h1>

            <p className={`text-sm ${mutedText}`}>
              {totalItems} {totalItems === 1 ? "item" : "itens"}
            </p>
          </motion.div>
        </div>
      </section>

      {/* ── Conteúdo ─────────────────────────────────── */}
      <section className="py-10 md:py-16 transition-colors duration-300">
        <div className="mx-auto max-w-[80%]">
          <div className="grid gap-8 lg:grid-cols-[1fr_380px]">
            {/* Lista de itens */}
            <motion.div
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              variants={staggerList}
              className="space-y-4"
            >
              {items.map((item) => {
                return (
                  <motion.div
                    key={item.cartKey}
                    variants={fadeIn}
                    className={`flex gap-4 rounded-2xl border ${cardBorder} ${cardBg} p-4 sm:p-5 ${cardShadow}`}
                  >
                    {/* Imagem clicável para zoom */}
                    <div
                      className="relative h-24 w-24 sm:h-28 sm:w-28 shrink-0 rounded-xl overflow-hidden shadow-sm group/img cursor-zoom-in"
                      onClick={() => setZoomedImage({ url: item.image, alt: item.name })}
                    >
                      <img
                        src={item.image}
                        alt={item.name}
                        className="h-full w-full object-cover transition-transform duration-300 group-hover/img:scale-105"
                      />
                      <div className="absolute inset-0 bg-black/0 group-hover/img:bg-black/30 transition-colors duration-300 flex items-center justify-center">
                        <ZoomIn size={20} className="text-white opacity-0 group-hover/img:opacity-100 transition-opacity drop-shadow-lg" />
                      </div>
                    </div>

                    {/* Info */}
                    <div className="flex min-w-0 flex-1 flex-col gap-2">
                      <div className="flex items-start justify-between gap-2">
                        <div className="min-w-0 flex flex-col gap-1">
                          <h3 className={`font-poppins font-bold leading-tight ${textColor}`}>
                            {item.name}
                          </h3>

                          {/* Atributos do item */}
                          <div className={`flex flex-col gap-0.5 text-xs ${mutedText}`}>
                            {item.size && (
                              <p>
                                Tamanho: <span className="font-semibold">{item.size}</span>
                                {item.isBabydoll && <span className="ml-1 font-semibold">· Babydoll</span>}
                              </p>
                            )}
                            {item.dateTime && (
                              <p>
                                {formatDateTime(item.dateTime)}
                              </p>
                            )}
                            {item.comboDateTimes && item.comboDateTimes.length > 0 && (
                              <p>
                                Coffee incluído: {item.comboDateTimes.map((t) => formatDateTime(t)).join(", ")}
                              </p>
                            )}
                            <p className="font-medium">{formatBRL(item.price)}/un</p>
                          </div>
                        </div>

                        <button
                          type="button"
                          onClick={() => removeItem(item.cartKey)}
                          aria-label={`Remover ${item.name}`}
                          className={`shrink-0 rounded-full p-2 ${isDarkMode ? "text-semcompOffWhite/50" : "text-semcompDarkBlue/40"} hover:bg-red-500/10 hover:text-red-500 transition-colors cursor-pointer`}
                        >
                          <Trash2 size={15} />
                        </button>
                      </div>

                      <div className="flex items-center justify-between mt-auto">
                        {/* Controle de quantidade */}
                        <div className={`flex h-9 items-center rounded-full border ${cardBorder} ${cardBg} py-5 px-1 shadow-sm`}>
                          <button
                            type="button"
                            onClick={() => updateQuantity(item.cartKey, -1)}
                            aria-label="Diminuir"
                            className={`w-8 h-8 rounded-full border ${cardBorder} flex items-center justify-center ${textColor} hover:bg-semcompMidLightBlue/20 transition-colors cursor-pointer`}
                          >
                            <Minus size={14} />
                          </button>
                          <span className={`w-8 text-center text-sm font-bold ${textColor}`}>
                            {item.quantity}
                          </span>
                          <button
                            type="button"
                            onClick={() => updateQuantity(item.cartKey, 1)}
                            aria-label="Aumentar"
                            className={`w-8 h-8 rounded-full border ${cardBorder} flex items-center justify-center ${textColor} hover:bg-semcompMidLightBlue/20 transition-colors cursor-pointer`}
                          >
                            <Plus size={14} />
                          </button>
                        </div>

                        <p className={`text-base font-extrabold ${textColor}`}>
                          {formatBRL(item.price * item.quantity)}
                        </p>
                      </div>
                    </div>
                  </motion.div>
                );
              })}

              <button
                type="button"
                onClick={clearCart}
                className={`mt-2 text-xs font-medium ${mutedText} hover:text-red-500 transition-colors cursor-pointer`}
              >
                Limpar carrinho
              </button>
            </motion.div>

            {/* Resumo do pedido */}
            <aside className="space-y-4 lg:sticky lg:top-24 lg:h-fit">
              <div className={`rounded-2xl border ${cardBorder} ${cardBg} p-5 sm:p-6 ${cardShadow}`}>
                <h2 className={`mb-4 flex items-center gap-2 text-xs font-bold uppercase tracking-widest ${textColor}`}>
                  <Store size={16} />
                  Resumo do Pedido
                </h2>

                <div className="space-y-3 text-sm">
                  {/* Itens do pedido */}
                  {items.map((item) => (
                    <div key={item.cartKey} className={`flex justify-between ${mutedText}`}>
                      <span className="truncate mr-2">{item.name}{item.quantity > 1 ? ` (${item.quantity}x)` : ""}</span>
                      <span className={`font-bold ${textColor} shrink-0`}>{formatBRL(item.price * item.quantity)}</span>
                    </div>
                  ))}

                  <div className={`flex flex-col gap-0.5 ${mutedText} pt-1`}>
                    <span>Retirada</span>
                    <span className="text-xs font-bold text-green-600/80 dark:text-green-400/80 leading-snug">
                      Informações sobre a retirada serão disponibilizadas em breve, acompanhe as nossas redes sociais!
                    </span>
                  </div>

                  <div className={`flex justify-between border-t ${divider} pt-4`}>
                    <span className={`text-base font-extrabold ${textColor}`}>Total</span>
                    <span className={`text-xl font-extrabold ${textColor}`}>{formatBRL(subtotal)}</span>
                  </div>
                </div>

                {(items.length > 0 && items.some((i) => i.type === "COFFEE")) && (
                  <div className={`mt-5 border-t ${divider} pt-4`}>
                    <label
                      htmlFor="dietary-restrictions"
                      className={`mb-1.5 block text-xs font-bold uppercase tracking-widest ${textColor}`}
                    >
                      Restrições alimentares
                  </label>
                  <textarea
                    id="dietary-restrictions"
                    value={dietaryRestrictions}
                    onChange={(e) => setDietaryRestrictions(e.target.value)}
                    maxLength={1000}
                    rows={2}
                    placeholder="Ex: Vegano, sem lactose, alergia a amendoim"
                    className={`w-full resize-none rounded-xl border ${cardBorder} ${cardBg} px-3 py-2 text-sm ${textColor} shadow-sm focus:outline-none focus:ring-2 focus:ring-semcompMidLightBlue`}
                  />
                  <p className={`mt-1.5 text-[11px] ${mutedText}`}>
                    Se o seu pedido incluir coffee break, conte pra gente se você tem alguma restrição alimentar (opcional).
                  </p>
                </div>
                )}

                <button
                  type="button"
                  onClick={handleCheckout}
                  disabled={checkoutLoading}
                  className={`mt-6 flex w-full items-center justify-center gap-2 rounded-full py-3.5 text-sm font-bold transition-all duration-300 cursor-pointer focus:outline-none focus:ring-2 focus:ring-semcompMidLightBlue focus:ring-offset-2 active:scale-95 shadow-lg disabled:opacity-60 ${btnSolid}`}
                >
                  {checkoutLoading ? "Gerando PIX..." : "Finalizar Pedido"}
                  {!checkoutLoading && <ArrowRight size={18} />}
                </button>

                <p className={`mt-3 text-center text-[11px] ${mutedText}`}>
                  Pagamento processado via integração com Mercado Pago. Você será redirecionado para a página de pagamento com QR Code.
                </p>
              </div>

              <Link
                to="/loja"
                className={`block w-full rounded-full border-2 py-3 text-center text-sm font-bold transition-all duration-300 shadow-md ${
                  isDarkMode
                    ? "border-semcompOffWhite text-semcompOffWhite hover:bg-semcompOffWhite hover:text-semcompMidDarkBlue"
                    : "border-semcompMidDarkBlue text-semcompMidDarkBlue hover:bg-semcompMidDarkBlue hover:text-semcompOffWhite"
                }`}
              >
                <span className="flex items-center justify-center gap-2">
                  <ArrowLeft size={16} />
                  Continuar comprando
                </span>
              </Link>
            </aside>
          </div>
        </div>
      </section>

      {/* ── Lightbox de zoom ─────────────────────────── */}
      <AnimatePresence>
        {zoomedImage && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-[200] bg-black/95 flex items-center justify-center p-4"
            onClick={() => setZoomedImage(null)}
          >
            <button
              type="button"
              className="absolute top-5 right-5 z-10 rounded-full bg-white/10 hover:bg-white/25 p-3 text-white transition-colors cursor-pointer shadow-lg"
              onClick={() => setZoomedImage(null)}
              aria-label="Fechar"
            >
              <X size={22} />
            </button>

            <motion.img
              initial={{ scale: 0.88, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.88, opacity: 0 }}
              transition={{ duration: 0.22, ease: "easeOut" }}
              src={zoomedImage.url}
              alt={zoomedImage.alt}
              className="max-w-[90vw] max-h-[88vh] object-contain rounded-2xl shadow-2xl cursor-default"
              onClick={(e) => e.stopPropagation()}
            />

            <p className="absolute bottom-5 left-1/2 -translate-x-1/2 text-white/40 text-sm font-medium select-none">
              {zoomedImage.alt} · Clique fora para fechar
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
