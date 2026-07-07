import { useEffect, useRef } from 'react';
import { gsap } from '@/lib/gsap';
import { Button, buttonVariants } from "@/components/ui/Button";
import iconMessage from "@/assets/img/Home/Icons/iconMessage.svg";
import SectionWatermark from "@/components/ui/SectionWatermark";
import { useTheme } from '@/contexts/useTheme';
import { PREVIOUS_SPONSORS } from '@/lib/constants/previousSponsors';

const RAIN_LOGOS = PREVIOUS_SPONSORS;

const IMPACT_PHRASES = [
  "Mais de 30 empresas parceiras.",
  "Mais de uma década de história.",
  "Sua empresa pode ser a próxima.",
];

type PatrocinadoresSectionProps = {
  className?: string;
};

export default function TornarPatrocinadorSection({ className }: PatrocinadoresSectionProps) {
  const sectionRef  = useRef<HTMLElement>(null);
  const overlayRef  = useRef<HTMLDivElement>(null);
  const formRef     = useRef<HTMLDivElement>(null);
  const { isDarkMode } = useTheme();

  useEffect(() => {
    const ctx = gsap.context(() => {
      const sectionH = sectionRef.current?.clientHeight ?? 700;

      gsap.set(formRef.current,  { opacity: 0, y: 28 });
      gsap.set('.tsp-logo',   { y: -110, opacity: 0 });
      gsap.set('.tsp-phrase', { opacity: 0, y: 32 });

      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: sectionRef.current,
          start: 'top 62%',
          once: true,
        },
      });

      tl.to('.tsp-logo', {
        y: sectionH + 110,
        rotation: () => gsap.utils.random(-18, 18),
        opacity: (_i: number) => [0.45, 0.62, 0.38, 0.55, 0.42, 0.58][_i % 6],
        duration: () => gsap.utils.random(0.85, 1.55),
        stagger: { amount: 1.0, from: 'random' },
        ease: 'power1.in',
      });

      tl.to('.tsp-phrase', {
        opacity: 1,
        y: 0,
        duration: 0.52,
        stagger: 0.48,
        ease: 'power3.out',
      }, 0.18);

      tl.to({}, { duration: 0.55 });

      tl.to('.tsp-phrase', {
        opacity: 0,
        y: -24,
        duration: 0.38,
        stagger: 0.07,
        ease: 'power2.in',
      });

      tl.to(overlayRef.current, {
        opacity: 0,
        duration: 0.65,
        ease: 'power2.inOut',
      });

      tl.to(formRef.current, {
        opacity: 1,
        y: 0,
        duration: 0.68,
        ease: 'power3.out',
      }, '-=0.45');

    }, sectionRef);

    return () => ctx.revert();
  }, []);

  return (
    <section
      ref={sectionRef}
      className={`bg-semcompLightBlue dark:bg-semcompMidDarkBlue relative overflow-hidden ${className}`}
    >
      <SectionWatermark
        src="/img/decorative/lines_circled.png"
        className="w-full bottom-0 left-0 translate-y-1/3 dark:hidden"
        style={{ mixBlendMode: 'multiply', opacity: 0.4 }}
      />
      <SectionWatermark
        src="/img/decorative/lines_circled.png"
        className="w-full bottom-0 left-0 translate-y-1/3 hidden dark:block"
        style={{ mixBlendMode: 'screen', opacity: 0.1 }}
      />

      {/* ── Animation overlay ────────────────────────────────────────────────── */}
      <div
        ref={overlayRef}
        aria-hidden="true"
        className="absolute inset-0 z-20 pointer-events-none"
      >
        <div className="absolute inset-0 overflow-hidden">
          {RAIN_LOGOS.map((logo, i) => (
            <img
              key={logo.alt}
              src={logo.src}
              alt=""
              className="tsp-logo absolute object-contain select-none"
              style={{
                left: `${(i / RAIN_LOGOS.length) * 93 + 3}%`,
                top: 0,
                width: `${52 + (i % 5) * 16}px`,
                filter: isDarkMode ? 'brightness(0) invert(1)' : 'brightness(0) opacity(0.25)',
                opacity: 0,
              }}
            />
          ))}
        </div>

        <div className="relative z-10 flex flex-col items-center justify-center h-full px-6 gap-4">
          {IMPACT_PHRASES.map((phrase, i) => (
            <p
              key={phrase}
              className="tsp-phrase font-poppins font-extrabold text-center leading-tight"
              style={{ fontSize: 'clamp(1.5rem, 3.8vw, 3.2rem)', opacity: 0 }}
            >
              {i === IMPACT_PHRASES.length - 1 ? (
                <span className="bg-clip-text text-transparent bg-linear-to-r from-semcompMidDarkBlue to-semcompDarkBlue dark:from-semcompMidLightBlue dark:to-semcompLightBlue">
                  {phrase}
                </span>
              ) : (
                <span className="text-semcompDarkBlue dark:text-semcompOffWhite">{phrase}</span>
              )}
            </p>
          ))}
        </div>
      </div>

      {/* ── Form (revealed after animation) ─────────────────────────────────── */}
      <div
        ref={formRef}
        className="flex flex-col lg:flex-row justify-between max-w-[90%] sm:max-w-[80%] mx-auto gap-10"
        style={{ opacity: 0 }}
      >
        {/* Left: contact form */}
        <div className="w-full lg:w-[35%]">
          <h1 className="text-2xl sm:text-4xl font-extrabold mb-5 text-left z-20 relative text-semcompDarkBlue dark:text-semcompOffWhite">
            Torne-se um patrocinador da SEMCOMP XXIX
          </h1>

          <div className="w-full">
            <div className="flex gap-5 items-center mb-2">
              <img src={iconMessage} alt="ícone de envio de contato" className="h-5 dark:invert" />
              <h3 className="text-semcompDarkBlue dark:text-semcompOffWhite text-sm sm:text-[18px]">Preencha e entraremos em contato!</h3>
            </div>
            <hr className="border border-semcompMidLightBlue/50 dark:border-semcompOffWhite" />
          </div>

          <div className="mt-4 gap-1 flex flex-col">
            <div className="gap-3 flex flex-col">
              <div className="w-full">
                <label htmlFor="contactName" />
                <input
                  id="contactName"
                  type="text"
                  placeholder="Seu nome de contato..."
                  className="w-full p-2 bg-white/70 dark:bg-[#0F486D] border-semcompMidLightBlue/50 dark:border-semcompOffWhite border rounded-sm text-semcompDarkBlue dark:text-semcompOffWhite placeholder:text-semcompDarkBlue/45 dark:placeholder:text-semcompOffWhite/45"
                />
              </div>
              <div className="w-full">
                <label htmlFor="contactEmail" />
                <input
                  id="contactEmail"
                  type="text"
                  placeholder="Seu e-mail de contato..."
                  className="w-full p-2 bg-white/70 dark:bg-[#0F486D] border-semcompMidLightBlue/50 dark:border-semcompOffWhite border rounded-sm text-semcompDarkBlue dark:text-semcompOffWhite placeholder:text-semcompDarkBlue/45 dark:placeholder:text-semcompOffWhite/45"
                />
              </div>
              <div className="w-full">
                <label htmlFor="company" />
                <input
                  id="company"
                  type="text"
                  placeholder="Empresa que você representa..."
                  className="w-full p-2 bg-white/70 dark:bg-[#0F486D] border-semcompMidLightBlue/50 dark:border-semcompOffWhite border rounded-sm text-semcompDarkBlue dark:text-semcompOffWhite placeholder:text-semcompDarkBlue/45 dark:placeholder:text-semcompOffWhite/45"
                />
              </div>
              <div className="w-full">
                <label htmlFor="message" />
                <textarea
                  id="message"
                  rows={4}
                  placeholder="Sua mensagem..."
                  className="w-full p-2 bg-white/70 dark:bg-[#0F486D] border-semcompMidLightBlue/50 dark:border-semcompOffWhite border rounded-sm resize-none text-semcompDarkBlue dark:text-semcompOffWhite placeholder:text-semcompDarkBlue/45 dark:placeholder:text-semcompOffWhite/45"
                />
              </div>
            </div>

            <div className="flex justify-between gap-2">
              <Button
                className={`
                  ${buttonVariants({ variant: "ghost", size: "lg" })}
                  cursor-pointer bg-semcompMidLightBlue/20 dark:bg-[#003050] text-semcompDarkBlue dark:text-semcompOffWhite flex-1 sm:flex-none sm:w-32.5 h-12.5 -translate-x-0.5
                `}
              >
                Limpar
              </Button>

              <Button
                className={`
                  ${buttonVariants({ variant: "ghost", size: "lg" })}
                  cursor-pointer bg-semcompDarkBlue dark:bg-semcompOffWhite text-semcompOffWhite dark:text-semcompMidDarkBlue font-extrabold flex-1 sm:flex-none sm:w-50 h-12.5
                `}
              >
                Enviar Mensagem
              </Button>
            </div>
          </div>
        </div>

        {/* Right: decorative image */}
        <div className="hidden lg:flex w-full lg:w-[50%] relative items-center justify-end">
          <p className="absolute max-w-112.5 text-right bottom-12.5 right-0 p-4 bg-semcompMidDarkBlue dark:bg-semcompMidLightBlue text-semcompLightBlue font-bold rounded-2xl z-10">
            Conecte sua empresa a centenas de<br />estudantes de computação.
          </p>
          <div className="flex w-full">
            <img
              src="/img/Home/TornesePatrocinador/nome.png"
              alt=""
              className="w-full"
            />
          </div>
        </div>
      </div>
    </section>
  );
}
