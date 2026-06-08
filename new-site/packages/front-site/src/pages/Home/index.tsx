import MainEntrance from "@/components/MainEntrance";
import { useTheme } from "@/contexts/useTheme";
import SobreSection from "@/pages/Home/sections/SobreSection";
import PatrocinadoresSection from "@/pages/Home/sections/PatrocinadoresSection";
import EquipeSection from "@/pages/Home/sections/EquipeSection";
import BarraEventsSection from "@/pages/Home/sections/BarraEventsSection";
import FAQSection from "@/pages/Home/sections/FAQSection";
import TornarPatrocinadorSection from "@/pages/Home/sections/TornarPatrocinadorSection"
import ContatoSection from "@/pages/Home/sections/ContatoSection";
import { SPONSORS } from "@/constants/Sponsors";

export default function HomePage() {
  const { isDarkMode } = useTheme();

  const bgColor = isDarkMode ? "bg-semcompDarkBlue" : "bg-semcompOffWhite";

  const sectionStyles = "mx-auto py-20";
  return (
    <div className={`w-full font-poppins ${bgColor}`}>
      <MainEntrance />
      <main>

        <SobreSection className={`${sectionStyles}`} />

        <div className={`${isDarkMode ? "bg-semcompMidDarkBlue" : "bg-semcompMidDarkBlue"}`}>
        <PatrocinadoresSection className={sectionStyles} sponsors={SPONSORS} />
        </div>

        <EquipeSection className={sectionStyles} />
        
        <BarraEventsSection />

        <div className={`${isDarkMode ? "bg-semcompAlmostDarkBlue" : "bg-semcompLightBlue"}`}>
          <FAQSection className={sectionStyles} />
        </div>
        
        <TornarPatrocinadorSection className={sectionStyles} />
        
        <ContatoSection className="mx-auto py-5"  />
      </main>
    </div>
  );
}
