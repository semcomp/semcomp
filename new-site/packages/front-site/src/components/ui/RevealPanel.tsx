import { useEffect, useRef } from 'react';
import { gsap, ScrollTrigger } from '@/lib/gsap';

type Direction = 'up' | 'left' | 'right';

type Props = {
  children: React.ReactNode;
  className?: string;
  direction?: Direction;
};

const fromVars: Record<Direction, gsap.TweenVars> = {
  up:    { y: 56 },
  left:  { x: -72 },
  right: { x: 72 },
};

export default function RevealPanel({ children, className = '', direction = 'up' }: Props) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const st = ScrollTrigger.create({
      trigger: el,
      start: 'top 90%',
      once: true,
      onEnter: () => {
        gsap.from(el, {
          ...fromVars[direction],
          opacity: 0,
          duration: 1.1,
          ease: 'power2.out',
          clearProps: 'all',
        });
      },
    });

    return () => st.kill();
  }, [direction]);

  return (
    <div ref={ref} className={className}>
      {children}
    </div>
  );
}
