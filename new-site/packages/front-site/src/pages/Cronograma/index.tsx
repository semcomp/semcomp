import { useState, useEffect, useMemo, useCallback, memo, type ReactElement } from "react";
import { eventsAPI } from "@/api/events";
import type { EventType } from "@/types/EventType.ts";
import type { EventWithColumn } from "@/types/EventWithColumn.ts";
import { useTheme } from "@/contexts/useTheme";
import { formatTime } from "@/lib/utils/formatDate";
import imagemFundo from "@/assets/img/backgrounds/schedule.jpg";

/**
 * Agrupa e distribui os eventos em colunas quando há sobreposição de horários.
 * Utiliza uma variação do algoritmo de partição de intervalos (Interval Partitioning).
 * * @param events Lista bruta de eventos vindos do banco de dados.
 * @returns Matriz bidimensional onde cada linha representa um grupo de eventos concorrentes.
 */
const processEvents = (events: EventType[]): EventWithColumn[][] => {
  if (!events || events.length === 0) return [];

  // Ordena os eventos cronologicamente pelo horário de início
  const sorted = [...events].sort((a, b) => 
    new Date(a.dateInit).getTime() - new Date(b.dateInit).getTime()
  );

  const groups: EventType[][] = [];
  let currentGroup: EventType[] = [];
  let currentEnd = 0;

  // Agrupa eventos que colidem no mesmo intervalo de tempo
  for (const event of sorted) {
    const start = new Date(event.dateInit).getTime();
    const end = new Date(event.dateEnd).getTime();

    if (currentGroup.length === 0 || start < currentEnd) {
      // Se o evento inicia antes do término do grupo atual, há colisão
      currentGroup.push(event);
      currentEnd = Math.max(currentEnd, end);
    } else {
      // Se não colide, fecha o grupo atual e inicia um novo
      groups.push(currentGroup);
      currentGroup = [event];
      currentEnd = end;
    }
  }
  if (currentGroup.length > 0) groups.push(currentGroup);

  // Define o posicionamento visual (colunas) de cada evento dentro do seu grupo
  return groups.map((group) => {
    // Evento único no horário ocupa a largura total
    if (group.length === 1) {
      return [{ ...group[0], column: "full" }];
    }
    
    // Dois eventos concorrentes dividem a tela igualmente
    if (group.length === 2) {
      return [
        { ...group[0], column: "left" },
        { ...group[1], column: "right" }
      ];
    }

    // Multiplos eventos
    // Encontra o evento de maior duração para fixá-lo na direita
    const specialEvent = group.reduce((prev, curr) => {
      const prevDuration = new Date(prev.dateEnd).getTime() - new Date(prev.dateInit).getTime();
      const currDuration = new Date(curr.dateEnd).getTime() - new Date(curr.dateInit).getTime();
      
      if (currDuration > prevDuration) return curr;
      if (currDuration === prevDuration && new Date(curr.dateInit).getTime() < new Date(prev.dateInit).getTime()) return curr;
      return prev;
    });

    // Os demais eventos menores são empilhados na coluna da esquerda
    return group.map((evento) => ({
      ...evento,
      column: evento === specialEvent ? "right" : "left"
    }));
  });
};


/**
 * Componente do Card de Evento individual.
 * * Otimização com 'memo': Impede que o botão seja re-renderizado caso o estado
 * pai mude (como a abertura do modal), a menos que as propriedades do próprio evento mudem.
 */
const EventButton = memo(function EventButton({
  evento,
  onClick,
  cardClasses,
  captionClasses,
}: {
  evento: EventWithColumn;
  onClick: (evento: EventWithColumn) => void;
  cardClasses: string;
  captionClasses: string;
}): ReactElement {
  return (
    <button
      type="button"
      className={`group w-full rounded-xl border px-4 py-4 text-center transition-all duration-300 hover:-translate-y-0.5 hover:shadow-md h-full ${cardClasses}`}
      onClick={() => onClick(evento)} // Aciona o callback memorizado
    >
      <p className="font-poppins-bold text-base md:text-lg">{evento.name}</p>
      <p className={`mt-1 text-sm ${captionClasses}`}>
        {formatTime(evento.dateInit)} - {formatTime(evento.dateEnd)}
      </p>

      <div className="grid max-h-none grid-rows-[0fr] overflow-hidden opacity-0 transition-all duration-300 group-hover:mt-3 group-hover:grid-rows-[1fr] group-hover:opacity-100">
        <div className="overflow-hidden">
          <div className="flex flex-col items-center gap-3 text-center">
            {evento.image && (
              <div className="w-full flex justify-center">
                <img
                  src={evento.image}
                  alt={evento.name}
                  loading="lazy" // Otimização: Só carrega a imagem do servidor quando o card aparece em tela
                  className="h-32 w-auto max-w-xs rounded-lg object-cover"
                />
              </div>
            )}
            <p className={`text-sm text-center leading-relaxed break-words ${captionClasses}`}>
              {evento.description || "Mais detalhes deste evento."}
            </p>
          </div>
        </div>
      </div>
    </button>
  );
});

/**
 * Componente do Pop-up (Modal) de detalhes.
 */
function EventModal({
  selected,
  onClose,
  isDarkMode,
  captionClasses,
}: {
  selected: EventWithColumn | null;
  onClose: () => void;
  isDarkMode: boolean;
  captionClasses: string;
}): ReactElement | null {
  // Renderização Condicional: Se não houver evento selecionado, o componente não consome recursos de árvore DOM
  if (!selected) return null;

  const modalClasses = isDarkMode
    ? "border-semcompMidDarkBlue bg-semcompAlmostDarkBlue text-semcompOffWhite"
    : "border-semcompLightBlue bg-white text-semcompDarkBlue";

  const buttonClasses = isDarkMode
    ? "bg-semcompMidDarkBlue text-semcompOffWhite hover:bg-semcompMidLightBlue"
    : "bg-semcompMidDarkBlue text-semcompOffWhite hover:bg-semcompAlmostDarkBlue";

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4 py-4 backdrop-blur-sm"
      onClick={onClose} // Fecha ao clicar no backdrop escuro
    >
      <div
        className={`w-full max-w-md max-h-[90vh] overflow-y-auto rounded-2xl border p-6 shadow-2xl ${modalClasses}`}
        onClick={(e) => e.stopPropagation()} // Impede que o clique dentro do modal bolha e feche ele
      >
        <h2 className="font-poppins-bold text-xl">{selected.name}</h2>
        {formatTime(selected.dateInit) && (
          <p className={`mt-1 text-sm ${captionClasses}`}>{formatTime(selected.dateInit)}</p>
        )}
        <p className="mt-3 text-center text-sm leading-relaxed md:text-base">
          {selected.description || "Sem descrição."}
        </p>
        <button
          className={`mt-6 inline-flex rounded-lg px-4 py-2 text-sm font-semibold transition-colors ${buttonClasses}`}
          onClick={onClose}
        >
          Fechar
        </button>
      </div>
    </div>
  );
}

export default function CronogramaPage(): ReactElement {
  const { isDarkMode } = useTheme();
  
  // Estados locais da aplicação
  const [events, setEvents] = useState<EventType[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedEvent, setSelectedEvent] = useState<EventWithColumn | null>(null);

  // Gerenciamento Dinâmico de Cores
  const bgClasses = isDarkMode ? "bg-semcompDarkBlue" : "bg-semcompOffWhite";
  const textClasses = isDarkMode ? "text-semcompOffWhite" : "text-semcompDarkBlue";
  const cardClasses = isDarkMode ? "border-semcompMidDarkBlue bg-semcompAlmostDarkBlue/75 hover:bg-semcompAlmostDarkBlue" : "border-semcompLightBlue bg-white/70 hover:bg-white";
  const captionClasses = isDarkMode ? "text-semcompLightBlue/90" : "text-semcompMidDarkBlue/85";
  const gradientColor = isDarkMode ? "#002D5E" : "#004F7C";

  // Gradientes radiais puros substituindo os antigos filtros CSS 'blur' (gargalo de GPU corrigido)
  const glowPrimaryClass = isDarkMode ? "from-semcompMidLightBlue/15 to-transparent" : "from-semcompMidLightBlue/20 to-transparent";
  const glowSecondaryClass = isDarkMode ? "from-semcompLightBlue/8 to-transparent" : "from-semcompAlmostDarkBlue/12 to-transparent";

  /**
   * Chamada de API assíncrona ao carregar o componente.
   */
  useEffect(() => {
    const fetchEvents = async () => {
      try {
        setLoading(true);
        // Busca os dados diretamente da sua base de dados real
        const response = await eventsAPI.getAllEvents();
        setEvents(response.events || []);
      } catch (error) {
        console.error("Erro ao buscar eventos do banco de dados:", error);
        setEvents([]);
      } finally {
        setLoading(false);
      }
    };
    fetchEvents();
  }, []);

  /**
   * Otimização com 'useMemo': Evita re-processar o cálculo complexo de colunas e 
   * sobreposições a cada render do componente. Só roda se a array 'events' mudar da API.
   */
  const processedEventGroups = useMemo(() => processEvents(events), [events]);

  /**
   * Otimização com 'useCallback': Guarda a referência em cache da função.
   * Impede que uma nova instância de função seja criada a cada render, mantendo a blindagem do 'React.memo' nos cards.
   */
  const handleSelectEvent = useCallback((evento: EventWithColumn) => {
    setSelectedEvent(evento);
  }, []);

  const handleCloseModal = useCallback(() => {
    setSelectedEvent(null);
  }, []);

  return (
    <section className={`relative min-h-[calc(100vh-70px)] w-full overflow-x-hidden font-poppins isolate ${textClasses}`}>
      
      <div 
        className={`fixed inset-0 z-0 bg-cover bg-center ${bgClasses}`}
        style={{
          backgroundImage: `
            linear-gradient(to top, ${gradientColor} 10%, ${gradientColor}00 100%),
            url('${imagemFundo}')
          `,
        }}
      />

      <div className="pointer-events-none absolute inset-0 z-0 overflow-hidden">
        <div className={`absolute -left-32 top-6 h-[500px] w-[500px] bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] ${glowPrimaryClass}`} />
        <div className={`absolute -right-32 bottom-4 h-[500px] w-[500px] bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] ${glowSecondaryClass}`} />
      </div>

      <div className="relative z-10 mx-auto max-w-5xl px-4 py-10 md:px-6 md:py-14">
        <header className="mb-8 md:mb-10">
          <h1 className="animate-slide font-poppins-bold text-3xl text-white animation-duration-[900ms] [animation-timing-function:cubic-bezier(0.22,1,0.36,1)] md:text-4xl">
            Cronograma
          </h1>
          <p className="animate-slide [animation-delay:120ms] animation-duration-[900ms] fill-mode-[both] mt-2 text-sm text-white md:text-base">
            Programação completa da Semcomp.
          </p>
        </header>

        {/* Modal de Detalhes controlado por estado memorizado */}
        <EventModal
          selected={selectedEvent}
          onClose={handleCloseModal}
          isDarkMode={isDarkMode}
          captionClasses={captionClasses}
        />

        {/* Renderização da Grade de Grade Horária */}
        <div className="space-y-3">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <p className="text-white/70">Carregando eventos...</p>
            </div>
          ) : events.length === 0 ? (
            <div className="flex items-center justify-center py-12">
              <p className="text-white/70">Nenhum evento disponível no momento.</p>
            </div>
          ) : (
            // Percorre a matriz bidimensional de colisões calculada pelo useMemo
            processedEventGroups.map((grupo, rowIndex) => {
              const left = grupo.filter((e) => e.column === "left");
              const right = grupo.filter((e) => e.column === "right");
              const full = grupo.filter((e) => e.column === "full");

              return (
                <div key={`group-${rowIndex}`} className="grid gap-3 md:grid-cols-2">
                  {/* Renderização Condicional baseada nas colunas calculadas */}
                  {full.length > 0 ? (
                    full.map((evento) => (
                      <div key={evento.name} className="col-span-2">
                        <EventButton
                          evento={evento}
                          onClick={handleSelectEvent}
                          cardClasses={cardClasses}
                          captionClasses={captionClasses}
                        />
                      </div>
                    ))
                  ) : (
                    <>
                      {/* Coluna Esquerda */}
                      <div className="flex flex-col gap-3 h-full">
                        {left.map((evento) => (
                          <div key={evento.name} className="flex-1">
                            <EventButton
                              evento={evento}
                              onClick={handleSelectEvent}
                              cardClasses={cardClasses}
                              captionClasses={captionClasses}
                            />
                          </div>
                        ))}
                      </div>
                      
                      {/* Coluna Direita (Eventos simultâneos ou de longa duração) */}
                      <div className="flex flex-col gap-3 h-full">
                        {right.map((evento) => (
                          <div key={evento.name} className="flex-1">
                            <EventButton
                              evento={evento}
                              onClick={handleSelectEvent}
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
            })
          )}
        </div>
      </div>
    </section>
  );
}