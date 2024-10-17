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
  const [loading, setLoading] = useState(true);
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
      } finally {
        setLoading(false);
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

  if (!loading && events.length === 0) {
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

  const changeDay = (day) => {
    setExpandedEvents(new Array(events.length).fill(false));
    setSelectedDay(day);
  }

  return (
    <div className="w-full">
      {/* Seletor de dias */}
      { loading ?
        <p>CARREGANDO</p>
        : 
        <>
          {isMobile ? (
            <>
              <div className="relative flex items-center justify-center mb-4 w-full">
                <div className="relative w-48">
                  <select
                    value={selectedDay || ""}
                    onChange={(e) => changeDay(e.target.value)}
                    className={`w-full px-4 py-2 text-white rounded-md font-secondary outline-none appearance-none transition ${
                      selectedDay ? "bg-purple-400" : "bg-secondary"
                    }`}
                  >
                    {uniqueDayAndDates.map((dayAndDate) => (
                      <option key={dayAndDate} value={dayAndDate}>
                        {dayAndDate}
                      </option>
                    ))}
                  </select>
                  
                  {/* Ícone de seta para baixo dentro do select */}
                  <AiOutlineDown className="absolute text-white transform -translate-y-1/2 pointer-events-none top-1/2 right-4" />
                </div>
              </div>
            </>
          ) : (
            <>
              <div className="flex justify-center mb-4 space-x-2">
                {uniqueDayAndDates.map((dayAndDate) => (
                  <button
                    key={dayAndDate}
                    className={`px-4 py-2 rounded-md transition transform focus:outline-none ${
                      selectedDay === dayAndDate
                        ? "bg-purple-400 text-gray-900 shadow-inner scale-95"
                        : "bg-secondary text-gray-900 hover:bg-purple-400 active:scale-95 active:shadow-inner"
                    }`}
                    onClick={() => changeDay(dayAndDate)}
                  >
                    {dayAndDate}
                  </button>
                ))}
              </div>
            </>
          )}
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
                      : { background: "rgb(192 132 252)", color: "#fff" }
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
                  className={`${isMobile ? "hidden-icon" : ""} font-secondary`}
                >
                  <div onClick={() => toggleExpandEvent(index)}>
                    <div className="flex flex-row align-left justify-left w-full">
                      <h4 className="text-purple-500 text-left pr-2 whitespace-nowrap">
                          {event.type + " |"}
                      </h4>
                      <h3 className="text-left">
                        {event.name}
                      </h3>
                    </div>
                    <p className="flex items-center text-yellow-400">
                      <AiOutlineClockCircle className="mr-2" />
                      {startTimeStr} - {endTimeStr}
                    </p>
                  </div>
                  <div
                    className={`transition-max-height duration-700 ease-in-out overflow-hidden ${
                      expandedEvents[index] ? "max-h-screen" : "max-h-0"
                    }`}
                    style={{ transition: 'max-height 0.7s ease-in-out' }}
                  >
                    <div className="p-4">
                      {event.speaker && event.speaker.length > 0 && 
                        <div className="w-full flex flex-row items-center justify-left">
                          <p className="text-purple-400 pr-2">Ministrante: </p> 
                          <p>{event.speaker}</p>
                        </div>
                      }
                      {event.location && event.location.length > 0 && 
                        <div className="w-full flex flex-row items-center justify-left">
                            <p className="text-purple-400 pr-2">Local: </p>
                            <p>{event.location}</p>
                        </div>
                      }

                      <p className="text-left whitespace-pre-line">{event.description}</p>
                    
                    
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
        </>
      }
      </div>
  ); 
};

function sortEvents(e1, e2) {
  if (e1.startDate < e2.startDate) return -1;
  if (e2.startDate < e1.startDate) return 1;
  return e1.endDate < e2.endDate ? -1 : 1;
}

export default EventsCalendar;
