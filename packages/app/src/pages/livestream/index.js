import React from "react";
import Footer from "../../components/footer";
import Header from "../../components/header";
import API from "../../api";

import "./style.css";
import { toast } from "react-toastify";
import { HashLink } from "react-router-hash-link";
import { useSelector } from "react-redux";

const zeroPad = (num, places) => String(num).padStart(places, "0");

function formatDate(startDate, endDate) {
  const start = new Date(startDate);
  const end = new Date(endDate);

  const startTime = `${zeroPad(start.getHours(), 2)}:${zeroPad(
    start.getMinutes(),
    2
  )}`;
  const endTime = `${zeroPad(end.getHours(), 2)}:${zeroPad(
    end.getMinutes(),
    2
  )}`;

  return `${zeroPad(start.getDate(), 2)}/${zeroPad(
    start.getMonth() + 1,
    2
  )} | ${startTime} às ${endTime}`;
}

function Livestream() {
  const timeUntilCanMarkPresence = 300;

  const [event, setEvent] = React.useState(null);
  const [loading, setLoading] = React.useState(true);
  const [timePresent, setTimePresent] = React.useState(0);

  const [isBigScreen, setIsBigScreen] = React.useState(
    window.innerWidth >= 1200
  );

  const [presenceClicked, setPresenceClicked] = React.useState(false);
  const [waitTime, setWaitTime] = React.useState(timeUntilCanMarkPresence / 60);

  function fetchSavedTimePresent(event) {
    const storageValue = localStorage.getItem(`${event._id}pre`);

    if (storageValue) {
      const presence = JSON.parse(storageValue);
      setTimePresent(presence);
      setWaitTime(waitTime - presence / 60);
    } else setTimePresent(0);
  }

  React.useEffect(() => {
    async function fetchCurrentEvent() {
      try {
        const response = await API.events.getCurrent();

        return response.data;
      } catch (e) {
        console.error(e);
        return null;
      }
    }

    async function fetchAndSetCurrentEvent() {
      const response = await fetchCurrentEvent();

      if (response) {
        setEvent(response);
        fetchSavedTimePresent(response);
      }

      setLoading(false);
    }

    fetchAndSetCurrentEvent();
    window.addEventListener("resize", () =>
      setIsBigScreen(window.innerWidth >= 1200)
    );
  }, []);

  React.useEffect(() => {
    const timeout = setTimeout(() => {
      if (timePresent < timeUntilCanMarkPresence)
        setTimePresent(timePresent + 1);

      if (event && timePresent > 0 && timePresent % 60 === 0) {
        const presence = JSON.stringify(
          localStorage.getItem(`${event._id}pre`)
        );

        if (parseInt(presence.replace(/"/g, "")) !== timePresent) {
          localStorage.setItem(`${event._id}pre`, JSON.stringify(timePresent));
          setWaitTime(waitTime - 1);
        }
      }
    }, 1000);

    return () => {
      clearTimeout(timeout);
    };
  }, [timePresent]);

  function parseVideoID(link) {
    // if no event were fetched yet (useEffect not called), skip without errors
    if (!link) return undefined;

    // match Youtube video ID (whether it uses the full URL or the shortened one)
    const match = link.match(
      /(?:youtu\.be\/|youtube\.com\/watch\?v=)(?<videoId>\s*([^\n\r]*))/
    );
    const videoID = match?.groups?.videoId;

    // if no video ID could be parsed, then the URL is malformed
    if (!videoID || videoID.length !== 11) {
      toast.error("Não é um vídeo do YouTube válido, avise a organização!");
      return undefined;
    }

    return videoID;
  }

  async function handlePresenceClick() {
    try {
      await API.events.markPresence(event._id);
      toast.success("Presença confirmada com sucesso!");
      setPresenceClicked(true);
      localStorage.removeItem(`${event._id}pre`);
    } catch (e) {
      console.error(e);
    }
  }

  const isUserLoggedIn = Boolean(useSelector((state) => state.auth.token));

  function renderPresenceButton() {
    // if no event is happening now, don't render button
    if (!event) return;

    if (event.type === "Concurso" || event.type === "Game Night") return <></>;
    if (event.type === "Minicurso" && !event.isSubscribed) return;

    // If user already marked presence at this event, there's no need to enable the button
    if (event.wasPresent || presenceClicked) {
      return (
        <button className="disabled" disabled>
          Sua presença já foi confirmada
        </button>
      );
    }

    if (!isUserLoggedIn) {
      return <button disabled>Entre para marcar a presença</button>;
    }

    if (timePresent < timeUntilCanMarkPresence) {
      return (
        <button className="disabled" disabled>
          Espere {waitTime} {waitTime > 1 ? "minutos" : "minuto"} antes de
          marcar presença
        </button>
      );
    }

    return <button onClick={handlePresenceClick}>Marcar presença</button>;
  }

  const youtubeVideoId = event && parseVideoID(event.link);

  return (
    <div className="livestream-page-container">
      <Header />
      <div className="livestream-page-content-container">
        {loading || event ? (
          <>
            <main className="main-container">
              <div className="livestream-container">
                {youtubeVideoId ? (
                  <>
                    {!isBigScreen && renderPresenceButton()}
                    <div className="player">
                      <iframe
                        width="829"
                        height="466"
                        src={`https://www.youtube.com/embed/${youtubeVideoId}`}
                        title="YouTube video player"
                        frameborder="0"
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                        allowfullscreen
                      ></iframe>
                    </div>

                    <div className="livestream-data">
                      <h1 className="livestream-title">{event?.name}</h1>
                      <p className="livestream-description">
                        <br />
                        <strong>Palestrante: </strong> {event?.speaker}
                        <br />
                        <strong>Horário: </strong>
                        {formatDate(event?.startDate, event?.endDate)}
                        <br />
                        <br />
                        {event?.description}
                      </p>
                    </div>
                  </>
                ) : (
                  <p style={{ textAlign: "center" }}>Carregando transmissão!</p>
                )}
              </div>
            </main>
            <aside className="aside-container">
              <div className="live-chat-container">
                {isBigScreen && renderPresenceButton()}
                {youtubeVideoId && (
                  <div className="chat">
                    <iframe
                      width="400px"
                      height="500px"
                      title="YouTube comments"
                      // src={`https://www.youtube.com/live_chat?v=${youtubeVideoId}&embed_domain=localhost`}
                      src={`https://www.youtube.com/live_chat?v=${youtubeVideoId}&embed_domain=semcomp.icmc.usp.br`}
                    ></iframe>
                  </div>
                )}
              </div>
            </aside>
          </>
        ) : (
          <main className="main-container">
            <div className="no-livestream">
              <p>
                Nenhum evento sendo transmitido agora!
                <br />
                Dê uma olhada na nossa{" "}
                <HashLink to="/#schedule">programação</HashLink> para descobrir
                mais eventos legais :)
              </p>
            </div>
          </main>
        )}
      </div>
      <Footer />
    </div>
  );
}

export default Livestream;
