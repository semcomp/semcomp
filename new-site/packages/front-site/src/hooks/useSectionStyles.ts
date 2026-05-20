/**
 * Hook para centralizar estilos de sections
 * Reduz duplicação em todas as sections da Home
 */

import { useTheme } from "@/contexts/useTheme";
import { THEME_COLORS, getGradientClass } from "@/lib/constants/ThemeColors";

export function useSectionStyles() {
  const { isDarkMode } = useTheme();

  // Cores de texto
  const textColor = THEME_COLORS.text(isDarkMode);
  const textContrast = THEME_COLORS.textContrast(isDarkMode);

  // Backgrounds
  const bgPrimary = THEME_COLORS.bgPrimary(isDarkMode);
  const bgSecondary = THEME_COLORS.bgSecondary(isDarkMode);
  const bgTertiary = THEME_COLORS.bgTertiary(isDarkMode);

  // Gradiente
  const gradient = THEME_COLORS.gradient(isDarkMode);
  const gradientClass = getGradientClass(isDarkMode);

  // Placeholder
  const placeholderColor = THEME_COLORS.placeholder(isDarkMode);

  // Hover
  const hoverColor = THEME_COLORS.hoverColor(isDarkMode);

  // Form
  const formBg = THEME_COLORS.formBg(isDarkMode);

  return {
    // Cores de texto
    textColor,
    textContrast,

    // Backgrounds
    bgPrimary,
    bgSecondary,
    bgTertiary,

    // Gradiente (retorna objeto para casos onde precisa de from/via/to separados)
    gradient,
    // String pronta para usar em className
    gradientClass,

    // Placeholder
    placeholderColor,

    // Hover
    hoverColor,

    // Form
    formBg,

    // Utilitários
    isDarkMode,
  };
}
