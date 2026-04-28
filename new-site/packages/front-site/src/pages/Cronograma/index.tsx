import {useState} from "react"
import { mockEvents } from "@/mock/mockEvents.tsx";
import type { EventType } from "@/types/EventType.ts"
import type { EventWithColumn } from "@/types/EventWithColumn.ts";
import { useTheme } from "@/contexts/useTheme";
import { formatTime } from "@/lib/utils/formatDate";
import imagemFundo from "@/assets/img/backgrounds/schedule.jpg";

function ordenarEventosPorData(events: EventType[]): EventType[]{
  const EventsCopy = [...events];
  
  EventsCopy.sort((a, b) => {
    return new Date(a.dateInit).getTime() - new Date(b.dateInit).getTime();
  });

  return EventsCopy;
}

function agruparEventosCoincidentes(events: EventType[]): EventType[][]{
  const dicionario: Record<number, EventType[]> = {};

  for(const outroEvento of events){ // para cada evento de events...
    const key = new Date(outroEvento.dateInit).getTime();

    if(dicionario[key]){ // se o dicionario já haver o horário de "outroEvento"...

      //Então adiciona este evento a lista de eventos DESTE HORÁRIO
      dicionario[key].push(outroEvento); 

    }else{
      //Senão, cria mais uma linha no dicionário
      dicionario[key] = [outroEvento];
    }
  }

  return Object.values(dicionario);
}

function definirColuna(events: EventType[]): EventWithColumn[][]{
  const grupos: EventType[][] = agruparEventosCoincidentes(events);
  const resultado: EventWithColumn[][] = [];

  for(const grupo of grupos){
    if (grupo.length === 1) {
      const grupoModificado: EventWithColumn[] = [
        {
          ...grupo[0],
          column: "full"
        }
      ];
      resultado.push(grupoModificado);

    }else if(grupo.length === 2){
      const grupoModificado: EventWithColumn[] = [
        {
          ...grupo[0],
          column: "left"
        },
        {
          ...grupo[1],
          column: "right"
        }
      ];

      resultado.push(grupoModificado);
    }else{
      const grupoModificado: EventWithColumn[] = [];

      for (const evento of grupo) {
        grupoModificado.push({
          ...evento,
          column: "full"
        });
      }
      resultado.push(grupoModificado);
    }
  }

  return resultado;
}

function processarEventos(events: EventType[]): EventWithColumn[][]{
    const ordenados = ordenarEventosPorData(events);
    const grupoEventosComColuna = definirColuna(ordenados);

    return grupoEventosComColuna;
}

export default function CronogramaPage() {

  const [selected, setSelected] = useState<EventWithColumn | null>(null);
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

  const GrupoEventosProcessados: EventWithColumn[][] = processarEventos(mockEvents.events);

  const gridCols: Record<number, string> = {
    1: "grid-cols-1",
    2: "grid-cols-1 md:grid-cols-2",
    3: "grid-cols-1 md:grid-cols-3",
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
              <h2 className="font-poppins-bold text-xl">{selected.name}</h2>
              {formatTime(selected.dateInit) && (
                <p className={`mt-1 text-sm ${captionClasses}`}>{formatTime(selected.dateInit)}</p>
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
          {GrupoEventosProcessados.map((grupo, rowIndex) => (
            <div key={rowIndex} className={`grid gap-3 ${gridCols[grupo.length] ?? "grid-cols-1"}`}>
              {grupo.map((evento, colIndex) => (
                <button
                  key={`${evento.name}-${colIndex}`}
                  type="button"
                  className={`group w-full rounded-xl border px-4 py-4 text-center transition-all duration-300 hover:-translate-y-0.5 hover:shadow-md ${cardClasses}`}
                  onClick={() => setSelected(evento)}
                >
                  <p className="font-poppins-bold text-base md:text-lg">{evento.name}</p>
                  {formatTime(evento.dateInit) && <p className={`mt-1 text-sm ${captionClasses}`}>{formatTime(evento.dateInit)}</p>}
                  <div className="grid max-h-none grid-rows-[0fr] overflow-hidden opacity-0 transition-all duration-300 group-hover:mt-3 group-hover:max-h-none group-hover:grid-rows-[1fr] group-hover:opacity-100">
                    <div className="overflow-hidden">
                      <div className="flex items-center gap-4">
                        {evento.image && (
                          <div className="w-1/2 flex justify-center items-center h-full">
                            <img 
                              src={evento.image} 
                              alt={evento.name}
                              className="h-full w-auto max-w-xs rounded-lg object-cover"
                            />
                          </div>
                        )}
                        <p className={`text-sm text-justify w-1/2 ml-auto ${captionClasses}`}>
                          {evento.description || "Mais detalhes deste evento."}
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