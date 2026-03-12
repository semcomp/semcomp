import { motion } from "framer-motion";
import TeamGrid from "@/components/TeamGrid";
import TEAM from "@/lib/constants/Team";
import useWindowDimensions from "@/hooks/useWindowDimensions";
import { useTheme } from "@/contexts/useTheme";

type EquipeSectionProps = {
  className?: string;
}

const EquipeSection = (props: EquipeSectionProps) => {
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
    <section id="equipe" className={`${props.className} ${sectionPadding}`}>
      <motion.h2
        className={`${headingSize} font-extrabold mb-10`}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true }}
        variants={fadeIn}
      >
        <span className={`${textColor} font-extrabold`}>NOSSA</span>{" "}
        <span className={`bg-clip-text text-transparent bg-linear-to-r ${gradientFrom} ${gradientTo} font-extrabold`}>
          EQUIPE
        </span>
      </motion.h2>
      <motion.div
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true }}
        variants={fadeIn}
      >
        <TeamGrid data={TEAM} />
      </motion.div>
    </section>
  );
};

export default EquipeSection;