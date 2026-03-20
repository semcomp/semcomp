import { motion } from "framer-motion";
import useWindowDimensions from "@/hooks/useWindowDimensions";
import { useTheme } from "@/contexts/useTheme";
import { FaLinkedin, FaInstagram } from "react-icons/fa";
import SemcompInfo from "../../../lib/constants/SemcompInfo"
import LogoSemcomp from "../../../assets/img/semcomp/logo_default_branco.png"

type ContatoSectionProps = {
  className?: string;
};

const ContatoSection = ({ className }: ContatoSectionProps) => {
  const { width } = useWindowDimensions();
  const { isDarkMode } = useTheme();

  const textColor = isDarkMode ? "text-semcompOffWhite" : "text-semcompDarkBlue";
  const sectionPadding = width > 768 ? "py-16" : "py-10";
  const headingSize = width > 768 ? "text-3xl" : "text-xl";

  const fadeIn = {
    hidden: { opacity: 0, y: 15 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.6 } },
  };

  return (
    <footer
      id="contato"
      className={`border-t border-white/10 ${sectionPadding} ${className}`}
    >
      <div className="mx-auto max-w-[80%] flex flex-col md:flex-row items-center md:items-start justify-between">

        <div className="text-center md:text-left">
          <motion.h2
            className={`${headingSize} font-extrabold mb-4`}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={fadeIn}
          >
            <span className={`${textColor}`}>TEM ALGUMA DÚVIDA? <br/> FALE CONOSCO</span>
            
          </motion.h2>

          <motion.div
            className={`flex flex-col gap-1 ${textColor}`}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={fadeIn}
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
          viewport={{ once: true }}
          variants={fadeIn}
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
      <div className={`flex pt-10 gap-5 justify-center ${isDarkMode ? "" : "invert-[75%]"}`}>
        <img src={LogoSemcomp} alt="oiii" className="h-18 w-18"/>
      </div>

      <div className="mt-10 text-center text-sm opacity-70">
        © {new Date().getFullYear()} Semcomp — ICMC USP
      </div>
    </footer>
  );
};

export default ContatoSection;