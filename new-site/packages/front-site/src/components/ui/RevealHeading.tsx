import { useEffect, useRef } from 'react';
import { gsap } from '@/lib/gsap';

export type RevealWord = {
  text: string;
  gradient?: boolean;
};

type Props = {
  words: RevealWord[];
  /** Classe de cor para palavras simples, ex: "text-semcompOffWhite" */
  plainClass?: string;
  /** Classes de gradiente completas, ex: "bg-linear-to-r from-X via-Y to-Z" */
  gradientClass?: string;
  /** Classes no elemento h2: tamanho, margem, fonte, etc. */
  className?: string;
  /** Start do ScrollTrigger; padrão "top 85%" */
  triggerStart?: string;
};

/**
 * Heading com animação de clip-reveal por palavra acionada por scroll.
 * Cada palavra sobe de trás de uma máscara `overflow-hidden`.
 *
 * Uso:
 * <RevealHeading
 *   words={[{ text: 'SOBRE A' }, { text: 'SEMCOMP', gradient: true }]}
 *   plainClass={textColor}
 *   gradientClass={`bg-linear-to-r ${gradientFrom} ${gradientVia} ${gradientTo}`}
 *   className="text-4xl font-extrabold mb-6"
 * />
 */
export default function RevealHeading({
  words,
  plainClass = '',
  gradientClass = '',
  className = '',
  triggerStart = 'top 85%',
}: Props) {
  const headingRef = useRef<HTMLHeadingElement>(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.from('.rh-word', {
        yPercent: 115,
        duration: 0.85,
        stagger: 0.13,
        ease: 'power4.out',
        scrollTrigger: {
          trigger: headingRef.current,
          start: triggerStart,
        },
      });
    }, headingRef);
    return () => ctx.revert();
  }, [triggerStart]);

  return (
    <h2 ref={headingRef} className={className}>
      {words.map((word, i) => (
        <span key={i}>
          {i > 0 && ' '}
          <span className="inline-block overflow-hidden leading-none pb-1">
            <span
              className={`rh-word inline-block font-extrabold ${
                word.gradient
                  ? `bg-clip-text text-transparent ${gradientClass}`
                  : plainClass
              }`}
            >
              {word.text}
            </span>
          </span>
        </span>
      ))}
    </h2>
  );
}
