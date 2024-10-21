import { useEffect, useState } from "react";
import Image from "next/image";

import { QRCodeSVG } from "qrcode.react";
import { Divider, List, ListItem, ListItemText, Tooltip } from "@mui/material";
import Chip from "@mui/material/Chip";
import DoneIcon from '@mui/icons-material/Done';
import HourglassTopIcon from '@mui/icons-material/HourglassTop';
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
import Handlers from "../../app/api/handlers";
// Casas
import TelegramIcon from "@mui/icons-material/Telegram";
import ImgLogo from "../assets/logo-24.png";

import CameraAltIcon from '@mui/icons-material/CameraAlt';
import { useAppContext } from "../libs/contextLib";
import Card from "../components/Card";
import FundEstudarForm from "../components/profile/fundEstudar";
import MarkAttendanceModal from "../components/profile/MarkAttendanceModal";
import AddAchievementModal from "../components/profile/AddAchievementModal";
import { TShirtSize } from "../components/profile/coffeePayment/coffee-step-2";
import Sidebar from "../components/sidebar";
import Navbar from "../components/navbar/index";
import AnimatedBG from "./animatedBG";
import { NewFooter } from "./newFooter";

import Symbiosia from "../assets/27-imgs/symbiosia-pixilart.png"; 
import Cybertechna from "../assets/27-imgs/cybertechna-pixilart.png"; 
import Stormrock from "../assets/27-imgs/stormrock-pixilart.png"; 
import Arcadium from "../assets/27-imgs/arcadium-pixilart.png";  
import { Info } from "@mui/icons-material";
import { PaymentStatus } from "../libs/constants/payment-status";
import ConfirmarCracha from "../components/profile/crachasemcomp/index";
import FundacaoEstudarLogo from "../components/profile/fundEstudar/index"

function Profile() {
  const { config } = useAppContext();
  const [eventCount, setEventCount] = useState(null);
  const [userFetched, setUserFetched] = useState(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isMarkAttendanceModalOpen, setIsMarkAttendanceModalOpen] = useState(false);
  const [IsAddAchievementModalOpen, setIsAddAchievementModalOpen] = useState(false);
  const [isRegistrationsModalOpen, setIsRegistrationsModalOpen] = useState(false);
  const [isAchievementsModalOpen, setIsAchievementsModalOpen] = useState(false);
  const [events, setEvents] = useState([]);
  const [showCalendar, setShowCalendar] = useState(false);
  const [achievements, setAchievements] = useState([]);
  const [earnedAchievements, setEarnedAchievements] = useState([]);
  const [closeSales, setCloseSales] = useState(false);
  const [isAboutOverflowModalOpen, setIsAboutOverflowModalOpen] = useState(false);  // OBSERVAÇÃO: está relacionado a casa do stack overflow
  const [isCoffeeModalOpen, setCoffeeModalOpen] = useState(false);
  const [allSales, setAllSales] = useState([]);
  const [dataToCoffeeStep3, setDataToCoffeeStep3] = useState(null);

  //const [isFundacaoEstudarFormModalOpen, setIsFundacaoEstudarFormModalOpen] =
  //  useState(true);
  const [isConfirmarCrachaModalOpen, setIsConfirmarCrachaModalOpen] = useState(true);


  async function fetchAchievements() {
    if (!config || !config.openAchievement) {
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

  async function shouldShowCalendar() {
    try {
      const response = await API.events.getAll();
      setShowCalendar(Object.keys(response.data).length > 0);
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
    const allSales = await API.sales.getSales().then((res) => res.data);

    if (data && data.payments) {
      data.payments.forEach((payment: { sale: any; saleOption: any[]; }) => {
        payment.sale = payment.saleOption.map((saleId) => allSales.find((sale: { id: any; }) => sale.id === saleId));
      });
    }

    setUserFetched(data);
    setAllSales(allSales);
  }

  useEffect(() => {
    fetchUserData();
  }, []);


  useEffect(() => {
    printFunction();
  });

  useEffect(() => {
    removeEventsWarning();
    shouldShowCalendar();
  }, [events]);

  function printFunction() {
    let element = document.getElementsByClassName('events-list')[0];
    
    if(element){
      let children = element.hasChildNodes();
      if (!children) {
        let warning = document.createElement('p');
        warning.classList.add('no-event-warning');
        warning.classList.add('text-[#A4A4A4]');
        warning.classList.add('leading-3');
        warning.innerHTML = 'Voce não se inscreveu em nenhum evento.';
        element.appendChild(warning);
      }

    }
  }

  function removeEventsWarning() {
    let element = document.getElementsByClassName('events-list')[0];
    if(element){
      let children = element.childElementCount;
      if (children > 1) {
        element.children[0].innerHTML = 'Voce está inscrito nesses eventos:';
      }
    }
  }
  
  const userHouseName = userFetched?.house?.name;
  const userHouseTelegram = userFetched?.house?.telegramLink;
  const houseImageSrc = {
    "Symbiosia": Symbiosia.src,
    "Stormrock": Stormrock.src,
    "Arcadium": Arcadium.src,
    "Cybertechna": Cybertechna.src,
  }[userHouseName];

  
  const backgroundAuthor = {
    "Symbiosia": " Adam - @adamfergusonart [art, animation] | Prism - @GFLK_pik [art, animation] | Joey - @JalopesTL [music, animation] | Pik - @PictoDev [art, animation]",
    "Stormrock": "Artstation: kenzee wee",
    "Arcadium": "Tumblr: @the2dstagesfg",
    "Cybertechna": "Deviantart: o0mikeking0o",
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

  const [imageIndex, setImageIndex] = useState<number>(10);

  const timeToImage = [
    { start: 5, end: 7, imgIndex: 0 },
    { start: 7, end: 8, imgIndex: 1 },
    { start: 8, end: 10, imgIndex: 2 },
    { start: 10, end: 12, imgIndex: 3 },
    { start: 12, end: 14, imgIndex: 4 },
    { start: 14, end: 16, imgIndex: 5 },
    { start: 16, end: 17, imgIndex: 6 },
    { start: 17, end: 18, imgIndex: 7 },
    { start: 18, end: 19, imgIndex: 8 },
    { start: 19, end: 22, imgIndex: 9 },
    { start: 0, end: 5, imgIndex: 10 },
  ];

  useEffect(() => {
    const currentHour = new Date().getHours();
    const matchedImage = timeToImage.find(({ start, end }) => currentHour >= start && currentHour < end);
    setImageIndex(
      // 0
      matchedImage?.imgIndex ?? 10,
    );
  }, []);

  return (
    userFetched && userFetched.house &&
    <div className="min-h-screen w-full flex flex-col justify-between font-secondary text-sm"
      style={{
        backgroundImage: `url(${userFetched.house.name}.gif)`,
        // backgroundImage: `url(Stormrock.gif)`,
        backgroundSize: "cover",
        backgroundRepeat: "no-repeat",
        backgroundPosition: "center"
      }}
    >
    <Navbar />
    <Sidebar />
      { isEditModalOpen && (
        <EditProfile
          onRequestClose={() => {
            setIsEditModalOpen(false);
            removeBodyStyle();
            fetchUserData();
          }}
        />
      )}
      { isMarkAttendanceModalOpen && (
        <MarkAttendanceModal
          onRequestClose={() => {
            setIsMarkAttendanceModalOpen(false);
            removeBodyStyle();
            fetchUserData();
          }}
        />
        )}
      { isRegistrationsModalOpen && (
        <Registrations
          onRequestClose={() => {
            setIsRegistrationsModalOpen(false);
            removeBodyStyle();
          }}
        />
      )}
      { isAchievementsModalOpen && (
        <Achievements
          onRequestClose={() => {
            setIsAchievementsModalOpen(false);
            removeBodyStyle();
          }}
          conquistasLista={achievements}
        />
      )}
      { IsAddAchievementModalOpen && (
        <AddAchievementModal
          onRequestClose={() => {
            setIsAddAchievementModalOpen(false);
            removeBodyStyle();
            fetchUserData();
          }}
        />
        ) 
      }
      {/** Relacionado as casa do stackoverflow */}
      {isAboutOverflowModalOpen && (
        <AboutOverflow
          onRequestClose={() => setIsAboutOverflowModalOpen(false)}
        />
      )}

      {isCoffeeModalOpen && (
        <CoffeePayment
          onRequestClose={() => {
            setCoffeeModalOpen(false);
            setDataToCoffeeStep3(null);
            fetchUserData();
            removeBodyStyle();
          }}
          allSales={allSales}
          dataOpenStep3={dataToCoffeeStep3}
          userPayments={userFetched.payments}
        />
      )}
      <div>
      {/* <AnimatedBG imageIndex={imageIndex} /> */}

      <main className="p-8 h-full w-full justify-center col-gap-4 md:flex text-white pt-16 sm:pt-20 sm:items-center z-20">
        <div className="flex flex-col h-full md:w-[60%] md:grid md:grid-cols-2 md:gap-4 z-20 mobile:grid mobile:grid-cols-1 mobile:gap-4">
        <div className="flex flex-col w-full md:grid md:grid-cols-1 gap-4 z-20">
          {userFetched && (
            <>
              <Card className="flex flex-col items-center p-9 w-full bg-[#222333] rounded-lg justify-center">
                <div className="ml-2">
                    <Tooltip
                      arrow
                      placement="top-start"
                      title={userFetched.wantNameTag != null ? userFetched.wantNameTag ? "Você optou por receber o crachá físico!" : "Você optou por não receber o crachá físico" : ""}
                      enterTouchDelay={1}
                    >
                      <div className="border-8 border-solid rounded-lg border-white">
                        <QRCodeSVG value={userFetched && userFetched.id} />
                      </div>
                  </Tooltip>
                  </div>
                <p className="flex flex-row text-xl text-center my-3">
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
                      className={`bg-${userHouseName} text-white hover:bg-white hover:text-primary p-2 rounded-lg`}
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
            </>
          )}

          { eventCount == 0 &&
            <Card className="flex flex-col items-center p-9 bg-[#222333] w-full rounded-lg justify-center">
                <h1 className="text-xl">
                  Compras
                </h1>
                <div className="flex flex-wrap justify-center">
                  {userFetched && userFetched.payments && (
                    userFetched.payments.map((payment: {
                        sale: any[]; status: string, price: number, tShirtSize: string 
                    }, index: number) => (
                      (payment.status === PaymentStatus.APPROVED || payment.status === PaymentStatus.PENDING) && (
                        <div key={`div-${index}`} className="mr-2 my-2">
                          <Tooltip 
                            key={`tooltip-${index}`}
                            title={
                              payment.status === PaymentStatus.APPROVED 
                                ? "Pagamento confirmado!" 
                                : "Para acessar o QRCode, clique aqui"
                            }
                          >
                            <Chip
                              sx={{
                                height: 'auto',
                                '& .MuiChip-label': {
                                  display: 'block',
                                  whiteSpace: 'normal',
                                },
                              }}
                              key={`chip-${index}`}
                              label={`${payment.sale.map(sale => 
                                sale.hasTShirt ?  `${sale.name} - ${payment.tShirtSize}` : sale.name
                              ).join(", ")}`}
                              color={payment.status === PaymentStatus.APPROVED ? "success" : "warning"}
                              clickable={payment.status === PaymentStatus.APPROVED ? false : true}
                              onClick={() => {
                                if (payment.status === PaymentStatus.PENDING) {
                                  setDataToCoffeeStep3(payment);
                                  setCoffeeModalOpen(true);
                                  blockBodyScroll();
                                }
                              }}
                              icon={payment.status === PaymentStatus.APPROVED ? 
                                <DoneIcon></DoneIcon>
                                :
                                <HourglassTopIcon></HourglassTopIcon>
                              }
                            />
                          </Tooltip>
                        </div>
                      )
                    ))
                  )}
                </div>
                { config && config.openSales ? (
                    <>
                    { !closeSales ? (
                        <>
                          <p className="text-sm pb-2 text-center text-[#A4A4A4]">Compre o Coffee e o Kit da Semcomp com Pix!</p>
                        <button
                          onClick={() => {
                          setCoffeeModalOpen(true);
                          blockBodyScroll();
                          }}
                          className={`bg-${userHouseName} text-white p-3 rounded-lg mt-2`}>
                          Comprar!
                        </button>
                        </>
                      ) : 
                      <>
                        <p className="text-center"> As vendas estão esgotadas! </p>
                      </>
                    }
                    </>
                  ) : 
                    <>
                      <p className="text-center"> Não há vendas no momento. </p>
                    </>
                }
              </Card>}

          {/* ABRIR AQUI PARA MOSTRAR INSCRIÇÕES */}
          { eventCount > 0 &&
            (
            <Card className="flex flex-col items-center p-9 w-full bg-[#222333] text-white text-center rounded-lg justify-center">
              <h1 className="text-xl">
                Inscrições em Eventos
              </h1>
              <List className="events-list text-center grid grid-cols-1 gap-4">
                {Object.keys(events).map((type) =>
                  events[type].map((e) =>
                    e.events.map((item) => {
                      if (item.isSubscribed === true) {
                        return (
                          <div key={item.name} className="bg-[#2f2e46] rounded-lg">
                            <ListItem>
                              <ListItemText
                                primary={
                                  <div className="flex flex-row">
                                    <div className="text-secondary mr-2">
                                      {`${type} |`}
                                    </div>
                                    <div className="text-white">
                                      {`${item.name}`}
                                    </div>
                                  </div>
                                }
                                secondary={
                                  item.link ? (
                                    <a
                                      target="_blank"
                                      className="underline text-center pb-4"
                                      href={item.link}
                                    >
                                      Acesse aqui
                                    </a>
                                  ) : (
                                    <div className="text-[#c1c1c1]">
                                      {formatTime(item.startDate, item.endDate)}
                                    </div>
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
                  className={`bg-${userHouseName} text-white p-3 rounded-lg mt-2 hover:bg-white hover:text-primary`}
                >
                  Inscreva-se!
                </button>
              }
            </Card>
          )}
          {/*isFundacaoEstudarFormModalOpen && (
            <FundEstudarForm
              onRequestClose={() => setIsFundacaoEstudarFormModalOpen(false)}
            />
          )*/}

          {userFetched && config && config.enableWantNameTag && isConfirmarCrachaModalOpen && (
            <ConfirmarCracha
              onRequestClose={() => setIsConfirmarCrachaModalOpen(false)}
              user={userFetched}
            />
          )}

{userFetched && config.openAchievement && (
  <Card className="flex flex-col items-center p-9 w-full bg-[#222333] text-center rounded-lg justify-center">
    <div className="flex items-center justify-between w-full">
      <h1 className="flex-1 text-center" style={{ fontSize: "1.5rem", marginBottom: "1rem" }}>
        Conquistas
      </h1>       
    </div>
    {/* <div className="grid auto-cols-auto auto-rows-auto">
      {earnedAchievements.slice(0, 6).map((conquista) => (
        <img
          key={conquista.id}
          src={conquista.imageBase64}
          alt={conquista.title}
          style={{ padding: ".3rem", maxHeight: "80px" }}
          className="rounded-lg"
        />
      ))}
    </div> */}
    <div className="grid gap-4 grid-cols-2 phone:grid-cols-1">
      <button
        onClick={() => {
          setIsAchievementsModalOpen(true);
          blockBodyScroll();
        }}
        className={`bg-${userHouseName} text-white p-3 rounded-lg mt-2 hover:bg-white hover:text-primary`}
      >
        Ver conquistas
      </button>
      <button
        onClick={() => {
          setIsAddAchievementModalOpen(true);
          blockBodyScroll();
        }}
        className={`bg-${userHouseName} text-white p-3 rounded-lg mt-2 flex flex-row items-center justify-center hover:bg-white hover:text-primary`}
      >
        <p className="mr-2">Escanear conquista</p>
        <CameraAltIcon 
          className=""
          cursor="pointer"
          titleAccess="Escanear Conquista"
        />
      </button>
    </div>
    
  </Card>
)}

          {/* ABRIR AQUI QUANDO FOR PARA MOSTRAR A CASA */}
          {/* 
          <Card className="flex flex-col items-center p-9 w-full mb-6">
            <h1 style={{ fontSize: "1.5rem", marginBottom: "1rem" }}>
              Pontuações
            </h1>
            <HouseScores />
          </Card> 
          */}
        </div>
        <div className="flex flex-col w-full md:grid md:grid-cols-1 gap-4 ">
          {userFetched && (
            <Card className="flex flex-col items-center p-9 bg-[#222333] w-full rounded-lg h-full justify-center">
                <h1 style={{ fontSize: "1.5rem", marginBottom: "1rem" }}>
                  Overflow
                </h1>
                <strong>Sua casa é...</strong>
                <img className="w-full object-fill max-w-sm m-2 rounded-lg" alt="User house" src={houseImageSrc} />
                <p className="house-name text-2xl">{userFetched.house.name}</p>
                <a
                  className={`bg-${userHouseName} text-white p-2 rounded-lg mt-2 text-center text-xs hover:bg-white hover:text-primary`}
                  href={userHouseTelegram}
                  target="_blank"
                  rel="noopener noreferrer"
                  >
                  Entrar no grupo da casa 
                  <TelegramIcon />
                </a> 
                <a
                  className={`bg-${userHouseName} text-white p-2 rounded-lg mt-2 text-center text-xs hover:bg-white hover:text-primary`}
                  href="https://t.me/+XszTILsnIoAyYjEx"
                  target="_blank"
                  rel="noopener noreferrer"
                  >
                  Entrar no grupo do Overflow 
                  <TelegramIcon />
                </a> 
                <button className="text-sm mt-5 text-white hover:underline" onClick={() => setIsAboutOverflowModalOpen(true)}>
                    O que é o Overflow?
                </button>
              </Card>
            )}

         { eventCount > 0 &&
            <Card className="flex flex-col items-center p-9 bg-[#222333] w-full rounded-lg justify-center">
                <h1 className="text-xl">
                  Compras
                </h1>
                <div className="flex flex-wrap justify-center">
                  {userFetched && userFetched.payments && (
                    userFetched.payments.map((payment: {
                        sale: any[]; status: string, price: number, tShirtSize: string 
                    }, index: number) => (
                      (payment.status === PaymentStatus.APPROVED || payment.status === PaymentStatus.PENDING) && (
                        <div key={`div-${index}`} className="mr-2 my-2">
                          <Tooltip 
                            key={`tooltip-${index}`}
                            title={
                              payment.status === PaymentStatus.APPROVED 
                                ? "Pagamento confirmado!" 
                                : "Para acessar o QRCode, clique aqui"
                            }
                          >
                            <Chip
                              sx={{
                                height: 'auto',
                                '& .MuiChip-label': {
                                  display: 'block',
                                  whiteSpace: 'normal',
                                },
                              }}
                              key={`chip-${index}`}
                              label={`${payment.sale.map(sale => 
                                sale.hasTShirt ?  `${sale.name} - ${payment.tShirtSize}` : sale.name
                              ).join(", ")}`}
                              color={payment.status === PaymentStatus.APPROVED ? "success" : "warning"}
                              clickable={payment.status === PaymentStatus.APPROVED ? false : true}
                              onClick={() => {
                                if (payment.status === PaymentStatus.PENDING) {
                                  setDataToCoffeeStep3(payment);
                                  setCoffeeModalOpen(true);
                                  blockBodyScroll();
                                }
                              }}
                              icon={payment.status === PaymentStatus.APPROVED ? 
                                <DoneIcon></DoneIcon>
                                :
                                <HourglassTopIcon></HourglassTopIcon>
                              }
                            />
                          </Tooltip>
                        </div>
                      )
                    ))
                  )}
                </div>
                { config && config.openSales ? (
                    <>
                    { !closeSales ? (
                        <>
                          <p className="text-sm pb-2 text-center text-[#A4A4A4]">Compre o Coffee e o Kit da Semcomp com Pix!</p>
                        <button
                          onClick={() => {
                          setCoffeeModalOpen(true);
                          blockBodyScroll();
                          }}
                          className={`bg-${userHouseName} text-white p-3 rounded-lg mt-2 hover:bg-white hover:text-primary`}>
                          Comprar!
                        </button>
                        </>
                      ) : 
                      <>
                        <p className="text-center"> As vendas estão esgotadas! </p>
                      </>
                    }
                    </>
                  ) : 
                    <>
                      <p className="text-center"> Não há vendas no momento. </p>
                    </>
                }
              </Card>}
        </div>
        </div>
        {/* {
          showCalendar ?? (
          <div>
            <Card className="flex flex-col items-center p-9 mb-6 max-w-4xl  rounded-lg">
              <p className="events-overview-component__title text-xl mb-8">Eventos</p>
              <EventsCalendar />
            </Card>
          </div>)
        } */}
        
      </main>
      </div>
      <div className="flex flex-col justify-right">
        <div className="flex flex-row md:justify-end mobile:justify-center md:pr-6 not-phone:absolute not-phone:bottom-12 not-phone:right-0">
          <Tooltip
              arrow
              placement="top-start"
              title={"Autor da imagem | " + backgroundAuthor}
              enterTouchDelay={1}
            >
            <Info sx={{ color: "#d3d3d3", paddingRight: "2px", opacity: 0.75}} />
          </Tooltip>
        </div>
        <NewFooter/>
      </div>
      </div>
  );
}

export default RequireAuth(Profile);
