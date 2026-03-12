import { motion } from "framer-motion";
import FAQList from "@/components/FAQList";
import FAQS from "@/lib/constants/FAQS";
import useWindowDimensions from "@/hooks/useWindowDimensions";
import { useTheme } from "@/contexts/useTheme";

type FAQSectionProps = {
  className?: string;
}

const FAQSection = (props: FAQSectionProps) => {
  const { width } = useWindowDimensions();
  const { isDarkMode } = useTheme();

  const textColor = isDarkMode ? "text-semcompOffWhite" : "text-semcompDarkBlue";
  const sectionPadding = width > 768 ? "py-20" : "py-10";
  const headingSize = width > 768 ? "text-4xl" : "text-2xl";
  const gradientFrom = isDarkMode ? "from-semcompLightBlue" : "from-semcompLightBlue";
  const gradientTo = isDarkMode ? "to-semcompOffWhite" : "to-semcompDarkBlue";

  const fadeIn = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.6 } },
  };

  return (
    <section id="faq" className={`${props.className} ${sectionPadding}`}>
      <div className="mx-auto max-w-[80%]">
      <motion.h2
        className={`${headingSize} font-extrabold mb-10`}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true }}
        variants={fadeIn}
      >
        <span className={`${textColor} font-extrabold`}>PERGUNTAS</span>{" "}
        <span className={`bg-clip-text text-transparent bg-linear-to-r ${gradientFrom} ${gradientTo} font-extrabold`}>
          FREQUENTES
        </span>
      </motion.h2>
      <motion.div
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