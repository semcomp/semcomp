import { Button, buttonVariants } from "@/components/ui/Button";
import { Mail } from "lucide-react";
import SectionWatermark from "@/components/ui/SectionWatermark";

type PatrocinadoresSectionProps = { className?: string };

export default function TornarPatrocinadorSection({ className }: PatrocinadoresSectionProps) {
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

          <div className="mt-4 gap-1 flex flex-col">
            <div className="gap-3 flex flex-col">
              <div className="w-full">
                <label htmlFor="contactName" />
                <input
                  id="contactName"
                  type="text"
                  placeholder="Seu nome de contato..."
                  className="w-full p-2 bg-white/70 dark:bg-[#0F486D] border-semcompMidLightBlue/50 dark:border-semcompOffWhite border rounded-sm text-semcompDarkBlue dark:text-semcompOffWhite placeholder:text-semcompDarkBlue/45 dark:placeholder:text-semcompOffWhite/45"
                />
              </div>
              <div className="w-full">
                <label htmlFor="contactEmail" />
                <input
                  id="contactEmail"
                  type="text"
                  placeholder="Seu e-mail de contato..."
                  className="w-full p-2 bg-white/70 dark:bg-[#0F486D] border-semcompMidLightBlue/50 dark:border-semcompOffWhite border rounded-sm text-semcompDarkBlue dark:text-semcompOffWhite placeholder:text-semcompDarkBlue/45 dark:placeholder:text-semcompOffWhite/45"
                />
              </div>
              <div className="w-full">
                <label htmlFor="company" />
                <input
                  id="company"
                  type="text"
                  placeholder="Empresa que você representa..."
                  className="w-full p-2 bg-white/70 dark:bg-[#0F486D] border-semcompMidLightBlue/50 dark:border-semcompOffWhite border rounded-sm text-semcompDarkBlue dark:text-semcompOffWhite placeholder:text-semcompDarkBlue/45 dark:placeholder:text-semcompOffWhite/45"
                />
              </div>
              <div className="w-full">
                <label htmlFor="message" />
                <textarea
                  id="message"
                  rows={4}
                  placeholder="Sua mensagem..."
                  className="w-full p-2 bg-white/70 dark:bg-[#0F486D] border-semcompMidLightBlue/50 dark:border-semcompOffWhite border rounded-sm resize-none text-semcompDarkBlue dark:text-semcompOffWhite placeholder:text-semcompDarkBlue/45 dark:placeholder:text-semcompOffWhite/45"
                />
              </div>
            </div>

            <div className="flex justify-between gap-2">
              <Button
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
                className={`
                  ${buttonVariants({ variant: "ghost", size: "lg" })}
                  cursor-pointer font-extrabold flex-1 sm:flex-none sm:w-50 h-12.5 -translate-x-0.5
                  transition-transform duration-200 hover:scale-102
                  bg-semcompMidDarkBlue hover:bg-semcompMidDarkBlue/90 text-semcompOffWhite/90 hover:text-semcompOffWhite/90
                  dark:bg-semcompLightBlue dark:text-semcompDarkBlue dark:hover:bg-semcompOffWhite
                `}
              >
                Enviar Mensagem
              </Button>
            </div>
          </div>
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
