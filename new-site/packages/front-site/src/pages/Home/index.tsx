import MainEntrance from "@/components/MainEntrance";
import SobreSection from "@/pages/Home/sections/SobreSection";
import PatrocinadoresSection from "@/pages/Home/sections/PatrocinadoresSection";
import EquipeSection from "@/pages/Home/sections/EquipeSection";
import FAQSection from "@/pages/Home/sections/FAQSection";
import ContatoSection from "@/pages/Home/sections/ContatoSection";
import { SPONSORS } from "@/constants/Sponsors";
import { useSectionStyles } from "@/hooks/useSectionStyles";

export default function HomePage() {
  const { bgPrimary, bgSecondary, bgTertiary } = useSectionStyles();

  const sectionStyles = "mx-auto py-20";
  return (
    <div className={`w-full font-poppins ${bgPrimary}`}>
      <MainEntrance />
      <main>

        <SobreSection className={`${sectionStyles}`} />

        <div className={bgSecondary}>
          <PatrocinadoresSection className={sectionStyles} sponsors={SPONSORS} />
        </div>

        <EquipeSection className={sectionStyles} />

        <div className={bgTertiary}>
          <FAQSection className={sectionStyles} />
        </div>
        
        <ContatoSection className="mx-auto py-5"  />
      </main>
    </div>
  );
}
