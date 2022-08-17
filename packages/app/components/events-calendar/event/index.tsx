import { useEffect, useRef, useState } from "react";

import Chip from '@mui/material/Chip';
import { useRouter } from 'next/router';

/*
	For the sake of simplicity, we will assume that all events start and end in the same day.
	This might change in the future, so refactoring this component could be a thing.
*/
function Event({ event, isUserLoggedIn, onPresenceSubmited }) {
  // State that controls whether the event has been clicked or not
  const [isOpen, setIsOpen] = useState(false);

  // Holds a reference to the description's paragraph element
  const descriptionRef: any = useRef();

  // Will store the description's height
  const heightSizeRef: any = useRef();

  const startDateObj = new Date(event.startDate);
  const endDateObj = new Date(event.endDate);

  const options: any = { hour: "numeric", minute: "numeric" };

  const startDateStr = new Intl.DateTimeFormat("pt-BR", options).format(
    startDateObj
  );
  const endDateStr = new Intl.DateTimeFormat("pt-BR", options).format(
    endDateObj
  );

  const router = useRouter();

  // Calculates the description's height, and stores it in `heightSizeRef`
  useEffect(() => {
    descriptionRef.current.style.height = "";
    heightSizeRef.current = descriptionRef.current.clientHeight;
    descriptionRef.current.style.height = "0";
  }, []);

  // Whenever the `isOpen` state changes, executes the open/close animation
  useEffect(() => {
    if (isOpen) {
      descriptionRef.current.style.height = heightSizeRef.current + "px";
    } else {
      descriptionRef.current.style.height = "0";
    }
  }, [isOpen]);

  // Switches the `isOpen` state
  function handleEventClick() {
    if (isOpen) setIsOpen(false);
    else setIsOpen(true);
  }

  function renderBadge() {
    // Don't render button if event type doesnt need presence
    if (
      event.type === "Concurso" ||
      event.type === "Game Night" ||
      event.type === "Contest"
    )
      return <></>;

    // If user already marked presence at this event, there's no need to show the button
    if (event.hasAttended) {
      return (
        <Chip label="Presente" color="primary" size="small"/>
      );
    }
  }

  return (
    <div className="event-component">
      <button className="card" onClick={handleEventClick}>
        <div className="left-item">
          <div>
            <strong>{startDateStr}</strong>
          </div>
          <div>{endDateStr}</div>
        </div>
        <div className="right-item">
          {event.type} | {event.name} <br/> {
            renderBadge()
          }
        </div>
      </button>
      <p ref={descriptionRef} className="description" style={{ height: 0 }}>
        {/* The span is used to have a padding and still retract the element into
				a zero-height state */}
        <span className="desc">
        <strong>
          {(event.type === "Palestra" && "Palestrante: ") ||
            (event.type === "Minicurso" && "Ministrante: ")}
        </strong>
        {(event.type === "Minicurso" || event.type === "Palestra") &&
          event.speaker}
          <br />
          {event.description.split(/\\n|\n/g).map((line, i) => (
            <span key={i}> {line} </span>
          ))}
        </span>
        <span>
          {/* {event.type === "Minicurso" && event.isSubscribed && (
            <>
              <br />
              <button
                onClick={() =>
                  window.open(
                    "https://docs.google.com/forms/d/e/1FAIpQLSc_gA2QtRGo5tpDXYxQYyYqFxqNU3tFXXd46g96Pan70wxN4w/viewform?usp=sf_link",
                    "_blank",
                    "noopener noreferrer"
                  )
                }
              >
                Enviar feedback
              </button>
            </>
          )} */}
          {event.type === "Contest" && event.isSubscribed && (
            <>
              <br />
              <button
                onClick={() =>
                  window.open(event.link, "_blank", "noopener noreferrer")
                }
              >
                Entrar no contest
              </button>
            </>
          )}
          {event.type === "Palestra" && (
            <>
              <br />
              <button onClick={() => router.push("/live")}>
                Acessar transmissão
              </button>
            </>
          )}
          {/* CUIDADO: Gambiarra abaixo */}
          {event.type !== "Minicurso" && (
            <>
              <span>
                <br />
              </span>
              {/* The above text was not written directly because it would consume de blankspace after the comma */}
              {event.type !== "Palestra" && event.type !== "Contest" && (
                <>
                  {/* Para acessar,{" "}
                  <a
                    rel="external noopener noreferrer"
                    target="_blank"
                    href={event.link}
                  >
                    clique aqui!
                  </a> */}
                </>
              )}
            </>
          )}
        </span>
      </p>
    </div>
  );
}

export default Event;
