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

// Essa função necessida dos eventos já ordenados
function agruparEventosCoincidentes(events: EventType[]): EventType[][]{
  if (events.length === 0) return [];

  const resultado: EventType[][] = [];
  let grupoAtual: EventType[] = [];

  // controla até onde o grupo atual vai
  let fimAtual = 0;

  for (const evento of events) {
    const inicio = new Date(evento.dateInit).getTime();
    const fim = new Date(evento.dateEnd).getTime();

    // se o grupo está vazio, começa
    if (grupoAtual.length === 0) {
      grupoAtual.push(evento);
      fimAtual = fim;
      continue;
    }

    // se sobrepõe ao grupo atual
    if (inicio < fimAtual) {
      grupoAtual.push(evento);

      fimAtual = Math.max(fimAtual, fim);
    } 
    // não sobrepõe, fecha grupo e cria outro
    else {
      resultado.push(grupoAtual);
      grupoAtual = [evento];
      fimAtual = fim;
    }
  }

  // adiciona último grupo
  if (grupoAtual.length > 0) {
    resultado.push(grupoAtual);
  }

  return resultado;
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

      // 1. encontrar o evento "especial"
      let eventoEspecial = grupo[0];

      for (const evento of grupo) {
        const inicioAtual = new Date(evento.dateInit).getTime();
        const fimAtual = new Date(evento.dateEnd).getTime();
        const duracaoAtual = fimAtual - inicioAtual;

        const inicioEspecial = new Date(eventoEspecial.dateInit).getTime();
        const fimEspecial = new Date(eventoEspecial.dateEnd).getTime();
        const duracaoEspecial = fimEspecial - inicioEspecial;

        if (
          duracaoAtual > duracaoEspecial ||
          (duracaoAtual === duracaoEspecial && inicioAtual < inicioEspecial)
        ) {
          eventoEspecial = evento;
        }
      }

      // 2. montar o grupo com colunas
      for (const evento of grupo) {
        grupoModificado.push({
          ...evento,
          column: evento === eventoEspecial ? "right" : "left"
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

function EventButton({
  evento,
  onClick,
  cardClasses,
  captionClasses
}: {
  evento: EventWithColumn;
  onClick: () => void;
  cardClasses: string;
  captionClasses: string;
}) {
  return (
    <button
      type="button"
      className={`group w-full rounded-xl border px-4 py-4 text-center transition-all duration-300 hover:-translate-y-0.5 hover:shadow-md h-full ${cardClasses}`}
      onClick={onClick}
    >
      <p className="font-poppins-bold text-base md:text-lg">{evento.name}</p>

      <p className={`mt-1 text-sm ${captionClasses}`}>
        {formatTime(evento.dateInit)} - {formatTime(evento.dateEnd)}
      </p>

      <div className="grid max-h-none grid-rows-[0fr] overflow-hidden opacity-0 transition-all duration-300 group-hover:mt-3 group-hover:grid-rows-[1fr] group-hover:opacity-100">
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
  );
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
          {GrupoEventosProcessados.map((grupo, rowIndex) => {
            const left = grupo.filter(e => e.column === "left");
            const right = grupo.filter(e => e.column === "right");
            const full = grupo.filter(e => e.column === "full");

            return (
              <div key={rowIndex} className="grid gap-3 md:grid-cols-2">

                {full.length > 0 && full.map((evento) => (
                  <div key={evento.name} className="col-span-2">
                    <EventButton
                      evento={evento}
                      onClick={() => setSelected(evento)}
                      cardClasses={cardClasses}
                      captionClasses={captionClasses}
                    />
                  </div>
                ))}

                {full.length === 0 && (
                  <>
                    <div className="flex flex-col gap-3 h-full">
                      {left.map((evento) => (
                        <div className="flex-1">
                          <EventButton
                            key={evento.name}
                            evento={evento}
                            onClick={() => setSelected(evento)}
                            cardClasses={cardClasses}
                            captionClasses={captionClasses}
                          />
                        </div>
                      ))}
                    </div>

                    <div className="flex flex-col gap-3 h-full">
                      {right.map((evento) => (
                        <div className="flex-1">
                          <EventButton
                            key={evento.name}
                            evento={evento}
                            onClick={() => setSelected(evento)}
                            cardClasses={cardClasses}
                            captionClasses={captionClasses}
                          />
                        </div>
                      ))}
                    </div>
                  </>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}