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

  return (<>
    <button
      className="bg-white text-tertiary w-full shadow"
      onClick={handleEventClick}
    >
      <div className="flex items-center">
        <div className="basis-1/6 p-4">
          <div>
            <strong>{startDateStr}</strong>
          </div>
          <div>{endDateStr}</div>
        </div>
        <div className="basis-5/6 text-left p-4">
          {event.type} | {event.name} <br/> {
            renderBadge()
          }
        </div>
      </div>
    </button>
    <div ref={descriptionRef} className="transition-all duration-500 overflow-hidden" style={{ height: 0 }}>
      <div className="bg-white text-black p-6 text-left w-full">
        <span className="text-left">
          <p>
            <strong>
              {(event.type === "Palestra" && "Palestrante: ") || (event.type === "Minicurso" && "Ministrante: ")}
            </strong>
            {(event.type === "Minicurso" || event.type === "Palestra") && event.speaker}
          </p>
          <br />
          <p>
            {event.description.split(/\\n|\n/g).map((line, i) => (<span key={i}> {line} </span>))}
          </p>
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
                className="bg-tertiary text-white transition-all hover:bg-white hover:text-tertiary p-4 shadow-md hover:shadow-none"
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
              <button
                className="bg-tertiary text-white transition-all hover:bg-white hover:text-tertiary p-4 shadow-md hover:shadow-none"
                onClick={() => router.push("/live")}
              >
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
      </div>
    </div>
  </>);
}

export default Event;
