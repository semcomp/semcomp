/**
 * Centraliza todas as cores e temas do site
 * Reduz duplicação de código nos components
 */

export const THEME_COLORS = {
  // Cores de texto principais
  text: (isDarkMode: boolean) =>
    isDarkMode ? "text-semcompOffWhite" : "text-semcompDarkBlue",

  textContrast: (isDarkMode: boolean) =>
    isDarkMode ? "text-semcompOffBlack" : "text-semcompOffWhite",

  // Backgrounds principais
  bgPrimary: (isDarkMode: boolean) =>
    isDarkMode ? "bg-semcompDarkBlue" : "bg-semcompOffWhite",

  bgSecondary: (isDarkMode: boolean) =>
    isDarkMode ? "bg-semcompMidDarkBlue" : "bg-semcompMidDarkBlue",

  bgTertiary: (isDarkMode: boolean) =>
    isDarkMode ? "bg-semcompAlmostDarkBlue" : "bg-semcompLightBlue",

  // Gradientes (retorna objeto com from, via, to)
  gradient: (isDarkMode: boolean) => ({
    from: isDarkMode
      ? "from-semcompLightBlue/80"
      : "from-semcompDarkBlue/80",
    via: isDarkMode ? "via-semcompLightBlue" : "via-semcompDarkBlue",
    to: isDarkMode ? "to-semcompOffWhite" : "to-semcompOffBlack",
  }),

  // Placeholder styles
  placeholder: (isDarkMode: boolean) =>
    isDarkMode
      ? "placeholder:text-semcompOffWhite/50"
      : "placeholder:text-semcompDarkBlue/50",

  // Hover states
  hoverColor: (isDarkMode: boolean) =>
    isDarkMode ? "hover:bg-semcompLightBlue" : "hover:bg-semcompMidDarkBlue",

  // Form elements
  formBg: (isDarkMode: boolean) =>
    isDarkMode ? "bg-semcompDarkBlue" : "bg-semcompOffWhite",
} as const;

/**
 * Utilitário para gerar string de gradiente linear
 * @param isDarkMode - se deve usar tema escuro
 * @returns string completa para usar em className
 */
export function getGradientClass(isDarkMode: boolean): string {
  const grad = THEME_COLORS.gradient(isDarkMode);
  return `bg-linear-to-r ${grad.from} ${grad.via} ${grad.to}`;
}
