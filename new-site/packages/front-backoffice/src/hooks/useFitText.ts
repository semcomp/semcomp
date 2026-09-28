import { useLayoutEffect, useRef } from "react";

const STEP = 0.5;
const DEFAULT_MIN_SIZE = 8;

/**
 * Reduz dinamicamente a font-size de um elemento de texto para caber na
 * largura do pai em uma única linha (white-space nowrap), sem quebrar.
 * Começa da fonte definida por CSS (ex.: classes responsivas) e somente
 * encolhe quando houver overflow, até atingir `minSize` px.
 * Recalcula quando `text` muda, quando o pai redimensiona (ResizeObserver)
 * e quando as fontes da página terminam de carregar.
 */
export function useFitText<T extends HTMLElement>(
  text: unknown,
  minSize = DEFAULT_MIN_SIZE,
) {
  const ref = useRef<T>(null);

  useLayoutEffect(() => {
    const el = ref.current;
    if (!el || typeof window === "undefined") return;
    const parent = el.parentElement;
    if (!parent) return;

    const fit = () => {
      // Restaura a fonte definida por CSS para recalcular sempre a partir dela.
      el.style.fontSize = "";
      const base = parseFloat(window.getComputedStyle(el).fontSize) || 16;
      el.style.whiteSpace = "nowrap";

      const parentStyle = window.getComputedStyle(parent);
      const horizontalPadding =
        (parseFloat(parentStyle.paddingLeft) || 0) +
        (parseFloat(parentStyle.paddingRight) || 0);
      const maxWidth = parent.clientWidth - horizontalPadding;

      if (maxWidth <= 0) return;

      let size = base;
      el.style.fontSize = `${size}px`;
      while (size > minSize && el.scrollWidth > maxWidth) {
        size -= STEP;
        el.style.fontSize = `${size}px`;
      }
    };

    fit();

    const observer = new ResizeObserver(fit);
    observer.observe(parent);
    document.fonts?.ready?.then(fit).catch(() => {});

    return () => observer.disconnect();
  }, [text, minSize]);

  return ref;
}