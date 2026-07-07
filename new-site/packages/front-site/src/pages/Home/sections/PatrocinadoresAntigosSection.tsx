import { useEffect, useRef } from 'react';
import { gsap } from '@/lib/gsap';
import LogoLoop from '@/components/ui/LogoLoop';
import SectionWatermark from '@/components/ui/SectionWatermark';
import { useTheme } from '@/contexts/useTheme';
import { PREVIOUS_SPONSORS } from '@/lib/constants/previousSponsors';

const mid  = Math.ceil(PREVIOUS_SPONSORS.length / 2);
const ROW_1 = PREVIOUS_SPONSORS.slice(0, mid);
const ROW_2 = PREVIOUS_SPONSORS.slice(mid);

export default function PatrocinadoresAntigosSection() {
  const sectionRef = useRef<HTMLElement>(null);
  const { isDarkMode } = useTheme();

  const fadeOutColor = isDarkMode ? "#003050" : "#D2EDFF";

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.from('.pastsp-heading', {
        opacity: 0,
        y: 40,
        duration: 0.9,
        ease: 'power3.out',
        scrollTrigger: { trigger: '.pastsp-heading', start: 'top 85%' },
      });

      gsap.from('.pastsp-divider', {
        scaleX: 0,
        duration: 0.9,
        ease: 'power3.out',
        transformOrigin: 'center',
        scrollTrigger: { trigger: '.pastsp-divider', start: 'top 90%' },
      });

      gsap.from('.pastsp-row', {
        opacity: 0,
        y: 30,
        duration: 0.7,
        ease: 'power2.out',
        stagger: 0.15,
        scrollTrigger: { trigger: '.pastsp-rows', start: 'top 85%' },
      });

      gsap.from('.pastsp-footer', {
        opacity: 0,
        y: 16,
        duration: 0.6,
        ease: 'power2.out',
        scrollTrigger: { trigger: '.pastsp-footer', start: 'top 92%' },
      });
    }, sectionRef);

    return () => ctx.revert();
  }, []);

  return (
    <section
      ref={sectionRef}
      className="bg-semcompLightBlue dark:bg-semcompAlmostDarkBlue relative overflow-hidden py-24"
    >
      <SectionWatermark
        src="/img/decorative/lines.png"
        className="w-full md:w-[65vw] top-1/2 -translate-y-1/2 right-0 translate-x-1/4 dark:hidden"
        style={{ mixBlendMode: 'multiply', opacity: 0.45 }}
      />
      <SectionWatermark
        src="/img/decorative/lines.png"
        className="w-full md:w-[65vw] top-1/2 -translate-y-1/2 right-0 translate-x-1/4 hidden dark:block"
        style={{ mixBlendMode: 'screen', opacity: 0.14 }}
      />

      <div className="relative z-10">
        <div className="pastsp-heading section-container-wide text-center px-4 mb-12">
          <p className="section-eyebrow">
            Edições 2012 – 2025
          </p>
          <h2 className="text-3xl md:text-4xl font-extrabold font-poppins text-semcompDarkBlue dark:text-semcompOffWhite">
            Quem já confiou na{' '}
            <span className="bg-clip-text text-transparent bg-linear-to-r from-semcompDarkBlue to-semcompMidDarkBlue dark:from-semcompMidLightBlue dark:to-semcompLightBlue">
              Semcomp
            </span>
          </h2>
        </div>

        <div className="pastsp-divider section-divider mb-12" />

        <div className="pastsp-rows flex flex-col gap-6">
          <div className="pastsp-row">
            <LogoLoop
              logos={ROW_1}
              direction="left"
              speed={55}
              logoHeight={72}
              logoWidth={160}
              gap={64}
              hoverSpeed={0}
              fadeOut
              fadeOutColor={fadeOutColor}
              isDarkMode={isDarkMode}
              ariaLabel="Patrocinadores anteriores da Semcomp — grupo 1"
            />
          </div>
          <div className="pastsp-row">
            <LogoLoop
              logos={ROW_2}
              direction="right"
              speed={45}
              logoHeight={72}
              logoWidth={160}
              gap={64}
              hoverSpeed={0}
              fadeOut
              fadeOutColor={fadeOutColor}
              isDarkMode={isDarkMode}
              ariaLabel="Patrocinadores anteriores da Semcomp — grupo 2"
            />
          </div>
        </div>

        <p className="pastsp-footer text-center mt-12 text-sm text-semcompDarkBlue/45 dark:text-semcompOffWhite/35 font-poppins px-4">
          {PREVIOUS_SPONSORS.length}+ parceiros ao longo de mais de uma década de Semcomp.
        </p>
      </div>
    </section>
  );
}
