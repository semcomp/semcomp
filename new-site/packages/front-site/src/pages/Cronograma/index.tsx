import {useState} from "react"
import EVENT from "@/lib/constants/SemcompBetaEvents";
import type { EventType } from "@/types/EventType";
import { useTheme } from "@/contexts/useTheme";
import imagemFundo from "./Imagem_fundo.jpg";

export default function CronogramaPage() {

  const [selected, setSelected] = useState<EventType | null>(null);
  const { isDarkMode } = useTheme();

  const pageClasses = isDarkMode
    ? "bg-semcompDarkBlue text-semcompOffWhite"
    : "bg-semcompOffWhite text-semcompDarkBlue";

  const cardClasses = isDarkMode
    ? "border-semcompMidDarkBlue bg-semcompAlmostDarkBlue/75 hover:bg-semcompAlmostDarkBlue"
    : "border-semcompLightBlue bg-white/70 hover:bg-white";

  const captionClasses = isDarkMode ? "text-semcompLightBlue/90" : "text-semcompMidDarkBlue/85";
  const glowPrimaryClass = isDarkMode ? "bg-semcompMidLightBlue/10" : "bg-semcompMidLightBlue/15";
  const glowSecondaryClass = isDarkMode ? "bg-semcompLightBlue/5" : "bg-semcompAlmostDarkBlue/8";

  const rows: EventType[][] = [];
  let i = 0;
  
  // Define se a linha da tabela terá um evento ou mais na mesma linha
  // Provavelmente isso será mudado, dado que os dados atuais tão hardcodados
  while (i < EVENT.length) {
    if (EVENT[i].col === "left" && EVENT[i + 1]?.col === "right") {
      rows.push([EVENT[i], EVENT[i + 1]]);
      i += 2;
    } else {
      rows.push([EVENT[i]]);
      i++;
    }
  }

  // Cores do gradiente baseadas no modo
  const gradientColor = isDarkMode ? "#002D5E" : "#004F7C"; // semcompDarkBlue / semcompOffWhite

  return (
    <section 
      className={`relative min-h-screen w-full overflow-hidden font-poppins ${pageClasses}`}
      style={{
        backgroundImage: `
          linear-gradient(
            to top,
            ${gradientColor} 10%,
            ${gradientColor}00 100%
          ),
          url('${imagemFundo}')
        `,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundAttachment: 'fixed',
      }}
    >
      <div className="pointer-events-none absolute inset-0">
        <div className={`absolute -left-10 top-6 h-100 w-100 rounded-full blur-[110px] ${glowPrimaryClass}`} />
        <div className={`absolute -right-10 bottom-4 h-100 w-100 rounded-full blur-[120px] ${glowSecondaryClass}`} />
      </div>

      <div className="relative z-10 mx-auto max-w-5xl px-4 py-10 md:px-6 md:py-14">
        <header className="mb-8 md:mb-10">
          <h1 className="animate-slide font-poppins-bold text-3xl text-white [animation-duration:900ms] [animation-timing-function:cubic-bezier(0.22,1,0.36,1)] md:text-4xl">
            Cronograma
          </h1>
          <p className="animate-slide [animation-delay:120ms] [animation-duration:900ms] [animation-fill-mode:both] mt-2 text-sm text-white md:text-base">
            Programação completa da Semcomp.
          </p>
        </header>

        {/* Popup */}
        {selected && (
          <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4 backdrop-blur-sm"
            onClick={() => setSelected(null)}
          >
            <div
              className={`w-full max-w-md rounded-2xl border p-6 shadow-2xl ${isDarkMode ? "border-semcompMidDarkBlue bg-semcompAlmostDarkBlue text-semcompOffWhite" : "border-semcompLightBlue bg-white text-semcompDarkBlue"}`}
              onClick={(e) => e.stopPropagation()}
            >
              <h2 className="font-poppins-bold text-xl">{selected.title}</h2>
              {selected.time && (
                <p className={`mt-1 text-sm ${captionClasses}`}>{selected.time}</p>
              )}
              <p className="mt-3 text-sm leading-relaxed md:text-base">
                {selected.description || "Sem descrição."}
              </p>
              <button
                className={`mt-6 inline-flex rounded-lg px-4 py-2 text-sm font-semibold transition-colors ${isDarkMode ? "bg-semcompMidDarkBlue text-semcompOffWhite hover:bg-semcompMidLightBlue" : "bg-semcompMidDarkBlue text-semcompOffWhite hover:bg-semcompAlmostDarkBlue"}`}
                onClick={() => setSelected(null)}
              >
                Fechar
              </button>
            </div>
          </div>
        )}

        <div className="space-y-3">
          {rows.map((row, rowIndex) => (
            <div key={rowIndex} className={`grid gap-3 ${row.length === 2 ? "grid-cols-1 md:grid-cols-2" : "grid-cols-1"}`}>
              {row.map((ev, colIndex) => (
                <button
                  key={`${ev.title}-${colIndex}`}
                  type="button"
                  className={`group w-full rounded-xl border px-4 py-4 text-center transition-all duration-300 hover:-translate-y-0.5 hover:shadow-md ${cardClasses}`}
                  onClick={() => setSelected(ev)}
                >
                  <p className="font-poppins-bold text-base md:text-lg">{ev.title}</p>
                  {ev.time && <p className={`mt-1 text-sm ${captionClasses}`}>{ev.time}</p>}
                  <div className="grid max-h-none grid-rows-[0fr] overflow-hidden opacity-0 transition-all duration-300 group-hover:mt-3 group-hover:max-h-none group-hover:grid-rows-[1fr] group-hover:opacity-100">
                    <div className="overflow-hidden">
                      <div className="flex items-center gap-4">
                        {ev.image && (
                          <div className="w-1/2 flex justify-center items-center h-full">
                            <img 
                              src={ev.image} 
                              alt={ev.title}
                              className="h-full w-auto max-w-xs rounded-lg object-cover"
                            />
                          </div>
                        )}
                        <p className={`text-sm text-justify w-1/2 ml-auto ${captionClasses}`}>
                          {ev.description || "Mais detalhes deste evento."}
                        </p>
                      </div>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}