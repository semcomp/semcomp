import { useState, useEffect, useRef } from "react";
import { gsap } from "@/lib/gsap";
import SemcompInfo from "../lib/constants/SemcompInfo";

const HERO_IMAGES = [
  "/img/Home/Hero/Banner1.webp",
  "/img/Home/Hero/Banner2.webp",
  "/img/Home/Hero/Palestra1.webp",
  "/img/Home/Hero/Palestra2.webp",
  "/img/Home/Hero/Semcomp.webp",
];
const pickRandomHero = () =>
  HERO_IMAGES[Math.floor(Math.random() * HERO_IMAGES.length)];

const TARGET_DATE = new Date("2026-10-17T00:00:00");

const getCountdown = () => {
  const diff = Math.max(0, TARGET_DATE.getTime() - Date.now());
  return {
    d: Math.floor(diff / 86_400_000),
    h: Math.floor((diff / 3_600_000) % 24),
    m: Math.floor((diff / 60_000) % 60),
    s: Math.floor((diff / 1_000) % 60),
  };
};

const tileStyle: React.CSSProperties = {
  background: "rgba(19, 45, 71, 0.9)",
  color: "#d6ecff",
  fontFamily: "'Barlow Condensed', sans-serif",
  fontWeight: 750,
  letterSpacing: "0.03em",
  padding: "clamp(0.5rem, 2vw, 2rem) clamp(0.5rem, 2vw, 2.5rem)",
  minHeight: "clamp(45px, 8vw, 80px)",
  minWidth: "clamp(55px, 11vw, 90px)",
  textAlign: "center",
  lineHeight: 1,
  clipPath: "polygon(0% 0%, 92% 0%, 100% 100%, 8% 100%)",
  transition: "background 0.18s, color 0.18s",
  fontSize: "clamp(1.5rem, 3vw, 2rem)",
};

export default function MainEntrance() {
  const [heroSrc] = useState<string>(() => pickRandomHero());
  const sectionRef = useRef<HTMLElement>(null);
  const bgRef      = useRef<HTMLDivElement>(null);

  // Refs para GSAP manipular o textContent diretamente
  const diasEl     = useRef<HTMLSpanElement>(null);
  const horasEl    = useRef<HTMLSpanElement>(null);
  const minutosEl  = useRef<HTMLSpanElement>(null);
  const segundosEl = useRef<HTMLSpanElement>(null);

  // Parallax + hero entrance
  useEffect(() => {
    const ctx = gsap.context(() => {
      // Parallax fundo
      gsap.to(bgRef.current, {
        yPercent: 22,
        ease: 'none',
        scrollTrigger: {
          trigger: '#hero',
          start: 'top top',
          end: 'bottom top',
          scrub: true,
        },
      });

      // Entradas do hero (mount, sem scroll)
      gsap.from('.hero-logo', { opacity: 0, x: -30, duration: 0.8, ease: 'power2.out' });
      gsap.from('.hero-date', { opacity: 0, y: 10, duration: 0.8, delay: 0.2, ease: 'power2.out' });
      gsap.from('.hero-countdown', { opacity: 0, y: 20, duration: 0.8, delay: 0.4, ease: 'power2.out' });

      // Scroll indicator: fade in → float loop
      gsap.fromTo('.hero-scroll',
        { opacity: 0, y: 10 },
        {
          opacity: 1, y: 0, duration: 0.6, delay: 1, ease: 'power2.out',
          onComplete() {
            gsap.to('.hero-scroll', {
              y: -10, duration: 0.8, yoyo: true, repeat: -1, ease: 'sine.inOut', repeatDelay: 0.2,
            });
          },
        }
      );
    }, sectionRef);

    return () => ctx.revert();
  }, []);

  // GSAP count-up do countdown + atualização ao vivo
  useEffect(() => {
    const render = (d: number, h: number, m: number, s: number) => {
      if (diasEl.current)    diasEl.current.textContent    = String(d).padStart(2, '0');
      if (horasEl.current)   horasEl.current.textContent   = String(h).padStart(2, '0');
      if (minutosEl.current) minutosEl.current.textContent = String(m).padStart(2, '0');
      if (segundosEl.current) segundosEl.current.textContent = String(s).padStart(2, '0');
    };

    const current = getCountdown();
    const proxy   = { d: 0, h: 0, m: 0, s: 0 };

    const countUp = gsap.to(proxy, {
      ...current,
      duration: 2.4,
      delay: 0.55,
      ease: 'power3.out',
      onUpdate: () =>
        render(Math.round(proxy.d), Math.round(proxy.h), Math.round(proxy.m), Math.round(proxy.s)),
    });

    const interval = setInterval(() => {
      const v = getCountdown();
      render(v.d, v.h, v.m, v.s);
    }, 1000);

    return () => {
      countUp.kill();
      clearInterval(interval);
    };
  }, []);

  const scrollToContent = () => {
    document.querySelector('#sobre')?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <section
      ref={sectionRef}
      id="hero"
      aria-label="hero"
      className="relative w-full sm:h-screen flex items-center"
      style={{ height: '100vh' }}
    >
      {/* Wrapper de clip para o parallax não vazar */}
      <div className="absolute inset-0 overflow-hidden">
        <div ref={bgRef} className="absolute inset-x-0 w-full" style={{ height: '125%', top: '-12.5%' }}>
          <img
            src={heroSrc}
            alt={`SEMCOMP ${SemcompInfo.EDITION}`}
            loading="eager"
            decoding="async"
            fetchPriority="high"
            sizes="100vw"
            className="w-full h-full object-cover"
          />
        </div>
      </div>
      <div className="absolute inset-0 bg-gradient-to-b from-semcompOffBlack/40 to-semcompOffBlack/80" />

      <div className="relative z-10 w-full h-full flex items-center ml-[5%] sm:ml-[10%]">
        <div className="flex flex-col gap-8 md:gap-12">

          {/* Logo e título */}
          <div className="hero-logo flex items-center gap-6">
            <img src="/img/semcomp/logo_default_branco.webp" alt="Logo da Semcomp" className="h-24 w-24 md:h-42 md:w-42 flex-shrink-0" />
            <div className="flex flex-col justify-center">
              <h1 className="text-5xl md:text-8xl font-comfortaa text-semcompOffWhite leading-tight">
                semcomp
              </h1>
              <p className="text-xl md:text-4xl font-poppins font-bold text-semcompLightBlue/90 tracking-[-0.03em]">
                Edição {SemcompInfo.EDITION}
              </p>
            </div>
          </div>

          {/* Data */}
          <p className="hero-date text-lg md:text-3xl font-poppins text-semcompLightBlue">
            {SemcompInfo.DATES_STRING}
          </p>

          {/* Countdown — GSAP count-up */}
          <div className="hero-countdown flex items-end gap-1 sm:gap-2">
            {[
              { ref: diasEl,     label: 'dias'  },
              { ref: horasEl,    label: 'horas' },
              { ref: minutosEl,  label: 'min'   },
              { ref: segundosEl, label: 'seg'   },
            ].map(({ ref, label }) => (
              <div key={label} className="flex flex-col items-center gap-2">
                <div style={tileStyle}>
                  <span ref={ref}>00</span>
                </div>
                <span className="text-sm font-poppins text-semcompLightBlue/60 tracking-wide">
                  {label}
                </span>
              </div>
            ))}
          </div>

        </div>
      </div>

      {/* Scroll indicator */}
      <div className="hero-scroll absolute bottom-6 left-1/2 -translate-x-1/2 z-10">
        <button
          onClick={scrollToContent}
          className="flex flex-col items-center text-semcompOffWhite hover:text-semcompOffWhite/80 focus:outline-none text-2xl font-light"
        >
          v
        </button>
      </div>
    </section>
  );
}
