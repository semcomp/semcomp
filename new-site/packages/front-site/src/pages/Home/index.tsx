import { useEffect, useRef } from "react";
import { gsap } from "@/lib/gsap";
import MainEntrance from "@/components/MainEntrance";
import SobreSection from "@/pages/Home/sections/SobreSection";
import PatrocinadoresSection from "@/pages/Home/sections/PatrocinadoresSection";
import EquipeSection from "@/pages/Home/sections/EquipeSection";
import BarraEventsSection from "@/pages/Home/sections/BarraEventsSection";
import FAQSection from "@/pages/Home/sections/FAQSection";
import TornarPatrocinadorSection from "@/pages/Home/sections/TornarPatrocinadorSection"
import ContatoSection from "@/pages/Home/sections/ContatoSection";
import NumerosSection from "@/pages/Home/sections/NumerosSection";
import PatrocinadoresAntigosSection from "@/pages/Home/sections/PatrocinadoresAntigosSection";
import { SPONSORS } from "@/constants/Sponsors";

export default function HomePage() {
  const pageRef = useRef<HTMLDivElement>(null);

  const sectionStyles = "mx-auto py-20";

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.utils.toArray<HTMLElement>('section:not(#hero)').forEach((el) => {
        gsap.from(el, {
          opacity: 0,
          clipPath: 'inset(4% 0 0 0)',
          duration: 0.85,
          ease: 'power2.out',
          clearProps: 'clipPath,opacity',
          scrollTrigger: {
            trigger: el,
            start: 'top 90%',
            once: true,
          },
        });
      });
    }, pageRef);

    return () => ctx.revert();
  }, []);

  return (
    <div ref={pageRef} className="w-full font-poppins bg-semcompOffWhite dark:bg-semcompDarkBlue">
      <MainEntrance />
      <main>

        <SobreSection className={`${sectionStyles}`} />

        <div className="bg-semcompMidDarkBlue">
          <PatrocinadoresSection className={sectionStyles} sponsors={SPONSORS} />
        </div>

        <EquipeSection className={sectionStyles} />

        <BarraEventsSection />

        <div className="bg-semcompLightBlue dark:bg-semcompAlmostDarkBlue">
          <FAQSection className={sectionStyles} />
        </div>

        <NumerosSection />

        <PatrocinadoresAntigosSection />

        <TornarPatrocinadorSection className={sectionStyles} />

        <ContatoSection className="mx-auto py-5" />
      </main>
    </div>
  );
}
