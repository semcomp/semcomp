import { useState, useEffect, useMemo, useCallback, useRef, memo, type ReactElement } from "react";
import { MicVocal, Rocket, Trophy, Target, Gamepad2, Flag, Coffee, Clock, MapPin } from "lucide-react";
import { eventsAPI } from "@/api/events";
import type { EventType } from "@/types/EventType.ts";
import { useTheme } from "@/contexts/useTheme";
import { formatTime } from "@/lib/utils/formatDate";
import SEMCOMPInfo from "@/lib/constants/SEMCOMPInfo";

const SEMCOMP_YEAR = SEMCOMPInfo.YEAR;
const SEMCOMP_MONTH = Number(SEMCOMPInfo.START_DATE.slice(5, 7));
const EVENT_DAYS_START = Number(SEMCOMPInfo.START_DATE.slice(8, 10));
const EVENT_DAYS_END = Number(SEMCOMPInfo.END_DATE.slice(8, 10));

const EVENT_DAYS = Array.from(
  { length: EVENT_DAYS_END - EVENT_DAYS_START + 1 },
  (_, index) => EVENT_DAYS_START + index
);

const MS_PER_HOUR = 60 * 60 * 1000;
// São Paulo = UTC-3; midnight BR = 03:00 UTC (October, before DST)
const BR_OFFSET_MS = 3 * MS_PER_HOUR;
const PX_PER_HOUR_DAY = 120;
const PX_PER_HOUR_WEEK = 90;

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
      .toLocaleDateString("pt-BR", { weekday: "short", timeZone: "UTC" })
      .replace(".", "")
      .toUpperCase();

    const weekdayLong = date
      .toLocaleDateString("pt-BR", { weekday: "long", timeZone: "UTC" })
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

// ─── Layout ──────────────────────────────────────────────────────────────────

type PositionedEvent = EventType & {
  column: number;
  totalColumns: number;
};

/**
 * Greedy column assignment + BFS connected-component analysis.
 * Each event gets a column so that overlapping events are side-by-side.
 * Non-overlapping events always share the same column (full width when alone).
 */
const computeLayout = (events: EventType[]): PositionedEvent[] => {
  if (!events.length) return [];

  const sorted = [...events].sort(
    (a, b) => new Date(a.dateInit).getTime() - new Date(b.dateInit).getTime()
  );

  const colEnds: number[] = [];
  const cols: number[] = [];

  for (const event of sorted) {
    const s = new Date(event.dateInit).getTime();
    const e = new Date(event.dateEnd).getTime();
    let col = colEnds.findIndex((end) => end <= s);
    if (col === -1) col = colEnds.length;
    colEnds[col] = e;
    cols.push(col);
  }

  const n = sorted.length;
  const starts = sorted.map((ev) => new Date(ev.dateInit).getTime());
  const ends = sorted.map((ev) => new Date(ev.dateEnd).getTime());
  const visited = new Array(n).fill(false);
  const totalColsArr = new Array(n).fill(1);

  for (let i = 0; i < n; i++) {
    if (visited[i]) continue;
    const component: number[] = [];
    const queue = [i];
    visited[i] = true;
    while (queue.length) {
      const u = queue.shift()!;
      component.push(u);
      for (let v = 0; v < n; v++) {
        if (!visited[v] && starts[u] < ends[v] && starts[v] < ends[u]) {
          visited[v] = true;
          queue.push(v);
        }
      }
    }
    const maxCol = Math.max(...component.map((idx) => cols[idx]));
    component.forEach((idx) => {
      totalColsArr[idx] = maxCol + 1;
    });
  }

  return sorted.map((event, i) => ({
    ...event,
    column: cols[i],
    totalColumns: totalColsArr[i],
  }));
};

/** UTC time range covering all events, rounded to hour boundaries. */
const getTimeRange = (events: EventType[]): { start: number; end: number } | null => {
  if (!events.length) return null;
  const starts = events.map((e) => new Date(e.dateInit).getTime());
  const ends = events.map((e) => new Date(e.dateEnd).getTime());
  return {
    start: Math.floor(Math.min(...starts) / MS_PER_HOUR) * MS_PER_HOUR,
    end: Math.ceil(Math.max(...ends) / MS_PER_HOUR) * MS_PER_HOUR,
  };
};

/**
 * Shared "time-of-day" range (hours since midnight BR) across all week days.
 * Uses the BR calendar day anchor so that events crossing UTC midnight are handled correctly.
 */
const getWeekTimeOfDayRange = (
  processedWeek: { option: DayOption; events: EventType[] }[]
): { startHours: number; endHours: number } | null => {
  let minH = Infinity;
  let maxH = -Infinity;

  for (const { option, events: dayEvents } of processedWeek) {
    if (!dayEvents.length) continue;
    // Midnight BR = 03:00 UTC of the same UTC calendar day
    const brDayStart = Date.UTC(SEMCOMP_YEAR, SEMCOMP_MONTH - 1, option.day) + BR_OFFSET_MS;
    for (const ev of dayEvents) {
      const s = (new Date(ev.dateInit).getTime() - brDayStart) / MS_PER_HOUR;
      const e = (new Date(ev.dateEnd).getTime() - brDayStart) / MS_PER_HOUR;
      if (s < minH) minH = s;
      if (e > maxH) maxH = e;
    }
  }

  if (minH === Infinity) return null;
  return { startHours: Math.floor(minH), endHours: Math.ceil(maxH) };
};

/** Converts a time-of-day range into absolute UTC timestamps for a specific UTC calendar day. */
const getDayRangeForWeek = (
  utcDay: number,
  weekRange: { startHours: number; endHours: number }
): { start: number; end: number } => {
  const brDayStart = Date.UTC(SEMCOMP_YEAR, SEMCOMP_MONTH - 1, utcDay) + BR_OFFSET_MS;
  return {
    start: brDayStart + weekRange.startHours * MS_PER_HOUR,
    end: brDayStart + weekRange.endHours * MS_PER_HOUR,
  };
};

// ─── Style helpers ────────────────────────────────────────────────────────────

const getEventTypeStyle = (type: string) => {
  switch (type) {
    case "Palestra":
      return {
        classes: "bg-blue-100 border-blue-300 dark:bg-blue-950/60 dark:border-blue-700",
        icon: "microphone",
      };
    case "Minicurso":
    case "Workshop":
      return {
        classes: "bg-green-100 border-green-300 dark:bg-green-950/60 dark:border-green-700",
        icon: "rocket",
      };
    case "Concurso":
    case "Competicao":
      return {
        classes: "bg-yellow-100 border-yellow-300 dark:bg-yellow-950/60 dark:border-yellow-700",
        icon: "trophy",
      };
    case "Hackathon":
      return {
        classes: "bg-purple-100 border-purple-300 dark:bg-purple-950/60 dark:border-purple-700",
        icon: "target",
      };
    case "Game Night":
      return {
        classes: "bg-pink-100 border-pink-300 dark:bg-pink-950/60 dark:border-pink-700",
        icon: "gamepad",
      };
    case "Intervalo":
      return {
        classes: "bg-orange-100 border-orange-300 dark:bg-orange-950/60 dark:border-orange-700",
        icon: "coffee",
      };
    case "Encerramento":
      return {
        classes: "bg-violet-100 border-violet-300 dark:bg-violet-950/60 dark:border-violet-700",
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
  const cls = "h-5 w-5 md:h-6 md:w-6 shrink-0";
  switch (icon) {
    case "microphone": return <MicVocal className={cls} />;
    case "rocket":     return <Rocket className={cls} />;
    case "trophy":     return <Trophy className={cls} />;
    case "target":     return <Target className={cls} />;
    case "gamepad":    return <Gamepad2 className={cls} />;
    case "coffee":     return <Coffee className={cls} />;
    default:           return <Flag className={cls} />;
  }
}

// ─── EventButton ──────────────────────────────────────────────────────────────

const EventButton = memo(function EventButton({
  evento,
  onClick,
  captionClasses,
  viewMode,
  exportMode = false,
  compact = false,
  small = false,
  totalColumns = 1,
}: {
  evento: EventType;
  onClick: (evento: EventType) => void;
  captionClasses: string;
  viewMode: "day" | "week";
  exportMode?: boolean;
  compact?: boolean;
  small?: boolean;
  totalColumns?: number;
}): ReactElement {
  const concurrent = totalColumns >= 2;
  const eventStyle = getEventTypeStyle(evento.type);

  // Compact (< 50 px): apenas nome, sem mais nada
  if (compact) {
    return (
      <button
        type="button"
        className={`w-full h-full overflow-hidden rounded-lg border px-1.5 py-0.5 text-left cursor-pointer transition-colors ${eventStyle.classes}`}
        onClick={() => onClick(evento)}
      >
        <p className="font-poppins-bold text-[9px] md:text-[10px] leading-tight break-words">{evento.name}</p>
      </button>
    );
  }

  // Small (50–100 px): nome + tipo (só no dia) + horário — sem ícone nem localização
  if (small) {
    return (
      <button
        type="button"
        className={`w-full h-full overflow-hidden rounded-xl border px-2 py-1.5 text-left cursor-pointer transition-colors hover:brightness-95 ${eventStyle.classes}`}
        onClick={() => onClick(evento)}
      >
        {viewMode === "day" && (
          <p className={`text-[9px] md:text-[10px] font-medium truncate ${captionClasses}`}>{evento.type}</p>
        )}
        <p className="font-poppins-bold text-[10px] md:text-[11px] leading-snug break-words">{evento.name}</p>
        <p className={`flex items-center gap-1 text-[9px] md:text-[10px] mt-0.5 ${captionClasses}`}>
          <Clock className="h-3 w-3 shrink-0" aria-hidden="true" />
          {formatTime(evento.dateInit)} – {formatTime(evento.dateEnd)}
        </p>
      </button>
    );
  }

  return (
    <button
      type="button"
      className={`
        flex group/btn w-full min-h-full rounded-xl border
        transition-all duration-300 hover:-translate-y-0.5 hover:shadow-md cursor-pointer
        max-lg:px-2 max-lg:py-2 min-lg:px-4 min-lg:py-4
        ${viewMode === "day"
          ? concurrent
            ? "max-md:flex-col max-md:gap-0.5 max-md:!px-1.5 max-md:!py-1 md:max-[1500px]:flex-col md:max-[1500px]:gap-2 min-[1500px]:flex-row min-[1500px]:items-start min-[1500px]:gap-5 text-left"
            : "max-md:flex-row max-md:items-start max-md:gap-2 md:max-[1500px]:flex-col md:max-[1500px]:gap-2 min-[1500px]:flex-row min-[1500px]:items-start min-[1500px]:gap-5 text-left"
          : "flex-col gap-1.5 items-start text-left"
        }
        ${eventStyle.classes}`}
      onClick={() => onClick(evento)}
    >
      {viewMode === "day" && (
        <div
          className={`
            border flex items-center justify-center rounded-xl gap-2
            ${concurrent ? "max-md:hidden" : "max-md:shrink-0 max-md:self-start max-md:p-1.5 max-md:rounded-lg"}
            md:px-2 md:py-2 md:max-[1500px]:w-full md:justify-center lg:px-3 lg:py-3
            ${eventStyle.classes}`}
        >
          <EventTypeIcon type={evento.type} />
          <div className="max-md:hidden min-[1500px]:hidden">
            <p className="font-poppins text-[11px] md:text-xs">{evento.type}</p>
            <p
              className={`font-poppins-bold break-words text-left ${
                exportMode ? "text-xs" : "text-sm md:text-base"
              }`}
            >
              {evento.name}
            </p>
          </div>
        </div>
      )}

      <div className={viewMode === "day" ? "flex-1 min-w-0" : "w-full min-w-0"}>
        {viewMode === "week" && (
          <p className={`text-[8px] sm:text-[9px] font-semibold truncate mb-0.5 ${captionClasses}`}>
            {evento.type}
          </p>
        )}

        {viewMode === "day" && (
          <p className="font-poppins text-[9px] md:text-xs md:max-[1500px]:hidden">
            {evento.type}
          </p>
        )}

        <p
          className={`font-poppins-bold break-words ${
            viewMode === "week"
              ? "text-[10px] sm:text-[11px] md:text-xs text-left"
              : `text-[11px] md:text-sm lg:text-base text-left md:max-[1500px]:hidden ${concurrent ? "max-md:text-[10px]" : ""}`
          }`}
        >
          {evento.name}
        </p>

        <div
          className={`items-center w-full mt-0.5 ${exportMode ? "grid gap-1" : "flex flex-col gap-0.5"}`}
        >
          <p
            className={`flex items-center gap-1 text-[9px] sm:text-[10px] md:text-xs ${captionClasses}`}
          >
            <Clock className={`h-3 w-3 shrink-0 ${exportMode ? "hidden" : ""}`} aria-hidden="true" />
            {formatTime(evento.dateInit)} – {formatTime(evento.dateEnd)}
          </p>

          <p
            className={`flex items-center gap-1 text-[9px] sm:text-[10px] md:text-xs ${
              viewMode === "day" || exportMode ? "" : "md:hidden"
            } ${concurrent ? "max-md:hidden" : ""} ${captionClasses}`}
          >
            <MapPin className={`h-3 w-3 shrink-0 ${exportMode ? "hidden" : ""}`} aria-hidden="true" />
            <span className="break-words">Local: {evento.location}</span>
          </p>
        </div>

        <div className="grid max-h-none grid-rows-[0fr] overflow-hidden opacity-0 transition-all duration-300 group-hover/btn:mt-2 group-hover/btn:grid-rows-[1fr] group-hover/btn:opacity-100">
          <div className="overflow-hidden">
            <div className="flex flex-col gap-2 text-left">
              {evento.image && (
                <div className="w-full flex justify-left">
                  <img
                    src={evento.image}
                    alt={evento.name}
                    loading="lazy"
                    className="h-28 w-auto max-w-xs rounded-lg object-cover"
                  />
                </div>
              )}
              {viewMode === "week" && (
                <p className={`flex items-center gap-1 text-[9px] sm:text-[10px] max-md:hidden ${captionClasses}`}>
                  <MapPin className="h-3 w-3 shrink-0" aria-hidden="true" />
                  <span className="break-words">Local: {evento.location}</span>
                </p>
              )}
              <p className={`text-[10px] sm:text-xs leading-relaxed break-words max-md:hidden ${captionClasses}`}>
                {evento.description || "Mais detalhes deste evento."}
              </p>
            </div>
          </div>
        </div>
      </div>
    </button>
  );
});

// ─── EventModal ───────────────────────────────────────────────────────────────

function EventModal({
  selected,
  onClose,
  captionClasses,
}: {
  selected: EventType | null;
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
        <div className="text-sm mt-1">
          <p className={`flex gap-1 items-center ${captionClasses}`}>
            <Flag className="h-4 w-4" aria-hidden="true" />
            Tipo de Evento: {selected.type}
          </p>
          <p className={`flex gap-1 items-center ${captionClasses}`}>
            <Clock className="h-4 w-4" aria-hidden="true" />
            {formatTime(selected.dateInit)} - {formatTime(selected.dateEnd)}
          </p>
          <p className={`flex items-center gap-1 ${captionClasses}`}>
            <MapPin className="h-4 w-4 shrink-0" aria-hidden="true" />
            <span className="break-words min-w-10 text-left">Local: {selected.location}</span>
          </p>
          <hr className="mt-3" />
          <p className="mt-3 text-center leading-relaxed md:text-base">
            {selected.description || "Sem descrição."}
          </p>
        </div>
        <button
          className="mt-6 cursor-pointer inline-flex rounded-lg px-4 py-2 text-sm font-semibold transition-colors bg-semcompMidDarkBlue text-semcompOffWhite hover:bg-semcompAlmostDarkBlue dark:hover:bg-semcompMidLightBlue"
          onClick={onClose}
        >
          Fechar
        </button>
      </div>
    </div>
  );
}

// ─── DayPill ─────────────────────────────────────────────────────────────────

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
  const size = isCenter ? "min-w-0 px-3 py-3.5 sm:px-4" : "min-w-0 px-2 py-2.5";

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
      <span className={`text-[10px] font-semibold uppercase tracking-wider ${captionTheme}`}>
        {option.weekdayShort}
      </span>
      <span className={`font-poppins-bold whitespace-nowrap ${isCenter ? "text-base md:text-lg" : "text-sm"}`}>
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

// ─── TimeGrid ─────────────────────────────────────────────────────────────────

function TimeGrid({
  events,
  timeRange,
  onSelect,
  captionClasses,
  viewMode,
  showHourLabels = false,
  pxPerHour = PX_PER_HOUR_DAY,
  exportMode = false,
}: {
  events: EventType[];
  timeRange: { start: number; end: number };
  onSelect: (evento: EventType) => void;
  captionClasses: string;
  viewMode: "day" | "week";
  showHourLabels?: boolean;
  pxPerHour?: number;
  exportMode?: boolean;
}) {
  const positioned = useMemo(() => computeLayout(events), [events]);
  const totalMs = timeRange.end - timeRange.start;
  const containerHeight = (totalMs / MS_PER_HOUR) * pxPerHour;

  const hourMarks: number[] = [];
  for (
    let t = Math.ceil(timeRange.start / MS_PER_HOUR) * MS_PER_HOUR;
    t <= timeRange.end;
    t += MS_PER_HOUR
  ) {
    hourMarks.push(t);
  }

  return (
    <div className="flex gap-2 min-h-0">
      {showHourLabels && (
        <div className="relative shrink-0 w-10 select-none" style={{ height: containerHeight }}>
          {hourMarks.map((t) => {
            const topPx = ((t - timeRange.start) / MS_PER_HOUR) * pxPerHour;
            return (
              <span
                key={t}
                className={`absolute right-0 -translate-y-1/2 text-xs ${captionClasses}`}
                style={{ top: topPx }}
              >
                {formatTime(new Date(t).toISOString())}
              </span>
            );
          })}
        </div>
      )}

      <div className="relative flex-1" style={{ height: containerHeight }}>
        {hourMarks.map((t) => {
          const topPx = ((t - timeRange.start) / MS_PER_HOUR) * pxPerHour;
          return (
            <div
              key={t}
              className="absolute inset-x-0 border-t border-white/10 pointer-events-none"
              style={{ top: topPx }}
            />
          );
        })}

        {positioned.map((event) => {
          const s = new Date(event.dateInit).getTime();
          const e = new Date(event.dateEnd).getTime();
          const topPx = ((s - timeRange.start) / MS_PER_HOUR) * pxPerHour;
          const heightPx = ((e - s) / MS_PER_HOUR) * pxPerHour;
          const leftPct = (event.column / event.totalColumns) * 100;
          const widthPct = (1 / event.totalColumns) * 100;

          return (
            <div
              key={`${event.name}-${event.dateInit}`}
              className="absolute box-border p-0.5 group/card hover:z-10"
              style={{
                top: topPx,
                height: Math.max(heightPx, 28),
                left: `${leftPct}%`,
                width: `${widthPct}%`,
              }}
            >
              <EventButton
                evento={event}
                onClick={onSelect}
                captionClasses={captionClasses}
                viewMode={viewMode}
                exportMode={exportMode}
                compact={heightPx < 50}
                small={heightPx >= 50 && heightPx < 100}
                totalColumns={event.totalColumns}
              />
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function CronogramaPage(): ReactElement {
  const { isDarkMode } = useTheme();

  const [viewMode, setViewMode] = useState<"day" | "week">("day");
  const [events, setEvents] = useState<EventType[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedEvent, setSelectedEvent] = useState<EventType | null>(null);
  const [selectedDay, setSelectedDay] = useState<number>(() => {
    const today = new Date();
    const withinEventWindow =
      today.getFullYear() === SEMCOMP_YEAR &&
      today.getMonth() === SEMCOMP_MONTH - 1 &&
      EVENT_DAYS.includes(today.getDate());
    return withinEventWindow ? today.getDate() : EVENT_DAYS[0];
  });

  const downloadRef = useRef<HTMLDivElement>(null);

  const handleDownloadSchedule = async () => {
    if (!downloadRef.current) return;
    try {
      const { toPng } = await import("html-to-image");
      const image = await toPng(downloadRef.current, { pixelRatio: 2 });
      const link = document.createElement("a");
      link.download = "cronograma-semcomp.png";
      link.href = image;
      link.click();
    } catch (error) {
      console.error("Erro ao baixar cronograma:", error);
    }
  };

  const captionClasses = "text-semcompMidDarkBlue/85 dark:text-semcompLightBlue/90";
  const gradientColor = isDarkMode ? "#0B2639" : "#357BA3";

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        setLoading(true);
        const response = await eventsAPI.getAllEvents();
        setEvents(response.events || []);
      } catch (error) {
        console.error("Erro ao buscar eventos:", error);
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

  const dayTimeRange = useMemo(() => getTimeRange(filteredEvents), [filteredEvents]);

  // Compute px/hour so every card fits its slot without overflow.
  // Iterates until convergence: for each event, estimates min rendered height
  // per variant (compact/small/normal) and derives the minimum px/hour needed.
  const dayPxPerHour = useMemo(() => {
    if (!filteredEvents.length) return PX_PER_HOUR_DAY;
    let p = PX_PER_HOUR_DAY;
    for (let iter = 0; iter < 10; iter++) {
      let next = p;
      for (const ev of filteredEvents) {
        const d =
          (new Date(ev.dateEnd).getTime() - new Date(ev.dateInit).getTime()) /
          MS_PER_HOUR;
        if (d <= 0) continue;
        const slot = d * p;
        // min heights match the rendered variants (after mobile text reduction)
        const minH = slot < 50 ? 22 : slot < 100 ? 50 : 88;
        if (slot < minH) next = Math.max(next, minH / d);
      }
      if (next <= p + 0.5) break;
      p = next;
    }
    return Math.ceil(p);
  }, [filteredEvents]);

  const processedWeek = useMemo(
    () =>
      dayOptions.map((option) => {
        const dayEvents = events.filter((event) => {
          const date = new Date(event.dateInit);
          return (
            date.getUTCFullYear() === SEMCOMP_YEAR &&
            date.getUTCMonth() === SEMCOMP_MONTH - 1 &&
            date.getUTCDate() === option.day
          );
        });
        return { option, events: dayEvents };
      }),
    [events]
  );

  const weekTimeOfDayRange = useMemo(
    () => getWeekTimeOfDayRange(processedWeek),
    [processedWeek]
  );

  const handleSelectEvent = useCallback((evento: EventType) => {
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
      <div className="fixed inset-0 z-0 bg-cover bg-center bg-semcompLightBlue dark:bg-semcompDarkBlue" />

      <div className="pointer-events-none absolute inset-0 z-0 overflow-hidden">
        <div className="absolute -left-32 top-6 h-[500px] w-[500px] bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-semcompMidLightBlue/20 dark:from-semcompMidLightBlue/15 to-transparent" />
        <div className="absolute -right-32 bottom-4 h-[500px] w-[500px] bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-semcompAlmostDarkBlue/12 dark:from-semcompLightBlue/8 to-transparent" />
      </div>

      <div className="relative z-10 mx-auto max-w-[95%] md:max-w-[80%] px-3 py-8 md:px-6 md:py-14">
        <header>
          <div className="flex w-full flex-col gap-4 md:flex-row md:justify-between">
            <div>
              <h1 className="animate-slide font-poppins-bold text-3xl text-semcompMidLightBlue dark:text-white animation-duration-[900ms] [animation-timing-function:cubic-bezier(0.22,1,0.36,1)] md:text-4xl">
                Cronograma
              </h1>
              <p className="animate-slide [animation-delay:120ms] animation-duration-[900ms] fill-mode-[both] mt-2 text-sm text-semcompDarkBlue dark:text-white md:text-base">
                Programação completa da SEMCOMP.
              </p>
            </div>

            <div className="flex flex-wrap md:items-end md:justify-end gap-3">
              <button
                type="button"
                onClick={handleDownloadSchedule}
                className="inline-flex gap-2 items-center cursor-pointer text-xs md:text-sm dark:text-white/80 rounded-xl border bg-white/70 border-semcompMidDarkBlue dark:bg-semcompAlmostDarkBlue/75 dark:hover:bg-semcompMidLightBlue hover:bg-semcompMidLightBlue/30 transition-all px-5 py-3"
              >
                <svg
                  viewBox="0 0 24 24" fill="none" stroke="currentColor"
                  strokeWidth={2} strokeLinecap="round" strokeLinejoin="round"
                  className="h-4 w-4 hidden md:flex" aria-hidden="true"
                >
                  <path d="M12 3v12" />
                  <path d="m7 10 5 5 5-5" />
                  <path d="M5 21h14" />
                </svg>
                Baixar cronograma
              </button>

              <div className="inline-flex rounded-xl border border-semcompLightBlue bg-white/70 p-1 border-semcompMidDarkBlue dark:bg-semcompAlmostDarkBlue/75">
                <button
                  type="button"
                  onClick={() => setViewMode("day")}
                  className={`rounded-lg px-4 py-2 text-sm font-semibold transition-colors cursor-pointer ${
                    viewMode === "day"
                      ? "dark:bg-semcompMidDarkBlue bg-semcompMidLightBlue text-white"
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
                      ? "dark:bg-semcompMidDarkBlue bg-semcompMidLightBlue text-white"
                      : "text-semcompDarkBlue dark:text-semcompOffWhite"
                  }`}
                >
                  Semana
                </button>
              </div>
            </div>
          </div>

          <div
            className="w-full h-30 rounded-t-lg mt-4 border border-b-0"
            style={{
              backgroundImage: `linear-gradient(to top, ${gradientColor} 5%, ${gradientColor}00 100%), url('/img/backgrounds/schedule.jpg')`,
            }}
          />
        </header>

        {/* ── Day navigation ── */}
        {viewMode === "day" && (
          <nav
            aria-label="Dias do cronograma"
            className="mb-3 flex items-center justify-center gap-2 sm:gap-4 dark:bg-semcompDarkBlue bg-semcompMidLightBlue border border-t-0 rounded-b-[4px] py-3 px-5"
          >
            <button
              type="button"
              aria-label="Dia anterior"
              disabled={!canGoPrev}
              onClick={() => handleShiftDay(-1)}
              className={`${arrowBase} ${canGoPrev ? arrowEnabled : arrowDisabled}`}
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5}
                strokeLinecap="round" strokeLinejoin="round" className="h-5 w-5" aria-hidden="true">
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
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5}
                strokeLinecap="round" strokeLinejoin="round" className="h-5 w-5" aria-hidden="true">
                <path d="M9 18l6-6-6-6" />
              </svg>
            </button>
          </nav>
        )}

        <EventModal selected={selectedEvent} onClose={handleCloseModal} captionClasses={captionClasses} />

        {/* ── Day view ── */}
        {viewMode === "day" && (
          <div
            className="overflow-y-auto custom-scrollbar p-5 rounded-lg"
            style={{
              backgroundImage: `linear-gradient(to top, ${gradientColor} 100%, #ffffff 50%)`,
            }}
          >
            {loading ? (
              <div className="flex items-center justify-center text-center py-12">
                <p className="text-white/70">Carregando eventos...</p>
              </div>
            ) : filteredEvents.length === 0 ? (
              <div className="flex items-center justify-center text-center py-12">
                <p className="text-white/70">Nenhum evento neste dia.</p>
              </div>
            ) : dayTimeRange ? (
              <TimeGrid
                events={filteredEvents}
                timeRange={dayTimeRange}
                onSelect={handleSelectEvent}
                captionClasses={captionClasses}
                viewMode="day"
                showHourLabels
                pxPerHour={dayPxPerHour}
              />
            ) : null}
          </div>
        )}

        {/* ── Week view ── */}
        {viewMode === "week" && (
          loading ? (
            <div className="flex items-center justify-center py-12">
              <p className="text-white/70">Carregando eventos...</p>
            </div>
          ) : (
            <div
              className="flex w-full gap-2 sm:gap-3 md:gap-5 overflow-x-auto custom-scrollbar p-3 sm:p-4 md:p-5 rounded-b-md border border-t-0"
              style={{
                backgroundImage: `linear-gradient(to top, ${gradientColor} 100%, ${gradientColor}00 100%)`,
              }}
            >
              {processedWeek.map(({ option, events: dayEvents }, index) => {
                const dayRange = weekTimeOfDayRange
                  ? getDayRangeForWeek(option.day, weekTimeOfDayRange)
                  : null;

                return (
                  <div
                    key={option.day}
                    className={`w-100 shrink-0 ${
                      index !== processedWeek.length - 1
                        ? "border-r border-semcompMidDarkBlue/20 pr-2 sm:pr-3 md:pr-5"
                        : ""
                    }`}
                  >
                    <h2 className="mb-2 font-poppins-bold text-[10px] sm:text-xs md:text-sm text-white text-center">
                      <span className="hidden sm:inline">{option.weekdayLong} — </span>
                      <span className="sm:hidden">{option.weekdayShort} </span>
                      {option.label}
                    </h2>

                    {dayRange ? (
                      dayEvents.length === 0 ? (
                        <div
                          className="relative flex items-center justify-center"
                          style={{
                            height:
                              ((weekTimeOfDayRange!.endHours - weekTimeOfDayRange!.startHours) *
                                PX_PER_HOUR_WEEK),
                          }}
                        >
                          <p className="text-white/40 text-sm">Nenhum evento</p>
                        </div>
                      ) : (
                        <TimeGrid
                          events={dayEvents}
                          timeRange={dayRange}
                          onSelect={handleSelectEvent}
                          captionClasses={captionClasses}
                          viewMode="week"
                          pxPerHour={PX_PER_HOUR_WEEK}
                        />
                      )
                    ) : (
                      <p className="text-white/60 text-center">Nenhum evento neste dia.</p>
                    )}
                  </div>
                );
              })}
            </div>
          )
        )}
      </div>

      {/* ── Export area (off-screen, rendered for html-to-image) ── */}
      <div className="absolute -left-[9999px] top-0">
        <div
          ref={downloadRef}
          className="w-fit bg-semcompLightBlue dark:bg-semcompAlmostDarkBlue p-8 text-semcompDarkBlue dark:text-semcompLightBlue"
        >
          <h1 className="mb-8 text-center font-poppins-bold text-4xl">
            Cronograma SEMCOMP
          </h1>

          {weekTimeOfDayRange && (
            <div
              className="grid gap-4"
              style={{
                gridTemplateColumns: `repeat(${processedWeek.length}, 25rem)`,
              }}
            >
              {processedWeek.map(({ option, events: dayEvents }, index) => {
                const dayRange = getDayRangeForWeek(option.day, weekTimeOfDayRange);
                return (
                  <div
                    key={option.day}
                    className={
                      index !== processedWeek.length - 1
                        ? "border-r border-semcompDarkBlue/20 px-4"
                        : "px-4"
                    }
                  >
                    <h2 className="mb-4 text-center font-poppins-bold text-md">
                      {option.weekdayLong} {option.label}
                    </h2>
                    {dayEvents.length === 0 ? (
                      <p className="text-center text-sm">Nenhum evento</p>
                    ) : (
                      <TimeGrid
                        events={dayEvents}
                        timeRange={dayRange}
                        onSelect={() => {}}
                        captionClasses={captionClasses}
                        viewMode="week"
                        exportMode
                        pxPerHour={PX_PER_HOUR_WEEK}
                      />
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
