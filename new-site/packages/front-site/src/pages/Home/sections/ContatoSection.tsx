import { Linkedin, Instagram } from "lucide-react";
import SEMCOMPInfo from "../../../lib/constants/SEMCOMPInfo";
import SectionWatermark from "@/components/ui/SectionWatermark";

type ContatoSectionProps = { className?: string };

const ContatoSection = ({ className }: ContatoSectionProps) => (
  <footer
    id="contato"
    className={`border-t border-white/10 py-10 md:py-16 relative overflow-hidden ${className}`}
  >
    <SectionWatermark
      src="/img/decorative/lines_circled.png"
      className="w-full top-0 left-0 -translate-y-1/3 opacity-[0.06]"
      style={{ mixBlendMode: 'multiply' }}
    />
    <div className="section-container flex flex-col md:flex-row items-center md:items-start justify-between">
      <div className="text-center md:text-left">
        <h2 className="text-xl md:text-3xl font-extrabold mb-4">
          <span className="text-semcompDarkBlue dark:text-semcompOffWhite">
            TEM ALGUMA DÚVIDA? <br /> FALE CONOSCO
          </span>
        </h2>
        <div className="flex flex-col gap-1 text-semcompDarkBlue dark:text-semcompOffWhite">
          <a href={`mailto:${SEMCOMPInfo.ORGANIZING_COMMITTEE_EMAIL}`} className="hover:underline">
            {SEMCOMPInfo.ORGANIZING_COMMITTEE_EMAIL}
          </a>
          <a href={`mailto:${SEMCOMPInfo.ORGANIZING_COMMITTEE_PATROCINIO_EMAIL}`} className="hover:underline">
            {SEMCOMPInfo.ORGANIZING_COMMITTEE_PATROCINIO_EMAIL}
          </a>
        </div>
      </div>

      <div className="flex gap-3 pt-10">
        <a
          href={SEMCOMPInfo.ORGANIZING_COMMITTEE_INSTAGRAM_LINK}
          target="_blank"
          rel="noopener noreferrer"
          className="text-semcompDarkBlue dark:text-semcompOffWhite hover:scale-110 transition"
        >
          <Instagram size={36} />
        </a>
        <a
          href={SEMCOMPInfo.ORGANIZING_COMMITTEE_LINKEDIN_LINK}
          target="_blank"
          rel="noopener noreferrer"
          className="text-semcompDarkBlue dark:text-semcompOffWhite hover:scale-110 transition"
        >
          <Linkedin size={36} />
        </a>
      </div>
    </div>

    <div className="flex pt-10 gap-5 justify-center dark:invert-0 invert-75">
      <img
        src="/img/semcomp/logo_default_branco.webp"
        alt="Logo da SEMCOMP"
        loading="lazy"
        decoding="async"
        className="h-18 w-18"
      />
    </div>

    <div className="mt-10 text-center text-sm opacity-70">
      © {new Date().getFullYear()} SEMCOMP — ICMC USP — Feito com 🤍 por{" "}
      <a href="https://codelab.icmc.usp.br/" className="no-underline hover:underline text-[#488578] dark:text-[#5fccad]">
        USPCodelab Sanca
      </a>
    </div>

    <div className="mt-10 text-center text-lg">
      <a href="https://forms.gle/T5JvoDKjABkEBGyXA" className="no-underline hover:underline">
        Avalie nosso site!
      </a>
    </div>
  </footer>
);

export default ContatoSection;
