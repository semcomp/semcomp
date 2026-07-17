import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { useTheme } from "@/contexts/useTheme";
import useWindowDimensions from "@/hooks/useWindowDimensions";
import { useCart } from "@/contexts/CartContext";
import {
  ShoppingBag,
  Trash2,
  Minus,
  Plus,
  ArrowLeft,
  ArrowRight,
  Store,
} from "lucide-react";

// ─── Animação ────────────────────────────────────────────
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

// ─── CartPage ─────────────────────────────────────────────
export default function CartPage() {
  const { isDarkMode } = useTheme();
  const { width } = useWindowDimensions();
  const { items, removeItem, updateQuantity, clearCart, subtotal, totalItems } = useCart();

  // ─── Cores ──────────────────────────────────────────────
  const bgColor = isDarkMode ? "bg-semcompDarkBlue" : "bg-semcompLightBlue";
  const sectionBg = isDarkMode ? "bg-semcompAlmostDarkBlue" : "bg-semcompOffWhite";
  const textColor = isDarkMode ? "text-semcompOffWhite" : "text-semcompDarkBlue";
  const mutedText = isDarkMode ? "text-semcompOffWhite/60" : "text-semcompDarkBlue/60";
  const mutedText2 = isDarkMode ? "text-semcompOffWhite/40" : "text-semcompDarkBlue/40";
  const cardBg = isDarkMode ? "bg-semcompMidDarkBlue" : "bg-white";
  const cardBorder = isDarkMode ? "border-white/10" : "border-gray-200";
  const cardShadow = isDarkMode
    ? "shadow-[0_8px_40px_rgba(0,0,0,0.5)] hover:shadow-[0_12px_48px_rgba(0,0,0,0.65)]"
    : "shadow-[0_8px_40px_rgba(0,0,0,0.12)] hover:shadow-[0_12px_48px_rgba(0,0,0,0.2)]";
  // Botão sólido com cores invertidas (igual ao floating mobile da loja)
  const btnSolid = isDarkMode
    ? "bg-semcompOffWhite text-semcompMidDarkBlue hover:bg-gray-200 hover:shadow-[0_0_24px_rgba(255,255,255,0.25)]"
    : "bg-semcompMidDarkBlue text-semcompOffWhite hover:bg-semcompDarkBlue hover:shadow-[0_0_24px_rgba(0,48,80,0.45)]";
  const headingSize = width > 768 ? "text-4xl" : "text-2xl";
  const gradientFrom = isDarkMode ? "from-semcompLightBlue/80" : "from-semcompDarkBlue/80";
  const gradientVia = isDarkMode ? "via-semcompLightBlue" : "via-semcompDarkBlue";
  const gradientTo = isDarkMode ? "to-semcompOffWhite" : "to-semcompOffBlack";
  const divider = isDarkMode ? "border-white/10" : "border-gray-200";

  // ─── Carrinho vazio ─────────────────────────────────────
  if (items.length === 0) {
    return (
      <div
        className={`w-full min-h-screen font-poppins ${bgColor} transition-colors duration-300 flex flex-col items-center justify-center`}
      >
        <motion.div
          initial="hidden"
          animate="visible"
          variants={fadeIn}
          className="flex flex-col items-center gap-6 px-4 text-center"
        >
          <div className={`rounded-full ${sectionBg} p-8 shadow-[0_6px_32px_rgba(0,0,0,0.12)]`}>
            <ShoppingBag size={72} className={mutedText2} />
          </div>

          <h1 className={`${headingSize} font-extrabold`}>
            <span className={`${textColor} font-poppins`}>CARRINHO</span>{" "}
            <span
              className={`bg-clip-text font-poppins text-transparent bg-linear-to-r ${gradientFrom} ${gradientVia} ${gradientTo}`}
            >
              VAZIO
            </span>
          </h1>

          <p className={`max-w-xs ${mutedText}`}>
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
              <span className={`${textColor} font-poppins`}>MEU</span>{" "}
              <span
                className={`bg-clip-text font-poppins text-transparent bg-linear-to-r ${gradientFrom} ${gradientVia} ${gradientTo}`}
              >
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
      <section className={`${sectionBg} py-10 md:py-16 transition-colors duration-300`}>
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
              {items.map((item) => (
                <motion.div
                  key={item.cartKey}
                  variants={fadeIn}
                  className={`flex gap-4 rounded-2xl border ${cardBorder} ${cardBg} p-4 sm:p-5 ${cardShadow}`}
                >
                  {/* Imagem */}
                  <img
                    src={item.image}
                    alt={item.name}
                    className="h-20 w-20 sm:h-24 sm:w-24 shrink-0 rounded-xl object-cover shadow-sm"
                  />

                  {/* Info */}
                  <div className="flex min-w-0 flex-1 flex-col gap-2">
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0">
                        <h3 className={`font-poppins font-bold leading-tight ${textColor}`}>
                          {item.name}
                        </h3>
                        {/* Opções selecionadas */}
                        {item.size && (
                          <p className={`text-xs ${mutedText} mt-0.5`}>
                            Tamanho: <span className="font-semibold">{item.size}</span>
                          </p>
                        )}
                        {item.dateTime && (
                          <p className={`text-xs ${mutedText} mt-0.5`}>
                            🕐 {new Date(item.dateTime).toLocaleDateString("pt-BR", {
                              day: "2-digit", month: "long", hour: "2-digit", minute: "2-digit"
                            })}
                          </p>
                        )}
                        {item.isBabydoll && (
                          <p className={`text-xs ${mutedText} mt-0.5`}>
                            Modelo: <span className="font-semibold">Babydoll</span>
                          </p>
                        )}
                        <p className={`text-xs ${mutedText} mt-0.5`}>{formatBRL(item.price)}/un</p>
                      </div>
                      <button
                        type="button"
                        onClick={() => removeItem(item.cartKey)}
                        aria-label={`Remover ${item.name}`}
                        className={`shrink-0 rounded-full p-2 ${mutedText} hover:bg-red-500/10 hover:text-red-500 transition-colors cursor-pointer`}
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>

                    <div className="flex items-center justify-between mt-auto">
                      {/* Controle de quantidade */}
                      <div
                        className={`flex h-9 items-center rounded-full border ${cardBorder} ${cardBg} px-1 shadow-sm`}
                      >
                        <button
                          type="button"
                          onClick={() => updateQuantity(item.cartKey, -1)}
                          aria-label="Diminuir"
                          className={`w-8 h-8 rounded-full border ${cardBorder} flex items-center justify-center ${textColor} hover:bg-semcompLightBlue/20 transition-colors cursor-pointer`}
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
                          className={`w-8 h-8 rounded-full border ${cardBorder} flex items-center justify-center ${textColor} hover:bg-semcompLightBlue/20 transition-colors cursor-pointer`}
                        >
                          <Plus size={14} />
                        </button>
                      </div>

                      <p className={`text-base font-extrabold text-semcompMidDarkBlue`}>
                        {formatBRL(item.price * item.quantity)}
                      </p>
                    </div>
                  </div>
                </motion.div>
              ))}

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

                <div className={`space-y-3 text-sm`}>
                  <div className={`flex justify-between ${mutedText}`}>
                    <span>Subtotal</span>
                    <span className={`font-bold ${textColor}`}>{formatBRL(subtotal)}</span>
                  </div>
                  <div className={`flex justify-between ${mutedText}`}>
                    <span>Frete</span>
                    <span className={`font-bold text-green-600 dark:text-green-400`}>Grátis</span>
                  </div>
                  <div className={`flex justify-between border-t ${divider} pt-4`}>
                    <span className={`text-base font-extrabold ${textColor}`}>Total</span>
                    <span className={`text-xl font-extrabold text-semcompMidDarkBlue`}>
                      {formatBRL(subtotal)}
                    </span>
                  </div>
                </div>

                <button
                  type="button"
                  className={`mt-6 flex w-full items-center justify-center gap-2 rounded-full py-3.5 text-sm font-bold transition-all duration-300 cursor-pointer focus:outline-none focus:ring-2 focus:ring-semcompLightBlue focus:ring-offset-2 active:scale-95 shadow-lg ${btnSolid}`}
                >
                  Finalizar Pedido
                  <ArrowRight size={18} />
                </button>

                <p className={`mt-3 text-center text-[11px] ${mutedText2}`}>
                  Pagamento seguro processado via plataforma parceira
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
</div>
);
}