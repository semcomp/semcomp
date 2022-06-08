import React, { useEffect, useState } from "react";
import API from "../../api";
import _ from "lodash";
import Chip from "@mui/material/Chip";

import Header from "../../components/header";
import Footer from "../../components/footer";
import EventsCalendar from "../../components/events-calendar";
import EditProfile from "./edit-profile";
import Registrations from "./registrations";
import Achievements from "./achievements";

import Tardis from "../../assets/tardis.jpg";
import Ocarina from "../../assets/ocarina.jpg";
import DeLorean from "../../assets/delorean.jpg";
import Agamotto from "../../assets/agamotto.jpg";

import Telegram from "../../assets/telegram-logo.png";

import "./index.css";
import EventsOverview from "../../components/events-overview";
import HouseScores from "../../components/house-scores";

import ImgLogo from "../../assets/logo-24.png";
import { Divider, List, ListItem, ListItemText } from "@mui/material";

import AboutOverflow from "./about-overflow";
import AchievementsImages from "./achievements_images";
import CoffeePayment from "./coffeePayment";

function Profile({ user }) {
  const [userFetched, setUserFetched] = React.useState();
  const [isEditModalOpen, setIsEditModalOpen] = React.useState(false);
  const [isRegistrationsModalOpen, setIsRegistrationsModalOpen] =
    useState(false);
  const [isAchievementsModalOpen, setIsAchievementsModalOpen] = useState(false);
  const [events, setEvents] = useState([]);
  const [achievements, setAchievements] = useState([]);
  const [isAboutOverflowModalOpen, setIsAboutOverflowModalOpen] =
    useState(false);
  const [isCoffeeModalOpen, setIsCoffeeModalOpen] = useState(false);

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

  React.useEffect(() => {
    async function fetchData() {
      const { data } = await API.auth.me();
      setUserFetched(data);
    }
    fetchData();
  }, []);

  // React.useEffect(() => {
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
  const userHouseName = user?.house?.name;
  const userHouseTelegram = user?.house?.telegramLink;

  const houseImageSrc = {
    Tardis,
    Ocarina,
    DeLorean,
    Agamotto,
  }[userHouseName];

  function stringify(string) {
    let removeEmoji = string.replace(
      /([\u2700-\u27BF]|[\uE000-\uF8FF]|\uD83C[\uDC00-\uDFFF]|\uD83D[\uDC00-\uDFFF]|[\u2011-\u26FF]|\uD83E[\uDD10-\uDDFF])/g,
      ""
    );
    let camelCase = _.camelCase(removeEmoji);
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

  function displayDate(date) {
    const options = { hour: "numeric", minute: "numeric" };

    const formatDate = new Date(date);

    const dayDateStr = new Intl.DateTimeFormat("pt-BR", {
      day: "numeric",
      month: "numeric",
    }).format(formatDate);
    const weekDayStr = new Intl.DateTimeFormat("pt-BR", {
      weekday: "long",
    }).format(formatDate);
    const startHourStr = new Intl.DateTimeFormat("pt-BR", options).format(
      formatDate
    );

    const returnDate = `${dayDateStr} (${weekDayStr}) às ${startHourStr}`;
    return returnDate;
  }

  const earnedAchievements = [];
  achievements.map((conquista) => {
    if (conquista.isEarned) {
      earnedAchievements.push(conquista);
    }
  });

  return (
    <div className="profile-page-container">
      {isEditModalOpen && (
        <EditProfile
          onRequestClose={() => {
            setIsEditModalOpen(false);
            removeBodyStyle();
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
      {isAboutOverflowModalOpen && (
        <AboutOverflow
          onRequestClose={() => setIsAboutOverflowModalOpen(false)}
        />
      )}
      {isCoffeeModalOpen && (
        <CoffeePayment
          userHasPaid={userFetched.paid}
          onRequestClose={() => {
            setIsCoffeeModalOpen(false);
            removeBodyStyle();
          }}
        />
      )}
      <Header />
      <main className="main-container">
        <div className="left-side">
          <div className="user-house-card">
            <p className="username">{user.name}</p>
            <p className="course">{user.course}</p>
            {
              <button
                onClick={() => {
                  setIsEditModalOpen(true);
                  blockBodyScroll();
                }}
              >
                Editar
              </button>
            }
          </div>
          <div className="user-house-card">
            <h1 style={{ fontSize: "1.5rem", marginBottom: "1rem" }}>Coffee</h1>
            <p>Pague com PIX o Coffee da Semcomp 25 Beta</p>
            {userFetched?.paid ? (
              <>
                <Chip label="Pago" color="warning" />
                <button
                  onClick={() => {
                    setIsCoffeeModalOpen(true);
                    blockBodyScroll();
                  }}
                >
                  Ver infos coffee
                </button>
              </>
            ) : (
              <>
                <button
                  onClick={() => {
                    setIsCoffeeModalOpen(true);
                    blockBodyScroll();
                  }}
                >
                  Comprar coffee
                </button>
                <Chip label="Não pago" disabled="true" />
              </>
            )}
          </div>
          {/* <div className="user-house-card">
            <h1 style={{ fontSize: "1.5rem", marginBottom: "1rem" }}>
              Overflow
            </h1>
            <strong>Sua casa é...</strong>
            <img alt="User house" src={houseImageSrc} />
            <p className="house-name">{userHouseName}</p>
            <button
              style={{ backgroundColor: "#0088cc" }}
              onClick={() =>
                window.open(userHouseTelegram, "_blank", "noopener noreferrer")
              }
            >
              Entrar no grupo <img src={Telegram} alt="Telegram" />
            </button>
            <button onClick={() => setIsAboutOverflowModalOpen(true)}>
              O que é o Overflow?
            </button>
          </div> */}
          <div className="user-house-card">
            <h1 style={{ fontSize: "1.5rem", marginBottom: "1rem" }}>
              Eventos
            </h1>
            <List
              className="events-list"
              // subheader={
              //   <ListSubheader component="p" id="nested-list-subheader">
              //     Eventos inscritos
              //   </ListSubheader>
              // }
            >
              {events.map((event) =>
                event.items.map((e) =>
                  e.events.map((item) =>
                    item.isSubscribed === true ? (
                      <>
                        <ListItem>
                          <ListItemText
                            primary={`${event.type}:  ${item.name}`}
                            secondary={displayDate(e.startDate)}
                          />
                        </ListItem>
                        <Divider />
                      </>
                    ) : (
                      <></>
                    )
                  )
                )
              )}
            </List>
            {
              <button
                onClick={() => {
                  setIsRegistrationsModalOpen(true);
                  blockBodyScroll();
                }}
              >
                Inscrever
              </button>
            }
          </div>
          {/* <div className="user-house-card">
            <h1 style={{ fontSize: "1.5rem", marginBottom: "1rem" }}>
              Conquistas
            </h1>
            <div className="conquistas-grid">
              {earnedAchievements.slice(0, 6).map((conquista) => {
                const achievementsImageSrc = AchievementsImages(
                  conquista.image
                );
                return (
                  <>
                    <img
                      key={conquista._id}
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
          {/* <HouseScores /> */}
        </div>
        <div className="profile-info-card">
          {/* <EventsOverview />
          <span className="spacing" /> */}
          <EventsCalendar />
        </div>
      </main>
      <Footer />
    </div>
  );
}

export default Profile;
