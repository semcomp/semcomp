/**
 * Sistema de filtro/hover dos logos, compartilhado pelo <LogoLoop> e por quem
 * renderiza logos fora do loop (a grade estática de patrocinadores, usada quando
 * há poucos itens). Fica em módulo próprio para que exista uma única fonte de
 * verdade das classes — duplicá-las no consumidor faria as duas cópias divergirem
 * ao primeiro ajuste de hover.
 *
 * Os literais completos ficam aqui (e não concatenados) porque é o texto no
 * arquivo que o Tailwind usa para gerar cada classe.
 */

/** Combina class names filtrando falsy values */
export const cx = (...classes: (string | false | null | undefined)[]) =>
  classes.filter(Boolean).join(' ');

/** Tema em que um logo deve ficar branco no hover. */
export type LogoHoverTheme = 'light' | 'dark' | 'both';

/**
 * Filtro aplicado no hover, por tema.
 * - `original`: descarta o grayscale/invert do estado base e devolve a cor do arquivo.
 * - `white`: zera o RGB (brightness(0)) e inverte para branco puro, preservando o
 *   canal alpha — a marca vira uma silhueta branca, sem depender da cor original.
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

/**
 * Classes da <img> do logo: estado base (silhueta branca), transição e efeito de
 * hover. Exige um ancestral com `group` para os `group-hover:` funcionarem.
 *
 * `whiteOnHover` mantém a marca branca pura no hover em vez de revelar a cor do
 * arquivo — necessário quando a cor original se aproxima do fundo da seção e
 * deixaria o logo ilegível justamente no estado de destaque.
 */
export function buildLogoImgClassName(
  isDarkMode: boolean | undefined,
  whiteOnHover?: LogoHoverTheme,
  scaleOnHover = false,
): string {
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
}
