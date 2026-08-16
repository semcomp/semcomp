import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Link } from "react-router-dom";
import { useTheme } from "@/contexts/useTheme";
import useWindowDimensions from "@/hooks/useWindowDimensions";
import Modal from "@/components/ui/Modal";
import { useCart, type AddToCartParams } from "@/contexts/CartContext";
import { ShoppingCart, Minus, Plus, ShoppingBag, Package, Loader2, X, ZoomIn } from "lucide-react";
import { productsAPI } from "@/api/products";
import type { Product, ProductType } from "@/types/ProductType";
import { useNotification } from "@/contexts/NotificationContext";

// ─── Tipos ────────────────────────────────────────────────
interface SizeVariant {
  productId: string;
  color?: string;
  size: string;
  isBabydoll: boolean;
  priceValue: number;
}

// A chave da variante considera cor + tamanho + corte: cada cor×tamanho de uma
// camiseta é um produto (combo) próprio, mas eles formam um único card/combos.
function variantKey(v: { color?: string; size: string; isBabydoll: boolean }): string {
  return `${v.color ?? ""}__${v.size}__${v.isBabydoll ? "babydoll" : "padrao"}`;
}

function variantLabel(v: { size: string; isBabydoll: boolean }): string {
  return v.isBabydoll ? `${v.size} · Babydoll` : v.size;
}

function colorOf(v: SizeVariant): string {
  return v.color?.trim() || "Padrão";
}

function colorsOf(item: StoreItem): string[] {
  return [...new Set(item.sizeVariants.map(colorOf))];
}

function firstVariantKeyForColor(item: StoreItem, color: string): string {
  const variant = item.sizeVariants.find((v) => colorOf(v) === color);
  return variant ? variantKey(variant) : "";
}

// Cada horário de coffee é um produto próprio (id + preço distintos).
interface CoffeeTimeOption {
  dateTime: string;
  productId: string;
  priceValue: number;
}

interface StoreItem {
  id: string;
  name: string;
  category: string;
  description: string;
  price: string;
  priceValue: number;
  image: string;
  rawType: ProductType;
  sizeVariants: SizeVariant[];
  availableDateTimes: string[];
  coffeeTimes: CoffeeTimeOption[];
  defaultDateTime?: string;
  color?: string;
}

const SIZE_ORDER = ["PP", "P", "M", "G", "GG"];

// Coffee de dia (antes das 18h) só é vendido individualmente após este horário;
// durante o dia ele aparece apenas dentro de combos.
const NIGHT_HOUR = 18;

function isNightCoffee(dateTime: string): boolean {
  return new Date(dateTime).getHours() >= NIGHT_HOUR;
}

function compareSizes(a: string, b: string): number {
  const ia = SIZE_ORDER.indexOf(a);
  const ib = SIZE_ORDER.indexOf(b);
  if (ia === -1 && ib === -1) return a.localeCompare(b);
  if (ia === -1) return 1;
  if (ib === -1) return -1;
  return ia - ib;
}

function compareVariants(a: { size: string; isBabydoll: boolean }, b: { size: string; isBabydoll: boolean }): number {
  const bySize = compareSizes(a.size, b.size);
  if (bySize !== 0) return bySize;
  return Number(a.isBabydoll) - Number(b.isBabydoll);
}

function kitVariantGroupKey(p: Product): string {
  const kit = p.kit as (Product["kit"] & { color?: string }) | undefined;
  return kit?.color?.trim() || kit?.name || `product-${p.id}`;
}

function coffeeGroupKey(p: Product): string {
  return p.coffee?.name?.trim() || `product-${p.id}`;
}

// Combos com os MESMOS coffees e MESMA camiseta (modelo) são o MESMO combo:
// cor/tamanho/preço da camiseta NÃO diferenciam combos, apenas geram variações
// selecionáveis dentro do mesmo card.
function comboGroupKey(p: Product, productById: Map<number, Product>): string {
  if (!p.combo_items?.length) return `combo-${p.id}`;
  const coffeeParts = p.combo_items
    .filter((ci) => productById.get(ci.item_id)?.type !== "KIT")
    .map((ci) => `${ci.item_id}x${ci.quantity ?? 1}`)
    .sort();
  const kitNames = p.combo_items
    .filter((ci) => productById.get(ci.item_id)?.type === "KIT")
    .map((ci) => productById.get(ci.item_id)?.kit?.name?.trim() ?? "")
    .filter(Boolean)
    .sort()
    .join("+");
  return `${coffeeParts.join(",")}|${kitNames}`;
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

// Gera uma descrição legível a partir dos itens do combo, sem travar cor/tamanho
// (que são escolhidos na hora da compra). Usa product.description se preenchida.
function buildComboDescription(product: Product, productById: Map<number, Product>): string {
  if (product.description?.trim()) return product.description;

  const kitNames: string[] = [];
  const coffees: { name: string; dateTime: string }[] = [];
  for (const comboItem of product.combo_items ?? []) {
    const item = productById.get(comboItem.item_id);
    if (!item) continue;
    if (item.type === "KIT" && item.kit?.name) {
      kitNames.push(item.kit.name);
    } else if (item.type === "COFFEE" && item.coffee) {
      coffees.push({ name: item.coffee.name, dateTime: item.coffee.date_time });
    }
  }

  const parts: string[] = [];
  if (kitNames.length) {
    parts.push(`${[...new Set(kitNames)].join(" + ")} (cor e tamanho à sua escolha)`);
  }
  if (coffees.length) {
    const coffeeLabel = [...new Set(coffees.map((c) => c.name))].join(" + ");
    const times = [...new Set(coffees.map((c) => formatDateTime(c.dateTime)))].join(", ");
    parts.push(times ? `${coffeeLabel} de ${times}` : coffeeLabel);
  }

  if (!parts.length) {
    return `Combo com ${product.combo_items?.length ?? 0} itens`;
  }
  return parts.join(" + ");
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

// Chip selecionável com contador: clique adiciona uma unidade; "+"/"−" ajustam.
function OptionChip({
  label,
  count,
  activeClass,
  idleClass,
  onAdd,
  onRemove,
}: {
  label: string;
  count: number;
  activeClass: string;
  idleClass: string;
  onAdd: () => void;
  onRemove: () => void;
}) {
  const active = count > 0;
  return (
    <div
      className={`flex items-center gap-1 px-2 py-1.5 text-sm font-bold rounded-lg border transition-all cursor-pointer select-none ${active ? activeClass : idleClass}`}
      onClick={onAdd}
    >
      <span className="min-w-8 text-center">{label}</span>
      <span className={`flex items-center gap-0.5 border-l pl-1.5 ${active ? "border-current/30" : "border-current/20"}`}>
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            onRemove();
          }}
          className="w-5 h-5 flex items-center justify-center rounded hover:bg-black/10 disabled:opacity-30 transition-colors"
          disabled={count === 0}
          aria-label="Diminuir"
        >
          <Minus size={12} />
        </button>
        <span className="w-4 text-center text-sm tabular-nums">{count}</span>
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            onAdd();
          }}
          className="w-5 h-5 flex items-center justify-center rounded hover:bg-black/10 transition-colors"
          aria-label="Aumentar"
        >
          <Plus size={12} />
        </button>
      </span>
    </div>
  );
}

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
    description: representative.description || kit.color,
    price: formatBRL(representative.price),
    priceValue: representative.price,
    image:
      representative.picture_url ||
      `https://placehold.co/600x400/0B2639/FAFDFF?text=${encodeURIComponent(kit.name)}`,
    rawType: "KIT",
    sizeVariants,
    availableDateTimes: [],
    coffeeTimes: [],
    color: kit.color,
  };
}

function coffeeGroupToStoreItem(groupProducts: Product[]): StoreItem {
  const sorted = [...groupProducts].sort((a, b) =>
    (a.coffee?.date_time ?? "").localeCompare(b.coffee?.date_time ?? "")
  );
  const representative = sorted[0];
  const coffee = representative.coffee!;

  const coffeeTimes: CoffeeTimeOption[] = sorted
    .map((p) =>
      p.coffee?.date_time
        ? { dateTime: p.coffee.date_time, productId: String(p.id), priceValue: p.price }
        : null
    )
    .filter((t): t is CoffeeTimeOption => t !== null);

  return {
    id: String(representative.id),
    name: coffee.name,
    category: "Coffee Break",
    description: representative.description || "Coffee Break da Semcomp",
    price: formatBRL(representative.price),
    priceValue: representative.price,
    image:
      representative.picture_url ||
      `https://placehold.co/600x400/0B2639/FAFDFF?text=${encodeURIComponent(coffee.name)}`,
    rawType: "COFFEE",
    sizeVariants: [],
    availableDateTimes: coffeeTimes.map((t) => t.dateTime),
    coffeeTimes,
    defaultDateTime: coffeeTimes[0]?.dateTime ?? undefined,
  };
}

function comboGroupToStoreItem(groupProducts: Product[], productById: Map<number, Product>): StoreItem {
  const withKitInfo = groupProducts.map((p) => {
    const kitComboItem = p.combo_items?.find((ci) => productById.get(ci.item_id)?.type === "KIT");
    const kitProduct = kitComboItem ? productById.get(kitComboItem.item_id) : undefined;
    return {
      product: p,
      color: kitProduct?.kit?.color ?? "",
      size: kitProduct?.kit?.size,
      isBabydoll: kitProduct?.kit?.is_babydoll ?? false,
    };
  });

  const sorted = withKitInfo
    .filter((x) => !!x.size)
    .sort((a, b) => {
      const byColor = (a.color ?? "").localeCompare(b.color ?? "");
      if (byColor !== 0) return byColor;
      return compareVariants({ size: a.size!, isBabydoll: a.isBabydoll }, { size: b.size!, isBabydoll: b.isBabydoll });
    });
  const representative = sorted[0]?.product ?? groupProducts[0];

  const sizeVariants: SizeVariant[] = sorted.map((x) => ({
    productId: String(x.product.id),
    color: x.color,
    size: x.size!,
    isBabydoll: x.isBabydoll,
    priceValue: x.product.price,
  }));

  const comboDateTimes = collectComboDateTimes(representative, productById);
  const representativeName = representative.name?.trim();

  return {
    id: String(representative.id),
    name: representativeName || "Combo",
    category: "Combo",
    description: buildComboDescription(representative, productById),
    price: formatBRL(representative.price),
    priceValue: representative.price,
    image: representative.picture_url || `https://placehold.co/600x400/0B2639/FAFDFF?text=Combo`,
    rawType: "COMBO",
    sizeVariants,
    availableDateTimes: comboDateTimes,
    coffeeTimes: [],
    defaultDateTime: comboDateTimes[0] ?? undefined,
  };
}

// ─── Animações ────────────────────────────────────────────
const fadeIn = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6 } },
};

const stagger = {
  visible: { transition: { staggerChildren: 0.08 } },
};

// ─── Helpers visuais ──────────────────────────────────────
const CATEGORY_FILTERS: { key: ProductType | "all"; label: string }[] = [
  { key: "all", label: "Todos" },
  { key: "KIT", label: "Camisetas" },
  { key: "COFFEE", label: "Coffee Break" },
  { key: "COMBO", label: "Combos" },
];

// ─── StorePage ────────────────────────────────────────────
export default function StorePage() {
  const { isDarkMode } = useTheme();
  const { width } = useWindowDimensions();
  const { addItem, totalItems } = useCart();
  const { showNotification } = useNotification();

  const [selected, setSelected] = useState<StoreItem | null>(null);
  const [selectedVariantKey, setSelectedVariantKey] = useState<string>("");
  // Contagem por opção (tamanho para KIT/COMBO, horário para COFFEE).
  const [optionCounts, setOptionCounts] = useState<Record<string, number>>({});
  const [products, setProducts] = useState<StoreItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [quickVariantKeyByItemId, setQuickVariantKeyByItemId] = useState<Record<string, string>>({});
  const [quickDateTimeByItemId, setQuickDateTimeByItemId] = useState<Record<string, string>>({});
  const [zoomedImage, setZoomedImage] = useState<{ url: string; alt: string } | null>(null);
  const [activeCategory, setActiveCategory] = useState<ProductType | "all">("all");

  useEffect(() => {
    let cancelled = false;
    async function fetchProducts() {
      try {
        setLoading(true);
        const data = await productsAPI.getAllProducts();
        if (!cancelled) {
          // productById precisa conter TODOS os produtos (não só os em venda):
          // coffees de dia podem aparecer dentro de combos sem serem vendidos
          // individualmente, e a resolução deles depende deste mapa.
          const productById = new Map(data.products.map((p) => [p.id, p] as const));
          const selling = data.products.filter((p) => p.is_selling);

          const kitsByGroup = new Map<string, Product[]>();
          const coffeesByGroup = new Map<string, Product[]>();
          const combosByGroup = new Map<string, Product[]>();

          for (const p of selling) {
            if (p.type === "KIT" && p.kit) {
              const key = kitVariantGroupKey(p);
              const group = kitsByGroup.get(key);
              if (group) group.push(p);
              else kitsByGroup.set(key, [p]);
            } else if (p.type === "COFFEE" && p.coffee) {
              // Regra de negócio: coffee de dia só via combo; individual = noite.
              if (!isNightCoffee(p.coffee.date_time)) continue;
              const key = coffeeGroupKey(p);
              const group = coffeesByGroup.get(key);
              if (group) group.push(p);
              else coffeesByGroup.set(key, [p]);
            } else if (p.type === "COMBO") {
              const key = comboGroupKey(p, productById);
              const group = combosByGroup.get(key);
              if (group) group.push(p);
              else combosByGroup.set(key, [p]);
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

  const filteredProducts = activeCategory === "all"
    ? products
    : products.filter((p) => p.rawType === activeCategory);

  // ─── Tokens de cor ────────────────────────────────────────
  const heroBg = isDarkMode
    ? "bg-gradient-to-b from-semcompAlmostDarkBlue via-semcompDarkBlue to-semcompDarkBlue/80"
    : "bg-gradient-to-b from-semcompMidLightBlue to-semcompMidLightBlue/20";
  const priceColor = isDarkMode ? "text-semcompOffWhite" : "text-semcompMidDarkBlue";
  const textColor = isDarkMode ? "text-semcompOffWhite" : "text-semcompDarkBlue";
  const mutedText = isDarkMode ? "text-semcompOffWhite/60" : "text-semcompDarkBlue/60";
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
  const chipActive = isDarkMode
    ? "bg-semcompOffWhite text-semcompMidDarkBlue border-semcompOffWhite shadow-md"
    : "bg-semcompMidDarkBlue text-semcompOffWhite border-semcompMidDarkBlue shadow-md";
  const chipIdle = isDarkMode
    ? `${cardBorder} ${mutedText} hover:border-semcompOffWhite/70 hover:text-semcompOffWhite hover:bg-white/5`
    : `${cardBorder} ${mutedText} hover:border-semcompMidDarkBlue hover:text-semcompMidDarkBlue hover:bg-semcompMidDarkBlue/5`;

  // ─── Handlers ─────────────────────────────────────────────
  const openModal = (item: StoreItem) => {
    setSelected(item);
    setOptionCounts({});
    const defaultKey = item.sizeVariants[0] ? variantKey(item.sizeVariants[0]) : "";
    const initialKey = quickVariantKeyByItemId[item.id] ?? defaultKey;
    setSelectedVariantKey(initialKey);
  };

  const closeModal = () => setSelected(null);

  const setOptionCount = (key: string, delta: number) => {
    setOptionCounts((prev) => {
      const next = { ...prev };
      const value = (next[key] ?? 0) + delta;
      if (value <= 0) delete next[key];
      else next[key] = value;
      return next;
    });
  };

  const handleColorSelect = (item: StoreItem, color: string) => {
    setSelectedVariantKey(firstVariantKeyForColor(item, color));
    // Mantém apenas contadores de tamanhos da nova cor.
    setOptionCounts((prev) => {
      const next: Record<string, number> = {};
      for (const [key, count] of Object.entries(prev)) {
        const variant = item.sizeVariants.find((v) => variantKey(v) === key);
        if (variant && colorOf(variant) === color) next[key] = count;
      }
      return next;
    });
  };

  const selectedVariant =
    selected?.sizeVariants.find((v) => variantKey(v) === selectedVariantKey) ?? selected?.sizeVariants[0];
  const modalCurrentColor = selectedVariant
    ? colorOf(selectedVariant)
    : selected?.sizeVariants[0]
      ? colorOf(selected.sizeVariants[0])
      : "";

  const totalQty = Object.values(optionCounts).reduce((sum, n) => sum + n, 0);
  const priceOfOption = (key: string): number => {
    if (!selected) return 0;
    if (selected.rawType === "COFFEE") {
      return selected.coffeeTimes.find((t) => t.dateTime === key)?.priceValue ?? 0;
    }
    return selected.sizeVariants.find((v) => variantKey(v) === key)?.priceValue ?? 0;
  };
  const totalPriceValue = Object.entries(optionCounts).reduce(
    (sum, [key, n]) => sum + priceOfOption(key) * n,
    0,
  );
  const baseUnitPrice =
    selected?.rawType === "COFFEE"
      ? selected.coffeeTimes[0]?.priceValue ?? selected?.priceValue ?? 0
      : selected?.sizeVariants[0]?.priceValue ?? selected?.priceValue ?? 0;
  const displayPrice = totalQty > 0 ? totalPriceValue : baseUnitPrice;

  const handleAddToCart = () => {
    if (!selected) return;
    const entries = Object.entries(optionCounts).filter(([, count]) => count > 0);
    if (entries.length === 0) return;
    for (const [key, count] of entries) {
      let params: AddToCartParams;
      if (selected.rawType === "COFFEE") {
        const time = selected.coffeeTimes.find((t) => t.dateTime === key);
        if (!time) continue;
        params = {
          id: time.productId,
          name: selected.name,
          price: time.priceValue,
          image: selected.image,
          type: selected.rawType,
          dateTime: time.dateTime,
        };
      } else {
        const variant = selected.sizeVariants.find((v) => variantKey(v) === key);
        if (!variant) continue;
        params = {
          id: variant.productId,
          name: selected.name,
          price: variant.priceValue,
          image: selected.image,
          size: variant.size,
          type: selected.rawType,
          isBabydoll: variant.isBabydoll,
          comboDateTimes: selected.rawType === "COMBO" ? selected.availableDateTimes : undefined,
        };
      }
      for (let i = 0; i < count; i++) addItem(params);
    }
    closeModal();
    showNotification("Produto adicionado ao carrinho!", "success");
  };

  return (
    <div className={`w-full min-h-screen font-poppins ${heroBg} transition-colors duration-300`}>
      {/* ── Header ──────────────────────────────────────── */}
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
                <span className="text-semcompOffWhite font-poppins">NOSSA</span>{" "}
                <span className={`bg-clip-text font-poppins text-transparent bg-linear-to-r ${gradientFrom} ${gradientVia} ${gradientTo}`}>
                  LOJA
                </span>
              </h1>
              <p className={`max-w-2xl text-base md:text-lg leading-relaxed ${mutedText}`}>
                Explore nossa seleção de produtos exclusivos da Semcomp e leve um pedacinho do evento com você.
              </p>
            </div>

            {/* Carrinho (desktop) */}
            <Link
              to="/loja/carrinho"
              className={`hidden md:flex relative items-center gap-3 rounded-2xl border ${cardBorder} ${cardBg} px-5 py-3.5 transition-all duration-300 ${cardShadow} cursor-pointer ${isDarkMode ? "shadow-[0_6px_32px_rgba(0,0,0,0.5)] hover:shadow-[0_10px_40px_rgba(0,0,0,0.65)]" : "shadow-[0_6px_32px_rgba(0,0,0,0.1)] hover:shadow-[0_10px_40px_rgba(0,0,0,0.18)]"}`}
            >
              <div className="relative">
                <ShoppingBag size={24} className={isDarkMode ? "text-semcompOffWhite" : "text-semcompMidDarkBlue"} />
                {totalItems > 0 && (
                  <span className="absolute -right-2 -top-2 flex h-5 w-5 items-center justify-center rounded-full bg-semcompMidDarkBlue text-[10px] font-bold text-semcompOffWhite ring-2 ring-white">
                    {totalItems}
                  </span>
                )}
              </div>
              <div className="text-left">
                <p className={`text-xs ${mutedText}`}>Meu Carrinho</p>
                <p className={`text-sm font-bold ${textColor}`}>
                  {totalItems === 0 ? "Vazio" : `${totalItems} ${totalItems === 1 ? "item" : "itens"}`}
                </p>
              </div>
            </Link>
          </motion.div>
        </div>
      </section>

      {/* ── Grid de produtos ─────────────────────────── */}
      <section className="py-12 md:py-20 transition-colors duration-300">
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
            <>
              {/* ── Filtros de categoria ──────────────── */}
              <motion.div
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true }}
                variants={fadeIn}
                className="flex flex-wrap gap-2 mb-10"
              >
                {CATEGORY_FILTERS.map(({ key, label }) => (
                  <button
                    key={key}
                    onClick={() => setActiveCategory(key)}
                    className={`px-5 py-2 rounded-full text-sm font-bold transition-all duration-200 cursor-pointer border ${
                      activeCategory === key
                        ? isDarkMode
                          ? "bg-semcompOffWhite text-semcompDarkBlue border-transparent shadow-md"
                          : "bg-semcompMidDarkBlue text-semcompOffWhite border-transparent shadow-md"
                        : `${cardBorder} ${mutedText} hover:border-semcompMidDarkBlue`
                    }`}
                  >
                    {label}
                    {key !== "all" && (
                      <span className={`ml-2 text-[11px] font-bold px-1.5 py-0.5 rounded-full ${
                        activeCategory === key
                          ? isDarkMode ? "bg-semcompMidDarkBlue/20 text-semcompMidDarkBlue" : "bg-white/20 text-semcompOffWhite"
                          : isDarkMode ? "bg-white/10 text-semcompOffWhite/60" : "bg-black/5 text-semcompDarkBlue/50"
                      }`}>
                        {products.filter(p => p.rawType === key).length}
                      </span>
                    )}
                  </button>
                ))}
              </motion.div>

              {filteredProducts.length === 0 ? (
                <motion.div
                  initial="hidden"
                  whileInView="visible"
                  viewport={{ once: true }}
                  variants={fadeIn}
                  className="flex flex-col items-center justify-center py-20"
                >
                  <Package size={64} className={`mb-4 ${mutedText}`} />
                  <p className={`text-lg ${mutedText}`}>Nenhum produto nesta categoria.</p>
                  <button
                    onClick={() => setActiveCategory("all")}
                    className={`mt-4 px-6 py-2.5 rounded-full text-sm font-bold transition-all duration-200 cursor-pointer ${btnSolid}`}
                  >
                    Ver todos
                  </button>
                </motion.div>
              ) : (
                <motion.div
                  initial="visible"
                  whileInView="visible"
                  viewport={{ once: true, amount: 0.1 }}
                  variants={stagger}
                  className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8 items-stretch"
                >
                  {filteredProducts.map((item) => {
                    const defaultKey = item.sizeVariants[0] ? variantKey(item.sizeVariants[0]) : "";
                    const quickKey = quickVariantKeyByItemId[item.id] ?? defaultKey;
                    const quickVariant = item.sizeVariants.length > 0
                      ? (item.sizeVariants.find((v) => variantKey(v) === quickKey) ?? item.sizeVariants[0])
                      : undefined;
                    const currentColor = quickVariant ? colorOf(quickVariant) : "";
                    const activeDateTime = quickDateTimeByItemId[item.id] ?? item.defaultDateTime;
                    const quickCoffeeTime = item.rawType === "COFFEE"
                      ? (item.coffeeTimes.find((t) => t.dateTime === activeDateTime) ?? item.coffeeTimes[0])
                      : undefined;
                    const displayPrice = quickVariant
                      ? formatBRL(quickVariant.priceValue)
                      : quickCoffeeTime
                        ? formatBRL(quickCoffeeTime.priceValue)
                        : item.price;
                    const sizeVariantsToShow = item.rawType === "COMBO"
                      ? item.sizeVariants.filter((v) => colorOf(v) === currentColor)
                      : item.sizeVariants;

                    return (
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

                        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/15 transition-colors duration-300" />

                        {/* Botão de zoom */}
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            setZoomedImage({ url: item.image, alt: item.name });
                          }}
                          className="absolute bottom-3 right-3 rounded-full bg-black/50 backdrop-blur-sm p-2 text-white opacity-0 group-hover:opacity-100 transition-all duration-300 hover:bg-black/70 cursor-zoom-in shadow-lg"
                          aria-label="Ampliar imagem"
                        >
                          <ZoomIn size={15} />
                        </button>

                      </div>

                      {/* Conteúdo */}
                      <div className="p-5 flex flex-col gap-2.5 flex-1">
                        <div className="flex items-start justify-between gap-3">
                          <h3 className={`font-poppins font-bold text-lg leading-tight ${textColor}`}>
                            {item.name}
                          </h3>
                          <span className={`shrink-0 font-extrabold text-lg ${priceColor}`}>
                            {displayPrice}
                          </span>
                        </div>

                        {/* Info específica por tipo */}
                        {item.rawType === "COFFEE" && item.availableDateTimes.length > 0 && (
                          <p className={`text-xs ${mutedText}`}>
                            {item.availableDateTimes.length} {item.availableDateTimes.length === 1 ? "horário disponível" : "horários disponíveis"}
                          </p>
                        )}

                        {item.rawType === "KIT" && (
                          <p className={`text-sm font-semibold ${mutedText}`}>
                            {`Cor: ${item.color ?? "Padrão"}`}
                          </p>
                        )}

                        <p className={`text-sm leading-relaxed ${mutedText} line-clamp-2`}>
                          {item.description}
                        </p>

                        {/* Seletor de cor (Combo) */}
                        {item.rawType === "COMBO" && colorsOf(item).length > 1 && (
                          <div className="flex flex-wrap gap-1.5 mt-0.5">
                            {colorsOf(item).map((color) => {
                              const isActive = currentColor === color;
                              return (
                                <button
                                  key={color}
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    setQuickVariantKeyByItemId((prev) => ({ ...prev, [item.id]: firstVariantKeyForColor(item, color) }));
                                  }}
                                  className={`px-2.5 py-1 text-xs font-bold rounded-md border transition-all cursor-pointer ${
                                    isActive
                                      ? isDarkMode
                                        ? "bg-semcompOffWhite text-semcompMidDarkBlue border-semcompOffWhite shadow-sm"
                                        : "bg-semcompMidDarkBlue text-semcompOffWhite border-semcompMidDarkBlue"
                                      : isDarkMode
                                        ? `${cardBorder} ${mutedText} hover:border-semcompOffWhite/70 hover:text-semcompOffWhite`
                                        : `${cardBorder} ${mutedText} hover:border-semcompMidDarkBlue hover:text-semcompMidDarkBlue`
                                  }`}
                                >
                                  {color}
                                </button>
                              );
                            })}
                          </div>
                        )}

                        {/* Seletor de tamanho no card */}
                        {sizeVariantsToShow.length > 0 && (
                          <div className="flex flex-wrap gap-1.5 mt-0.5">
                            {sizeVariantsToShow.map((v) => {
                              const key = variantKey(v);
                              const isActive = quickKey === key;
                              return (
                                <button
                                  key={key}
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    setQuickVariantKeyByItemId((prev) => ({ ...prev, [item.id]: key }));
                                  }}
                                  className={`px-2.5 py-1 text-xs font-bold rounded-md border transition-all cursor-pointer ${
                                    isActive
                                      ? isDarkMode
                                        ? "bg-semcompOffWhite text-semcompMidDarkBlue border-semcompOffWhite shadow-sm"
                                        : "bg-semcompMidDarkBlue text-semcompOffWhite border-semcompMidDarkBlue"
                                      : isDarkMode
                                        ? `${cardBorder} ${mutedText} hover:border-semcompOffWhite/70 hover:text-semcompOffWhite`
                                        : `${cardBorder} ${mutedText} hover:border-semcompMidDarkBlue hover:text-semcompMidDarkBlue`
                                  }`}
                                >
                                  {variantLabel(v)}
                                </button>
                              );
                            })}
                          </div>
                        )}

                        {/* Horários: Coffee selecionável, Combo somente leitura */}
                        {item.rawType === "COFFEE" && item.availableDateTimes.length > 0 && (
                          <div className="flex flex-wrap gap-1.5 mt-0.5">
                            {item.availableDateTimes.map((dt) => {
                              const isActive = activeDateTime === dt;
                              return (
                                <button
                                  key={dt}
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    setQuickDateTimeByItemId((prev) => ({ ...prev, [item.id]: dt }));
                                  }}
                                  className={`px-2.5 py-1 text-xs font-bold rounded-md border transition-all cursor-pointer ${
                                    isActive
                                      ? isDarkMode
                                        ? "bg-semcompOffWhite text-semcompMidDarkBlue border-semcompOffWhite shadow-sm"
                                        : "bg-semcompMidDarkBlue text-semcompOffWhite border-semcompMidDarkBlue"
                                      : `bg-semcompMidDarkBlue/10 ${cardBorder} ${mutedText} hover:border-semcompMidDarkBlue/60`
                                  }`}
                                >
                                  {formatDateTime(dt)}
                                </button>
                              );
                            })}
                          </div>
                        )}
                        {item.rawType === "COMBO" && item.availableDateTimes.length > 0 && (
                          <div className="flex flex-wrap gap-1.5 mt-0.5">
                            {item.availableDateTimes.map((dt) => (
                              <span
                                key={dt}
                                className={`px-2.5 py-1 text-xs font-semibold rounded-md border ${cardBorder} bg-semcompMidDarkBlue/10 ${mutedText}`}
                              >
                                {formatDateTime(dt)}
                              </span>
                            ))}
                          </div>
                        )}

                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            addItem({
                              id: quickVariant ? quickVariant.productId : (quickCoffeeTime ? quickCoffeeTime.productId : item.id),
                              name: item.name,
                              price: quickVariant ? quickVariant.priceValue : (quickCoffeeTime ? quickCoffeeTime.priceValue : item.priceValue),
                              image: item.image,
                              type: item.rawType,
                              size: quickVariant?.size,
                              isBabydoll: quickVariant?.isBabydoll || undefined,
                              dateTime: activeDateTime,
                              comboDateTimes: item.rawType === "COMBO" ? item.availableDateTimes : undefined,
                            });
                            showNotification("Produto adicionado ao carrinho!", "success");
                          }}
                          className={`mt-auto w-full rounded-full py-2.5 text-sm font-bold transition-all duration-300 cursor-pointer dark:focus:bg-semcompOffWhite dark:focus:text-semcompAlmostDarkBlue focus:outline-none focus:ring-2 focus:ring-semcompLightBlue focus:ring-offset-2 active:scale-95 shadow-md ${btnSolid}`}
                        >
                          <span className="flex items-center justify-center gap-2">
                            <ShoppingCart size={18} />
                            Comprar
                          </span>
                        </button>
                      </div>
                    </motion.article>
                    );
                  })}
                </motion.div>
              )}
            </>
          )}
        </div>
      </section>

      {/* ── Modal de detalhes ────────────────────────── */}
      <Modal open={!!selected} onClose={closeModal} size="xl" closeOnBackdrop>
        {selected && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Imagem com zoom ao clicar */}
            <div
              className="rounded-2xl overflow-hidden aspect-square shadow-[0_4px_20px_rgba(0,0,0,0.15)] cursor-zoom-in relative group"
              onClick={() => setZoomedImage({ url: selected.image, alt: selected.name })}
            >
              <img
                src={selected.image}
                alt={selected.name}
                className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/25 transition-all duration-300 flex items-center justify-center">
                <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-300 bg-black/50 backdrop-blur-sm rounded-full p-3.5 shadow-xl">
                  <ZoomIn size={28} className="text-white" />
                </div>
              </div>
              <span className="absolute bottom-3 right-3 text-xs text-white/60 bg-black/30 backdrop-blur-sm px-2 py-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity">
                Clique para ampliar
              </span>
            </div>

            {/* Info */}
            <div className="flex flex-col gap-4">
              <div>
                <h2 className={`font-poppins text-2xl font-extrabold ${textColor}`}>
                  {selected.name}
                </h2>
              </div>

              <p className="text-3xl font-extrabold text-semcompDarkBlue dark:text-semcompOffWhite">{formatBRL(displayPrice)}</p>

              <p className={`text-sm leading-relaxed ${mutedText}`}>
                {selected.description}
              </p>

              <p className={`text-sm ${mutedText}`}>
                {selected.rawType === "KIT" ? "Cor: " + (selected.color ?? "Padrão") : ""}
              </p>

              <div className={`border-t ${divider} pt-4 space-y-5`}>
                {/* Seletor de cor (Combo) */}
                {selected.rawType === "COMBO" && colorsOf(selected).length > 1 && (
                  <div>
                    <span className={`text-sm font-semibold ${textColor}`}>Cor da camiseta</span>
                    <div className="flex flex-wrap gap-2 mt-2">
                      {colorsOf(selected).map((color) => (
                        <button
                          key={color}
                          onClick={() => handleColorSelect(selected, color)}
                          className={`min-w-11 px-3 py-2 text-sm font-bold rounded-lg border transition-all cursor-pointer ${
                            modalCurrentColor === color
                              ? isDarkMode
                                ? "bg-semcompOffWhite text-semcompMidDarkBlue border-semcompOffWhite shadow-md"
                                : "bg-semcompMidDarkBlue text-semcompOffWhite border-semcompMidDarkBlue shadow-md"
                              : isDarkMode
                                ? `${cardBorder} ${mutedText} hover:border-semcompOffWhite/70 hover:text-semcompOffWhite hover:bg-white/5`
                                : `${cardBorder} ${mutedText} hover:border-semcompMidDarkBlue hover:text-semcompMidDarkBlue hover:bg-semcompMidDarkBlue/5`
                          }`}
                        >
                          {color}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* Seletor de Tamanho/Corte com contagem por unidade */}
                {selected.sizeVariants.length > 0 && (
                  <div>
                    <span className={`text-sm font-semibold ${textColor}`}>Tamanho da camiseta</span>
                    <div className="flex flex-wrap gap-2 mt-2">
                      {selected.sizeVariants
                        .filter((v) => selected.rawType !== "COMBO" || colorOf(v) === modalCurrentColor)
                        .map((v) => {
                          const key = variantKey(v);
                          return (
                            <OptionChip
                              key={key}
                              label={variantLabel(v)}
                              count={optionCounts[key] ?? 0}
                              activeClass={chipActive}
                              idleClass={chipIdle}
                              onAdd={() => setOptionCount(key, 1)}
                              onRemove={() => setOptionCount(key, -1)}
                            />
                          );
                        })}
                    </div>
                    <p className={`mt-2 text-xs ${mutedText}`}>
                      Selecione um tamanho por camiseta. Quantidade total: {totalQty}.
                    </p>
                  </div>
                )}

                {/* Horários: Coffee selecionável, Combo somente leitura */}
                {selected.rawType === "COFFEE" && selected.availableDateTimes.length > 0 && (
                  <div>
                    <span className={`text-sm font-semibold ${textColor}`}>Horário disponível</span>
                    <div className="flex flex-wrap gap-2 mt-2">
                      {selected.availableDateTimes.map((dt) => (
                        <OptionChip
                          key={dt}
                          label={formatDateTime(dt)}
                          count={optionCounts[dt] ?? 0}
                          activeClass={chipActive}
                          idleClass={chipIdle}
                          onAdd={() => setOptionCount(dt, 1)}
                          onRemove={() => setOptionCount(dt, -1)}
                        />
                      ))}
                    </div>
                    <p className={`mt-2 text-xs ${mutedText}`}>
                      Selecione um horário por coffee. Quantidade total: {totalQty}.
                    </p>
                  </div>
                )}
                {selected.rawType === "COMBO" && selected.availableDateTimes.length > 0 && (
                  <div>
                    <span className={`text-sm font-semibold ${textColor}`}>Coffee Break incluído</span>
                    <div className="flex flex-wrap gap-2 mt-2">
                      {selected.availableDateTimes.map((dt) => (
                        <span
                          key={dt}
                          className={`px-3 py-2 text-sm font-semibold rounded-lg border ${cardBorder} bg-semcompMidDarkBlue/10 ${mutedText}`}
                        >
                          {formatDateTime(dt)}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {/* Total */}
                <div className={`pt-4 border-t ${divider}`}>
                  <div className="flex items-center justify-between">
                    <span className={`font-bold ${textColor}`}>
                      {totalQty > 0 ? `Total (${totalQty} ${totalQty === 1 ? "item" : "itens"})` : "Total"}
                    </span>
                    <span className="text-2xl font-extrabold text-semcompMidDarkBlue dark:text-semcompOffWhite">
                      {formatBRL(totalPriceValue)}
                    </span>
                  </div>
                </div>
              </div>

              <button
                type="button"
                onClick={handleAddToCart}
                disabled={totalQty === 0}
                className={`mt-2 w-full rounded-full py-3.5 text-base font-bold transition-all duration-300 cursor-pointer focus:outline-none focus:ring-2 focus:ring-semcompLightBlue focus:ring-offset-2 active:scale-95 shadow-lg ${btnSolid} disabled:opacity-50 disabled:cursor-not-allowed disabled:active:scale-100`}
              >
                <span className="flex items-center justify-center gap-2">
                  <ShoppingCart size={20} />
                  {totalQty > 0 ? `Adicionar ao carrinho (${totalQty})` : "Selecione horários/tamanhos"}
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

      {/* Carrinho flutuante (mobile) */}
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
