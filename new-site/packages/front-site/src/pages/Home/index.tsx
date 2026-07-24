import { lazy, Suspense } from "react";
import MainEntrance from "@/components/MainEntrance";
import SobreSection from "@/pages/Home/sections/SobreSection";
import PatrocinadoresSection from "@/pages/Home/sections/PatrocinadoresSection";

const EquipeSection             = lazy(() => import("@/pages/Home/sections/EquipeSection"));
const BarraEventsSection        = lazy(() => import("@/pages/Home/sections/BarraEventsSection"));
const FAQSection                = lazy(() => import("@/pages/Home/sections/FAQSection"));
const TornarPatrocinadorSection = lazy(() => import("@/pages/Home/sections/TornarPatrocinadorSection"));
const ContatoSection            = lazy(() => import("@/pages/Home/sections/ContatoSection"));
const NumerosSection            = lazy(() => import("@/pages/Home/sections/NumerosSection"));
const PatrocinadoresAntigosSection = lazy(() => import("@/pages/Home/sections/PatrocinadoresAntigosSection"));

export default function HomePage() {
  const sectionStyles = "mx-auto py-20";

  return (
    <div className="w-full font-poppins bg-semcompOffWhite dark:bg-semcompDarkBlue">
      <MainEntrance />
      <main>

        <SobreSection className={`${sectionStyles}`} />

        <div className="bg-semcompMidDarkBlue">
          <PatrocinadoresSection />
        </div>

        <Suspense>
          <EquipeSection className={sectionStyles} />
        </Suspense>

        <Suspense>
          <BarraEventsSection />
        </Suspense>

        <div className="bg-semcompLightBlue dark:bg-semcompAlmostDarkBlue">
          <Suspense>
            <FAQSection className={sectionStyles} />
          </Suspense>
        </div>

        <Suspense>
          <NumerosSection />
        </Suspense>

        <Suspense>
          <PatrocinadoresAntigosSection />
        </Suspense>

        <Suspense>
          <TornarPatrocinadorSection className={sectionStyles} />
        </Suspense>

        <Suspense>
          <ContatoSection className="mx-auto py-5" />
        </Suspense>
      </main>
    </div>
  );
}
