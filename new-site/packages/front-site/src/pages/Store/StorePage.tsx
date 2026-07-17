import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { useTheme } from "@/contexts/useTheme";
import useWindowDimensions from "@/hooks/useWindowDimensions";
import Modal from "@/components/ui/Modal";
import { useCart, type AddToCartParams } from "@/contexts/CartContext";
import { ShoppingCart, Minus, Plus, X, ShoppingBag, Package, Loader2 } from "lucide-react";
import { productsAPI } from "@/api/products";
import type { Product, ProductType } from "@/types/ProductType";

// ─── Tipos ────────────────────────────────────────────────
interface StoreItem {
  id: string;
  name: string;
  category: string;
  description: string;
  price: string;
  priceValue: number;
  badge?: string;
  image: string;
  /** Categoria raw (KIT | COFFEE | COMBO) */
  rawType: ProductType;
  /** Opções disponíveis para o produto */
  availableSizes: string[];
  availableDateTimes: string[];
  /** Opções pré-selecionadas */
  defaultSize?: string;
  defaultDateTime?: string;
  isBabydoll?: boolean;
}

function collectComboDateTimes(product: Product, productById: Map<number, Product>): string[] {
  if (product.type !== "COMBO" || !product.combo_items?.length) return [];

  const dateTimes = new Set<string>();
  for (const comboItem of product.combo_items) {
    const referencedProduct = productById.get(comboItem.item_id);
    if (referencedProduct?.type === "COFFEE" && referencedProduct.coffee?.date_time) {
      dateTimes.add(referencedProduct.coffee.date_time);
    }
  }

  return [...dateTimes];
}

// ─── Helpers ──────────────────────────────────────────────
function formatBRL(value: number): string {
  return value.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

function formatDateTime(iso: string): string {
  const d = new Date(iso);
  return d.toLocaleDateString("pt-BR", {
    day: "2-digit",
    month: "long",
    hour: "2-digit",
    minute: "2-digit",
  });
}

const SIZES = ["PP", "P", "M", "G", "GG", "XG"];

function productToStoreItem(p: Product, productById: Map<number, Product>): StoreItem {
  const categoryMap: Record<string, string> = {
    KIT: "Kit",
    COFFEE: "Coffee Break",
    COMBO: "Combo",
  };

  const name = p.kit?.name ?? p.coffee?.name ?? p.type;
  const availableDateTimes =
    p.type === "COMBO"
      ? collectComboDateTimes(p, productById)
      : p.coffee?.date_time
        ? [p.coffee.date_time]
        : [];
  const description = p.kit
    ? `${p.kit.size} · ${p.kit.color}${p.kit.is_babydoll ? " · Babydoll" : ""}`
    : p.type === "COMBO"
      ? `Combo com ${p.combo_items?.length ?? 0} itens`
      : "Coffee Break da Semcomp";

  return {
    id: String(p.id),
    name,
    category: categoryMap[p.type] ?? p.type,
    description,
    price: formatBRL(p.price),
    priceValue: p.price,
    image: `https://placehold.co/600x400/0B2639/FAFDFF?text=${encodeURIComponent(name)}`,
    rawType: p.type,
    availableSizes: SIZES,
    availableDateTimes,
    defaultSize: p.kit?.size ?? undefined,
    defaultDateTime: availableDateTimes[0] ?? undefined,
    isBabydoll: p.kit?.is_babydoll ?? undefined,
  };
}

// ─── Constantes de animação ──────────────────────────────
const fadeIn = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6 } },
};

const stagger = {
  visible: { transition: { staggerChildren: 0.08 } },
};

// ─── Badge color helper ──────────────────────────────────
function badgeColor(badge: string, isDark: boolean) {
  const map: Record<string, string> = {
    Novo: isDark
      ? "bg-green-500/20 text-green-300 border-green-500/30"
      : "bg-green-100 text-green-700 border-green-300",
    Popular: isDark
      ? "bg-amber-500/20 text-amber-300 border-amber-500/30"
      : "bg-amber-100 text-amber-700 border-amber-300",
    Premium: isDark
      ? "bg-purple-500/20 text-purple-300 border-purple-500/30"
      : "bg-purple-100 text-purple-700 border-purple-300",
    Limitado: isDark
      ? "bg-rose-500/20 text-rose-300 border-rose-500/30"
      : "bg-rose-100 text-rose-700 border-rose-300",
  };
  return map[badge] ?? (isDark ? "bg-semcompLightBlue/20 text-semcompOffWhite border-white/10" : "bg-semcompLightBlue text-semcompDarkBlue border-semcompLightBlue");
}

// ─── StorePage ────────────────────────────────────────────
export default function StorePage() {
  const { isDarkMode } = useTheme();
  const { width } = useWindowDimensions();
  const { addItem, totalItems } = useCart();

  const [selected, setSelected] = useState<StoreItem | null>(null);
  const [qty, setQty] = useState(1);
  const [selectedSize, setSelectedSize] = useState<string>("");
  const [selectedDateTime, setSelectedDateTime] = useState<string>("");
  const [selectedIsBabydoll, setSelectedIsBabydoll] = useState(false);
  const [products, setProducts] = useState<StoreItem[]>([]);
  const [loading, setLoading] = useState(true);

  // Busca produtos da API
  useEffect(() => {
    let cancelled = false;
    async function fetchProducts() {
      try {
        setLoading(true);
        const data = await productsAPI.getAllProducts();
        if (!cancelled) {
          const selling = data.products.filter((p) => p.is_selling);
          const productById = new Map(selling.map((p) => [p.id, p] as const));
          setProducts(selling.map((product) => productToStoreItem(product, productById)));
        }
      } catch {
        if (!cancelled) setProducts([]);
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    fetchProducts();
    return () => { cancelled = true; };
  }, []);

  // ─── Cores responsivas ao tema ──────────────────────────
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
  const headingSize = width > 768 ? "text-4xl" : "text-2xl";
  const gradientFrom = isDarkMode ? "from-semcompLightBlue/80" : "from-semcompDarkBlue/80";
  const gradientVia = isDarkMode ? "via-semcompLightBlue" : "via-semcompDarkBlue";
  const gradientTo = isDarkMode ? "to-semcompOffWhite" : "to-semcompOffBlack";
  // Botão sólido com cores invertidas (igual ao floating mobile)
  const btnSolid = isDarkMode
    ? "bg-semcompOffWhite text-semcompMidDarkBlue hover:bg-gray-200 hover:shadow-[0_0_24px_rgba(255,255,255,0.25)]"
    : "bg-semcompMidDarkBlue text-semcompOffWhite hover:bg-semcompDarkBlue hover:shadow-[0_0_24px_rgba(0,48,80,0.45)]";
  const divider = isDarkMode ? "border-white/10" : "border-gray-200";

  // ─── Handlers ───────────────────────────────────────────
  const openModal = (item: StoreItem) => {
    setSelected(item);
    setQty(1);
    setSelectedSize(item.defaultSize ?? (item.rawType !== "COFFEE" ? SIZES[0] : ""));
    setSelectedDateTime(item.defaultDateTime ?? "");
    setSelectedIsBabydoll(item.isBabydoll ?? false);
  };

  const closeModal = () => {
    setSelected(null);
  };

  const handleAddToCart = () => {
    if (!selected) return;
    const params: AddToCartParams = {
      id: selected.id,
      name: selected.name,
      price: selected.priceValue,
      image: selected.image,
      size: selectedSize || undefined,
      dateTime: selectedDateTime || undefined,
      isBabydoll: selectedIsBabydoll || undefined,
    };
    // Adiciona N unidades de uma vez
    for (let i = 0; i < qty; i++) {
      addItem(params);
    }
    closeModal();
  };

  return (
    <div className={`w-full min-h-screen font-poppins ${bgColor} transition-colors duration-300`}>
      {/* ── Header da página ─────────────────────────── */}
      <section className="pt-28 pb-10 md:pt-36 md:pb-16">
        <div className="mx-auto max-w-[80%]">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={fadeIn}
            className="flex flex-col md:flex-row md:items-end md:justify-between"
          >
            <div>
              <p className={`text-sm font-semibold uppercase tracking-widest ${mutedText} mb-2`}>
                Monte seu pedido
              </p>

              <h1 className={`${headingSize} font-extrabold mb-4`}>
                <span className={`${textColor} font-poppins`}>NOSSA</span>{" "}
                <span
                  className={`bg-clip-text font-poppins text-transparent bg-linear-to-r ${gradientFrom} ${gradientVia} ${gradientTo}`}
                >
                  LOJA
                </span>
              </h1>

              <p className={`max-w-2xl text-base md:text-lg leading-relaxed ${mutedText}`}>
                Explore nossa seleção de produtos exclusivos da Semcomp e leve um pedacinho do
                evento com você.
              </p>
            </div>

            {/* ── Botão do carrinho (desktop) ─────────── */}
            <Link
              to="/loja/carrinho"
              className={`hidden md:flex relative items-center gap-3 rounded-2xl border ${cardBorder} ${cardBg} px-5 py-3.5 transition-all duration-300 ${cardShadow} cursor-pointer ${isDarkMode ? "shadow-[0_6px_32px_rgba(0,0,0,0.5)] hover:shadow-[0_10px_40px_rgba(0,0,0,0.65)]" : "shadow-[0_6px_32px_rgba(0,0,0,0.1)] hover:shadow-[0_10px_40px_rgba(0,0,0,0.18)]"}`}
            >
              <div className="relative">
                <ShoppingBag size={24} className={textColor} />
                {totalItems > 0 && (
                  <span className="absolute -right-2 -top-2 flex h-5 w-5 items-center justify-center rounded-full bg-semcompMidDarkBlue text-[10px] font-bold text-semcompOffWhite ring-2 ring-white">
                    {totalItems}
                  </span>
                )}
              </div>
              <div className="text-left">
                <p className={`text-xs ${mutedText2}`}>Meu Carrinho</p>
                <p className={`text-sm font-bold ${textColor}`}>
                  {totalItems === 0
                    ? "Vazio"
                    : `${totalItems} ${totalItems === 1 ? "item" : "itens"}`}
                </p>
              </div>
            </Link>
          </motion.div>
        </div>
      </section>

      {/* ── Grid de produtos ─────────────────────────── */}
      <section className={`${sectionBg} py-12 md:py-20 transition-colors duration-300`}>
        <div className="mx-auto max-w-[80%]">
          {loading ? (
            <motion.div
              initial="visible"
              whileInView="visible"
              viewport={{ once: true }}
              variants={fadeIn}
              className="flex flex-col items-center justify-center py-20"
            >
              <Loader2 size={48} className={`mb-4 animate-spin ${mutedText}`} />
              <p className={`text-lg ${mutedText}`}>Carregando produtos...</p>
            </motion.div>
          ) : products.length === 0 ? (
            <motion.div
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              variants={fadeIn}
              className="flex flex-col items-center justify-center py-20"
            >
              <Package size={64} className={`mb-4 ${mutedText}`} />
              <p className={`text-lg ${mutedText}`}>Nenhum produto disponível no momento.</p>
              <p className={`text-sm ${mutedText}`}>Volte em breve para conferir as novidades!</p>
            </motion.div>
          ) : (
            <motion.div
              initial="visible"
              whileInView="visible"
              viewport={{ once: true, amount: 0.1 }}
              variants={stagger}
              className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8"
            >
              {products.map((item) => (
                <motion.article
                  key={item.id}
                  variants={fadeIn}
                  className={`group cursor-pointer rounded-2xl border ${cardBorder} ${cardBg} overflow-hidden transition-all duration-300 hover:-translate-y-2 ${cardShadow}`}
                  onClick={() => openModal(item)}
                >
                  {/* Imagem */}
                  <div className="relative overflow-hidden aspect-4/3">
                    <img
                      src={item.image}
                      alt={item.name}
                      loading="lazy"
                      className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
                    />

                    {/* Overlay no hover */}
                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors duration-300" />

                    {item.badge && (
                      <span
                        className={`absolute left-3 top-3 rounded-full border px-3 py-1 text-xs font-bold backdrop-blur-sm ${badgeColor(item.badge, isDarkMode)}`}
                      >
                        {item.badge}
                      </span>
                    )}
                  </div>

                  {/* Conteúdo */}
                  <div className="p-5 flex flex-col gap-3">
                    <div className="flex items-start justify-between gap-3">
                      <h3 className={`font-poppins font-bold text-lg leading-tight ${textColor}`}>
                        {item.name}
                      </h3>
                      <span className="shrink-0 font-extrabold text-lg text-semcompMidDarkBlue">
                        {item.price}
                      </span>
                    </div>

                    <p className={`text-xs font-semibold uppercase tracking-wide ${mutedText}`}>
                      {item.category}
                    </p>

                    <p className={`text-sm leading-relaxed ${mutedText} line-clamp-2`}>
                      {item.description}
                    </p>

                    {/* ── Seletor in-line no card ─────────── */}
                    {item.rawType === "KIT" && (
                      <div className="flex flex-wrap gap-1.5">
                        {item.availableSizes.map((s) => (
                          <button
                            key={s}
                            onClick={(e) => { e.stopPropagation(); }}
                            className={`px-2.5 py-1 text-xs font-bold rounded-md border transition-all cursor-pointer ${cardBorder} ${mutedText} hover:border-semcompMidDarkBlue hover:text-semcompMidDarkBlue`}
                          >
                            {s}
                          </button>
                        ))}
                      </div>
                    )}
                    {item.rawType === "COFFEE" && item.availableDateTimes.length > 0 && (
                      <p className={`text-xs ${mutedText2}`}>
                        🕐 {formatDateTime(item.availableDateTimes[0])}
                      </p>
                    )}
                    {item.rawType === "COMBO" && (
                      <div className="flex flex-wrap gap-1.5">
                        {item.availableSizes.map((s) => (
                          <button
                            key={s}
                            onClick={(e) => { e.stopPropagation(); }}
                            className={`px-2.5 py-1 text-xs font-bold rounded-md border transition-all cursor-pointer ${cardBorder} ${mutedText} hover:border-semcompMidDarkBlue hover:text-semcompMidDarkBlue`}
                          >
                            {s}
                          </button>
                        ))}
                        {item.availableDateTimes.length > 0 && (
                          <span className={`px-2.5 py-1 text-xs font-bold rounded-md border bg-semcompMidDarkBlue/10 ${cardBorder} ${mutedText}`}>
                            🕐 {formatDateTime(item.availableDateTimes[0])}
                          </span>
                        )}
                      </div>
                    )}

                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        addItem({
                          id: item.id,
                          name: item.name,
                          price: item.priceValue,
                          image: item.image,
                          size: item.defaultSize,
                          dateTime: item.defaultDateTime,
                          isBabydoll: item.isBabydoll,
                        });
                      }}
                      className={`mt-2 w-full rounded-full py-2.5 text-sm font-bold transition-all duration-300 cursor-pointer focus:outline-none focus:ring-2 focus:ring-semcompLightBlue focus:ring-offset-2 active:scale-95 shadow-md ${btnSolid}`}
                    >
                      <span className="flex items-center justify-center gap-2">
                        <ShoppingCart size={18} />
                        Comprar
                      </span>
                    </button>
                  </div>
                </motion.article>
              ))}
            </motion.div>
          )}
        </div>
      </section>

      {/* ── Modal de detalhes ────────────────────────── */}
      <Modal open={!!selected} onClose={closeModal} size="xl" closeOnBackdrop>
        {selected && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Imagem */}
            <div className="rounded-2xl overflow-hidden aspect-square shadow-[0_4px_20px_rgba(0,0,0,0.15)]">
              <img
                src={selected.image}
                alt={selected.name}
                className="h-full w-full object-cover"
              />
            </div>

            {/* Info */}
            <div className="flex flex-col gap-5">
              <div className="flex items-start justify-between">
                <div>
                  <span className={`text-xs font-semibold uppercase tracking-wide ${mutedText}`}>
                    {selected.category}
                  </span>
                  <h2 className={`mt-1 font-poppins text-2xl font-extrabold ${textColor}`}>
                    {selected.name}
                  </h2>
                </div>
                <button
                  onClick={closeModal}
                  className={`p-2 rounded-full transition-colors ${mutedText} hover:bg-semcompMidDarkBlue/10 hover:text-semcompDarkBlue cursor-pointer`}
                >
                  <X size={20} />
                </button>
              </div>

              {selected.badge && (
                <span
                  className={`self-start rounded-full border px-3 py-1 text-xs font-bold ${badgeColor(selected.badge, isDarkMode)}`}
                >
                  {selected.badge}
                </span>
              )}

              <p className={`text-3xl font-extrabold text-semcompMidDarkBlue`}>{selected.price}</p>

              <p className={`text-sm leading-relaxed ${mutedText}`}>{selected.description}</p>

              <div className={`border-t ${divider} pt-5 space-y-5`}>
                {/* ── Seletor de Tamanho (Kit / Combo) ── */}
                {(selected.rawType === "KIT" || selected.rawType === "COMBO") && (
                  <div>
                    <span className={`text-sm font-semibold ${textColor}`}>Tamanho da camiseta</span>
                    <div className="flex flex-wrap gap-2 mt-2">
                      {selected.availableSizes.map((s) => (
                        <button
                          key={s}
                          onClick={() => setSelectedSize(s)}
                          className={`min-w-11 px-3 py-2 text-sm font-bold rounded-lg border transition-all cursor-pointer ${
                            selectedSize === s
                              ? "bg-semcompMidDarkBlue text-semcompOffWhite border-semcompMidDarkBlue shadow-md"
                              : `${cardBorder} ${mutedText} hover:border-semcompMidDarkBlue hover:text-semcompMidDarkBlue hover:bg-semcompMidDarkBlue/5`
                          }`}
                        >
                          {s}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* ── Seletor de Horário (Coffee / Combo) ── */}
                {(selected.rawType === "COFFEE" || selected.rawType === "COMBO") && selected.availableDateTimes.length > 0 && (
                  <div>
                    <span className={`text-sm font-semibold ${textColor}`}>
                      {selected.rawType === "COMBO" ? "Horário do Coffee Break" : "Horário do Coffee Break"}
                    </span>
                    <div className="flex flex-wrap gap-2 mt-2">
                      {selected.availableDateTimes.map((dt) => (
                        <button
                          key={dt}
                          onClick={() => setSelectedDateTime(dt)}
                          className={`px-3 py-2 text-sm font-bold rounded-lg border transition-all cursor-pointer ${
                            selectedDateTime === dt
                              ? "bg-semcompMidDarkBlue text-semcompOffWhite border-semcompMidDarkBlue shadow-md"
                              : `${cardBorder} ${mutedText} hover:border-semcompMidDarkBlue hover:text-semcompMidDarkBlue hover:bg-semcompMidDarkBlue/5`
                          }`}
                        >
                          🕐 {formatDateTime(dt)}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* ── Quantidade ──────────────────────── */}
                <div className="flex items-center justify-between">
                  <span className={`text-sm font-semibold ${textColor}`}>Quantidade</span>
                  <div className="flex items-center gap-3">
                    <button
                      onClick={() => setQty((p) => Math.max(1, p - 1))}
                      className={`w-10 h-10 rounded-full border ${cardBorder} ${cardBg} flex items-center justify-center ${textColor} hover:bg-semcompLightBlue/20 transition cursor-pointer shadow-sm`}
                    >
                      <Minus size={16} />
                    </button>
                    <span className={`w-8 text-center font-bold text-lg ${textColor}`}>{qty}</span>
                    <button
                      onClick={() => setQty((p) => p + 1)}
                      className={`w-10 h-10 rounded-full border ${cardBorder} ${cardBg} flex items-center justify-center ${textColor} hover:bg-semcompLightBlue/20 transition cursor-pointer shadow-sm`}
                    >
                      <Plus size={16} />
                    </button>
                  </div>
                </div>

                {/* Preço total */}
                <div className={`pt-5 border-t ${divider}`}>
                  <div className="flex items-center justify-between">
                    <span className={`font-bold ${textColor}`}>Total</span>
                    <span className={`text-2xl font-extrabold text-semcompMidDarkBlue`}>
                      R$ {(selected.priceValue * qty).toFixed(2).replace(".", ",")}
                    </span>
                  </div>
                </div>
              </div>

              <button
                type="button"
                onClick={handleAddToCart}
                className={`mt-2 w-full rounded-full py-3.5 text-base font-bold transition-all duration-300 cursor-pointer focus:outline-none focus:ring-2 focus:ring-semcompLightBlue focus:ring-offset-2 active:scale-95 shadow-lg ${btnSolid}`}
              >
                <span className="flex items-center justify-center gap-2">
                  <ShoppingCart size={20} />
                  Adicionar ao carrinho ({qty})
                </span>
              </button>

              <Link
                to="/loja/carrinho"
                onClick={closeModal}
                className={`w-full rounded-full border-2 py-3 text-center text-sm font-bold transition-all duration-300 cursor-pointer shadow-md ${
                  isDarkMode
                    ? "border-semcompOffWhite text-semcompOffWhite hover:bg-semcompOffWhite hover:text-semcompMidDarkBlue"
                    : "border-semcompMidDarkBlue text-semcompMidDarkBlue hover:bg-semcompMidDarkBlue hover:text-semcompOffWhite"
                }`}
              >
                <span className="flex items-center justify-center gap-2">
                  <ShoppingBag size={18} />
                  Ir para o carrinho
                </span>
              </Link>
            </div>
          </div>
        )}
      </Modal>

      {/* ── Floating cart button (mobile) ─────────────── */}
      {totalItems > 0 && (
        <Link
          to="/loja/carrinho"
          className={`md:hidden fixed bottom-6 left-6 z-40 flex items-center gap-3 rounded-2xl ${ isDarkMode ? "bg-semcompOffWhite" : "bg-semcompMidDarkBlue"} px-5 py-3.5 text-sm font-bold ${ isDarkMode ? "text-semcompMidDarkBlue" : "text-semcompOffWhite"} shadow-[0_8px_32px_rgba(0,48,80,0.4)] transition-all duration-300 hover:scale-105 hover:shadow-[0_12px_40px_rgba(0,48,80,0.55)] active:scale-95`}
        >
          <div className="relative">
            <ShoppingBag size={20} />
            <span className="absolute -right-2 -top-2 flex h-5 w-5 items-center justify-center rounded-full bg-white text-[10px] font-bold text-semcompMidDarkBlue">
              {totalItems}
            </span>
          </div>
          Ver Carrinho
        </Link>
      )}
    </div>
  );
}