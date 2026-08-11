import { useState, useEffect } from "react";
import SEMCOMPInfo from "../lib/constants/SEMCOMPInfo";

const HERO_IMAGES = [
  "/img/Home/Hero/Banner1.webp",
  "/img/Home/Hero/Banner2.webp",
  "/img/Home/Hero/Palestra1.webp",
  "/img/Home/Hero/Palestra2.webp",
  "/img/Home/Hero/Semcomp.webp",
];
const pickRandomHero = () => HERO_IMAGES[Math.floor(Math.random() * HERO_IMAGES.length)];

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

const pad = (n: number) => String(n).padStart(2, '0');

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
  fontSize: "clamp(1.5rem, 3vw, 2rem)",
};

export default function MainEntrance() {
  const [heroSrc] = useState<string>(() => pickRandomHero());
  const [countdown, setCountdown] = useState(getCountdown);

  useEffect(() => {
    const interval = setInterval(() => setCountdown(getCountdown()), 1000);
    return () => clearInterval(interval);
  }, []);

  const scrollToContent = () => {
    document.querySelector('#sobre')?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <section
      id="hero"
      aria-label="hero"
      className="relative w-full sm:h-screen flex items-center"
      style={{ height: '100vh' }}
    >
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute inset-x-0 w-full h-full">
          <img
            src={heroSrc}
            alt={`SEMCOMP ${SEMCOMPInfo.EDITION}`}
            loading="eager"
            decoding="async"
            fetchPriority="high"
            sizes="100vw"
            className="w-full h-full object-cover"
          />
        </div>
      </div>
      <div className="absolute inset-0 bg-gradient-to-b from-semcompOffBlack/40 to-semcompOffBlack/80" />

      <div className="relative z-10 w-full h-full flex items-center pl-[5%] sm:pl-[10%]">
        <div className="flex flex-col gap-8 md:gap-12">

          <div className="flex items-center gap-6">
            <img src="/img/semcomp/logo_default_branco.webp" alt="Logo da SEMCOMP" className="h-24 w-24 md:h-42 md:w-42 flex-shrink-0 object-contain" />
            <div className="flex flex-col justify-center">
              <h1 className="text-4xl sm:text-5xl md:text-8xl font-comfortaa text-semcompOffWhite leading-tight">
                semcomp
              </h1>
              <p className="text-lg sm:text-xl md:text-4xl font-poppins font-bold text-semcompLightBlue/90 tracking-[-0.03em]">
                Edição {SEMCOMPInfo.EDITION}
              </p>
            </div>
          </div>

          <p className="text-base sm:text-lg md:text-3xl font-poppins text-semcompLightBlue">
            {SEMCOMPInfo.DATES_STRING}
          </p>

          <div className="flex items-end gap-1 sm:gap-2">
            {[
              { value: countdown.d, label: 'dias'  },
              { value: countdown.h, label: 'horas' },
              { value: countdown.m, label: 'min'   },
              { value: countdown.s, label: 'seg'   },
            ].map(({ value, label }) => (
              <div key={label} className="flex flex-col items-center gap-2">
                <div style={tileStyle}>
                  <span>{pad(value)}</span>
                </div>
                <span className="text-sm font-poppins text-semcompLightBlue/60 tracking-wide">
                  {label}
                </span>
              </div>
            ))}
          </div>

        </div>
      </div>

      <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-10">
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
