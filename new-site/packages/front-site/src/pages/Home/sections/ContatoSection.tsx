import { motion } from "framer-motion";
import { useSectionStyles } from "@/hooks/useSectionStyles";
import { ANIMATIONS, ANIMATION_VIEWPORT } from "@/lib/animations";
import { FaLinkedin, FaInstagram } from "react-icons/fa";
import SemcompInfo from "../../../lib/constants/SemcompInfo"
import LogoSemcomp from "../../../assets/img/semcomp/logo_default_branco.webp"

type ContatoSectionProps = {
  className?: string;
};

const ContatoSection = ({ className }: ContatoSectionProps) => {
  const { textColor, isDarkMode } = useSectionStyles();

  return (
    <footer
      id="contato"
      className={`border-t border-white/10 py-10 md:py-16 ${className}`}
    >
      <div className="mx-auto max-w-[80%] flex flex-col md:flex-row items-center md:items-start justify-between">

        <div className="text-center md:text-left">
          <motion.h2
            className="text-xl md:text-3xl font-extrabold mb-4"
            initial="hidden"
            whileInView="visible"
            viewport={ANIMATION_VIEWPORT}
            variants={ANIMATIONS.softFadeIn}
          >
            <span className={`${textColor}`}>TEM ALGUMA DÚVIDA? <br/> FALE CONOSCO</span>
          </motion.h2>

          <motion.div
            className={`flex flex-col gap-1 ${textColor}`}
            initial="hidden"
            whileInView="visible"
            viewport={ANIMATION_VIEWPORT}
            variants={ANIMATIONS.softFadeIn}
          >
            <a
              href={`mailto:${SemcompInfo.ORGANIZING_COMMITTEE_EMAIL}`}
              className="hover:underline"
            >
              {SemcompInfo.ORGANIZING_COMMITTEE_EMAIL}
            </a>

            <a
              href={`mailto:${SemcompInfo.ORGANIZING_COMMITTEE_PATROCINIO_EMAIL}`}
              className="hover:underline"
            >
              {SemcompInfo.ORGANIZING_COMMITTEE_PATROCINIO_EMAIL}
            </a>
          </motion.div>
        </div>

        <motion.div
          className="flex gap-3 pt-10"
          initial="hidden"
          whileInView="visible"
          viewport={ANIMATION_VIEWPORT}
          variants={ANIMATIONS.softFadeIn}
        >
          <a
            href={SemcompInfo.ORGANIZING_COMMITTEE_INSTAGRAM_LINK}
            target="_blank"
            rel="noopener noreferrer"
            className={`${textColor} hover:scale-110 transition`}
          >
            <FaInstagram size={36} />
          </a>

          <a
            href={SemcompInfo.ORGANIZING_COMMITTEE_LINKEDIN_LINK}
            target="_blank"
            rel="noopener noreferrer"
            className={`${textColor} hover:scale-110 transition`}
          >
            <FaLinkedin size={36} />
          </a>
        </motion.div>
      </div>
      <div className={`flex pt-10 gap-5 justify-center ${isDarkMode ? "" : "invert-75"}`}>
        <img
          src={LogoSemcomp}
          alt="Logo da Semcomp"
          loading="lazy"
          decoding="async"
          className="h-18 w-18"
        />
      </div>

      <div className="mt-10 text-center text-sm opacity-70">
        © {new Date().getFullYear()} Semcomp — ICMC USP — Feito com {isDarkMode ? "🤍": "💙"} por <a href="https://codelab.icmc.usp.br/" className={`no-underline hover:underline hover:decoration ${isDarkMode ? "text-[#5fccad]" : "text-[#488578]"}`}>USPCodelab Sanca</a>  
      </div>
    </footer>
  );
};

export default ContatoSection;