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
  const color = isDarkMode ? "semcompOffWhite" : "semcompMidLightBlue";
  const sectionPadding = width > 768 ? "py-20" : "py-10";
  const headingSize = width > 768 ? "text-4xl" : "text-2xl";
  const gradientFrom = isDarkMode ? "from-semcompLightBlue/80" : "from-semcompDarkBlue/80";
  const gradientVia  = isDarkMode ? "via-semcompLightBlue" : "via-semcompDarkBlue";
  const gradientTo = isDarkMode ? "to-semcompOffWhite" : "to-semcompOffBlack";
  
  const fadeIn = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.6 } },
  };

  return (
    <section id="equipe" className={`${props.className} ${sectionPadding}`}>
      <div className="mx-auto max-w-[80%]">

      <motion.h2
        className={`${headingSize} font-extrabold mb-7 text-center`}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true }}
        variants={fadeIn}
      >
        <span className={`${textColor} font-extrabold`}>Conheça nossa</span>{" "}
        <span className={`bg-clip-text text-transparent bg-linear-to-r ${gradientFrom} ${gradientVia} ${gradientTo} font-extrabold`}>
          Equipe
        </span>
      </motion.h2>

      <p className="opacity-70 text-justify mb-5">A edição da SEMCOMP deste ano é construída com o esforço e dedicação de aproximadamente X membros, organizados em 8 frentes distintas, além da presidência.</p>
      <hr className={`w-full border border-${color} mb-7`} />

      <motion.div
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true }}
        variants={fadeIn}
      >
        <TeamGrid data={TEAM} />
      </motion.div>
      </div>
    </section>
  );
};

export default EquipeSection;