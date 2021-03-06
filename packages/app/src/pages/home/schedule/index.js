import React from "react";
import "./style.css";

import EventsCalendar from "../../../components/events-calendar";

const Schedule = () => {
  return (
    <div id="schedule" className="home-schedule-container">
      <h1>Cronograma</h1>
      <div className="schedule-container">
        <EventsCalendar />
      </div>
    </div>
  );
};

export default Schedule;
