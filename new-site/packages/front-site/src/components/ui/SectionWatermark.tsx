import { useEffect, useRef } from 'react';
import { gsap } from '@/lib/gsap';

type Props = {
  src: string;
  /** Classes de posicionamento e tamanho, ex: "right-0 top-1/2 w-[38vw]" */
  className?: string;
  style?: React.CSSProperties;
  /** Flutuação suave yoyo contínua */
  float?: boolean;
  /**
   * Rotação contínua infinita.
   * Positivo = sentido horário, negativo = anti-horário.
   * Valor em segundos por volta completa.
   */
  rotationDuration?: number;
};

/**
 * Logo watermark posicionado absolutamente dentro de uma seção.
 * Aceita animações GSAP opcionais: float (yoyo) e/ou rotação contínua.
 *
 * A seção pai deve ter `position: relative` e `overflow-hidden`.
 *
 * Uso:
 * <SectionWatermark
 *   src={LogoSEMCOMP}
 *   className="w-[38vw] right-0 top-1/2 -translate-y-1/2 opacity-[0.04]"
 *   style={{ filter: 'brightness(0) invert(1)' }}
 * />
 */
export default function SectionWatermark({ src, className = '', style, float, rotationDuration }: Props) {
  const imgRef = useRef<HTMLImageElement>(null);

  useEffect(() => {
    if (!imgRef.current) return;
    const tweens: gsap.core.Tween[] = [];

    if (float) {
      tweens.push(
        gsap.to(imgRef.current, {
          y: -20,
          duration: 5,
          ease: 'sine.inOut',
          yoyo: true,
          repeat: -1,
        })
      );
    }

    if (rotationDuration !== undefined) {
      tweens.push(
        gsap.to(imgRef.current, {
          rotation: rotationDuration > 0 ? 360 : -360,
          duration: Math.abs(rotationDuration),
          ease: 'none',
          repeat: -1,
          transformOrigin: 'center center',
        })
      );
    }

    return () => tweens.forEach((t) => t.kill());
  }, [float, rotationDuration]);

  return (
    <img
      ref={imgRef}
      src={src}
      alt=""
      aria-hidden
      className={`absolute pointer-events-none z-0 h-auto ${className}`}
      style={style}
    />
  );
}
