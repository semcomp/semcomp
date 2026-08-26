import { useState, useEffect, useMemo, useCallback, memo, type ReactElement } from "react";
import { eventsAPI } from "@/api/events";
import type { EventType } from "@/types/EventType.ts";
import type { EventWithColumn } from "@/types/EventWithColumn.ts";
import { useTheme } from "@/contexts/useTheme";
import { formatTime } from "@/lib/utils/formatDate";
import SEMCOMPInfo from "@/lib/constants/SEMCOMPInfo";

const SEMCOMP_YEAR = SEMCOMPInfo.YEAR;

// Range do evento (ex.: "2026-10-17 09:10:00") → mês e dias do cronograma
const SEMCOMP_MONTH = Number(SEMCOMPInfo.START_DATE.slice(5, 7));
const EVENT_DAYS_START = Number(SEMCOMPInfo.START_DATE.slice(8, 10));
const EVENT_DAYS_END = Number(SEMCOMPInfo.END_DATE.slice(8, 10));

const EVENT_DAYS = Array.from(
  { length: EVENT_DAYS_END - EVENT_DAYS_START + 1 },
  (_, index) => EVENT_DAYS_START + index
);

type DayOption = {
  day: number;
  label: string;
  weekday: string;
  isToday: boolean;
  isPast: boolean;
};

const buildDayOptions = (): DayOption[] => {
  const today = new Date();
  const todayUTC = Date.UTC(today.getFullYear(), today.getMonth(), today.getDate());

  return EVENT_DAYS.map((day) => {
    const date = new Date(Date.UTC(SEMCOMP_YEAR, SEMCOMP_MONTH - 1, day));
    const dayUTC = Date.UTC(SEMCOMP_YEAR, SEMCOMP_MONTH - 1, day);
    const weekday = date
      .toLocaleDateString("pt-BR", { weekday: "short", timeZone: "UTC" })
      .replace(".", "")
      .toUpperCase();

    return {
      day,
      label: `${String(day).padStart(2, "0")}/${String(SEMCOMP_MONTH).padStart(2, "0")}`,
      weekday,
      isToday: dayUTC === todayUTC,
      isPast: dayUTC < todayUTC,
    };
  });
};

const dayOptions = buildDayOptions();

const getDayOption = (day: number): DayOption => dayOptions[day - EVENT_DAYS_START];

/**
 * Agrupa e distribui os eventos em colunas quando há sobreposição de horários.
 * Utiliza uma variação do algoritmo de partição de intervalos (Interval Partitioning).
 */
const processEvents = (events: EventType[]): EventWithColumn[][] => {
  if (!events || events.length === 0) return [];

  const sorted = [...events].sort(
    (a, b) =>
      new Date(a.dateInit).getTime() - new Date(b.dateInit).getTime()
  );

  const groups: EventType[][] = [];
  let currentGroup: EventType[] = [];
  let currentEnd = 0;

  for (const event of sorted) {
    const start = new Date(event.dateInit).getTime();
    const end = new Date(event.dateEnd).getTime();

    if (currentGroup.length === 0 || start < currentEnd) {
      currentGroup.push(event);
      currentEnd = Math.max(currentEnd, end);
    } else {
      groups.push(currentGroup);
      currentGroup = [event];
      currentEnd = end;
    }
  }
  if (currentGroup.length > 0) groups.push(currentGroup);

  return groups.map((group) => {
    if (group.length === 1) {
      return [{ ...group[0], column: "full" }];
    }

    const orderedGroup = [...group].sort((a, b) => {
      const durationA =
        new Date(a.dateEnd).getTime() - new Date(a.dateInit).getTime();

      const durationB =
        new Date(b.dateEnd).getTime() - new Date(b.dateInit).getTime();

      return durationA - durationB;
    });

    return orderedGroup.map((event, index) => {
      let column: 1 | 2 | 3;

      if (orderedGroup.length === 2) {
        column = index === 0 ? 1 : 2;
      } else if (index === orderedGroup.length - 1) {
        column = 3;
      } else if (index === orderedGroup.length - 2) {
        column = 2;
      } else {
        column = 1;
      }

      return {
        ...event,
        column,
      };
    });
  });
};

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
      onClick={() => onClick(evento)}
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
                  loading="lazy"
                  className="h-32 w-auto max-w-xs rounded-lg object-cover"
                />
              </div>
            )}
            <p className={`text-sm text-center leading-relaxed wrap-break-word ${captionClasses}`}>
              {evento.description || "Mais detalhes deste evento."}
            </p>
          </div>
        </div>
      </div>
    </button>
  );
});

function EventModal({
  selected,
  onClose,
  captionClasses,
}: {
  selected: EventWithColumn | null;
  onClose: () => void;
  captionClasses: string;
}): ReactElement | null {
  if (!selected) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4 py-4 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="w-full max-w-md max-h-[90vh] overflow-y-auto custom-scrollbar rounded-2xl border p-6 shadow-2xl border-semcompLightBlue bg-white text-semcompDarkBlue dark:border-semcompMidDarkBlue dark:bg-semcompAlmostDarkBlue dark:text-semcompOffWhite"
        onClick={(e) => e.stopPropagation()}
      >
        <h2 className="font-poppins-bold text-xl">{selected.name}</h2>
        {formatTime(selected.dateInit) && (
          <p className={`mt-1 text-sm ${captionClasses}`}>{formatTime(selected.dateInit)}</p>
        )}
        <p className="mt-3 text-center text-sm leading-relaxed md:text-base">
          {selected.description || "Sem descrição."}
        </p>
        <button
          className="mt-6 inline-flex rounded-lg px-4 py-2 text-sm font-semibold transition-colors bg-semcompMidDarkBlue text-semcompOffWhite hover:bg-semcompAlmostDarkBlue dark:hover:bg-semcompMidLightBlue"
          onClick={onClose}
        >
          Fechar
        </button>
      </div>
    </div>
  );
}

const DayPill = memo(function DayPill({
  option,
  active,
  variant,
  onSelect,
}: {
  option: DayOption;
  active: boolean;
  variant: "center" | "side";
  onSelect: (day: number) => void;
}): ReactElement {
  const isCenter = variant === "center";

  const size = isCenter
    ? "min-w-0 px-3 py-3.5 sm:px-4"
    : "min-w-0 px-2 py-2.5";

  const containerTheme = option.isPast
    ? active
      ? "border-neutral-400 bg-neutral-300/80 text-neutral-700 dark:border-neutral-600 dark:bg-neutral-700/80 dark:text-neutral-200"
      : "border-neutral-300/80 bg-neutral-200/40 text-neutral-400 dark:border-neutral-700/60 dark:bg-neutral-800/40 dark:text-neutral-500"
    : active
      ? "border-semcompMidDarkBlue bg-semcompMidDarkBlue text-semcompOffWhite shadow-md dark:border-semcompLightBlue dark:bg-semcompLightBlue dark:text-semcompDarkBlue"
      : "border-semcompLightBlue bg-white/70 text-semcompDarkBlue hover:bg-white dark:border-semcompMidDarkBlue dark:bg-semcompAlmostDarkBlue/75 dark:text-semcompOffWhite dark:hover:bg-semcompAlmostDarkBlue";

  const captionTheme = option.isPast
    ? "text-neutral-400/70 dark:text-neutral-500/80"
    : active
      ? "opacity-90"
      : "text-semcompMidDarkBlue/70 dark:text-semcompLightBlue/80";

  return (
    <button
      type="button"
      aria-pressed={active}
      onClick={() => onSelect(option.day)}
      className={`group flex h-full w-full flex-col items-center justify-center rounded-xl border transition-all duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-semcompMidLightBlue ${size} ${containerTheme} ${
        option.isPast ? "" : "hover:-translate-y-0.5"
      }`}
    >
      <span
        className={`text-[10px] font-semibold uppercase tracking-wider ${captionTheme}`}
      >
        {option.weekday}
      </span>
      <span
        className={`font-poppins-bold whitespace-nowrap ${
          isCenter ? "text-base md:text-lg" : "text-sm"
        }`}
      >
        {option.label}
      </span>
      <span className="mt-0.5 flex h-1.5 items-center justify-center">
        {option.isToday && !option.isPast && (
          <span className="h-1.5 w-1.5 rounded-full bg-current" aria-hidden="true" />
        )}
      </span>
    </button>
  );
});

export default function CronogramaPage(): ReactElement {
  const { isDarkMode } = useTheme();

  const [events, setEvents] = useState<EventType[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedEvent, setSelectedEvent] = useState<EventWithColumn | null>(null);
  const [selectedDay, setSelectedDay] = useState<number>(() => {
    const today = new Date();
    const withinEventWindow =
      today.getFullYear() === SEMCOMP_YEAR &&
      today.getMonth() === SEMCOMP_MONTH - 1 &&
      EVENT_DAYS.includes(today.getDate());
    return withinEventWindow ? today.getDate() : EVENT_DAYS[0];
  });

  const cardClasses = "border-semcompLightBlue bg-white/70 hover:bg-white dark:border-semcompMidDarkBlue dark:bg-semcompAlmostDarkBlue/75 dark:hover:bg-semcompAlmostDarkBlue";
  const captionClasses = "text-semcompMidDarkBlue/85 dark:text-semcompLightBlue/90";
  const gradientColor = isDarkMode ? "#0B2639" : "#FAFDFF";

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        setLoading(true);
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

  const filteredEvents = useMemo(
    () =>
      events.filter((event) => {
        const date = new Date(event.dateInit);
        return (
          date.getUTCFullYear() === SEMCOMP_YEAR &&
          date.getUTCMonth() === SEMCOMP_MONTH - 1 &&
          date.getUTCDate() === selectedDay
        );
      }),
    [events, selectedDay]
  );

  const processedEventGroups = useMemo(() => processEvents(filteredEvents), [filteredEvents]);

  const handleSelectEvent = useCallback((evento: EventWithColumn) => {
    setSelectedEvent(evento);
  }, []);

  const handleCloseModal = useCallback(() => {
    setSelectedEvent(null);
  }, []);

  const handleSelectDay = useCallback((day: number) => {
    setSelectedDay(day);
    setSelectedEvent(null);
  }, []);

  const handleShiftDay = useCallback((delta: number) => {
    setSelectedDay((current) =>
      Math.min(Math.max(current + delta, EVENT_DAYS_START), EVENT_DAYS_END)
    );
    setSelectedEvent(null);
  }, []);

  const prevOption = selectedDay > EVENT_DAYS_START ? getDayOption(selectedDay - 1) : null;
  const nextOption = selectedDay < EVENT_DAYS_END ? getDayOption(selectedDay + 1) : null;
  const canGoPrev = selectedDay > EVENT_DAYS_START;
  const canGoNext = selectedDay < EVENT_DAYS_END;

  const arrowBase =
    "flex h-9 w-9 sm:h-11 sm:w-11 shrink-0 items-center justify-center rounded-xl border transition-all duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-semcompMidLightBlue";
  const arrowEnabled =
    "border-semcompLightBlue bg-white/70 text-semcompMidDarkBlue hover:-translate-y-0.5 hover:bg-white hover:text-semcompDarkBlue dark:border-semcompMidDarkBlue dark:bg-semcompAlmostDarkBlue/75 dark:text-semcompLightBlue dark:hover:bg-semcompAlmostDarkBlue dark:hover:text-semcompOffWhite";
  const arrowDisabled =
    "cursor-not-allowed border-neutral-300/80 bg-neutral-200/40 text-neutral-400 dark:border-neutral-700/60 dark:bg-neutral-800/40 dark:text-neutral-600";

  return (
    <section className="relative min-h-[calc(100vh-70px)] w-full overflow-x-hidden font-poppins isolate text-semcompDarkBlue dark:text-semcompOffWhite">

      <div
        className="fixed inset-0 z-0 bg-cover bg-center bg-semcompMidLightBlue dark:bg-semcompDarkBlue"
      />

      <div className="pointer-events-none absolute inset-0 z-0 overflow-hidden">
        <div className="absolute -left-32 top-6 h-[500px] w-[500px] bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-semcompMidLightBlue/20 dark:from-semcompMidLightBlue/15 to-transparent" />
        <div className="absolute -right-32 bottom-4 h-[500px] w-[500px] bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-semcompAlmostDarkBlue/12 dark:from-semcompLightBlue/8 to-transparent" />
      </div>

      <div className="relative z-10 mx-auto max-w-5xl px-4 py-10 md:px-6 md:py-14">
        <header className="">
          <h1 className="animate-slide font-poppins-bold text-3xl text-white animation-duration-[900ms] [animation-timing-function:cubic-bezier(0.22,1,0.36,1)] md:text-4xl">
            Cronograma
          </h1>
          <p className="animate-slide [animation-delay:120ms] animation-duration-[900ms] fill-mode-[both] mt-2 text-sm text-white md:text-base">
            Programação completa da SEMCOMP.
          </p>
          <div 
              className="w-full h-30 rounded-t-lg mt-4 border border-b-0"
              style={{
                backgroundImage: `
                  linear-gradient(to top, ${gradientColor} 5%, ${gradientColor}00 100%),
                  url('/img/backgrounds/schedule.jpg')
                `,
              }}>
          </div>
        </header>

        <nav
          aria-label="Dias do cronograma"
          className="mb-3 flex items-center justify-center gap-2 sm:gap-4 bg-semcompDarkBlue border border-t-0 rounded-b-[4px] py-3 px-5"
        >
          <button
            type="button"
            aria-label="Dia anterior"
            disabled={!canGoPrev}
            onClick={() => handleShiftDay(-1)}
            className={`${arrowBase} ${canGoPrev ? arrowEnabled : arrowDisabled}`}
          >
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth={2.5}
              strokeLinecap="round"
              strokeLinejoin="round"
              className="h-5 w-5"
              aria-hidden="true"
            >
              <path d="M15 18l-6-6 6-6" />
            </svg>
          </button>

          <div className="grid w-full min-w-0 max-w-sm grid-cols-[1fr_1.3fr_1fr] items-stretch gap-2 sm:max-w-md sm:gap-3 md:hidden">
            {prevOption ? (
              <DayPill option={prevOption} active={false} variant="side" onSelect={handleSelectDay} />
            ) : (
              <span aria-hidden="true" />
            )}

            <DayPill option={getDayOption(selectedDay)} active variant="center" onSelect={handleSelectDay} />

            {nextOption ? (
              <DayPill option={nextOption} active={false} variant="side" onSelect={handleSelectDay} />
            ) : (
              <span aria-hidden="true" />
            )}
          </div>

          <div className="hidden w-full grid-cols-7 gap-3 md:grid">
            {dayOptions.map((option) => (
              <DayPill
                key={option.day}
                option={option}
                active={option.day === selectedDay}
                variant={option.day === selectedDay ? "center" : "side"}
                onSelect={handleSelectDay}
              />
            ))}
          </div>

          <button
            type="button"
            aria-label="Próximo dia"
            disabled={!canGoNext}
            onClick={() => handleShiftDay(1)}
            className={`${arrowBase} ${canGoNext ? arrowEnabled : arrowDisabled}`}
          >
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth={2.5}
              strokeLinecap="round"
              strokeLinejoin="round"
              className="h-5 w-5"
              aria-hidden="true"
            >
              <path d="M9 18l6-6-6-6" />
            </svg>
          </button>
        </nav>

        <EventModal
          selected={selectedEvent}
          onClose={handleCloseModal}
          captionClasses={captionClasses}
        />

        <div className="space-y-3 h-[calc(100vh-500px)] p-5 rounded-lg" 
          style={{
                backgroundImage: `
                  linear-gradient(to top, ${gradientColor}00 10%, rgba(0, 0, 0, 0.1) 100%)
                `,
              }}
        >
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <p className="text-white/70">Carregando eventos...</p>
            </div>
          ) : filteredEvents.length === 0 ? (
            <div className="flex items-center justify-center py-12">
              <p className="text-white/70">Nenhum evento neste dia.</p>
            </div>
          ) : (
            processedEventGroups.map((grupo, rowIndex) => {
              const column1 = grupo.filter((e) => e.column === 1);
              const column2 = grupo.filter((e) => e.column === 2);
              const column3 = grupo.filter((e) => e.column === 3);
              const full = grupo.filter((e) => e.column === "full");

              return (
                <div key={`group-${rowIndex}`} className="grid gap-3 md:grid-cols-3">
                  {full.length > 0 ? (
                    full.map((evento) => (
                      <div key={evento.name} className="col-span-3">
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
                      <div className="flex flex-col gap-3 h-full">
                        {column1.map((evento) => (
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

                      <div className="flex flex-col gap-3 h-full">
                        {column2.map((evento) => (
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

                      <div className="flex flex-col gap-3 h-full">
                        {column3.map((evento) => (
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
