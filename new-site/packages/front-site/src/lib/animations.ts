/**
 * Animações reutilizáveis para toda a aplicação
 * Evita duplicação de definições de animação
 */

export const ANIMATIONS = {
  /**
   * Fade in clássico com movimento vertical
   */
  fadeIn: {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.6 } },
  },

  /**
   * Fade in mais rápido
   */
  fadeInFast: {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { duration: 0.3 } },
  },

  /**
   * Entrada pela esquerda
   */
  slideInFromLeft: {
    hidden: { opacity: 0, x: -50 },
    visible: { opacity: 1, x: 0, transition: { duration: 0.6 } },
  },

  /**
   * Entrada pela direita
   */
  slideInFromRight: {
    hidden: { opacity: 0, x: 50 },
    visible: { opacity: 1, x: 0, transition: { duration: 0.6 } },
  },

  /**
   * Entrada com zoom
   */
  scaleIn: {
    hidden: { opacity: 0, scale: 0.8 },
    visible: { opacity: 1, scale: 1, transition: { duration: 0.6 } },
  },

  /**
   * Entrada suave e rápida
   */
  softFadeIn: {
    hidden: { opacity: 0, y: 15 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.5 } },
  },
} as const;

/**
 * Configuração padrão para viewport triggers
 * Garante consistência em todas as animações
 */
export const ANIMATION_VIEWPORT = {
  once: true,
} as const;
