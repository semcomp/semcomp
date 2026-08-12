import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { useTheme } from "@/contexts/useTheme";
import useWindowDimensions from "@/hooks/useWindowDimensions";
import Modal from "@/components/ui/Modal";
import { useCart, type AddToCartParams } from "@/contexts/CartContext";
import { ShoppingCart, Minus, Plus, ShoppingBag, Package, Loader2 } from "lucide-react";
import { productsAPI } from "@/api/products";
import type { Product, ProductType } from "@/types/ProductType";

// ─── Tipos ────────────────────────────────────────────────
interface SizeVariant {
  /** ID do produto real correspondente a este tamanho/corte */
  productId: string;
  size: string;
  isBabydoll: boolean;
  priceValue: number;
}

/** Chave única de uma variante: mesmo tamanho com/sem babydoll são opções distintas. */
function variantKey(v: { size: string; isBabydoll: boolean }): string {
  return `${v.size}__${v.isBabydoll ? "babydoll" : "padrao"}`;
}

/** Rótulo exibido nos botões de seleção (ex: "M" vs "M · Babydoll"). */
function variantLabel(v: { size: string; isBabydoll: boolean }): string {
  return v.isBabydoll ? `${v.size} · Babydoll` : v.size;
}

interface StoreItem {
  /** ID do produto "representativo" do card (para KIT, é a variante do primeiro tamanho) */
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
  /** Tamanhos de fato disponíveis no catálogo (só populado para KIT), cada um apontando
   *  para o produto real daquele tamanho — selecionar um tamanho troca o produto comprado. */
  sizeVariants: SizeVariant[];
  availableDateTimes: string[];
  defaultDateTime?: string;
  color?: string;
}

/** Ordem "natural" de tamanhos, usada só para ordenar a exibição. Tamanhos fora dessa
 *  lista (ex: cadastros futuros) vão para o final, ordenados alfabeticamente. */
const SIZE_ORDER = ["PP", "P", "M", "G", "GG", "XG"];

function compareSizes(a: string, b: string): number {
  const ia = SIZE_ORDER.indexOf(a);
  const ib = SIZE_ORDER.indexOf(b);
  if (ia === -1 && ib === -1) return a.localeCompare(b);
  if (ia === -1) return 1;
  if (ib === -1) return -1;
  return ia - ib;
}

/** Ordena variantes por tamanho e, dentro do mesmo tamanho, corte padrão antes de babydoll. */
function compareVariants(a: { size: string; isBabydoll: boolean }, b: { size: string; isBabydoll: boolean }): number {
  const bySize = compareSizes(a.size, b.size);
  if (bySize !== 0) return bySize;
  return Number(a.isBabydoll) - Number(b.isBabydoll);
}

function kitVariantGroupKey(p: Product): string {
  const kit = p.kit as (Product["kit"] & { color?: string }) | undefined;
  return kit?.color?.trim() || kit?.name || `product-${p.id}`;
}

/** Agrupa produtos COFFEE de mesmo nome num único card. Diferente do Kit, o horário
 *  aqui não seleciona um produto diferente — é só informativo. */
function coffeeGroupKey(p: Product): string {
  return p.coffee?.name?.trim() || `product-${p.id}`;
}

/** Agrupa Combos que são "o mesmo combo", variando só o tamanho da camiseta incluída:
 *  mesmo conjunto de itens não-Kit (ex: mesmos coffees) e mesmo preço. O item Kit é
 *  propositalmente excluído da assinatura, já que é ele que varia entre as opções. */
function comboGroupKey(p: Product, productById: Map<number, Product>): string {
  if (!p.combo_items?.length) return `combo-${p.id}`;
  const nonKitIds = p.combo_items
    .filter((ci) => productById.get(ci.item_id)?.type !== "KIT")
    .map((ci) => ci.item_id)
    .sort((a, b) => a - b);
  return `${nonKitIds.join(",")}|${p.price}`;
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

/** Converte um grupo de produtos KIT (mesma cor, tamanhos diferentes) em um único
 *  StoreItem com seletor de tamanho real: cada tamanho aponta para o produto correto. */
function kitGroupToStoreItem(groupProducts: Product[]): StoreItem {
  const sorted = [...groupProducts].sort((a, b) =>
    compareVariants(
      { size: a.kit!.size, isBabydoll: a.kit!.is_babydoll },
      { size: b.kit!.size, isBabydoll: b.kit!.is_babydoll }
    )
  );
  const representative = sorted[0];
  const kit = representative.kit!;

  const sizeVariants: SizeVariant[] = sorted.map((p) => ({
    productId: String(p.id),
    size: p.kit!.size,
    isBabydoll: p.kit!.is_babydoll,
    priceValue: p.price,
  }));

  return {
    id: String(representative.id),
    name: kit.name,
    category: "Kit",
    description: kit.color,
    price: formatBRL(representative.price),
    priceValue: representative.price,
    image:
      representative.picture_url ||
      `https://placehold.co/600x400/0B2639/FAFDFF?text=${encodeURIComponent(kit.name)}`,
    rawType: "KIT",
    sizeVariants,
    availableDateTimes: [],
    color: kit.color,
  };
}

/** Converte um grupo de produtos COFFEE de mesmo nome em um único StoreItem. Ao
 *  contrário do KIT, o horário aqui é só informativo: não muda o produto comprado,
 *  que é sempre o do horário mais próximo (representante do grupo). */
function coffeeGroupToStoreItem(groupProducts: Product[]): StoreItem {
  const sorted = [...groupProducts].sort((a, b) =>
    (a.coffee?.date_time ?? "").localeCompare(b.coffee?.date_time ?? "")
  );
  const representative = sorted[0];
  const coffee = representative.coffee!;

  const availableDateTimes = sorted
    .map((p) => p.coffee?.date_time)
    .filter((dt): dt is string => Boolean(dt));

  return {
    id: String(representative.id),
    name: coffee.name,
    category: "Coffee Break",
    description: "Coffee Break da Semcomp",
    price: formatBRL(representative.price),
    priceValue: representative.price,
    image:
      representative.picture_url ||
      `https://placehold.co/600x400/0B2639/FAFDFF?text=${encodeURIComponent(coffee.name)}`,
    rawType: "COFFEE",
    sizeVariants: [],
    availableDateTimes,
    defaultDateTime: availableDateTimes[0] ?? undefined,
  };
}

/** Converte um grupo de Combos "iguais" (mesmos itens não-Kit, mesmo preço) em um único
 *  StoreItem. Quando o combo inclui uma camiseta, cada tamanho vira uma variante real —
 *  igual ao KIT avulso — apontando para o produto Combo correspondente àquele tamanho. */
function comboGroupToStoreItem(groupProducts: Product[], productById: Map<number, Product>): StoreItem {
  const withKitInfo = groupProducts.map((p) => {
    const kitComboItem = p.combo_items?.find((ci) => productById.get(ci.item_id)?.type === "KIT");
    const kitProduct = kitComboItem ? productById.get(kitComboItem.item_id) : undefined;
    return {
      product: p,
      size: kitProduct?.kit?.size,
      isBabydoll: kitProduct?.kit?.is_babydoll ?? false,
    };
  });

  const sorted = [...withKitInfo].sort((a, b) =>
    compareVariants({ size: a.size ?? "", isBabydoll: a.isBabydoll }, { size: b.size ?? "", isBabydoll: b.isBabydoll })
  );
  const representative = sorted[0].product;

  const sizeVariants: SizeVariant[] = withKitInfo
    .filter((x) => !!x.size)
    .sort((a, b) => compareVariants({ size: a.size!, isBabydoll: a.isBabydoll }, { size: b.size!, isBabydoll: b.isBabydoll }))
    .map((x) => ({
      productId: String(x.product.id),
      size: x.size!,
      isBabydoll: x.isBabydoll,
      priceValue: x.product.price,
    }));

  const availableDateTimes = collectComboDateTimes(representative, productById);

  return {
    id: String(representative.id),
    name: "Combo",
    category: "Combo",
    description: `Combo com ${representative.combo_items?.length ?? 0} itens`,
    price: formatBRL(representative.price),
    priceValue: representative.price,
    image: representative.picture_url || `https://placehold.co/600x400/0B2639/FAFDFF?text=Combo`,
    rawType: "COMBO",
    sizeVariants,
    availableDateTimes,
    defaultDateTime: availableDateTimes[0] ?? undefined,
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
  const [selectedVariantKey, setSelectedVariantKey] = useState<string>("");
  const [selectedDateTime, setSelectedDateTime] = useState<string>("");
  const [products, setProducts] = useState<StoreItem[]>([]);
  const [loading, setLoading] = useState(true);
  // Variante (tamanho + babydoll) escolhida rapidamente no card da grade, por item.id.
  const [quickVariantKeyByItemId, setQuickVariantKeyByItemId] = useState<Record<string, string>>({});

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

          // Kits (camisetas) de mesma cor, tamanhos diferentes, viram um único card com
          // seletor de tamanho real. Coffees de mesmo nome também viram um único card,
          // mas com horário apenas informativo. Combos "iguais" (mesmos itens além da
          // camiseta) também viram um único card, com seletor real de tamanho quando
          // incluem uma camiseta — e horário apenas informativo, igual ao Coffee.
          const kitsByGroup = new Map<string, Product[]>();
          const coffeesByGroup = new Map<string, Product[]>();
          const combosByGroup = new Map<string, Product[]>();

          for (const p of selling) {
            if (p.type === "KIT" && p.kit) {
              const key = kitVariantGroupKey(p);
              const group = kitsByGroup.get(key);
              if (group) {
                group.push(p);
              } else {
                kitsByGroup.set(key, [p]);
              }
            } else if (p.type === "COFFEE" && p.coffee) {
              const key = coffeeGroupKey(p);
              const group = coffeesByGroup.get(key);
              if (group) {
                group.push(p);
              } else {
                coffeesByGroup.set(key, [p]);
              }
            } else if (p.type === "COMBO") {
              const key = comboGroupKey(p, productById);
              const group = combosByGroup.get(key);
              if (group) {
                group.push(p);
              } else {
                combosByGroup.set(key, [p]);
              }
            }
          }

          const kitItems = [...kitsByGroup.values()].map((group) => kitGroupToStoreItem(group));
          const coffeeItems = [...coffeesByGroup.values()].map((group) => coffeeGroupToStoreItem(group));
          const comboItems = [...combosByGroup.values()].map((group) => comboGroupToStoreItem(group, productById));
          setProducts([...kitItems, ...coffeeItems, ...comboItems]);
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

  // ─── Cores ──────────────────────────
  const heroBg = isDarkMode
    ? "bg-gradient-to-b from-semcompDarkBlue to-semcompMidDarkBlue"
    : "bg-gradient-to-b from-semcompMidLightBlue to-semcompMidLightBlue/20";
  const priceColor = isDarkMode ? "text-semcompOffWhite" : "text-semcompMidDarkBlue"
  const textColor = isDarkMode ? "text-semcompOffWhite" : "text-semcompDarkBlue";
  const mutedText = isDarkMode ? "text-semcompOffWhite/60" : "text-semcompDarkBlue/60";
  const mutedText2 = isDarkMode ? "text-semcompOffWhite/60" : "text-semcompDarkBlue/60";
  const cardBg = isDarkMode ? "bg-semcompMidDarkBlue" : "bg-white";
  const cardBorder = isDarkMode ? "border-white/10" : "border-gray-200";
  const cardShadow = isDarkMode
    ? "shadow-[0_8px_40px_rgba(0,0,0,0.5)] hover:shadow-[0_12px_48px_rgba(0,0,0,0.65)]"
    : "shadow-[0_8px_40px_rgba(0,0,0,0.12)] hover:shadow-[0_12px_48px_rgba(0,0,0,0.2)]";
  const headingSize = width > 768 ? "text-4xl" : "text-2xl";
  const gradientFrom = isDarkMode ? "from-semcompMidLightBlue/80" : "from-semcompDarkBlue";
  const gradientVia = isDarkMode ? "via-semcompMidLightBlue" : "via-semcompDarkBlue/80";
  const gradientTo = isDarkMode ? "to-semcompLightBlue" : "to-semcompMidDarkBlue";
  const btnSolid = isDarkMode
    ? "bg-semcompOffWhite text-semcompMidDarkBlue hover:bg-gray-200 hover:shadow-[0_0_24px_rgba(255,255,255,0.25)]"
    : "bg-semcompMidLightBlue text-semcompOffWhite hover:bg-semcompDarkBlue hover:shadow-[0_0_24px_rgba(0,48,80,0.45)]";
  const divider = isDarkMode ? "border-white/10" : "border-gray-200";

  // ─── Handlers ───────────────────────────────────────────
  const openModal = (item: StoreItem) => {
    setSelected(item);
    setQty(1);
    const defaultKey = item.sizeVariants[0] ? variantKey(item.sizeVariants[0]) : "";
    const initialKey = quickVariantKeyByItemId[item.id] ?? defaultKey;
    setSelectedVariantKey(initialKey);
    setSelectedDateTime(item.defaultDateTime ?? "");
  };

  const closeModal = () => {
    setSelected(null);
  };

  // Variante (tamanho + babydoll) atualmente selecionada no modal (só existe para KIT).
  const selectedVariant =
    selected?.sizeVariants.find((v) => variantKey(v) === selectedVariantKey) ?? selected?.sizeVariants[0];
  const selectedPriceValue = selectedVariant?.priceValue ?? selected?.priceValue ?? 0;

  const handleAddToCart = () => {
    if (!selected) return;
    const params: AddToCartParams = {
      id: selectedVariant ? selectedVariant.productId : selected.id,
      name: selected.name,
      price: selectedPriceValue,
      image: selected.image,
      size: selectedVariant?.size || undefined,
      dateTime: selectedDateTime || undefined,
      isBabydoll: selectedVariant?.isBabydoll || undefined,
    };
    // Adiciona N unidades de uma vez
    for (let i = 0; i < qty; i++) {
      addItem(params);
    }
    closeModal();
  };

  return (
    <div className={`w-full min-h-screen font-poppins ${heroBg} transition-colors duration-300`}>
      {/* ── Header da página ─────────────────────────── */}
      <section className={`pt-28 pb-10 md:pt-36 md:pb-16`}>
        <div className="mx-auto max-w-[80%]">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={fadeIn}
            className="flex flex-col md:flex-row md:items-end md:justify-between"
          >
            <div>
              <p className={`text-sm font-semibold uppercase tracking-widest text-semcompOffWhite/60 mb-2`}>
                Monte seu pedido
              </p>

              <h1 className={`${headingSize} font-extrabold mb-4`}>
                <span className={`text-semcompOffWhite font-poppins`}>NOSSA</span>{" "}
                <span
                  className={`bg-clip-text font-poppins text-transparent bg-linear-to-r ${gradientFrom} ${gradientVia} ${gradientTo}`}
                >
                  LOJA
                </span>
              </h1>

              <p className={`max-w-2xl text-base md:text-lg leading-relaxed text-semcompOffWhite/60`}>
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
                <ShoppingBag size={24} className={`${isDarkMode ? "text-semcompOffWhite" : "text-semcompMidDarkBlue"}`} />
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
      <section className={`py-12 md:py-20 transition-colors duration-300`}>
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
              className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8 items-stretch"
            >
              {products.map((item) => (
                <motion.article
                  key={item.id}
                  variants={fadeIn}
                  className={`group cursor-pointer rounded-2xl border ${cardBorder} ${cardBg} overflow-hidden transition-all duration-300 hover:-translate-y-2 ${cardShadow} flex flex-col h-full`}
                  onClick={() => openModal(item)}
                >
                  {/* Imagem */}
                  <div className="relative overflow-hidden aspect-4/3 shrink-0">
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

                  {/* Conteúdo — flex-1 + flex column para o botão ficar no final */}
                  <div className="p-5 flex flex-col gap-3 flex-1">
                    {(() => {
                      // O preço exibido acompanha a variante (tamanho/corte) escolhida
                      // rapidamente no card — vale tanto para KIT quanto para Combo com camiseta.
                      const defaultKey = item.sizeVariants[0] ? variantKey(item.sizeVariants[0]) : "";
                      const quickKey = quickVariantKeyByItemId[item.id] ?? defaultKey;
                      const quickVariant = item.sizeVariants.length > 0
                        ? (item.sizeVariants.find((v) => variantKey(v) === quickKey) ?? item.sizeVariants[0])
                        : undefined;
                      const displayPrice = quickVariant ? formatBRL(quickVariant.priceValue) : item.price;

                      return (
                        <div className="flex items-start justify-between gap-3">
                          <h3 className={`font-poppins font-bold text-lg leading-tight ${textColor}`}>
                            {item.name}
                          </h3>
                          <span className={`shrink-0 font-extrabold text-lg ${priceColor}`}>
                            {displayPrice}
                          </span>
                        </div>
                      );
                    })()}

                    <p className={`text-xs font-semibold uppercase tracking-wide ${mutedText}`}>
                      {item.category}
                    </p>

                    <p className={`text-sm leading-relaxed ${mutedText} line-clamp-2`}>
                      {item.description}
                    </p>

                    {/* ── Seletor in-line no card (tamanho + corte reais do catálogo) ──
                         Vale tanto para KIT avulso quanto para Combo que inclui camiseta. ── */}
                    {item.sizeVariants.length > 0 && (
                      <div className="flex flex-wrap gap-1.5">
                        {item.sizeVariants.map((v) => {
                          const key = variantKey(v);
                          const defaultKey = item.sizeVariants[0] ? variantKey(item.sizeVariants[0]) : "";
                          const isActive = (quickVariantKeyByItemId[item.id] ?? defaultKey) === key;
                          return (
                            <button
                              key={key}
                              onClick={(e) => {
                                e.stopPropagation();
                                setQuickVariantKeyByItemId((prev) => ({ ...prev, [item.id]: key }));
                              }}
                              className={`px-2.5 py-1 text-xs font-bold rounded-md border transition-all cursor-pointer ${
                                isActive
                                  ? "bg-semcompMidDarkBlue text-semcompOffWhite border-semcompMidDarkBlue"
                                  : `${cardBorder} ${mutedText} hover:border-semcompMidDarkBlue hover:text-semcompMidDarkBlue`
                              }`}
                            >
                              {variantLabel(v)}
                            </button>
                          );
                        })}
                      </div>
                    )}
                    {/* ── Horários (Coffee e Combo): sempre só informativo, não seleciona produto ── */}
                    {(item.rawType === "COFFEE" || item.rawType === "COMBO") && item.availableDateTimes.length > 0 && (
                      <div className="flex flex-wrap gap-1.5">
                        {item.availableDateTimes.map((dt) => (
                          <span
                            key={dt}
                            className={`px-2.5 py-1 text-xs font-bold rounded-md border bg-semcompMidDarkBlue/10 ${cardBorder} ${mutedText}`}
                          >
                            🕐 {formatDateTime(dt)}
                          </span>
                        ))}
                      </div>
                    )}

                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        const defaultKey = item.sizeVariants[0] ? variantKey(item.sizeVariants[0]) : "";
                        const quickKey = quickVariantKeyByItemId[item.id] ?? defaultKey;
                        const variant = item.sizeVariants.length > 0
                          ? (item.sizeVariants.find((v) => variantKey(v) === quickKey) ?? item.sizeVariants[0])
                          : undefined;

                        addItem({
                          id: variant ? variant.productId : item.id,
                          name: item.name,
                          price: variant ? variant.priceValue : item.priceValue,
                          image: item.image,
                          size: variant?.size,
                          isBabydoll: variant?.isBabydoll || undefined,
                          dateTime: item.defaultDateTime,
                        });
                      }}
                      className={`mt-auto w-full rounded-full py-2.5 text-sm font-bold transition-all duration-300 cursor-pointer focus:outline-none focus:ring-2 focus:ring-semcompLightBlue focus:ring-offset-2 active:scale-95 shadow-md ${btnSolid}`}
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
              </div>

              {selected.badge && (
                <span
                  className={`self-start rounded-full border px-3 py-1 text-xs font-bold ${badgeColor(selected.badge, isDarkMode)}`}
                >
                  {selected.badge}
                </span>
              )}

              <p className={`text-3xl font-extrabold text-semcompMidDarkBlue`}>{formatBRL(selectedPriceValue)}</p>

              <p className={`text-sm leading-relaxed ${mutedText}`}>{selected.description}</p>

              <div className={`border-t ${divider} pt-5 space-y-5`}>
                {/* ── Seletor de Tamanho/Corte (real: muda o produto/preço) ──
                     Vale tanto para KIT avulso quanto para Combo que inclui camiseta. ── */}
                {selected.sizeVariants.length > 0 && (
                  <div>
                    <span className={`text-sm font-semibold ${textColor}`}>Tamanho da camiseta</span>
                    <div className="flex flex-wrap gap-2 mt-2">
                      {selected.sizeVariants.map((v) => {
                        const key = variantKey(v);
                        return (
                          <button
                            key={key}
                            onClick={() => setSelectedVariantKey(key)}
                            className={`min-w-11 px-3 py-2 text-sm font-bold rounded-lg border transition-all cursor-pointer ${
                              selectedVariantKey === key
                                ? "bg-semcompMidDarkBlue text-semcompOffWhite border-semcompMidDarkBlue shadow-md"
                                : `${cardBorder} ${mutedText} hover:border-semcompMidDarkBlue hover:text-semcompMidDarkBlue hover:bg-semcompMidDarkBlue/5`
                            }`}
                          >
                            {variantLabel(v)}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* ── Horários (Coffee e Combo): sempre só informativo, não seleciona produto ── */}
                {(selected.rawType === "COFFEE" || selected.rawType === "COMBO") && selected.availableDateTimes.length > 0 && (
                  <div>
                    <span className={`text-sm font-semibold ${textColor}`}>
                      {selected.rawType === "COMBO" ? "Horário do Coffee Break incluído" : "Horários disponíveis"}
                    </span>
                    <div className="flex flex-wrap gap-2 mt-2">
                      {selected.availableDateTimes.map((dt) => (
                        <span
                          key={dt}
                          className={`px-3 py-2 text-sm font-bold rounded-lg border ${cardBorder} ${mutedText}`}
                        >
                          🕐 {formatDateTime(dt)}
                        </span>
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
                      R$ {(selectedPriceValue * qty).toFixed(2).replace(".", ",")}
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

      {totalItems > 0 && (
        <Link
          to="/loja/carrinho"
          className={`md:hidden fixed bottom-8 left-6 z-40 flex items-center gap-3 rounded-2xl border ${cardBorder} ${cardBg} px-5 py-3.5 text-sm font-bold ${textColor} ${cardShadow} transition-all duration-300 hover:scale-105 active:scale-95`}
        >
          <div className="relative">
            <ShoppingBag size={20} />
            {totalItems > 0 && (
              <span className="absolute -right-2 -top-2 flex h-5 w-5 items-center justify-center rounded-full bg-semcompMidDarkBlue border-semcompOffWhite text-[10px] font-bold text-semcompOffWhite ring-2 ring-white dark:ring-semcompMidDarkBlue">
                {totalItems}
              </span>
            )}
          </div>
          Ver Carrinho
        </Link>
      )}
    </div>
  );
}