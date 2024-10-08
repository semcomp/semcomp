import { useEffect, useState } from "react";
import {
  VerticalTimeline,
  VerticalTimelineElement,
} from "react-vertical-timeline-component";
import "react-vertical-timeline-component/style.min.css";
import { AiOutlineClockCircle, AiOutlineDown } from "react-icons/ai";
import EventIcon from "@mui/icons-material/Event";
import API from "../../api";
import { useAppContext } from "../../libs/contextLib";

function getWeekdayAndDate(dateStr) {
  const daysOfWeek = [
    "Domingo",
    "Segunda",
    "Terça",
    "Quarta",
    "Quinta",
    "Sexta",
    "Sábado",
  ];
  const date = new Date(dateStr);
  const dayOfWeek = daysOfWeek[date.getDay()];
  const formattedDate = new Intl.DateTimeFormat("pt-BR", {
    day: "2-digit",
    month: "2-digit",
  }).format(date);
  return `${dayOfWeek} ${formattedDate}`;
}

function getUniqueDayAndDates(events: { startDate: string }[]) {
  const dayAndDatesSet = new Set<string>();
  events.forEach((event) => {
    dayAndDatesSet.add(getWeekdayAndDate(event.startDate));
  });
  return Array.from(dayAndDatesSet);
}

const EventsCalendar = (props) => {
  const [events, setEvents] = useState([]);
  const [selectedDay, setSelectedDay] = useState(null);
  const [expandedEvents, setExpandedEvents] = useState([]);
  const [isMobile, setIsMobile] = useState(false);
  const { user } = useAppContext();
  const isUserLoggedIn = Boolean(user);

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 620);
    };

    window.addEventListener("resize", handleResize);
    handleResize(); // Verifica inicialmente

    return () => window.removeEventListener("resize", handleResize);
  }, []);

  useEffect(() => {
    async function fetchEvents() {
      try {
        const response = await API.events.getAll();
        return response.data;
      } catch (e) {
        console.error(e);
        return [];
      }
    }

    async function fetchAndSetEvents() {
      const eventList = await fetchEvents();
      setEvents(eventList.sort(sortEvents));
      setExpandedEvents(new Array(eventList.length).fill(false));
      if (eventList.length > 0) {
        const firstEventDay = getWeekdayAndDate(eventList[0].startDate);
        setSelectedDay(firstEventDay);
      }
    }

    fetchAndSetEvents();
  }, []);

  if (events.length === 0) {
    return (
      <p className="p-3 mt-8 mb-32 bg-white text-primary font-secondary rounded-xl bg-opacity-70">
        Por enquanto não temos nenhum evento divulgado!
      </p>
    );
  }

  const uniqueDayAndDates = getUniqueDayAndDates(events);
  const filteredEvents = selectedDay
    ? events.filter(
        (event) => getWeekdayAndDate(event.startDate) === selectedDay
      )
    : events;

  const toggleExpandEvent = (index) => {
    setExpandedEvents((prevExpandedEvents) => {
      const newExpandedEvents = [...prevExpandedEvents];
      newExpandedEvents[index] = !newExpandedEvents[index];
      return newExpandedEvents;
    });
  };

  return (
<div className="w-full">
      {/* Seletor de dias */}
      {isMobile ? (
        <div className="relative flex items-center justify-center mb-4">
          <div className="relative w-48">
            {/* <select
              value={selectedDay || ""}
              onChange={(e) => setSelectedDay(e.target.value)}
              className={`w-full px-4 py-2 text-white rounded-md outline-none appearance-none transition ${
                selectedDay ? "bg-[rgb(233,30,99)]" : "bg-blue-600"
              }`}
            >
              {uniqueDayAndDates.map((dayAndDate) => (
                <option key={dayAndDate} value={dayAndDate}>
                  {dayAndDate}
                </option>
              ))}
            </select> */}

            {/* Ícone de seta para baixo dentro do select */}
            <AiOutlineDown className="absolute text-white transform -translate-y-1/2 pointer-events-none top-1/2 right-4" />
          </div>
        </div>
      ) : (
        <div className="flex justify-center mb-4 space-x-2">
          {/* {uniqueDayAndDates.map((dayAndDate) => (
            <button
              key={dayAndDate}
              className={`px-4 py-2 text-white rounded-md transition transform focus:outline-none ${
                selectedDay === dayAndDate
                  ? "bg-[rgb(233,30,99)] shadow-inner scale-95"
                  : "bg-blue-400 hover:bg-[rgb(233,30,99)] active:scale-95 active:shadow-inner"
              }`}
              onClick={() => setSelectedDay(dayAndDate)}
            >
              {dayAndDate}
            </button>
          ))} */}
        </div>
      )}

      {/* Timeline */}
      <VerticalTimeline
        animate={!isMobile}
        lineColor={isMobile ? "transparent" : "white"}
        className={`${isMobile ? "hidden-line" : ""}`}
      >
        {filteredEvents.map((event, index) => {
          const startDateObj = new Date(event.startDate);
          const endDateObj = new Date(event.endDate);

          const startTimeStr = startDateObj.toLocaleTimeString("pt-BR", {
            hour: "2-digit",
            minute: "2-digit",
          });
          const endTimeStr = endDateObj.toLocaleTimeString("pt-BR", {
            hour: "2-digit",
            minute: "2-digit",
          });

          return (
            <VerticalTimelineElement
              key={event.id}
              icon={isMobile ? null : <EventIcon />}
              iconStyle={
                isMobile
                  ? { display: "none" }
                  : { background: "rgb(233, 30, 99)", color: "#fff" }
              }
              contentStyle={
                isMobile
                  ? {
                      background: "#1f2937",
                      color: "#fff",
                      boxShadow: "0 3px 6px rgba(0, 0, 0, 0.16)",
                      maxWidth: "100%",
                      marginLeft: "0",
                      marginRight: "0",
                    }
                  : {
                      background: "#1f2937",
                      color: "#fff",
                      boxShadow: "0 3px 6px rgba(0, 0, 0, 0.16)",
                      maxWidth: "100%",
                    }
              }
              contentArrowStyle={
                isMobile
                  ? { display: "none" }
                  : { borderRight: "7px solid  #1f2937" }
              }
              className={`${isMobile ? "hidden-icon" : ""}`}
            >
              <div onClick={() => toggleExpandEvent(index)}>
                <h3 className="vertical-timeline-element-title">
                  {event.name}
                </h3>
                <p className="flex items-center text-yellow-400">
                  <AiOutlineClockCircle className="mr-2" />
                  {startTimeStr} - {endTimeStr}
                </p>
              </div>
              <div
                className={`transition-max-height duration-700 ease-in-out overflow-hidden ${
                  expandedEvents[index] ? "max-h-screen" : "max-h-0"
                }`}
              >
                <div className="p-4">
                  <h4 className="text-purple-500 vertical-timeline-element-subtitle">
                    {event.type}
                  </h4>
                  <p>{event.description}</p>
                  {event.type === "Contest" && event.isSubscribed && (
                    <button
                      className="p-2 mt-2 text-white bg-red-600 shadow-md hover:bg-red-500"
                      onClick={() =>
                        window.open(
                          event.link,
                          "_blank",
                          "noopener noreferrer"
                        )
                      }
                    >
                      Entrar no contest
                    </button>
                  )}
                </div>
              </div>
            </VerticalTimelineElement>
          );
        })}
      </VerticalTimeline>
    </div>
  );
};

function sortEvents(e1, e2) {
  if (e1.startDate < e2.startDate) return -1;
  if (e2.startDate < e1.startDate) return 1;
  return e1.endDate < e2.endDate ? -1 : 1;
}

export default EventsCalendar;
