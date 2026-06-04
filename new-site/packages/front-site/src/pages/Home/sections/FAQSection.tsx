import { motion } from "framer-motion";
import FAQList from "@/components/FAQList";
import FAQS from "@/lib/constants/FAQS";
import useWindowDimensions from "@/hooks/useWindowDimensions";
import { useTheme } from "@/contexts/useTheme";
import LogoSemcomp from "@/assets/img/semcomp/logo_default_preto.png";

type FAQSectionProps = {
  className?: string;
}

const FAQSection = (props: FAQSectionProps) => {
  const { width } = useWindowDimensions();
  const { isDarkMode } = useTheme();

  const textColor = isDarkMode ? "text-semcompOffWhite" : "text-semcompDarkBlue";
  const sectionPadding = width > 768 ? "py-30" : "py-10";
  const headingSize = width > 768 ? "text-4xl" : "text-2xl";
  const gradientFrom = isDarkMode ? "from-semcompLightBlue/80" : "from-semcompDarkBlue/80";
  const gradientVia  = isDarkMode ? "via-semcompLightBlue" : "via-semcompDarkBlue";
  const gradientTo = isDarkMode ? "to-semcompOffWhite" : "to-semcompOffBlack";

  const fadeIn = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.6 } },
  };

  return (
    <section id="faq" className={`${props.className} ${sectionPadding} relative overflow-hidden`}>
      <img
        src={LogoSemcomp}
        alt="Logo Semcomp"
        className="absolute w-200 h-200 pointer-events-none opacity-10 z-0 right-0 top-0 translate-x-1/2 -translate-y-1/2 rotate-220"
      />

      <img
        src={LogoSemcomp}
        alt="Logo Semcomp"
        className="absolute w-200 h-200 pointer-events-none opacity-10 z-0 left-0 bottom-0 -translate-x-1/2 translate-y-1/2 rotate-220"
      />

      <div className="mx-auto max-w-[80%]">
        
        <motion.h2
          className={`${headingSize} font-extrabold mb-10 text-center z-20 relative`}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          variants={fadeIn}
        >
          <span className={`${textColor} font-extrabold`}>PERGUNTAS</span>{" "}
          <span className={`bg-clip-text text-transparent bg-linear-to-r ${gradientFrom} ${gradientVia} ${gradientTo} font-extrabold`}>
            FREQUENTES
          </span>
        </motion.h2>

        <motion.div
          className="z-20 relative"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          variants={fadeIn}
        >
          <FAQList faqs={FAQS} />
        </motion.div>
      </div>
    </section>
  );
};

export default FAQSection;