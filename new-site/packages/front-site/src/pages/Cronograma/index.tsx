import { useState, useEffect, useMemo, useCallback, useRef, memo, type ReactElement } from "react";
import { MicVocal, Rocket, Trophy, Target, Gamepad2, Flag, Coffee, Clock, MapPin } from "lucide-react";
import { eventsAPI } from "@/api/events";
import type { EventType } from "@/types/EventType.ts";
import type { EventWithColumn } from "@/types/EventWithColumn.ts";
import { useTheme } from "@/contexts/useTheme";
import { formatTime } from "@/lib/utils/formatDate";
import SEMCOMPInfo from "@/lib/constants/SEMCOMPInfo";
import { toPng } from "html-to-image";

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
  weekdayShort: string;
  weekdayLong: string;
  isToday: boolean;
  isPast: boolean;
};

const buildDayOptions = (): DayOption[] => {
  const today = new Date();
  const todayUTC = Date.UTC(today.getFullYear(), today.getMonth(), today.getDate());

  return EVENT_DAYS.map((day) => {
    const date = new Date(Date.UTC(SEMCOMP_YEAR, SEMCOMP_MONTH - 1, day));
    const dayUTC = Date.UTC(SEMCOMP_YEAR, SEMCOMP_MONTH - 1, day);
    
    const weekdayShort = date
      .toLocaleDateString("pt-BR", {
        weekday: "short",
        timeZone: "UTC",
      })
      .replace(".", "")
      .toUpperCase();

    const weekdayLong = date
      .toLocaleDateString("pt-BR", {
        weekday: "long",
        timeZone: "UTC",
      })
      .toUpperCase();

    return {
      day,
      label: `${String(day).padStart(2, "0")}/${String(SEMCOMP_MONTH).padStart(2, "0")}`,
      weekdayShort,
      weekdayLong,
      isToday: dayUTC === todayUTC,
      isPast: dayUTC < todayUTC,
    };
  });
};

const dayOptions = buildDayOptions();

const getDayOption = (day: number): DayOption => dayOptions[day - EVENT_DAYS_START];

/**
 * Agrupa eventos com horários sobrepostos e distribui em até 3 colunas.
 * Eventos de maior duração são posicionados nas colunas mais à direita.
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

const getEventTypeStyle = (type: string) => {
  switch (type) {
    case "Palestra":
      return {
        classes:
          "bg-blue-100 border-blue-300 dark:bg-blue-950/60 dark:border-blue-700",
        icon: "microphone",
      };

    case "Minicurso":
    case "Workshop":
      return {
        classes:
          "bg-green-100 border-green-300 dark:bg-green-950/60 dark:border-green-700",
        icon: "rocket",
      };

    case "Concurso":
    case "Competicao":
      return {
        classes:
          "bg-yellow-100 border-yellow-300 dark:bg-yellow-950/60 dark:border-yellow-700",
        icon: "trophy",
      };

    case "Hackathon":
      return {
        classes:
          "bg-purple-100 border-purple-300 dark:bg-purple-950/60 dark:border-purple-700",
        icon: "target",
      };

    case "Game Night":
      return {
        classes:
          "bg-pink-100 border-pink-300 dark:bg-pink-950/60 dark:border-pink-700",
        icon: "gamepad",
      };

    case "Intervalo":
      return {
        classes:
          "bg-orange-100 border-orange-300 dark:bg-orange-950/60 dark:border-orange-700",
        icon: "coffee",
      };

      case "Encerramento":
      return {
        classes:
          "bg-violet-100 border-violet-300 dark:bg-violet-950/60 dark:border-violet-700",
        icon: "flag",
      };

    default:
      return {
        classes:
          "bg-white/70 border-semcompLightBlue dark:bg-semcompAlmostDarkBlue/75 dark:border-semcompMidDarkBlue",
        icon: "flag",
      };
  }
};

function EventTypeIcon({ type }: { type: string }) {
  const icon = getEventTypeStyle(type).icon;
  const iconClasses = "h-7 w-7";

  switch (icon) {
    case "microphone":
      return <MicVocal className={iconClasses} />;

    case "rocket":
      return <Rocket className={iconClasses} />;

    case "trophy":
      return <Trophy className={iconClasses} />;

    case "target":
      return <Target className={iconClasses} />;

    case "gamepad":
      return <Gamepad2 className={iconClasses} />;

    case "coffee":
      return <Coffee className={iconClasses} />;

    default:
      return <Flag className={iconClasses} />;
  }
}

const EventButton = memo(function EventButton({
  evento,
  onClick,
  captionClasses,
  viewMode,
}: {
  evento: EventWithColumn;
  onClick: (evento: EventWithColumn) => void;
  captionClasses: string;
  viewMode: "day" | "week";
}): ReactElement {
  const eventStyle = getEventTypeStyle(evento.type);

  return (
    <button
      type="button"
      className={`flex gap-5 group w-full min-w-0 overflow-hidden rounded-xl border px-4 py-4 ${viewMode === "day" ? "text-left" : "text-center justify-center items-center"} transition-all duration-300 hover:-translate-y-0.5 hover:shadow-md h-full ${eventStyle.classes}`}
      onClick={() => onClick(evento)}
    >
      {viewMode === "day" && (
      <div className={`border flex items-center justify-center ${eventStyle.classes} rounded-xl w-15 h-15`}>
        <EventTypeIcon type={evento.type} />
      </div>
      )}

      <div>
        {viewMode === "day" && (
          <p className={`font-poppins text-base md:text-sm ${viewMode === "day" ? "" : "opacity-30"}`}>
            {evento.type}
          </p>
        )}

        <p className={`font-poppins-bold text-base md:text-lg ${viewMode === "day" ? "text-left" : "text-center"}`}>
          {evento.name}
        </p>
        
        <div className={`flex items-center ${viewMode === "day" ? "gap-10" : "justify-center text-center"}`}>
          <p className={`mt-1 flex items-center gap-1.5 text-sm ${captionClasses}`}>
            <Clock className="h-4 w-4" aria-hidden="true" />
            {formatTime(evento.dateInit)} - {formatTime(evento.dateEnd)}
          </p>

          {viewMode === "day" && (
            <p className={`mt-1 flex items-center gap-1.5 text-sm ${captionClasses}`}>
              <MapPin className="h-4 w-4" aria-hidden="true" />
              Local: {evento.location}
            </p>
          )}
        </div>

        <div className="grid max-h-none grid-rows-[0fr] overflow-hidden opacity-0 transition-all duration-300 group-hover:mt-3 group-hover:grid-rows-[1fr] group-hover:opacity-100">
          <div className="overflow-hidden">
            <div className={`flex flex-col gap-3 ${viewMode === "day" ? "text-left" : "text-center justify-center"}`}>
              {evento.image && (
                <div className="w-full flex justify-left">
                  <img
                    src={evento.image}
                    alt={evento.name}
                    loading="lazy"
                    className="h-32 w-auto max-w-xs rounded-lg object-cover"
                  />
                </div>
              )}
              {viewMode === "week" && (
                <div className="justify-center flex">
                  <p className={`flex items-center text-center gap-1.5 text-sm ${captionClasses}`}>
                    <MapPin className="h-4 w-4" aria-hidden="true" />
                    Local: {evento.location}
                  </p>
                </div>
              )}
              <p className={`text-sm leading-relaxed wrap-break-word ${captionClasses}`}>
                {evento.description || "Mais detalhes deste evento."}
              </p>
            </div>
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
      className={`group flex h-full w-full flex-col items-center justify-center rounded-xl border transition-all duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-semcompMidLightBlue cursor-pointer ${size} ${containerTheme} ${
        option.isPast ? "" : "hover:-translate-y-0.5"
      }`}
    >
      <span
        className={`text-[10px] font-semibold uppercase tracking-wider ${captionTheme}`}
      >
        {option.weekdayShort}
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

function EventGroups({
  groups,
  onSelect,
  captionClasses,
  maxColumns = 3,
  viewMode,
}: {
  groups: EventWithColumn[][];
  onSelect: (evento: EventWithColumn) => void;
  captionClasses: string;
  maxColumns?: 2 | 3;
  viewMode: "day" | "week";
}) {
  return (
    <div className="space-y-3">
      {groups.map((grupo, rowIndex) => {
        let column1: EventWithColumn[];
        let column2: EventWithColumn[];
        let column3: EventWithColumn[];

        if (maxColumns === 2) {
          const hasColumn3 = grupo.some((e) => e.column === 3);

          column1 = grupo.filter(
            (e) => e.column === 1 || (hasColumn3 && e.column === 2)
          );

          column2 = grupo.filter(
            (e) =>
              e.column === (hasColumn3 ? 3 : 2)
          );

          column3 = [];
        } else {
          column1 = grupo.filter((e) => e.column === 1);
          column2 = grupo.filter((e) => e.column === 2);
          column3 = grupo.filter((e) => e.column === 3);
        }

        const full = grupo.filter((e) => e.column === "full");

        return (
          <div
            key={rowIndex}
            className={`grid gap-3 ${
              maxColumns === 2 ? "md:grid-cols-2" : "md:grid-cols-3"
            }`}
          >
            {full.length > 0 ? (
              full.map((evento) => (
                <div
                  key={`${evento.name}-${evento.dateInit}`}
                  className={maxColumns === 2 ? "md:col-span-2" : "md:col-span-3"}
                >
                  <EventButton
                    evento={evento}
                    onClick={onSelect}
                    captionClasses={captionClasses}
                    viewMode={viewMode}
                  />
                </div>
              ))
            ) : (
              <>
                {(maxColumns === 2
                  ? [column1, column2]
                  : [column1, column2, column3]
                ).map((column, index) => (
                  <div
                    key={index}
                    className="flex h-full flex-col gap-3"
                  >
                    {column.map((evento) => (
                      <div
                        key={`${evento.name}-${evento.dateInit}`}
                        className="flex-1"
                      >
                        <EventButton
                          evento={evento}
                          onClick={onSelect}
                          captionClasses={captionClasses}
                          viewMode={viewMode}
                        />
                      </div>
                    ))}
                  </div>
                ))}
              </>
            )}
          </div>
        );
      })}
    </div>
  );
}

export default function CronogramaPage(): ReactElement {
  const { isDarkMode } = useTheme();

  const [viewMode, setViewMode] = useState<"day" | "week">("day");
  const [events, setEvents] = useState<EventType[]>([]);
  const [loading, setLoading] = useState(true);

  // Opção de baixar cronograma
  const downloadRef = useRef<HTMLDivElement>(null);

  const handleDownloadSchedule = async () => {
    if (!downloadRef.current) return;

    try {
      const image = await toPng(downloadRef.current, {
        pixelRatio: 2,
      });

      const link = document.createElement("a");
      link.download = "cronograma-semcomp.png";
      link.href = image;
      link.click();
    } catch (error) {
      console.error("Erro ao baixar cronograma:", error);
    }
  };

  const [selectedEvent, setSelectedEvent] = useState<EventWithColumn | null>(null);
  const [selectedDay, setSelectedDay] = useState<number>(() => {
    const today = new Date();
    const withinEventWindow =
      today.getFullYear() === SEMCOMP_YEAR &&
      today.getMonth() === SEMCOMP_MONTH - 1 &&
      EVENT_DAYS.includes(today.getDate());
    return withinEventWindow ? today.getDate() : EVENT_DAYS[0];
  });

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

  const processedWeek = useMemo(() => {
    return dayOptions.map((option) => {
      const dayEvents = events.filter((event) => {
        const date = new Date(event.dateInit);

        return (
          date.getUTCFullYear() === SEMCOMP_YEAR &&
          date.getUTCMonth() === SEMCOMP_MONTH - 1 &&
          date.getUTCDate() === option.day
        );
      });

      return {
        option,
        groups: processEvents(dayEvents),
      };
    });
  }, [events]);

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

      <div className="relative z-10 mx-auto max-w-[80%] px-4 py-10 md:px-6 md:py-14">
        <header>
          <div className="flex w-full flex-col gap-4 md:flex-row md:justify-between">
            <div>
              <h1 className="animate-slide font-poppins-bold text-3xl text-white animation-duration-[900ms] [animation-timing-function:cubic-bezier(0.22,1,0.36,1)] md:text-4xl">
                Cronograma
              </h1>
              <p className="animate-slide [animation-delay:120ms] animation-duration-[900ms] fill-mode-[both] mt-2 text-sm text-white md:text-base">
                Programação completa da SEMCOMP.
              </p>
            </div>

            <div className="flex flex-wrap md:items-end md:justify-end gap-3">
              <button
                type="button"
                onClick={handleDownloadSchedule}
                className="inline-flex gap-2 items-center cursor-pointer text-xs md:text-sm text-white/80 rounded-xl border border-semcompLightBlue bg-white/70 dark:border-semcompMidDarkBlue dark:bg-semcompAlmostDarkBlue/75 px-5 py-3"
              >
                <svg
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth={2}
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="h-4 w-4 hidden md:flex"
                  aria-hidden="true"
                >
                  <path d="M12 3v12" />
                  <path d="m7 10 5 5 5-5" />
                  <path d="M5 21h14" />
                </svg>
                Baixar cronograma
              </button>
              <div className="inline-flex rounded-xl border border-semcompLightBlue bg-white/70 p-1 dark:border-semcompMidDarkBlue dark:bg-semcompAlmostDarkBlue/75">
                <button
                  type="button"
                  onClick={() => setViewMode("day")}
                  className={`rounded-lg px-4 py-2 text-sm font-semibold transition-colors cursor-pointer ${
                    viewMode === "day"
                      ? "bg-semcompMidDarkBlue text-white"
                      : "text-semcompDarkBlue dark:text-semcompOffWhite"
                  }`}
                >
                  Por dia
                </button>

                <button
                  type="button"
                  onClick={() => setViewMode("week")}
                  className={`rounded-lg px-4 py-2 text-sm font-semibold transition-colors cursor-pointer ${
                    viewMode === "week"
                      ? "bg-semcompMidDarkBlue text-white"
                      : "text-semcompDarkBlue dark:text-semcompOffWhite"
                  }`}
                >
                  Semana
                </button>
              </div>
            </div>
          </div>

          {/* Banner do Cronograma */}
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
        
        {viewMode === "day" && (
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
        )}

        <EventModal
          selected={selectedEvent}
          onClose={handleCloseModal}
          captionClasses={captionClasses}
        />
        {viewMode === "day" && (
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
              <EventGroups
                groups={processedEventGroups}
                onSelect={handleSelectEvent}
                captionClasses={captionClasses}
                viewMode={viewMode}
              />
            )}
          </div>
        )}

        {viewMode === "week" && (
          loading ? (
            <div className="flex items-center justify-center py-12">
              <p className="text-white/70">Carregando eventos...</p>
            </div>
          ) : (
            <div 
              className="flex w-full gap-5 overflow-x-auto custom-scrollbar p-5 rounded-b-md border border-t-0"
              style={{
                  backgroundImage: `
                    linear-gradient(to top, ${gradientColor} 5%, ${gradientColor}00 100%)
                  `,
                }}
            >
              {processedWeek.map(({ option, groups }, index) => (
                <div 
                  key={option.day} 
                  className={`w-100 shrink-0 ${
                    index !== processedWeek.length - 1
                      ? "border-r border-semcompMidDarkBlue/20 pr-5"
                      : ""
                  }`}>
                  <h2 className="mb-3 font-poppins-bold text-lg text-white text-center">
                    {option.weekdayLong} — {option.label}
                  </h2>

                  {groups.length === 0 ? (
                    <p className="text-white/60">
                      Nenhum evento neste dia.
                    </p>
                  ) : (
                    <EventGroups
                      groups={groups}
                      onSelect={handleSelectEvent}
                      captionClasses={captionClasses}
                      maxColumns={2}
                      viewMode={viewMode}                      
                    />
                  )}
                </div>
              ))}
            </div>
          )
        )}
      </div>

        {/* ÁREA APENAS PARA EXPORTAÇÃO DO CRONOGRAMA */}
        <div className="absolute -left-[9999px] top-0">
        <div
          ref={downloadRef}
          className="w-[2200px] bg-semcompMidLightBlue p-8 text-semcompDarkBlue"
        >
          <h1 className="mb-8 text-center font-poppins-bold text-4xl">
            Cronograma SEMCOMP
          </h1>

          <div
            className="grid gap-4"
            style={{
              gridTemplateColumns: `repeat(${processedWeek.length}, minmax(0, 1fr))`,
            }}
          >
            {processedWeek.map(({ option, groups }, index) => (
              <div
                key={option.day}
                className={
                  index !== processedWeek.length - 1
                    ? "border-r border-semcompDarkBlue/20 px-4"
                    : "px-4"
                }
              >
                <h2 className="mb-4 text-center font-poppins-bold text-lg">
                  {option.weekdayLong}
                  <br />
                  {option.label}
                </h2>

                {groups.length === 0 ? (
                  <p className="text-center text-sm">
                    Nenhum evento
                  </p>
                ) : (
                  <EventGroups
                    groups={groups}
                    onSelect={() => {}}
                    captionClasses={captionClasses}
                    maxColumns={2}
                    viewMode={viewMode}
                  />
                )}
              </div>
            ))}
          </div>
        </div>
      </div>

    </section>
  );
}
