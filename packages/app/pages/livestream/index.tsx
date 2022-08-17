/* eslint-disable react-hooks/exhaustive-deps */
import { useEffect, useState } from "react";
import Footer from "../../components/footer";
import Header from "../../components/header";
import API from "../../api";

import "./style.css";
import { toast } from "react-toastify";
import Link from 'next/link'

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

  const [event, setEvent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [timePresent, setTimePresent] = useState(0);

  const [isBigScreen, setIsBigScreen] = useState(
    window.innerWidth >= 1200
  );

  const [presenceClicked, setPresenceClicked] = useState(false);
  const [waitTime, setWaitTime] = useState(timeUntilCanMarkPresence / 60);

  function fetchSavedTimePresent(event) {
    const storageValue = localStorage.getItem(`${event.id}pre`);

    if (storageValue) {
      const presence = JSON.parse(storageValue);
      setTimePresent(presence);
      setWaitTime(waitTime - presence / 60);
    } else setTimePresent(0);
  }

  useEffect(() => {
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

  useEffect(() => {
    const timeout = setTimeout(() => {
      if (timePresent < timeUntilCanMarkPresence)
        setTimePresent(timePresent + 1);

      if (event && timePresent > 0 && timePresent % 60 === 0) {
        const presence = JSON.stringify(
          localStorage.getItem(`${event.id}pre`)
        );

        if (parseInt(presence.replace(/"/g, "")) !== timePresent) {
          localStorage.setItem(`${event.id}pre`, JSON.stringify(timePresent));
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
                    <div className="player">
                      <iframe
                        width="829"
                        height="466"
                        src={`https://www.youtube.com/embed/${youtubeVideoId}`}
                        title="YouTube video player"
                        frameBorder="0"
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                        allowFullScreen
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
                <Link href="/#schedule">programação</Link> para descobrir
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
