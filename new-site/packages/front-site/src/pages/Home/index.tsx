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

  return (
    <div className={`w-full font-sans-custom ${bgColor}`}>
      <MainEntrance />
      <main
        className={`mx-auto px-6`}
      >
        <SobreSection />
        {SPONSORS.length > 0 && <PatrocinadoresSection sponsors={SPONSORS} />}
        <EquipeSection />
        <FAQSection />
        <ContatoSection />
      </main>
    </div>
  );
}
