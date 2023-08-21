import { useEffect, useState } from "react";
import Image from "next/image";

import { QRCodeSVG } from "qrcode.react";
import { Divider, List, ListItem, ListItemText } from "@mui/material";
import Chip from "@mui/material/Chip";

import API from "../api";
import Header from "../components/navbar/index";
import Footer from "../components/Footer";
import EventsCalendar from "../components/events-calendar/EventsCalendar";
import EditProfile from "../components/profile/edit-profile";
import Registrations from "../components/profile/registrations";
import Achievements from "../components/profile/achievements";
import EventsOverview from "../components/events-overview";
import HouseScores from "../components/house-scores";
import AboutOverflow from "../components/profile/about-overflow";
// import AchievementsImages from "../components/profile/achievements_images";
import CoffeePayment from "../components/profile/coffeePayment/coffee-modal";
import RequireAuth from "../libs/RequireAuth";
import PicaPau from "../assets/pica-pau.png";
import OncaPintada from "../assets/onca-pintada.png";
import TatuBola from "../assets/tatu-bola.png";
import LoboGuara from "../assets/lobo-guara.png";
import TelegramIcon from "@mui/icons-material/Telegram";
import ImgLogo from "../assets/logo-24.png";
import { useAppContext } from "../libs/contextLib";
import Card from "../components/Card";
import FundEstudarForm from "../components/profile/fundEstudar";
import MarkAttendanceModal from "../components/profile/MarkAttendanceModal";

function Profile() {
  const { user } = useAppContext();
  const [userFetched, setUserFetched] = useState(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isMarkAttendanceModalOpen, setIsMarkAttendanceModalOpen] = useState(false);
  const [isRegistrationsModalOpen, setIsRegistrationsModalOpen] =
    useState(false);
  const [isAchievementsModalOpen, setIsAchievementsModalOpen] = useState(false);
  const [events, setEvents] = useState([]);
  const [achievements, setAchievements] = useState([]);
  const [isAboutOverflowModalOpen, setIsAboutOverflowModalOpen] = useState(false);  // OBSERVAÇÃO: comentei pq está relacionado a casa do stack overflow
  const [isCoffeeModalOpen, setIsCoffeeModalOpen] = useState(false);
  // const [isFundacaoEstudarFormModalOpen, setIsFundacaoEstudarFormModalOpen] =
  //   useState(true);

  async function fetchAchievements() {
    try {
      const response = await API.achievements.getAchievements();
      setAchievements(response.data);
    } catch (e) {
      console.error(e);
      return [];
    }
  }

  async function fetchSubscribedEvents() {
    try {
      const response = await API.events.getSubscribables();
      setEvents(response.data);
    } catch (e) {
      console.error(e);
      return [];
    }
  }

  useEffect(() => {
    fetchSubscribedEvents();
    fetchAchievements();
  }, []);

  async function fetchUserData() {
    const { data } = await API.auth.me();
    setUserFetched(data);
  }

  useEffect(() => {
    fetchUserData();
  }, []);

  // useEffect(() => {
  //   printFunction();
  // });

  // useEffect(() => {
  //   removeEventsWarning();
  // }, [events]);

  // function printFunction() {
  //   let element = document.getElementsByClassName('events-list')[0];
  //   let children = element.hasChildNodes();
  //   // console.log(element.children);
  //   // console.log(children);
  //   if (!children) {
  //     let warning = document.createElement('p');
  //     warning.classList.add('no-event-warning');
  //     warning.innerHTML = 'Voce nao se inscreveu em nenhum evento';
  //     element.appendChild(warning);
  //   }
  // }

  // function removeEventsWarning() {
  //   let element = document.getElementsByClassName('events-list')[0];
  //   let children = element.hasChildNodes();
  //   if (element.children[0]) {
  //     console.log(element.children[0]);
  //     element.children[0].innerHTML = 'Voce está inscrito nesses eventos:';
  //   }
  // }

  // OBERSERVAÇÃO; relacionado as casas do stackoverflow
  const userHouseName = userFetched?.house?.name;
  const userHouseTelegram = userFetched?.house?.telegramLink;

  const houseImageSrc = {
    "Pica-pau": PicaPau,
    "Onça-pintada": OncaPintada,
    "Tatu-bola": TatuBola,
    "Lobo-guara": LoboGuara,
  }[userHouseName];

  function toPascalCase(str: string) {
    return str
      .replace(/(?:^\w|[A-Z]|\b\w)/g, function (word, index) {
        return word.toUpperCase();
      })
      .replace(/\s+/g, "");
  }

  function stringify(string) {
    let removeEmoji = string.replace(
      /([\u2700-\u27BF]|[\uE000-\uF8FF]|\uD83C[\uDC00-\uDFFF]|\uD83D[\uDC00-\uDFFF]|[\u2011-\u26FF]|\uD83E[\uDD10-\uDDFF])/g,
      ""
    );
    let camelCase = toPascalCase(removeEmoji);
    let result = camelCase.charAt(0).toUpperCase() + camelCase.slice(1);
    return result;
  }

  achievements.forEach((a) => (a.image = stringify(a.title)));

  function removeBodyStyle() {
    document.body.setAttribute("style", ``);
  }

  function blockBodyScroll() {
    document.body.setAttribute(
      "style",
      `overflow-y: hidden; padding-right: 15px;`
    );
  }

  const zeroPad = (num, places) => String(num).padStart(places, "0");

  function formatTime(startDate, endDate) {
    const start = new Date(startDate);
    const end = new Date(endDate);

    const week = [
      "Domingo",
      "Segunda-Feira",
      "Terça-Feira",
      "Quarta-Feira",
      "Quinta-Feira",
      "Sexta-Feira",
      "Sábado",
    ];

    const DayOfTheWeek = `${start.getDay()}`;

    const day = `${week[DayOfTheWeek]}`;

    const dayInNumbers = `${zeroPad(start.getDate(), 2)}/${zeroPad(
      start.getMonth() + 1,
      2
    )}`;

    const startTime = `${zeroPad(start.getHours(), 2)}:${zeroPad(
      start.getMinutes(),
      2
    )}`;
    const endTime = `${zeroPad(end.getHours(), 2)}:${zeroPad(
      end.getMinutes(),
      2
    )}`;

    return `${day} (${dayInNumbers}), ${startTime} às ${endTime}`;
  }

  const earnedAchievements = [];
  achievements.map((conquista) => {
    if (conquista.isEarned) {
      earnedAchievements.push(conquista);
    }
  });

  return (
    <div className="min-h-full w-full flex flex-col">
      {isEditModalOpen && (
        <EditProfile
          onRequestClose={() => {
            setIsEditModalOpen(false);
            removeBodyStyle();
            fetchUserData();
          }}
        />
      )}
      {isMarkAttendanceModalOpen && (
        <MarkAttendanceModal
          onRequestClose={() => {
            setIsMarkAttendanceModalOpen(false);
            removeBodyStyle();
            fetchUserData();
          }}
        />
        )}
      {isRegistrationsModalOpen && (
        <Registrations
          onRequestClose={() => {
            setIsRegistrationsModalOpen(false);
            removeBodyStyle();
          }}
        />
      )}
      {isAchievementsModalOpen && (
        <Achievements
          onRequestClose={() => {
            setIsAchievementsModalOpen(false);
            removeBodyStyle();
          }}
          conquistasLista={achievements}
        />
      )}
      {/** Relacionado as casa do stackoverflow */}
      {isAboutOverflowModalOpen && (
        <AboutOverflow
          onRequestClose={() => setIsAboutOverflowModalOpen(false)}
        />
      )}

      {isCoffeeModalOpen && (
        <CoffeePayment
          userHasPaid={userFetched?.payment?.status === "approved"}
          onRequestClose={() => {
            setIsCoffeeModalOpen(false);
            removeBodyStyle();
          }}
        />
      )}
      <Header />
      <main className="p-8 h-full w-full self-center justify-center col-gap-4 min-h-[70vh] md:flex">
        <div className="flex flex-col self-start w-full md:w-60">
          {userFetched && (
            <>
              <Card className="flex flex-col items-center p-9 w-full mb-6">
                {/* <QRCodeSVG value={userFetched && userFetched.id} /> */}
                <p className="font-bold text-xl text-center my-3">
                  {userFetched.name}
                </p>
                <p className="text-center">{userFetched.course}</p>
                {
                  <div className="flex flex-col pt-3">
                    <button
                      onClick={() => {
                        setIsEditModalOpen(true);
                        blockBodyScroll();
                      }}
                      className="bg-tertiary text-white p-2 rounded-lg"
                    >
                      Editar
                    </button>
                    {/* <button BETA NAO TEM PRESENCA
                      onClick={() => {
                        setIsMarkAttendanceModalOpen(true);
                        blockBodyScroll();
                      }}
                      className="bg-primary text-white p-2 rounded-lg my-3"
                    >
                      Scanear Presença 
                    </button> */}
                  </div>
                }
              </Card>
              <Card className="flex flex-col items-center p-9 w-full mb-6">
                <h1 style={{ fontSize: "1.5rem", marginBottom: "1rem" }}>
                  Coffee
                </h1>
                <p style={{ fontSize: "1rem" }}>Pague com PIX o Coffee</p>
                {userFetched.payment.status === "approved" ? (
                  <>
                    <Chip label="OK" color="success" />
                    {/* <Chip
                      className="mt-3"
                      // label={`Camiseta ${userFetched.payment.tShirtSize}`}
                    />
                    <button
                      onClick={() => {
                        setIsCoffeeModalOpen(true);
                        blockBodyScroll();
                      }}
                    >
                      Ver infos pacote
                    </button> */}
                    <p style={{ fontSize: "0.7rem" }}>Caso seu QR code não carregou, verifique se seu e-mail está correto</p>
                  </>
                ) : (
                  <>
                    <button
                      onClick={() => {
                        setIsCoffeeModalOpen(true);
                        blockBodyScroll();
                      }}
                      className="bg-tertiary text-white p-2 rounded-lg mt-2"
                    >
                      Comprar Coffee
                    </button>
                    <Chip className="mt-3" label="---" disabled={true} />
                  </>
                )}
              </Card>
            </>
          )}
          {/** OBSERVAÇÃO: Não precisamos de informações relacionadas a casa, já que a beta não tem */}
          {userFetched && (
            <Card className="flex flex-col items-center p-9 w-full mb-6">
              <h1 style={{ fontSize: "1.5rem", marginBottom: "1rem" }}>
                Overflow
              </h1>
              <strong>Sua casa é...</strong>
              <Image alt="User house" src={houseImageSrc} />
              <p className="house-name">{userFetched.house.name}</p>
              <a
                className="bg-[#0088cc] text-white p-2 rounded-lg mt-2 text-center"
                href={userHouseTelegram}
                target="_blank"
                rel="noopener noreferrer"
              >
                Entrar no grupo
                <TelegramIcon />
              </a> 
              <button onClick={() => setIsAboutOverflowModalOpen(true)}>
                  O que é o Overflow?
                </button>
            </Card>
          )}
          <Card className="flex flex-col items-center p-9 w-full mb-6">
            <h1 style={{ fontSize: "1rem", marginBottom: "1rem" }}>
              Inscrições em Eventos
            </h1>
            <List className="events-list text-center">
              {Object.keys(events).map((type) =>
                events[type].map((e) =>
                  e.events.map((item) => {
                    if (item.isSubscribed === true) {
                      return (
                        <div key={item.name}>
                          <ListItem>
                            <ListItemText
                              primary={`${type}:  ${item.name}`}
                              secondary={
                                item.link ? (
                                  <a
                                    target="_blank"
                                    className="underline text-tertiary text-center pb-4 text-base"
                                    href={item.link}
                                  >
                                    Acesse aqui
                                  </a>
                                ) : (
                                  formatTime(item.startDate, item.endDate)
                                )
                              }
                            />
                          </ListItem>
                          <Divider />
                        </div>
                      );
                    }
                  })
                )
              )}
            </List>
            {
              <button
                onClick={() => {
                  setIsRegistrationsModalOpen(true);
                  blockBodyScroll();
                }}
                className="bg-tertiary text-white p-2 rounded-lg mt-2"
              >
                Inscrever
              </button>
            }
          </Card>
          {/* <div className="rounded-lg p-4 mb-4 self-start border-solid border h-full flex flex-col items-center justify-center w-full max-w-md bg-white">
            <h1 style={{ fontSize: "1.5rem", marginBottom: "1rem" }}>
              Conquistas
            </h1>
            <div className="grid auto-cols-auto auto-rows-auto">
              {earnedAchievements.slice(0, 6).map((conquista) => {
                const achievementsImageSrc = AchievementsImages(
                  conquista.image
                );
                return (
                  <>
                    <img
                      key={conquista.id}
                      src={achievementsImageSrc}
                      alt={conquista.title}
                      style={{ padding: ".3rem", maxHeight: "80px" }}
                    />
                  </>
                );
              })}
            </div>
            {
              <button
                onClick={() => {
                  setIsAchievementsModalOpen(true);
                  blockBodyScroll();
                }}
              >
                Ver mais
              </button>
            }
          </div> */}
          {/* <Card className="flex flex-col items-center p-9 w-full mb-6">
            <h1 style={{ fontSize: "1.5rem", marginBottom: "1rem" }}>
              Pontuações
            </h1>
            <HouseScores />
          </Card> */}
        </div>
        <div>
          <Card className="flex flex-col items-center p-9 mb-6 max-w-4xl">
            <EventsOverview />
          </Card>
          <Card className="flex flex-col items-center p-9 mb-6 max-w-4xl">
            <EventsCalendar />
          </Card>
        </div>
      </main>
      <Footer />
    </div>
  );
}

export default RequireAuth(Profile);
