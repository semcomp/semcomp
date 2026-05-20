import { motion } from "framer-motion";
import TeamGrid from "@/components/TeamGrid";
import TEAM from "@/lib/constants/Team";
import { useSectionStyles } from "@/hooks/useSectionStyles";
import { ANIMATIONS, ANIMATION_VIEWPORT } from "@/lib/animations";

type EquipeSectionProps = {
  className?: string;
}

const EquipeSection = (props: EquipeSectionProps) => {
  const { textColor, gradientClass } = useSectionStyles();
  return (
    <section id="equipe" className={`${props.className} py-10 md:py-20`}>
      <div className="mx-auto max-w-[80%]">
        <motion.h2
          className={`text-2xl md:text-4xl font-extrabold mb-10`}
          initial="hidden"
          whileInView="visible"
          viewport={ANIMATION_VIEWPORT}
          variants={ANIMATIONS.fadeIn}
        >
          <span className={`${textColor} font-extrabold`}>NOSSA</span>{" "}
          <span className={`bg-clip-text text-transparent ${gradientClass} font-extrabold`}>
            EQUIPE
          </span>
        </motion.h2>
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={ANIMATION_VIEWPORT}
          variants={ANIMATIONS.fadeIn}
        >
          <TeamGrid data={TEAM} />
        </motion.div>
      </div>
    </section>
  );
};

export default EquipeSection;