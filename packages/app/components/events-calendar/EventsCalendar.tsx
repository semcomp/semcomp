import { useEffect, useState } from "react";

import API from "../../api";
import EventDay from "./EventDay";
import Event from "./Event";
import { useAppContext } from "../../libs/contextLib";

function sortEvents(e1, e2) {
  if (e1.startDate < e2.startDate) return -1;
  if (e2.startDate < e1.startDate) return 1;
  // If the code reaches here, both start dates are equal.
  // In this case, sort by end date.
  return e1.endDate < e2.endDate ? -1 : 1;
}

const EventsCalendar = () => {
  const [events, setEvents] = useState([]);
  const [curPage, setCurPage] = useState(0);

  const { user } = useAppContext();
  const isUserLoggedIn = Boolean(user);

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
    }

    fetchAndSetEvents();
  }, []);

  if (events.length === 0) {
    return <p>Por enquanto não temos nenhum evento divulgado!</p>;
  }

  let splittedEventList = []; // will be a list of lists

  let lastDate = new Date(events[0].startDate);
  let lastDateFormatted = new Intl.DateTimeFormat("pt-BR").format(lastDate);

  const finalSplitIdx = events.reduce(
    (lastSplitIdx, curEvent, curIdx, events) => {
      const curDate = new Date(curEvent.startDate);
      const curDateFormatted = new Intl.DateTimeFormat("pt-BR").format(curDate);

      // If they are both in the same day, go to the next one...
      // You're not gonna need to split here
      if (curDateFormatted === lastDateFormatted) {
        lastDateFormatted = curDateFormatted;
        return lastSplitIdx;
      }

      // Slice from here backwards (without including this position)
      splittedEventList.push(events.slice(lastSplitIdx, curIdx));
      // Update the starting position of the next slice
      lastSplitIdx = curIdx;

      lastDateFormatted = curDateFormatted;
      return lastSplitIdx;
    },
    0
  );

  function handlePresenceSubmited(eventId) {
    const newEvents = events.map((event) => {
      if (event.id === eventId) {
        return { ...event, wasPresent: true };
      } else {
        return event;
      }
    });

    setEvents(newEvents);
  }

  // Termina de fazer o split
  splittedEventList.push(events.slice(finalSplitIdx));

  const changePage = (idx) => {
    setCurPage(idx);
  };

  const eventDayList = splittedEventList.map((eventList, idx) => {
    const eventDay = eventList[0].startDate;
    return (
      <EventDay
        dayDate={eventDay}
        key={idx}
        myPage={idx}
        changePage={changePage}
        isCurrentDay={curPage === idx}
      />
    );
  });

  const curEventList = splittedEventList[curPage].map((event) => (
    <Event
      key={event.id}
      event={event}
      onPresenceSubmited={handlePresenceSubmited}
      isUserLoggedIn={isUserLoggedIn}
    />
  ));

  return (
    <div className="md:flex lg:w-[650px]">
      <div className="grid grid-cols-3 sm:flex sm:flex-row md:flex-col">
        {eventDayList}
      </div>
      <div className="basis-5/6">{curEventList}</div>
    </div>
  );
};

export default EventsCalendar;
