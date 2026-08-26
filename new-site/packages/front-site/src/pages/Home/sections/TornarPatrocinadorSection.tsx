import { useState, useRef } from "react";
import { Button, buttonVariants } from "@/components/ui/Button";
import { Mail } from "lucide-react";
import SectionWatermark from "@/components/ui/SectionWatermark";
import SEMCOMPInfo from "@/lib/constants/SEMCOMPInfo";

type PatrocinadoresSectionProps = { className?: string };

type FormStatus = "idle" | "loading" | "success" | "error";

export default function TornarPatrocinadorSection({ className }: PatrocinadoresSectionProps) {
  const [status, setStatus] = useState<FormStatus>("idle");
  const formRef = useRef<HTMLFormElement>(null);

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
      const res = await fetch(
        `https://formsubmit.co/ajax/${SEMCOMPInfo.ORGANIZING_COMMITTEE_PATROCINIO_EMAIL}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json", Accept: "application/json" },
          body: JSON.stringify(data),
        }
      );
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

  const handleClear = () => {
    formRef.current?.reset();
    setStatus("idle");
  };

  return (
    <section className={`bg-semcompLightBlue dark:bg-semcompMidDarkBlue relative overflow-hidden ${className}`}>
      <SectionWatermark
        src="/img/decorative/lines.png"
        className="w-[60vw] md:w-100 right-5 md:right-20 bottom-4 sobre-watermark-light
          mix-blend-multiply opacity-15 dark:mix-blend-screen dark:opacity-10"
      />

      <div className="flex flex-col lg:flex-row justify-between max-w-[90%] sm:max-w-[80%] mx-auto gap-10">
        <div className="w-full lg:w-[35%]">
          <h1 className="text-2xl sm:text-4xl font-extrabold mb-5 text-left z-20 relative text-semcompDarkBlue dark:text-semcompOffWhite">
            Torne-se um patrocinador da SEMCOMP XXIX
          </h1>

          <div className="w-full">
            <div className="flex gap-5 items-center mb-2">
              <Mail className="h-5 w-5 text-semcompDarkBlue dark:text-semcompOffWhite" />
              <h3 className="text-semcompDarkBlue dark:text-semcompOffWhite text-sm sm:text-[18px]">Preencha e entraremos em contato!</h3>
            </div>
            <hr className="border border-semcompMidLightBlue/50 dark:border-semcompOffWhite" />
          </div>

          {status === "success" ? (
            <div className="mt-4 flex flex-col items-center gap-4 py-8">
              <p className="text-semcompDarkBlue dark:text-semcompOffWhite font-extrabold text-xl text-center">Mensagem enviada!</p>
              <p className="text-semcompDarkBlue dark:text-semcompOffWhite text-sm text-center opacity-80">
                Obrigado pelo interesse! Em breve entraremos em contato.
              </p>
              <Button
                onClick={() => setStatus("idle")}
                className={`
                  ${buttonVariants({ variant: "ghost", size: "lg" })}
                  cursor-pointer mt-2
                  bg-semcompDarkBlue/90 text-semcompOffWhite hover:bg-semcompDarkBlue hover:text-semcompOffWhite/90
                  dark:bg-semcompAlmostDarkBlue dark:text-semcompLightBlue dark:hover:bg-semcompDarkBlue dark:hover:text-semcompOffWhite
                `}
              >
                Enviar outra mensagem
              </Button>
            </div>
          ) : (
            <form ref={formRef} onSubmit={handleSubmit} className="mt-4 gap-1 flex flex-col">
              <div className="gap-3 flex flex-col">
                <div className="w-full">
                  <label htmlFor="contactName" />
                  <input
                    id="contactName"
                    name="name"
                    type="text"
                    placeholder="Seu nome de contato..."
                    required
                    className="w-full p-2 bg-white/70 dark:bg-[#0F486D] border-semcompMidLightBlue/50 dark:border-semcompOffWhite border rounded-sm text-semcompDarkBlue dark:text-semcompOffWhite placeholder:text-semcompDarkBlue/45 dark:placeholder:text-semcompOffWhite/45"
                  />
                </div>
                <div className="w-full">
                  <label htmlFor="contactEmail" />
                  <input
                    id="contactEmail"
                    name="email"
                    type="email"
                    placeholder="Seu e-mail de contato..."
                    required
                    className="w-full p-2 bg-white/70 dark:bg-[#0F486D] border-semcompMidLightBlue/50 dark:border-semcompOffWhite border rounded-sm text-semcompDarkBlue dark:text-semcompOffWhite placeholder:text-semcompDarkBlue/45 dark:placeholder:text-semcompOffWhite/45"
                  />
                </div>
                <div className="w-full">
                  <label htmlFor="company" />
                  <input
                    id="company"
                    name="company"
                    type="text"
                    placeholder="Empresa que você representa..."
                    required
                    className="w-full p-2 bg-white/70 dark:bg-[#0F486D] border-semcompMidLightBlue/50 dark:border-semcompOffWhite border rounded-sm text-semcompDarkBlue dark:text-semcompOffWhite placeholder:text-semcompDarkBlue/45 dark:placeholder:text-semcompOffWhite/45"
                  />
                </div>
                <div className="w-full">
                  <label htmlFor="message" />
                  <textarea
                    id="message"
                    name="message"
                    rows={4}
                    placeholder="Sua mensagem..."
                    required
                    className="w-full p-2 bg-white/70 dark:bg-[#0F486D] border-semcompMidLightBlue/50 dark:border-semcompOffWhite border rounded-sm resize-none text-semcompDarkBlue dark:text-semcompOffWhite placeholder:text-semcompDarkBlue/45 dark:placeholder:text-semcompOffWhite/45"
                  />
                </div>
              </div>

              {status === "error" && (
                <p className="text-red-500 text-sm">Erro ao enviar. Tente novamente.</p>
              )}

              <div className="flex justify-between gap-2">
                <Button
                  type="button"
                  onClick={handleClear}
                  className={`
                    ${buttonVariants({ variant: "ghost", size: "lg" })}
                    cursor-pointer flex-1 sm:flex-none sm:w-32.5 h-12.5 -translate-x-0.5
                    transition-transform duration-200 hover:scale-102
                    bg-semcompDarkBlue/90 text-semcompOffWhite hover:bg-semcompDarkBlue hover:text-semcompOffWhite/90
                    dark:bg-semcompAlmostDarkBlue dark:text-semcompLightBlue dark:hover:bg-semcompDarkBlue dark:hover:text-semcompOffWhite
                  `}
                >
                  Limpar
                </Button>
                <Button
                  type="submit"
                  disabled={status === "loading"}
                  className={`
                    ${buttonVariants({ variant: "ghost", size: "lg" })}
                    cursor-pointer font-extrabold flex-1 sm:flex-none sm:w-50 h-12.5 -translate-x-0.5
                    transition-transform duration-200 hover:scale-102
                    bg-semcompMidDarkBlue hover:bg-semcompMidDarkBlue/90 text-semcompOffWhite/90 hover:text-semcompOffWhite/90
                    dark:bg-semcompLightBlue dark:text-semcompDarkBlue dark:hover:bg-semcompOffWhite
                    disabled:opacity-50
                  `}
                >
                  {status === "loading" ? "Enviando..." : "Enviar Mensagem"}
                </Button>
              </div>
            </form>
          )}
        </div>

        <div className="hidden lg:flex w-full lg:w-[50%] relative items-center justify-end">
          <p className="absolute max-w-112.5 text-right bottom-12.5 right-0 p-4 bg-semcompMidDarkBlue dark:bg-semcompMidLightBlue text-semcompLightBlue font-bold rounded-2xl z-10">
            Conecte sua empresa a centenas de<br />estudantes de computação.
          </p>
          <div className="flex w-full">
            <img src="/img/Home/TornesePatrocinador/nome.png" alt="" className="w-full" />
          </div>
        </div>
      </div>
    </section>
  );
}
