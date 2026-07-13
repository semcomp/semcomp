import LogoLoop from '@/components/ui/LogoLoop';
import SectionWatermark from '@/components/ui/SectionWatermark';
import { useTheme } from '@/contexts/useTheme';
import { PREVIOUS_SPONSORS } from '@/lib/constants/previousSponsors';

const mid   = Math.ceil(PREVIOUS_SPONSORS.length / 2);
const ROW_1 = PREVIOUS_SPONSORS.slice(0, mid);
const ROW_2 = PREVIOUS_SPONSORS.slice(mid);

export default function PatrocinadoresAntigosSection() {
  const { isDarkMode } = useTheme();
  const fadeOutColor = isDarkMode ? "#0B2639" : "#357BA3";

  return (
    <section className="bg-semcompMidLightBlue dark:bg-semcompDarkBlue relative overflow-hidden py-24">
      <SectionWatermark
        src="/img/decorative/lines_curved.png"
        className="w-[60vw] md:w-100 right-2/3 bottom-1/3 sobre-watermark-light
          mix-blend-multiply opacity-12 dark:mix-blend-screen dark:opacity-5"
      />

      <div className="relative z-10">
        <div className="section-container-wide text-center px-4 mb-12">
          <p className="section-eyebrow">Edições 2012 – 2025</p>
          <h2 className="text-3xl md:text-4xl font-extrabold font-poppins text-semcompDarkBlue dark:text-semcompOffWhite">
            Quem já confiou na{' '}
            <span className="bg-clip-text text-transparent bg-linear-to-r from-semcompDarkBlue to-semcompMidDarkBlue dark:from-semcompMidLightBlue dark:to-semcompLightBlue">
              SEMCOMP
            </span>
          </h2>
        </div>

        <div className="section-divider mb-12" />

        <div className="flex flex-col gap-6">
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
            ariaLabel="Patrocinadores anteriores da SEMCOMP — grupo 1"
          />
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
            ariaLabel="Patrocinadores anteriores da SEMCOMP — grupo 2"
          />
        </div>

        <p className="text-center mt-12 text-sm text-semcompDarkBlue/85 dark:text-semcompOffWhite/55 font-poppins px-4">
          {PREVIOUS_SPONSORS.length}+ parceiros distintos ao longo de uma década de SEMCOMP.
        </p>
      </div>
    </section>
  );
}
