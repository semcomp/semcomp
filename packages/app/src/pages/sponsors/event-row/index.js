import React from "react";

import "./style.css";

/**
 * @param { Object } prop
 * @param { string } prop.startTime
 * @param { string } prop.endTime
 * @param { string } prop.title
 * @param { boolean } prop.selected
 */
function EventRow({ startTime, endTime, title, selected }) {
  return (
    <div className={"event-row-component" + (selected ? " selected" : "")}>
      <div className="time-container">
        <p className="start-time">{startTime}</p>
        <p className="end-time">{endTime}</p>
      </div>
      <p className="event-name">{title}</p>
    </div>
  );
}

export default EventRow;
