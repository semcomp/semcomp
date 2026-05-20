import { motion } from "framer-motion";
import { useState } from "react";
import { useSectionStyles } from "@/hooks/useSectionStyles";
import { ANIMATIONS, ANIMATION_VIEWPORT } from "@/lib/animations";
import type { SponsorType } from "@/types/SponsorType";
import SemcompInfo from "@/lib/constants/SemcompInfo";

type PatrocinadoresProps = {
  sponsors: SponsorType[];
  className?: string;
}

const PatrocinadoresSection = ({ sponsors, className }: PatrocinadoresProps) => {
  type FormStatus = "idle" | "loading" | "success" | "error";
  const [status, setStatus] = useState<FormStatus>("idle");
  
  const { textColor, bgPrimary, formBg, gradientClass, placeholderColor, hoverColor } = useSectionStyles();

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setStatus("loading");
    const form = e.currentTarget;
    const data = {
      name: (form.elements.namedItem("name") as HTMLInputElement).value,
      email: (form.elements.namedItem("email") as HTMLInputElement).value,
      company: (form.elements.namedItem("company") as HTMLInputElement).value,
      message: (form.elements.namedItem("message") as HTMLTextAreaElement).value,
      _subject: "Novo interesse em patrocinar a Semcomp!",
      _replyto: (form.elements.namedItem("email") as HTMLInputElement).value,
      _template: "table",
    };
    try {
      const res = await fetch(`https://formsubmit.co/ajax/${SemcompInfo.ORGANIZING_COMMITTEE_PATROCINIO_EMAIL}`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Accept: "application/json" },
        body: JSON.stringify(data),
      });
      if (res.ok) {
        setStatus("success");
        form.reset();
      } else {
        setStatus("error");
      }
    } catch {
      setStatus("error");
    }
  };

  return (
    <section id="patrocinadores" className="w-full">
      <div className={className}>
        <div className="mx-auto max-w-[80%]">
          <motion.h2
            className="text-2xl md:text-4xl font-extrabold mb-10"
            initial="hidden"
            whileInView="visible"
            viewport={ANIMATION_VIEWPORT}
            variants={ANIMATIONS.fadeIn}
          >
            <span className="text-semcompOffWhite font-extrabold">NOSSOS</span>{" "}
            <span className={`bg-clip-text font-poppins-extrabold text-transparent ${gradientClass} font-extrabold`}>
              PATROCINADORES
            </span>
          </motion.h2>

          <div className="flex justify-center flex-wrap">
            {sponsors.length > 0 ? (
              sponsors.map((sponsor, index) => (
                <motion.div
                  key={index}
                  className={`w-40 h-20 ${bgPrimary} flex items-center justify-center`}
                  initial="hidden"
                  whileInView="visible"
                  viewport={ANIMATION_VIEWPORT}
                  variants={ANIMATIONS.fadeIn}
                >
                  <a href={sponsor.websiteUrl} target="_blank" rel="noopener noreferrer" className="w-full h-full flex items-center justify-center">
                    <img
                      src={sponsor.logoSrc}
                      alt={sponsor.name}
                      loading="lazy"
                      decoding="async"
                      className="w-full h-full object-contain"
                    />
                  </a>
                </motion.div>
              ))
            ) : (
              <div className="sm:w-[95%] xl:w-full pt-10 flex items-center justify-center">
                <div className="relative inline-block max-w-lg">
                  <div className={`absolute -top-3 -left-3 w-[95%] h-[95%] rounded-4xl ${formBg} opacity-40`} />
                  <div className={`absolute -bottom-3 -right-3 w-[95%] h-[95%] rounded-4xl ${formBg} opacity-40`} />
                  <div className={`relative z-10 ${formBg} p-10 rounded-4xl`}>
                    {status === "success" ? (
                      <div className="flex flex-col items-center gap-4 py-8">
                        <p className={`${textColor} font-extrabold text-2xl text-center`}>Mensagem enviada!</p>
                        <p className={`${textColor} text-sm text-center opacity-80`}>Obrigado pelo interesse! Em breve entraremos em contato.</p>
                        <button onClick={() => setStatus("idle")} className={`mt-4 px-6 py-2 ${bgPrimary} ${textColor} rounded-md transition-colors duration-300`}>Enviar outra mensagem</button>
                      </div>
                    ) : (
                      <div>
                        <form onSubmit={handleSubmit} className="flex flex-col items-center gap-4">
                          <p className="font-extrabold text-2xl text-center tracking-wide">
                            <span className={textColor}>Torne-se um patrocinador da </span>
                            <span className={`${textColor} bg-clip-text ${gradientClass}`}>SEMCOMP</span>
                          </p>
                          <p className={`${textColor} text-sm text-center opacity-80 md:text-lg max-md:text-sm mb-2`}>Conecte sua empresa a centenas de estudantes de computação. Preencha e entraremos em contato.</p>
                          <input type="text" name="name" placeholder="Seu nome" required className={`px-4 py-2 border border-gray-400 ${textColor} ${placeholderColor} rounded-md w-[90%] bg-transparent`} />
                          <input type="email" name="email" placeholder="Seu email" required className={`px-4 py-2 border border-gray-400 ${textColor} ${placeholderColor} rounded-md w-[90%] bg-transparent`} />
                          <input type="text" name="company" placeholder="Empresa" required className={`px-4 py-2 border border-gray-400 ${textColor} ${placeholderColor} rounded-md w-[90%] bg-transparent`} />
                          <textarea name="message" placeholder="Sua mensagem" required className={`px-4 py-2 border border-gray-400 rounded-md w-[90%] max-w-sm h-32 ${textColor} ${placeholderColor} bg-transparent`}></textarea>
                          {status === "error" && (
                            <p className="text-red-500 text-sm text-center">Erro ao enviar. Tente novamente.</p>
                          )}
                          <button type="submit" disabled={status === "loading"} className={`px-6 py-2 ${bgPrimary} ${textColor} rounded-md ${hoverColor} transition-all duration-300 hover:scale-105 disabled:opacity-50`}>
                            {status === "loading" ? "Enviando..." : "Enviar"}
                          </button>
                        </form>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
};

export default PatrocinadoresSection;