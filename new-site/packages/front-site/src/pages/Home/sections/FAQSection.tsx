import { motion } from "framer-motion";
import FAQList from "@/components/FAQList";
import FAQS from "@/lib/constants/FAQS";
import { useSectionStyles } from "@/hooks/useSectionStyles";
import { ANIMATIONS, ANIMATION_VIEWPORT } from "@/lib/animations";

type FAQSectionProps = {
  className?: string;
}

const FAQSection = (props: FAQSectionProps) => {
  const { textColor, gradientClass } = useSectionStyles();
  return (
    <section id="faq" className={`${props.className} py-10 md:py-20`}>
      <div className="mx-auto max-w-[80%]">
        <motion.h2
          className={`text-2xl md:text-4xl font-extrabold mb-10`}
          initial="hidden"
          whileInView="visible"
          viewport={ANIMATION_VIEWPORT}
          variants={ANIMATIONS.fadeIn}
        >
          <span className={`${textColor} font-extrabold`}>PERGUNTAS</span>{" "}
          <span className={`bg-clip-text text-transparent ${gradientClass}`}>
            FREQUENTES
          </span>
        </motion.h2>
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={ANIMATION_VIEWPORT}
          variants={ANIMATIONS.fadeIn}
        >
          <FAQList faqs={FAQS} />
        </motion.div>
      </div>
    </section>
  );
};

export default FAQSection;