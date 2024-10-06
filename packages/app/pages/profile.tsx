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
import CoffeePayment from "../components/profile/coffeePayment/coffee-modal";
import RequireAuth from "../libs/RequireAuth";

// Casas
import Indie from "../assets/26-imgs/brasao_indie_complete.png";
import Rock from "../assets/26-imgs/brasao_rock_complete.png";
import Funk from "../assets/26-imgs/brasao_funk_complete.png";
import Pop from "../assets/26-imgs/brasao_pop_complete.png";
import TelegramIcon from "@mui/icons-material/Telegram";
import ImgLogo from "../assets/logo-24.png";

import CameraAltIcon from "@mui/icons-material/CameraAlt";
import { useAppContext } from "../libs/contextLib";
import Card from "../components/Card";
//import FundEstudarForm from "../components/profile/fundEstudar";
import MarkAttendanceModal from "../components/profile/MarkAttendanceModal";
import AddAchievementModal from "../components/profile/AddAchievementModal";
import { TShirtSize } from "../components/profile/coffeePayment/coffee-step-2";
import { KitOption } from "../components/profile/coffeePayment/coffee-step-1";
import Sidebar from "../components/sidebar";
import Navbar from "../components/navbar/index";
import ConfirmarCracha from "../components/profile/ModalConfirmacaoCracha/cracha";

function Profile() {
  const { config } = useAppContext();
  const [eventCount, setEventCount] = useState(null);
  const [userFetched, setUserFetched] = useState(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isMarkAttendanceModalOpen, setIsMarkAttendanceModalOpen] =
    useState(false);
  const [IsAddAchievementModalOpen, setIsAddAchievementModalOpen] =
    useState(false);
  const [isRegistrationsModalOpen, setIsRegistrationsModalOpen] =
    useState(false);
  const [isAchievementsModalOpen, setIsAchievementsModalOpen] = useState(false);
  const [events, setEvents] = useState([]);
  const [achievements, setAchievements] = useState([]);
  const [earnedAchievements, setEarnedAchievements] = useState([]);
  const [closeSales, setCloseSales] = useState(false);
  useEffect(() => {
    getRemainingCoffee();
    fetchUserData();
    fetchAchievements();
    fetchSubscribedEvents();
  }, [config]); // Adicionado config como dependência
  const [isAboutOverflowModalOpen, setIsAboutOverflowModalOpen] =
    useState(false); // OBSERVAÇÃO: está relacionado a casa do stack overflow
  const [isCoffeeModalOpen, setCoffeeModalOpen] = useState(false);
  const [isCrachaModalOpen, setIsCrachaModalOpen] = useState(false);
  const openCrachaModal = () => {
    setIsCrachaModalOpen(true);
  };

  const closeCrachaModal = () => {
    setIsCrachaModalOpen(false);
  };

  //const [isFundacaoEstudarFormModalOpen, setIsFundacaoEstudarFormModalOpen] =
  //   useState(true);

  useEffect(() => {
    getRemainingCoffee();
  }, []);

  async function getRemainingCoffee() {
    try {
      const response = await API.config.checkRemainingCoffee();
      setCloseSales(response.data <= 0);
    } catch (e) {
      console.error(e);
      return null;
    }
  }

  async function fetchAchievements() {
    if (!config || !config.openAchievement) {
      console.log("error");
      return [];
    }

    try {
      const response = await API.achievements.getAchievements();
      setAchievements(response.data);

      const earnAchievements = [];
      response.data.map((conquista) => {
        if (conquista.isEarned) {
          earnAchievements.push(conquista);
        }
      });
      setEarnedAchievements(earnAchievements);
    } catch (e) {
      console.error(e);
      return [];
    }
  }

  async function fetchSubscribedEvents() {
    try {
      const response = await API.events.getSubscribables();
      setEvents(response.data);
      setEventCount(Object.keys(response.data).length);
    } catch (e) {
      console.error(e);
      return [];
    }
  }

  useEffect(() => {
    fetchSubscribedEvents();
  }, []);

  useEffect(() => {
    fetchAchievements();
  }, [config]);

  async function fetchUserData() {
    const { data } = await API.auth.me();
    setUserFetched(data);
  }

  useEffect(() => {
    fetchUserData();
  }, []);

  useEffect(() => {
    printFunction();
  });

  useEffect(() => {
    removeEventsWarning();
  }, [events]);

  function printFunction() {
    let element = document.getElementsByClassName("events-list")[0];

    if (element) {
      let children = element.hasChildNodes();
      if (!children) {
        let warning = document.createElement("p");
        warning.classList.add("no-event-warning");
        warning.classList.add("text-[#A4A4A4]");
        warning.classList.add("leading-3");
        warning.innerHTML = "Voce não se inscreveu em nenhum evento.";
        element.appendChild(warning);
      }
    }
  }

  function removeEventsWarning() {
    let element = document.getElementsByClassName("events-list")[0];
    if (element) {
      let children = element.childElementCount;
      if (children > 1) {
        element.children[0].innerHTML = "Voce está inscrito nesses eventos:";
      }
    }
  }

  // OBERSERVAÇÃO; relacionado as casas do stack overflow

  const userHouseName = userFetched?.house?.name;
  const userHouseTelegram = userFetched?.house?.telegramLink;

  const houseImageSrc = {
    Indie: Indie,
    Pop: Pop,
    Funk: Funk,
    Rock: Rock,
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

  return (
    <div className="min-h-screen w-full flex flex-col justify-between bg-[url('../assets/27-imgs/profile-bg.png')] bg-cover font-secondary text-sm">
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
      {IsAddAchievementModalOpen && (
        <AddAchievementModal
          onRequestClose={() => {
            setIsAddAchievementModalOpen(false);
            removeBodyStyle();
            fetchUserData();
          }}
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
            setCoffeeModalOpen(false);
            removeBodyStyle();
          }}
        />
      )}
      <Navbar />
      <Sidebar />
      <main className="p-8 h-full w-full justify-center col-gap-4 md:flex pt-16">
        <div className="flex flex-col self-start w-full md:w-60">
          {userFetched && (
            <>
              <Card className="flex flex-col items-center p-9 w-full mb-6 bg-white rounded-lg">
                <QRCodeSVG value={userFetched && userFetched.id} />
                <p className="text-xl text-center my-3">{userFetched.name}</p>
                <p className="text-center">{userFetched.course}</p>
                {
                  <div className="flex flex-col pt-3">
                    <button
                      onClick={() => {
                        setIsEditModalOpen(true);
                        blockBodyScroll();
                      }}
                      className="bg-primary text-white p-2 rounded-lg"
                    >
                      Editar
                    </button>
                    {/* <button 
                      onClick={() => {
                        setIsMarkAttendanceModalOpen(true);
                        blockBodyScroll();
                      }}
                      className="bg-primary text-white p-2 rounded-lg my-3"
                    >
                      Escanear Presença 
                    </button> */}
                  </div>
                }
              </Card>
              <Card className="flex flex-col items-center p-9 w-full mb-6 bg-white rounded-lg">
                <h1 className="text-xl py-2">{KitOption[config.kitOption]}</h1>
                {userFetched.payment.status === "approved" ? (
                  <>
                    <Chip label="Pago" color="success" />
                    {/* {userFetched.payment.tShirtSize !== TShirtSize.NONE && (
                      <Chip
                        className="mt-3"
                        label={`Camiseta ${userFetched.payment.tShirtSize}`}
                      />
                    )} */}
                  </>
                ) : (
                  <>
                    <Chip className="mb-4" label="Sem Coffee" disabled={true} />
                    {config.openSales ? (
                      <>
                        {!closeSales ? (
                          <>
                            <p className="text-sm pb-2">Pague com PIX</p>
                            <button
                              onClick={() => {
                                setCoffeeModalOpen(true);
                                blockBodyScroll();
                              }}
                              className="bg-primary text-white p-3 rounded-lg mt-2"
                            >
                              Comprar!
                            </button>
                          </>
                        ) : (
                          <>
                            <p className="text-center">
                              {" "}
                              As vendas estão esgotadas!{" "}
                            </p>
                          </>
                        )}
                      </>
                    ) : (
                      <>
                        <p className="text-center">
                          {" "}
                          Não há vendas no momento.{" "}
                        </p>
                      </>
                    )}
                  </>
                )}
              </Card>
            </>
          )}
          {isCrachaModalOpen && (
            <ConfirmarCracha
              user={userFetched}
              onRequestClose={closeCrachaModal}
            />
          )}

          {/* ABRIR AQUI QUANDO FOR PARA MOSTRAR A CASA */}
          {/* {userFetched && (
            <Card className="flex flex-col items-center p-9 w-full mb-6">
              <h1 style={{ fontSize: "1.5rem", marginBottom: "1rem" }}>
                Overflow
              </h1>
              <strong>Sua casa é...</strong>
              <Image className="w-full" alt="User house" src={houseImageSrc} />
              <p className="house-name text-lg">{userFetched.house.name}</p>
              <a
                className="bg-[#0088cc] text-white p-2 rounded-lg mt-2 text-center"
                href={userHouseTelegram}
                target="_blank"
                rel="noopener noreferrer"
              >
                Entrar no grupo
                <TelegramIcon />
              </a> 
              <button className="text-sm mt-5 text-tertiary" onClick={() => setIsAboutOverflowModalOpen(true)}>
                  O que é o Overflow?
                </button>
            </Card>
          )} */}

          {/* ABRIR AQUI PARA MOSTRAR INSCRIÇÕES */}
          {eventCount > 0 && (
            <Card className="flex flex-col items-center p-9 w-full mb-6 text-center bg-white rounded-lg">
              <h1 className="text-xl">Inscrições em Eventos</h1>
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
                                      className="underline text-tertiary text-center pb-4"
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
                  className="bg-primary text-white p-2 rounded-lg mt-2"
                >
                  Inscrever
                </button>
              }
            </Card>
          )}

          {userFetched && config.openAchievement && (
            <div className="rounded-lg p-4 mb-4 self-start border-solid border h-full flex flex-col items-center justify-center w-full max-w-md bg-white">
              <div className="flex items-center justify-between w-full">
                <h1
                  className="flex-1 text-center"
                  style={{ fontSize: "1.5rem", marginBottom: "1rem" }}
                >
                  Conquistas
                </h1>
                <CameraAltIcon
                  className="mb-4 ml-auto"
                  onClick={() => {
                    setIsAddAchievementModalOpen(true);
                    blockBodyScroll();
                  }}
                  cursor="pointer"
                  titleAccess="Escanear Conquista"
                />
              </div>
              <div className="grid auto-cols-auto auto-rows-auto">
                {earnedAchievements.slice(0, 6).map((conquista) => {
                  return (
                    <>
                      <img
                        key={conquista.id}
                        src={conquista.imageBase64}
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
            </div>
          )}

          {/* ABRIR AQUI QUANDO FOR PARA MOSTRAR A CASA */}
          {/* <Card className="flex flex-col items-center p-9 w-full mb-6">
            <h1 style={{ fontSize: "1.5rem", marginBottom: "1rem" }}>
              Pontuações
            </h1>
            <HouseScores />
          </Card> */}
        </div>
        <div>
          {/* <Card className="flex flex-col items-center p-9 mb-6 max-w-4xl bg-white rounded-lg">
            <EventsOverview />
          </Card> */}
          <Card className="flex flex-col items-center p-9 mb-6 max-w-4xl bg-white rounded-lg">
            <p className="events-overview-component__title text-xl mb-8">
              Eventos
            </p>
            <EventsCalendar />
          </Card>
        </div>
      </main>
      <Footer />
    </div>
  );
}

export default RequireAuth(Profile);
