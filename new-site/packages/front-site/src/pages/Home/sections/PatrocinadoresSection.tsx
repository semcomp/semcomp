import { motion } from "framer-motion";
import useWindowDimensions from "@/hooks/useWindowDimensions";
import { useTheme } from "@/contexts/useTheme";
import type { SponsorType } from "@/types/SponsorType";

const PatrocinadoresSection = ({ sponsors }: { sponsors: SponsorType[] }) => {
  const { width } = useWindowDimensions();
  const { isDarkMode } = useTheme();

  const textColor = isDarkMode ? "text-semcompOffWhite" : "text-semcompDarkBlue";
  const bgColor = isDarkMode ? "bg-semcompDarkBlue" : "bg-semcompOffWhite";
  const sectionPadding = width > 768 ? "py-20" : "py-10";
  const headingSize = width > 768 ? "text-4xl" : "text-2xl";
  const gradientFrom = isDarkMode ? "from-semcompLightBlue" : "from-semcompLightBlue";
  const gradientTo = isDarkMode ? "to-semcompOffWhite" : "to-semcompDarkBlue";

  const fadeIn = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.6 } },
  };

  return (
    <section id="patrocinadores" className={`${bgColor} ${sectionPadding}`}>
      <motion.h2
        className={`${headingSize} font-extrabold mb-10`}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true }}
        variants={fadeIn}
      >
        <span className={`${textColor} font-extrabold`}>NOSSOS</span>{" "}
        <span className={`bg-clip-text text-transparent bg-linear-to-r ${gradientFrom} ${gradientTo} font-extrabold`}>
          PATROCINADORES
        </span>
      </motion.h2>
      <div className="flex justify-center gap-10 flex-wrap">
        {sponsors.map((sponsor, index) => (
          <motion.div
            key={index}
            className={`w-40 h-20 ${bgColor} flex items-center justify-center`}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={fadeIn}
          >
            <a href={sponsor.websiteUrl} target="_blank" rel="noopener noreferrer" className="w-full h-full flex items-center justify-center">
            <img src={sponsor.logoSrc} alt={sponsor.name} className="w-full h-full object-contain" /> 
            </a>
          </motion.div>
        ))}
      </div>
    </section>
  );
};

export default PatrocinadoresSection;