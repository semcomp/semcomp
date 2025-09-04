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
import SimpleBackground from "../components/home/SimpleBackground";
import { NewFooter } from "./newFooter";

import { Info } from "@mui/icons-material";
import { PaymentStatus } from "../libs/constants/payment-status";
import ConfirmarCracha from "../components/profile/crachasemcomp/index";
import FundacaoEstudarLogo from "../components/profile/fundEstudar/index"

// Componentes de cards
import ProfileCard from "../components/profile/ProfileCard";
import PurchasesCard from "../components/profile/PurchasesCard";
import EventsCard from "../components/profile/EventsCard";
import AchievementsCard from "../components/profile/AchievementsCard";
import OverflowCard from "../components/profile/OverflowCard";

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
  const [isAboutOverflowModalOpen, setIsAboutOverflowModalOpen] = useState(false);
  const [isCoffeeModalOpen, setCoffeeModalOpen] = useState(false);
  const [allSales, setAllSales] = useState([]);
  const [dataToCoffeeStep3, setDataToCoffeeStep3] = useState(null);

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

  function removeBodyStyle() {
    document.body.setAttribute("style", ``);
  }

  function blockBodyScroll() {
    document.body.setAttribute(
      "style",
      `overflow-y: hidden;`
    );
  }

  return (
    <div className="min-h-screen w-full flex flex-col justify-between font-secondary text-sm">
      <Navbar />
      <Sidebar />
      <SimpleBackground />
      
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
      )}
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
          userPayments={userFetched?.payments}
        />
      )}
      
      <div>
        <main className="p-8 h-full w-full justify-center col-gap-4 md:flex text-white pt-16 sm:pt-20 sm:items-center relative z-10">
          <div className="flex flex-col h-full md:w-[60%] md:grid md:grid-cols-2 md:gap-4 z-20 mobile:grid mobile:grid-cols-1 mobile:gap-4">
            <div className="flex flex-col w-full md:grid md:grid-cols-1 gap-4 z-20">
              {userFetched && (
                <ProfileCard
                  user={userFetched}
                  onEditClick={() => {
                    setIsEditModalOpen(true);
                    blockBodyScroll();
                  }}
                />
              )}

              { eventCount == 0 && (
                <PurchasesCard
                  user={userFetched}
                  config={config}
                  closeSales={closeSales}
                  onPurchaseClick={() => {
                    setCoffeeModalOpen(true);
                    blockBodyScroll();
                  }}
                  onPaymentClick={(payment) => {
                    setDataToCoffeeStep3(payment);
                    setCoffeeModalOpen(true);
                    blockBodyScroll();
                  }}
                />
              )}

              { eventCount > 0 && (
                <EventsCard
                  events={events}
                  onRegisterClick={() => {
                    setIsRegistrationsModalOpen(true);
                    blockBodyScroll();
                  }}
                />
              )}

              {userFetched && config && config.enableWantNameTag && isConfirmarCrachaModalOpen && (
                <ConfirmarCracha
                  onRequestClose={() => setIsConfirmarCrachaModalOpen(false)}
                  user={userFetched}
                />
              )}

              {userFetched && config && config.openAchievement && (
                <AchievementsCard
                  onViewAchievementsClick={() => {
                    setIsAchievementsModalOpen(true);
                    blockBodyScroll();
                  }}
                  onScanAchievementClick={() => {
                    setIsAddAchievementModalOpen(true);
                    blockBodyScroll();
                  }}
                />
              )}
            </div>
            <div className="flex flex-col w-full md:grid md:grid-cols-1 gap-4 ">
              {userFetched && userFetched.house && (
                <OverflowCard
                  user={userFetched}
                  onAboutOverflowClick={() => setIsAboutOverflowModalOpen(true)}
                />
              )}

              { eventCount > 0 && (
                <PurchasesCard
                  user={userFetched}
                  config={config}
                  closeSales={closeSales}
                  onPurchaseClick={() => {
                    setCoffeeModalOpen(true);
                    blockBodyScroll();
                  }}
                  onPaymentClick={(payment) => {
                    setDataToCoffeeStep3(payment);
                    setCoffeeModalOpen(true);
                    blockBodyScroll();
                  }}
                />
              )}
            </div>
          </div>
        </main>
      </div>
      <div className="flex flex-col justify-right">
        <NewFooter/>
      </div>
    </div>
  );
}

export default RequireAuth(Profile);
