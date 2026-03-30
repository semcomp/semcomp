import { useEffect, useRef, useState } from "react";
import Chip from "@mui/material/Chip";
import { useRouter } from "next/router";
import Linkify from "react-linkify";

function Event({ home, event, isUserLoggedIn, onPresenceSubmited }) {
  const [isOpen, setIsOpen] = useState(false);
  const descriptionRef: any = useRef();
  const heightSizeRef: any = useRef();

  const startDateObj = new Date(event.startDate);
  const endDateObj = new Date(event.endDate);

  const options: any = { hour: "numeric", minute: "numeric" };
  const startDateStr = new Intl.DateTimeFormat("pt-BR", options).format(startDateObj);
  const endDateStr = new Intl.DateTimeFormat("pt-BR", options).format(endDateObj);

  const router = useRouter();

  useEffect(() => {
    descriptionRef.current.style.height = "";
    heightSizeRef.current = descriptionRef.current.clientHeight;
    descriptionRef.current.style.height = "0";
  }, []);

  useEffect(() => {
    if (isOpen) {
      descriptionRef.current.style.height = heightSizeRef.current + "px";
    } else {
      descriptionRef.current.style.height = "0";
    }
  }, [isOpen]);

  function handleEventClick() {
    setIsOpen(!isOpen);
  }

  function renderBadge() {
    if (event.type === "Concurso" || event.type === "Game Night" || event.type === "Contest")
      return <></>;
    if (event.hasAttended) {
      return <Chip label="Presente" color="primary" size="small" />;
    }
  }

  let background = home ? "bg-gray-800 text-gray-300" : "bg-gray-700 text-gray-300";

  return (
    <>
      <button
        className={"focus:outline-none w-full shadow-lg hover:bg-gray-600 " + background}
        onClick={handleEventClick}
      >
        <div className="flex items-center">
          <div className="p-4 basis-1/6">
            <div>
              <strong className="text-red-500">{startDateStr}</strong>
            </div>
            <div>{endDateStr}</div>
          </div>
          <div className="p-4 text-left basis-5/6">
            {event.type} | {event.name} <br /> {renderBadge()}
          </div>
        </div>
      </button>
      <div
        ref={descriptionRef}
        className="overflow-hidden transition-all duration-500"
        style={{ height: 0 }}
      >
        <div className={"font-secondary p-6 text-left w-full " + background}>
          <span className="text-left">
            <p>
              <strong>
                {(event.type === "Palestra" && "Palestrante: ") ||
                  (event.type === "Minicurso" && "Ministrante: ")}
              </strong>
              {(event.type === "Minicurso" || event.type === "Palestra") && event.speaker}
              <br />
              {event.location ? (
                <>
                  <strong>Local: </strong>
                  {event.location}
                </>
              ) : (
                ""
              )}
            </p>
            <br />
            <p>
              <Linkify
                componentDecorator={(decoratedHref, decoratedText, key) => (
                  <a
                    target="blank"
                    style={{ color: "#ff4c4c", fontWeight: "bold" }}
                    href={decoratedHref}
                    key={key}
                  >
                    {decoratedText}
                  </a>
                )}
              >
                {event.description.split(/\\n|\n/g).map((line, i) => (
                  <span key={i}> {line} </span>
                ))}
              </Linkify>
            </p>
          </span>
          {event.type === "Contest" && event.isSubscribed && (
            <>
              <br />
              <button
                className="p-4 text-white transition-all bg-red-600 shadow-md hover:bg-red-500 hover:shadow-none"
                onClick={() =>
                  window.open(event.link, "_blank", "noopener noreferrer")
                }
              >
                Entrar no contest
              </button>
            </>
          )}
        </div>
      </div>
    </>
  );
}

export default Event;
