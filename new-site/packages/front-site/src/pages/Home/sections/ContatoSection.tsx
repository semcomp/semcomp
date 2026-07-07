import { useEffect, useRef } from "react";
import { gsap } from "@/lib/gsap";
import { Linkedin, Instagram } from "lucide-react";
import SemcompInfo from "../../../lib/constants/SemcompInfo";
import SectionWatermark from "@/components/ui/SectionWatermark";

type ContatoSectionProps = {
  className?: string;
};

const ContatoSection = ({ className }: ContatoSectionProps) => {
  const sectionRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.from('.contato-heading', {
        opacity: 0,
        y: 28,
        duration: 0.7,
        ease: 'power3.out',
        scrollTrigger: { trigger: '.contato-heading', start: 'top 88%' },
      });

      gsap.from('.contato-email', {
        opacity: 0,
        x: -24,
        duration: 0.5,
        stagger: 0.1,
        ease: 'power2.out',
        scrollTrigger: { trigger: '.contato-emails', start: 'top 88%' },
      });

      gsap.from('.contato-social', {
        opacity: 0,
        scale: 0.4,
        y: 16,
        duration: 0.6,
        stagger: 0.12,
        ease: 'back.out(2)',
        scrollTrigger: { trigger: '.contato-socials', start: 'top 88%' },
      });

      gsap.from('.contato-logo', {
        opacity: 0,
        scale: 0.65,
        rotation: -8,
        duration: 0.85,
        ease: 'back.out(1.5)',
        scrollTrigger: { trigger: '.contato-logo', start: 'top 92%' },
      });

      gsap.from('.contato-footer', {
        opacity: 0,
        y: 12,
        duration: 0.5,
        stagger: 0.1,
        ease: 'power2.out',
        scrollTrigger: { trigger: '.contato-footer', start: 'top 95%' },
      });
    }, sectionRef);

    return () => ctx.revert();
  }, []);

  return (
    <footer
      ref={sectionRef}
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
          <h2 className="contato-heading text-xl md:text-3xl font-extrabold mb-4">
            <span className="text-semcompDarkBlue dark:text-semcompOffWhite">
              TEM ALGUMA DÚVIDA? <br /> FALE CONOSCO
            </span>
          </h2>

          <div className="contato-emails flex flex-col gap-1 text-semcompDarkBlue dark:text-semcompOffWhite">
            <a
              href={`mailto:${SemcompInfo.ORGANIZING_COMMITTEE_EMAIL}`}
              className="contato-email hover:underline"
            >
              {SemcompInfo.ORGANIZING_COMMITTEE_EMAIL}
            </a>
            <a
              href={`mailto:${SemcompInfo.ORGANIZING_COMMITTEE_PATROCINIO_EMAIL}`}
              className="contato-email hover:underline"
            >
              {SemcompInfo.ORGANIZING_COMMITTEE_PATROCINIO_EMAIL}
            </a>
          </div>
        </div>

        <div className="contato-socials flex gap-3 pt-10">
          <a
            href={SemcompInfo.ORGANIZING_COMMITTEE_INSTAGRAM_LINK}
            target="_blank"
            rel="noopener noreferrer"
            className="contato-social text-semcompDarkBlue dark:text-semcompOffWhite hover:scale-110 transition"
          >
            <Instagram size={36} />
          </a>
          <a
            href={SemcompInfo.ORGANIZING_COMMITTEE_LINKEDIN_LINK}
            target="_blank"
            rel="noopener noreferrer"
            className="contato-social text-semcompDarkBlue dark:text-semcompOffWhite hover:scale-110 transition"
          >
            <Linkedin size={36} />
          </a>
        </div>
      </div>

      <div className="flex pt-10 gap-5 justify-center dark:invert-0 invert-75">
        <img
          src="/img/semcomp/logo_default_branco.webp"
          alt="Logo da Semcomp"
          loading="lazy"
          decoding="async"
          className="contato-logo h-18 w-18"
        />
      </div>

      <div className="contato-footer mt-10 text-center text-sm opacity-70">
        © {new Date().getFullYear()} Semcomp — ICMC USP — Feito com 🤍 por{" "}
        <a
          href="https://codelab.icmc.usp.br/"
          className="no-underline hover:underline text-[#488578] dark:text-[#5fccad]"
        >
          USPCodelab Sanca
        </a>
      </div>

      <div className="contato-footer mt-10 text-center text-lg">
        <a href="https://forms.gle/T5JvoDKjABkEBGyXA" className="no-underline hover:underline">
          Avalie nosso site!
        </a>
      </div>
    </footer>
  );
};

export default ContatoSection;
