import { motion } from "framer-motion";
import { useState, useEffect } from "react";
import SemcompInfo from "../lib/constants/SemcompInfo";
import FotoSemcompMain from "@/assets/img/Home/Hero/Semcomp.avif";
import LogoSemcomp from "../assets/img/semcomp/logo_default_branco.webp";

const _heroModules = import.meta.glob(
  "/src/assets/img/Home/Hero/*",
  { eager: true }
) as Record<string, { default: string }>;
const HERO_IMAGES = Object.values(_heroModules)
  .map((m) => m.default as string)
  .filter((src) => /\.(webp)$/i.test(src));
const pickRandomHero = () =>
  HERO_IMAGES.length ? HERO_IMAGES[Math.floor(Math.random() * HERO_IMAGES.length)] : FotoSemcompMain;

const tileStyle: React.CSSProperties = {
  background: "rgba(19, 45, 71, 0.9)",
  color: "#d6ecff",
  fontFamily: "'Barlow Condensed', sans-serif",
  fontWeight: 900,
  letterSpacing: "0.03em",
  padding: "1.2rem 1.6rem",
  minHeight: "80px", 
  minWidth: "90px",
  textAlign: "center",
  lineHeight: 1,
  clipPath: "polygon(0% 0%, 92% 0%, 100% 100%, 8% 100%)",
  transition: "background 0.18s, color 0.18s",
  fontSize: "clamp(2rem, 4vw, 3.2rem)",
};

export default function MainEntrance() {
  const [heroSrc] = useState<string>(() => pickRandomHero());
  const [dias, setDias] = useState(0);
  const [horas, setHoras] = useState(0);
  const [minutos, setMinutos] = useState(0);
  const [segundos, setSegundos] = useState(0);

  useEffect(() => {
    const target = new Date("2026-10-17T00:00:00");

    const tick = () => {
      const now = new Date();
      const diff = target.getTime() - now.getTime();
      if (diff <= 0) return;
      setDias(Math.floor(diff / (1000 * 60 * 60 * 24)));
      setHoras(Math.floor((diff / (1000 * 60 * 60)) % 24));
      setMinutos(Math.floor((diff / (1000 * 60)) % 60));
      setSegundos(Math.floor((diff / 1000) % 60));
    };

    tick();
    const interval = setInterval(tick, 1000);
    return () => clearInterval(interval);
  }, []);

  const scrollToContent = () => {
    const sobreSection = document.querySelector(`#sobre`);
    if (sobreSection) sobreSection.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <section
      id="hero"
      aria-label="hero"
      className="relative w-full sm:h-screen flex items-center"
      style={{ height: "100vh" }}
    >
      <img
        src={heroSrc}
        alt={`SEMCOMP ${SemcompInfo.EDITION}`}
        loading="eager"
        decoding="async"
        fetchPriority="high"
        sizes="100vw"
        className="absolute inset-0 h-full w-full object-cover"
      />
      <div className="absolute inset-0 bg-semcompOffBlack/60" />

      <div className="relative z-10 w-full h-full px-4 md:px-16 flex items-center max-w-7xl mx-auto">
        <div className="flex flex-col gap-8 md:gap-12">

          {/* Logo e título */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className="flex items-center gap-6"
          >
            <img src={LogoSemcomp} alt="Logo da Semcomp" className="h-24 w-24 md:h-42 md:w-42 flex-shrink-0" />
            <div className="flex flex-col justify-center">
              <h1 className="text-5xl md:text-8xl font-confortaa text-semcompOffWhite leading-tight">
                semcomp
              </h1>
              <p className="text-xl md:text-4xl font-poppins font-bold text-[#D2EDFF]/90 tracking-[-0.03em]">
                Edição {SemcompInfo.EDITION}
              </p>
            </div>
          </motion.div>

          {/* Data */}
          <motion.p
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.8 }}
            className="text-lg md:text-3xl font-poppins text-[#D2EDFF]"
          >
            {SemcompInfo.DATES_STRING}
          </motion.p>

          {/* Contador */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4, duration: 0.8 }}
            className="flex items-end gap-1"
          >
            {[
              { value: dias, label: "dias" },
              { value: horas, label: "horas" },
              { value: minutos, label: "min" },
              { value: segundos, label: "seg" },
            ].map(({ value, label }) => (
              <div key={label} className="flex flex-col items-center gap-2">
                <div
                  style={{
                    ...tileStyle,
                    fontSize: "clamp(2rem, 4vw, 3.7rem)",
                  }}
                >
                  {String(value).padStart(2, "0")}
                </div>
                <span className="text-sm font-poppins text-[#D2EDFF]/60 tracking-wide">
                  {label}
                </span>
              </div>
            ))}
          </motion.div>

        </div>
      </div>

      {/* Scroll indicator */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 1, duration: 0.6 }}
        className="absolute bottom-6 left-1/2 transform -translate-x-1/2 z-10"
      >
        <button
          onClick={scrollToContent}
          className="flex flex-col items-center text-semcompOffWhite hover:text-semcompOffWhite/80 focus:outline-none text-2xl font-light"
        >
          V
        </button>
      </motion.div>
      
    </section>
  );
}