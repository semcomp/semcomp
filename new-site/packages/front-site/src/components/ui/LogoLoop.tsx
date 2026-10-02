import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';

// Combina class names filtrando falsy values
const cx = (...classes: (string | false | null | undefined)[]) =>
  classes.filter(Boolean).join(' ');

/** Tema em que um logo deve ficar branco no hover. */
export type LogoHoverTheme = 'light' | 'dark' | 'both';

export type LogoItem =
  | {
      node: React.ReactNode;
      href?: string;
      title?: string;
      ariaLabel?: string;
    }
  | {
      src: string;
      alt?: string;
      href?: string;
      title?: string;
      srcSet?: string;
      sizes?: string;
      width?: number;
      height?: number;
      /** Escala extra do <img>, para arquivos com muita área morta em volta da marca. */
      scale?: number;
      /**
       * Tema em que este logo fica branco puro no hover, em vez de revelar a cor do
       * arquivo. Use quando a cor original da marca se aproxima do fundo da seção.
       */
      whiteOnHover?: LogoHoverTheme;
    };

export interface LogoLoopProps {
  logos: LogoItem[];
  speed?: number;
  direction?: 'left' | 'right' | 'up' | 'down';
  width?: number | string;
  logoHeight?: number;
  logoWidth?: number;
  gap?: number;
  pauseOnHover?: boolean;
  hoverSpeed?: number;
  fadeOut?: boolean;
  fadeOutColor?: string;
  scaleOnHover?: boolean;
  isDarkMode?: boolean;
  renderItem?: (item: LogoItem, key: React.Key) => React.ReactNode;
  ariaLabel?: string;
  className?: string;
  style?: React.CSSProperties;
}

const ANIMATION_CONFIG = {
  SMOOTH_TAU: 0.25,
  MIN_COPIES: 2,
  COPY_HEADROOM: 2,
} as const;

/**
 * Filtro aplicado no hover, por tema.
 * - `original`: descarta o grayscale/invert do estado base e devolve a cor do arquivo.
 * - `white`: zera o RGB (brightness(0)) e inverte para branco puro, preservando o
 *   canal alpha — a marca vira uma silhueta branca, sem depender da cor original.
 *
 * Os literais completos ficam aqui (e não concatenados) porque é o texto no arquivo
 * que o Tailwind usa para gerar cada classe.
 */
const HOVER_FILTER = {
  light: {
    original:
      '[@media(hover:hover)]:group-hover:[filter:brightness(1.2)_drop-shadow(0_0_12px_rgba(0,0,0,0.6))]',
    white:
      '[@media(hover:hover)]:group-hover:[filter:brightness(0)_invert(1)_drop-shadow(0_0_12px_rgba(0,0,0,0.6))]',
  },
  dark: {
    original:
      '[@media(hover:hover)]:group-hover:[filter:brightness(1.2)_drop-shadow(0_0_14px_rgba(255,255,255,0.4))]',
    white:
      '[@media(hover:hover)]:group-hover:[filter:brightness(0)_invert(1)_drop-shadow(0_0_14px_rgba(255,255,255,0.4))]',
  },
} as const;

const toCssLength = (value?: number | string): string | undefined =>
  typeof value === 'number' ? `${value}px` : (value ?? undefined);

const useResizeObserver = (
  callback: () => void,
  elements: Array<React.RefObject<Element | null>>,
  dependencies: React.DependencyList
) => {
  useEffect(() => {
    if (!window.ResizeObserver) {
      window.addEventListener('resize', callback);
      callback();
      return () => window.removeEventListener('resize', callback);
    }
    const observers = elements.map(ref => {
      if (!ref.current) return null;
      const observer = new ResizeObserver(callback);
      observer.observe(ref.current);
      return observer;
    });
    callback();
    return () => observers.forEach(o => o?.disconnect());
  }, dependencies); 
};

const useImageLoader = (
  seqRef: React.RefObject<HTMLUListElement | null>,
  onLoad: () => void,
  dependencies: React.DependencyList
) => {
  useEffect(() => {
    const images = seqRef.current?.querySelectorAll('img') ?? [];
    if (images.length === 0) { onLoad(); return; }

    let remaining = images.length;
    const done = () => { if (--remaining === 0) onLoad(); };

    images.forEach(img => {
      const el = img as HTMLImageElement;
      if (el.complete) { done(); }
      else {
        el.addEventListener('load', done, { once: true });
        el.addEventListener('error', done, { once: true });
      }
    });
    return () => images.forEach(img => {
      img.removeEventListener('load', done);
      img.removeEventListener('error', done);
    });
  }, dependencies); 
};

const useAnimationLoop = (
  trackRef: React.RefObject<HTMLDivElement | null>,
  targetVelocity: number,
  seqWidth: number,
  seqHeight: number,
  isHovered: boolean,
  hoverSpeed: number | undefined,
  isVertical: boolean
) => {
  const rafRef       = useRef<number | null>(null);
  const lastTsRef    = useRef<number | null>(null);
  const offsetRef    = useRef(0);
  const velocityRef  = useRef(0);

  useEffect(() => {
    const track = trackRef.current;
    if (!track) return;
    if (window.matchMedia?.('(prefers-reduced-motion: reduce)').matches) return;

    const seqSize = isVertical ? seqHeight : seqWidth;
    if (seqSize > 0) {
      offsetRef.current = ((offsetRef.current % seqSize) + seqSize) % seqSize;
      track.style.transform = isVertical
        ? `translate3d(0,${-offsetRef.current}px,0)`
        : `translate3d(${-offsetRef.current}px,0,0)`;
    }

    const animate = (ts: number) => {
      if (lastTsRef.current === null) lastTsRef.current = ts;
      const dt = Math.max(0, ts - lastTsRef.current) / 1000;
      lastTsRef.current = ts;

      const target = isHovered && hoverSpeed !== undefined ? hoverSpeed : targetVelocity;
      velocityRef.current += (target - velocityRef.current) * (1 - Math.exp(-dt / ANIMATION_CONFIG.SMOOTH_TAU));

      if (seqSize > 0) {
        let next = ((offsetRef.current + velocityRef.current * dt) % seqSize + seqSize) % seqSize;
        offsetRef.current = next;
        track.style.transform = isVertical
          ? `translate3d(0,${-next}px,0)`
          : `translate3d(${-next}px,0,0)`;
      }
      rafRef.current = requestAnimationFrame(animate);
    };

    rafRef.current = requestAnimationFrame(animate);
    return () => {
      if (rafRef.current !== null) { cancelAnimationFrame(rafRef.current); rafRef.current = null; }
      lastTsRef.current = null;
    };
  }, [targetVelocity, seqWidth, seqHeight, isHovered, hoverSpeed, isVertical]); 
};

export const LogoLoop = React.memo<LogoLoopProps>(
  ({
    logos,
    speed = 120,
    direction = 'left',
    width = '100%',
    logoHeight = 28,
    logoWidth,
    gap = 32,
    pauseOnHover,
    hoverSpeed,
    fadeOut = false,
    fadeOutColor,
    scaleOnHover = false,
    isDarkMode,
    renderItem,
    ariaLabel = 'Partner logos',
    className,
    style,
  }) => {
    const containerRef = useRef<HTMLDivElement>(null);
    const trackRef     = useRef<HTMLDivElement>(null);
    const seqRef       = useRef<HTMLUListElement>(null);

    const [seqWidth,   setSeqWidth]   = useState(0);
    const [seqHeight,  setSeqHeight]  = useState(0);
    const [copyCount,  setCopyCount]  = useState<number>(ANIMATION_CONFIG.MIN_COPIES);
    const [isHovered,  setIsHovered]  = useState(false);

    const effectiveHoverSpeed = useMemo(() => {
      if (hoverSpeed !== undefined) return hoverSpeed;
      if (pauseOnHover === true) return 0;
      if (pauseOnHover === false) return undefined;
      return 0;
    }, [hoverSpeed, pauseOnHover]);

    const isVertical = direction === 'up' || direction === 'down';

    const targetVelocity = useMemo(() => {
      const mag = Math.abs(speed);
      const dir = isVertical
        ? direction === 'up' ? 1 : -1
        : direction === 'left' ? 1 : -1;
      return mag * dir * (speed < 0 ? -1 : 1);
    }, [speed, direction, isVertical]);

    const updateDimensions = useCallback(() => {
      const cw = containerRef.current?.clientWidth ?? 0;
      const rect = seqRef.current?.getBoundingClientRect?.();
      const sw = rect?.width ?? 0;
      const sh = rect?.height ?? 0;

      if (isVertical) {
        const ph = containerRef.current?.parentElement?.clientHeight ?? 0;
        if (containerRef.current && ph > 0) {
          const t = Math.ceil(ph);
          if (containerRef.current.style.height !== `${t}px`)
            containerRef.current.style.height = `${t}px`;
        }
        if (sh > 0) {
          setSeqHeight(Math.ceil(sh));
          const vp = containerRef.current?.clientHeight ?? ph ?? sh;
          setCopyCount(Math.max(ANIMATION_CONFIG.MIN_COPIES, Math.ceil(vp / sh) + ANIMATION_CONFIG.COPY_HEADROOM));
        }
      } else if (sw > 0) {
        setSeqWidth(Math.ceil(sw));
        setCopyCount(Math.max(ANIMATION_CONFIG.MIN_COPIES, Math.ceil(cw / sw) + ANIMATION_CONFIG.COPY_HEADROOM));
      }
    }, [isVertical]);

    useResizeObserver(updateDimensions, [containerRef, seqRef], [logos, gap, logoHeight, isVertical]);
    useImageLoader(seqRef, updateDimensions, [logos, gap, logoHeight, isVertical]);
    useAnimationLoop(trackRef, targetVelocity, seqWidth, seqHeight, isHovered, effectiveHoverSpeed, isVertical);

    const handleMouseEnter = useCallback(() => {
      if (effectiveHoverSpeed !== undefined) setIsHovered(true);
    }, [effectiveHoverSpeed]);

    const handleMouseLeave = useCallback(() => {
      if (effectiveHoverSpeed !== undefined) setIsHovered(false);
    }, [effectiveHoverSpeed]);

    const hasHoverEffect = isDarkMode !== undefined || scaleOnHover;

    const liClassName = useMemo(() => cx(
      'leading-none',
      hasHoverEffect && 'group',
    ), [hasHoverEffect]);

    /** Classes da <img> — filtro + transição + hover effect (por item, por causa de whiteOnHover) */
    const buildImgClassName = useCallback((whiteOnHover?: LogoHoverTheme) => {
      const theme = isDarkMode === false ? 'light' : 'dark';
      const isWhiteOnHover =
        whiteOnHover === 'both' ||
        (isDarkMode === true && whiteOnHover === 'dark') ||
        (isDarkMode === false && whiteOnHover === 'light');

      const hoverFilter = HOVER_FILTER[theme][isWhiteOnHover ? 'white' : 'original'];

      return cx(
        'block object-contain pointer-events-none select-none [-webkit-user-drag:none]',
        'transition-[filter,opacity,transform] ease-[cubic-bezier(0.25,1,0.5,1)] motion-reduce:transition-none will-change-[filter,opacity,transform]',

        isDarkMode === true && cx(
          '[@media(hover:hover)]:[filter:grayscale(1)_brightness(0.35)_invert(1)]',
          '[@media(hover:hover)]:opacity-80',
          hoverFilter,
          '[@media(hover:hover)]:group-hover:opacity-100',
          '[@media(hover:hover)]:group-hover:scale-[1.15]',
          '[@media(hover:hover)]:group-hover:origin-center',
        ),
        isDarkMode === false && cx(
          '[@media(hover:hover)]:[filter:grayscale(1)_brightness(0.35)_invert(1)]',
          '[@media(hover:hover)]:opacity-100',
          hoverFilter,
          '[@media(hover:hover)]:group-hover:opacity-100',
          '[@media(hover:hover)]:group-hover:scale-[1.15]',
          '[@media(hover:hover)]:group-hover:origin-center',
        ),
        isDarkMode === undefined && scaleOnHover && 'group-hover:scale-[1.2] group-hover:origin-center',
      );
    }, [isDarkMode, scaleOnHover]);

    /**
     * Style inline da <img> — dimensões do box + escala opcional do item.
     * A escala usa `transform` (e não `scale`) de propósito: o `scale-[1.15]` do hover
     * é emitido pelo Tailwind v4 na propriedade `scale`, então `transform` compõe com
     * ele em vez de ser sobrescrito — o hover cresce os mesmos 15% em qualquer logo.
     */
    const buildImgStyle = useCallback((scale?: number): React.CSSProperties => ({
      height: `${logoHeight}px`,
      width: logoWidth !== undefined ? `${logoWidth}px` : 'auto',
      ...(scale !== undefined ? { transform: `scale(${scale})` } : null),
    }), [logoHeight, logoWidth]);

    /** Style inline de cada <li> */
    const itemStyle = useMemo((): React.CSSProperties => ({
      flex: '0 0 auto',
      lineHeight: 1,
      fontSize: `${logoHeight}px`,
      ...(isVertical ? { marginBottom: `${gap}px` } : { marginRight: `${gap}px` }),
    }), [gap, logoHeight, isVertical]);

    const containerStyle = useMemo((): React.CSSProperties => ({
      width: isVertical
        ? toCssLength(width) !== '100%' ? toCssLength(width) : undefined
        : (toCssLength(width) ?? '100%'),
      ...style,
    }), [width, style, isVertical]);

    const effectiveFadeColor = fadeOutColor ?? '#ffffff';

    const renderLogoItem = useCallback(
      (item: LogoItem, key: React.Key) => {
        if (renderItem) {
          return (
            <li
              key={key}
              role="listitem"
              className={liClassName}
              style={itemStyle}
            >
              {renderItem(item, key)}
            </li>
          );
        }

        const isNodeItem = 'node' in item;

        /** Só a variante de imagem tem metadados de exibição (a de `node` traz o próprio JSX) */
        const imgItem = isNodeItem ? null : item;

        const content = isNodeItem ? (
          <span
            className="inline-flex items-center"
            aria-hidden={!!item.href && !(item as any).ariaLabel}
          >
            {(item as any).node}
          </span>
        ) : (
          <img
            src={(item as any).src}
            srcSet={(item as any).srcSet}
            sizes={(item as any).sizes}
            alt={(item as any).alt ?? ''}
            title={(item as any).title}
            loading="lazy"
            decoding="async"
            draggable={false}
            className={buildImgClassName(imgItem?.whiteOnHover)}
            style={buildImgStyle(imgItem?.scale)}
          />
        );

        const itemAriaLabel = isNodeItem
          ? ((item as any).ariaLabel ?? (item as any).title)
          : ((item as any).alt ?? (item as any).title);

        const itemContent = (item as any).href ? (
          <a
            href={(item as any).href}
            aria-label={itemAriaLabel || 'logo link'}
            target="_blank"
            rel="noreferrer noopener"
            className="inline-flex items-center no-underline rounded transition-opacity duration-200 hover:opacity-80 focus-visible:outline-2 focus-visible:outline-current focus-visible:outline-offset-2"
          >
            {content}
          </a>
        ) : content;

        return (
          <li
            key={key}
            role="listitem"
            className={liClassName}
            style={itemStyle}
          >
            {itemContent}
          </li>
        );
      },
      [renderItem, liClassName, buildImgClassName, buildImgStyle, itemStyle]
    );

    const logoLists = useMemo(
      () =>
        Array.from({ length: copyCount }, (_, copyIndex) => (
          <ul
            key={`copy-${copyIndex}`}
            role="list"
            aria-hidden={copyIndex > 0}
            className={cx('flex items-center', isVertical && 'flex-col')}
            ref={copyIndex === 0 ? seqRef : undefined}
          >
            {logos.map((item, itemIndex) =>
              renderLogoItem(item, `${copyIndex}-${itemIndex}`)
            )}
          </ul>
        )),
      [copyCount, logos, renderLogoItem, isVertical]
    );

    // ── JSX ──────────────────────────────────────────────────────────────────

    return (
      <div
        ref={containerRef}
        role="region"
        aria-label={ariaLabel}
        className={cx(
          'relative',
          isVertical ? '[overflow-y:clip] h-full inline-block' : '[overflow-x:clip] w-full',
          className
        )}
        style={containerStyle}
      >
        {/*
          As máscaras laterais se estendem para fora da linha (-inset-y-5, 20px) de propósito:
          o hover pinta além da altura da linha — scale-[1.15] leva o <img> de 72 para 82.8px
          (5.4px de cada lado) e o drop-shadow soma ~12px (14px no dark) — e o container só
          recorta no eixo X. Sem a extensão, o logo que ainda está na zona de fade tem o
          brilho atenuado pela máscara mas a parte que transborda aparece sem máscara alguma,
          com um corte reto na altura da caixa da máscara.
          20px cobre o pior caso medido (5.4 + 12) e fica dentro do vão de 24px entre linhas.
        */}
        {fadeOut && (
          <div
            aria-hidden="true"
            className={cx(
              'absolute pointer-events-none z-10',
              isVertical
                ? 'left-0 right-0 top-0 h-[clamp(24px,8%,120px)]'
                : '-inset-y-5 left-0 w-[clamp(24px,8%,120px)]'
            )}
            style={{
              background: isVertical
                ? `linear-gradient(to bottom, ${effectiveFadeColor}, transparent)`
                : `linear-gradient(to right, ${effectiveFadeColor}, transparent)`,
            }}
          />
        )}

        <div
          ref={trackRef}
          className={cx(
            'flex will-change-transform select-none relative z-0',
            isVertical ? 'flex-col h-max w-full' : 'w-max'
          )}
          onMouseEnter={handleMouseEnter}
          onMouseLeave={handleMouseLeave}
        >
          {logoLists}
        </div>

        {fadeOut && (
          <div
            aria-hidden="true"
            className={cx(
              'absolute pointer-events-none z-10',
              isVertical
                ? 'left-0 right-0 bottom-0 h-[clamp(24px,8%,120px)]'
                : '-inset-y-5 right-0 w-[clamp(24px,8%,120px)]'
            )}
            style={{
              background: isVertical
                ? `linear-gradient(to top, ${effectiveFadeColor}, transparent)`
                : `linear-gradient(to left, ${effectiveFadeColor}, transparent)`,
            }}
          />
        )}
      </div>
    );
  }
);

LogoLoop.displayName = 'LogoLoop';
export default LogoLoop;
