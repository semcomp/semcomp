import { motion } from "framer-motion";
import useWindowDimensions from "@/hooks/useWindowDimensions";
import { useTheme } from "@/contexts/useTheme";

const ContatoSection = () => {
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
    <section id="contato" className={`${sectionPadding}`}>
      <motion.h2
        className={`${headingSize} font-extrabold mb-6`}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true }}
        variants={fadeIn}
      >
        <span className={`${textColor} font-extrabold`}>ENTRE EM</span>{" "}
        <span className={`bg-clip-text text-transparent bg-linear-to-r ${gradientFrom} ${gradientTo} font-extrabold`}>
          CONTATO
        </span>
      </motion.h2>
      <motion.p
        className={textColor}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true }}
        variants={fadeIn}
      >
        patrocinio_semcomp@icmc.usp.br
      </motion.p>
      <motion.p
        className={textColor}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true }}
        variants={fadeIn}
      >
        semcomp@icmc.usp.br
      </motion.p>
    </section>
  );
};

export default ContatoSection;