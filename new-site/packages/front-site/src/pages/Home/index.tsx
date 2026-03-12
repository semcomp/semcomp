import MainEntrance from "@/components/MainEntrance";
import { useTheme } from "@/contexts/useTheme";
import SobreSection from "@/pages/Home/sections/SobreSection";
import PatrocinadoresSection from "@/pages/Home/sections/PatrocinadoresSection";
import EquipeSection from "@/pages/Home/sections/EquipeSection";
import FAQSection from "@/pages/Home/sections/FAQSection";
import ContatoSection from "@/pages/Home/sections/ContatoSection";
import { SPONSORS } from "@/constants/Sponsors";

export default function HomePage() {
  const { isDarkMode } = useTheme();

  const bgColor = isDarkMode ? "bg-semcompDarkBlue" : "bg-semcompOffWhite";

  const sectionStyles = "mx-auto py-30";
  return (
    <div className={`w-full font-poppins ${bgColor}`}>
      <MainEntrance />
      <main>

        <SobreSection className={`${sectionStyles}`} />

        <div className={`${isDarkMode ? "bg-semcompOffWhite/40" : "bg-semcompDarkBlue/40"}`}>
        <PatrocinadoresSection className={sectionStyles} sponsors={SPONSORS} />
        </div>

        <EquipeSection className={sectionStyles} />

        <div className={`${isDarkMode ? "bg-semcompOffWhite/40" : "bg-semcompDarkBlue/40"}`}>
        <FAQSection className={sectionStyles} />
        </div>
        
        <ContatoSection className={sectionStyles}  />
      </main>
    </div>
  );
}
