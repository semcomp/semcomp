import { useEffect, useState } from "react";
import QRCode from "react-qr-code";
import useWindowDimensions from "@/hooks/useWindowDimensions";
import { useTheme } from "@/contexts/useTheme";
import FotoSemcompMain from "@/assets/img/Home/Hero/Semcomp.avif";
import imgLogoBranco from "@/assets/img/semcomp/logo_default_branco.webp";
import ContatoSection from "../Home/sections/ContatoSection";
import { useAuth } from "@/contexts/useAuth";
import { authAPI } from "@/api";
import { ChevronDown } from "lucide-react";
import { useNotification } from "@/contexts/NotificationContext";

const _heroModules = import.meta.glob(
  "/src/assets/img/Home/Hero/*",
  { eager: true }
) as Record<string, { default: string }>;
const HERO_IMAGES = Object.values(_heroModules)
  .map((m) => m.default as string)
  .filter((src) => /\.(webp)$/i.test(src));
const pickRandomHero = () =>
  HERO_IMAGES.length ? HERO_IMAGES[Math.floor(Math.random() * HERO_IMAGES.length)] : FotoSemcompMain;


type Evento = {
  tipo: string;
  description: string;
  data: string;
  horaStart: string;
  horaEnd: string;
  linkInscricao?: string;
};

interface ProfileProps {
  name?: string;
  email?: string;
  code?: string;
  qrValue?: string;
  event?: string;
}

let events: Evento[] = [
  {
    tipo: "Minicurso",
    description:
      "Inteligência de Enxames aplicada a Robótica - Prof. Doutor Eduardo do Valle Simões",
    data: "2026-05-16",
    horaStart: "14:00",
    horaEnd: "18:00",
    linkInscricao: "https://docs.google.com/forms/d/e/1FAIpQLScc0O2bcAs18cSS-mXkCS5mmJCVZ5BU37d4I8pDTANGiMCY0g/viewform"
  },
  {
    tipo: "Escape Room",
    description: "Monte uma equipe e participe do nosso Escape Room!",
    data: "2026-05-16",
    horaStart: "19:00",
    horaEnd: "23:00",
    linkInscricao: "https://forms.gle/9Am3Hwijdyw7r91h8"
  },
];

function formatarDataDynamic(dataIso: string) {
  const dateObj = new Date(dataIso + "T12:00:00");
  const dataFormatada = dateObj.toLocaleDateString("pt-BR", {
    day: "2-digit",
    month: "2-digit",
  });
  const diaDaSemana = dateObj.toLocaleDateString("pt-BR", { weekday: "long" });
  return {
    data: dataFormatada,
    diaSemana: diaDaSemana.charAt(0).toUpperCase() + diaDaSemana.slice(1), 
  };
}

export default function Profile({
  name = "Nome do usuário",
  email = "E-mail do usuário",
  code = "Código",
  qrValue = "Um código QR genérico para teste",
  event = "SEMCOMP",
}: ProfileProps) {
  const { width } = useWindowDimensions();
  const { isDarkMode } = useTheme();
  const { showNotification } = useNotification();

  const [activeTab, setActiveTab] = useState<"qr" | "account">("qr");
  const [userName, setUserName] = useState(name);
  const [userEmail, setUserEmail] = useState(email);
  const [userCode, setUserCode] = useState(code);
  const [qrData, setQrData] = useState(qrValue);
  const [presencePercent, setPresencePercent] = useState<number>(16);
  const [openSubscription, setOpenSubscription] = useState<number>(-1)

  const { logout } = useAuth();
  const [heroSrc] = useState<string>(() => pickRandomHero());

  // buscar dados do perfil na montagem da pagina
  useEffect(() => {
    async function fetchProfile() { // função de busca
      try {
        const response = await authAPI.getProfile(); // chama a API do perfil e insere as infos
        setUserName(response.name || name); 
        setUserEmail(response.email || email);
        setUserCode(response.user_number?.toString() || code);
        setPresencePercent(response.presence_rate || 0);
      } catch (err) { // caputura de erro
        console.error("Erro ao buscar o perfil", err);
      }
    }
    fetchProfile(); // chamada da função
  }, []);

  // Variáveis do Desktop original
  const bgColor = isDarkMode ? "bg-semcompDarkBlue" : "bg-semcompOffWhite";
  const textColor = isDarkMode
    ? "text-semcompOffWhite"
    : "text-semcompDarkBlue";
  const headerBgWithOpacity = isDarkMode
    ? "bg-semcompDarkBlue/80"
    : "bg-semcompMidDarkBlue/80";
  const shadowClass = isDarkMode
    ? "shadow-[inset_0_-180px_40px_-40px_theme(colors.semcompDarkBlue/100%)]"
    : "shadow-[inset_0_-180px_40px_-40px_theme(colors.semcompMidLight/100%)]";

  // Retirado o useEffect de sobrescrita hardcoded params para não conflitar com API
  useEffect(() => {
    // Apenas garante que se o QR mudar explicitamente externamente, atualize
    setQrData(qrValue);
  }, [qrValue]);

  // Card de Evento -Mobile
  const EventCardMobile = ({ ev }: { ev: Evento }) => {
    const { data, diaSemana } = formatarDataDynamic(ev.data);

    // Lógica Dark Mode para os cards de evento
    const cardBgColor = isDarkMode
      ? "bg-white/10 border-white/20 text-white"
      : "bg-black/10 border-semcompDarkBlue/20 text-semcompDarkBlue";

    return (
      <div className={`border rounded-xl p-4 mb-3 ${cardBgColor} flex flex-col items-start`}>
        <div className="w-full">
          <div className="flex items-start gap-2">
            <span className="font-bold whitespace-nowrap">{ev.tipo}</span>
            <span className="opacity-60">|</span>
            <p className="text-sm leading-relaxed opacity-90 wrap-break-words">{ev.description}</p>
          </div>
          <p className="mt-2 text-sm opacity-80 font-medium">
            {diaSemana} ({data}), {ev.horaStart} às {ev.horaEnd}
          </p>
          <hr className="mb-2 mt-2"/>
        </div>  
        <div className={`w-full flex flex-row justify-center ${cardBgColor}/90 rounded-sm`}>
          <button
            className="cursor-pointer w-full"
            onClick={()=>  ev.linkInscricao ? window.open(ev.linkInscricao, "_blank") : showNotification("Este evento ainda não está aberto para inscrições.")}
          >
            Inscreva-se
          </button>
        </div>
      </div>
    );
  };

  // Mobile e Tablet (< 1280px)
  if (width < 1280) {
    // Variáveis de Tema para Mobile
    const mMainBg = isDarkMode
      ? "bg-semcompAlmostDarkBlue"
      : "bg-semcompOffWhite";
    const mGradientTo = isDarkMode
      ? "to-semcompAlmostDarkBlue"
      : "to-semcompOffWhite";

    // Tabs
    const mTabsContainer = isDarkMode
      ? "bg-black/40 border-white/20"
      : "bg-semcompMidLightBlue/40 border-semcompDarkBlue/20";
    const mTabActive = isDarkMode
      ? "bg-[#D9D9D9] text-[#0B2639]"
      : "bg-semcompDarkBlue text-semcompOffWhite";
    const mTabInactive = isDarkMode ? "text-white" : "text-semcompDarkBlue";

    // Cards
    const mMainCardBg = isDarkMode
      ? "bg-[#D9D9D9] text-[#0B2639]"
      : "bg-gray-200 text-semcompDarkBlue border border-semcompDarkBlue/10 shadow-lg";
    const mFallbackBg = isDarkMode
      ? "bg-[#B7C9D3] border-[#0B2639]/10"
      : "bg-semcompMidLightBlue/20 border-semcompDarkBlue/20";

    // Seções
    const mOverflowBg = isDarkMode
      ? "bg-semcompDarkBlue text-semcompOffWhite"
      : "bg-semcompMidLightBlue text-semcompOffWhite";
    const mInscricoesBg = isDarkMode
      ? "bg-[#1A3A4F] border-white/10"
      : "bg-semcompOffWhite border-semcompDarkBlue text-semcompDarkBlue";

    return (
      <div
        className={`min-h-screen ${mMainBg} font-poppins pb-10 transition-colors duration-300`}
      >
        {/* Header com Background */}
        <div className="relative h-80 w-full overflow-hidden bg-black">
          <img
            src={heroSrc}
            className="absolute inset-0 w-full h-full object-cover opacity-60"
            alt="Semcomp Banner"
          />
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <img src={imgLogoBranco} alt="SEMCOMP Logo" className="w-1/2 max-w-50 object-contain drop-shadow-2xl" />
          </div>
          <div
            className={`absolute inset-0 bg-linear-to-b from-transparent ${mGradientTo}`}
          />

          {/* Tabs Seletoras */}
          <div
            className={`absolute bottom-10 left-1/2 -translate-x-1/2 flex backdrop-blur-md rounded-full p-1 border w-[80%] max-w-xs z-20 ${mTabsContainer}`}
          >
            <button
              onClick={() => setActiveTab("qr")}
              className={`flex-1 py-2 text-sm rounded-full transition-all font-bold ${
                activeTab === "qr" ? mTabActive : `${mTabInactive} opacity-80`
              }`}
            >
              QR Code
            </button>
            <button
              onClick={() => setActiveTab("account")}
              className={`flex-1 py-2 text-sm rounded-full transition-all font-bold ${
                activeTab === "account"
                  ? mTabActive
                  : `${mTabInactive} opacity-80`
              }`}
            >
              Minha Conta
            </button>
          </div>
        </div>

        {/* Conteúdo Principal (Card Central) */}
        <div className="px-5 -mt-6 relative z-10">
          <div
            className={`${mMainCardBg} rounded-3xl p-6 md:p-8 flex flex-col items-center shadow-2xl min-h-100`}
          >
            {activeTab === "qr" && (
              <>
                <h1 className="text-2xl font-bold mb-1">Meu QR Code</h1>
                <p className="text-center text-sm mb-8 px-2 md:px-4">
                  Utilize seu QR durante a{" "}
                  <span className="font-semibold">{event}</span> para registrar
                  sua presença
                </p>

                {/* Frame do QR Code */}
                <div className="relative p-6 mb-6">
                  {/* Cantoneiras customizadas */}
                  <div className="absolute top-0 right-0 w-12 h-12 border-t-8 border-r-8 border-[#548EAB]" />
                  <div className="absolute bottom-0 left-0 w-12 h-12 border-b-8 border-l-8 border-[#548EAB]" />

                  <div className="bg-white p-2">
                    <QRCode value={qrData} size={180} fgColor="#0B2639" />
                  </div>
                </div>

                <p className="font-bold text-lg mb-6 text-center">{userName}</p>

                {/* Fallback Code */}
                <div
                  className={`${mFallbackBg} rounded-xl p-4 w-full flex flex-row items-center justify-between gap-4 border`}
                >
                  <p className="text-[10px] md:text-xs leading-tight flex-1">
                    Caso dê algum problema ao scannear, forneça o código:
                  </p>
                  <p className="text-lg md:text-xl font-black tracking-widest whitespace-nowrap">
                    {userCode}
                  </p>
                </div>
              </>
            )}

            {activeTab === "account" && (
              <div className="w-full flex flex-col animate-in fade-in duration-300">
                <h2 className="text-2xl font-bold text-center mb-6">
                  Minha Conta
                </h2>

                <div className="flex flex-col space-y-4 mb-6">
                  <div className="flex flex-col border-b border-black/10 pb-2">
                    <span className="text-xs font-bold opacity-70">
                      Nome Completo:
                    </span>
                    <span className="text-sm font-medium">{userName}</span>
                  </div>
                  <div className="flex flex-col border-b border-black/10 pb-2">
                    <span className="text-xs font-bold opacity-70">
                      E-mail:
                    </span>
                    <span className="text-sm font-medium">{userEmail}</span>
                  </div>
                </div>

                {/* Barra de Progresso Mobile */}
                <div className="bg-white/50 rounded-xl p-4 mb-6 border border-black/10">
                  <h3 className="text-center text-sm font-bold mb-3">
                    Minha Presença
                  </h3>
                  <div className="relative w-full h-6 bg-black/10 rounded-full overflow-hidden">
                    <div
                      className="absolute inset-y-0 left-0 h-full bg-semcompDarkBlue flex items-center justify-end pr-2 transition-all duration-1000"
                      style={{ width: `${Math.max(presencePercent, 15)}%` }}
                    >
                      <span className="text-white text-[10px] font-bold">
                        {presencePercent}%
                      </span>
                    </div>
                  </div>
                </div>

                <button className="w-full bg-semcompDarkBlue text-white py-3 rounded-lg text-sm font-semibold mb-4"
                  onClick={() => {showNotification("Entre em contato com a organização", "info")}}>
                  Editar Informações
                </button>
                <button
                  className="w-full text-red-600 font-bold text-sm py-2"
                  onClick={logout}
                >
                  Sair da conta
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Seção Overflow */}
        <div
          className={`mt-12 pt-10 pb-10 px-5 text-center transition-colors ${mOverflowBg}`}
        >
          <h2 className="text-3xl font-bold mb-1 flex items-center justify-center gap-2">
            SEMCOMP Beta 2026
            <span
              className={`flex items-center justify-center w-5 h-5 rounded-full border text-xs font-normal ${
                isDarkMode
                  ? "border-white/60 text-white/60"
                  : "border-semcompDarkBlue/60 text-semcompDarkBlue/60"
              }`}
            >
              ?
            </span>
          </h2>
          <p className="text-xs mb-6 opacity-80">
            Você sabia que vem por aí a prévia da maior semana acadêmica de computação do Brasil?
          </p>

          <div
            className={`relative rounded-2xl overflow-hidden mb-4 border ${
              isDarkMode
                ? "bg-black/50 border-white/10"
                : "bg-white border-semcompDarkBlue/20"
            }`}
          >
            <img src={heroSrc} className="w-full h-56 object-cover brightness-[0.7]" />
            <div className="absolute inset-0 flex flex-col items-center justify-center pt-4">
              <img
                src={imgLogoBranco}
                className="w-32 mb-2 drop-shadow-2xl"
                alt="Logo"
              />
              <h3 className="text-2xl font-black tracking-widest drop-shadow-lg text-white">
                SEMCOMP Beta
              </h3>
            </div>
          </div>

          <div
            className={`border-t pt-4 px-2 ${
              isDarkMode ? "border-white/20" : "border-semcompDarkBlue/20"
            }`}
          >
            <p className="text-[11px] leading-relaxed text-justify opacity-90">
              A SEMCOMP Beta é uma prévia de um evento ainda maior - a Semana de
              Computação da USP São Carlos. Ela acontecerá no dia 16 de maio e
              sua programação inclui palestras, minicursos, concursos, coffee
              break e a nossa famosa gamenight. Participe e faça parte dessa
              experiência única!
            </p>
            {/* <button className="mt-4 underline text-sm font-semibold hover:opacity-70">
              Entrar no Grupo da Casa
            </button> */}
          </div>
        </div>

        {/* Seção Inscrições */}
        <div className="mt-12 mb-12 px-5">
          <div
            className={`rounded-3xl p-6 border shadow-xl transition-colors ${mInscricoesBg}`}
          >
            <h2 className="text-2xl font-bold text-center mb-6">
              Inscrições em Eventos
            </h2>
            {events.length > 0 ? (
              events.map((ev, i) => <EventCardMobile key={i} ev={ev} />)
            ) : (
              <p className="opacity-60 text-center text-sm italic">
                Nenhuma inscrição encontrada.
              </p>
            )}
          </div>
        </div>

        <ContatoSection />
      </div>
    );
  }

  // construção do QRcode
  const qrAndAccountCard = (
    <div className="h-full w-full pt-5 bg-gray-300 flex flex-col text-semcompDarkBlue rounder-2xl">
      <div className="flex mx-auto mb-5 w-[60%] rounded-full m-3 p-1 gap-1 border-2 border-semcompOffWhite/20 bg-semcompMidLight/20">
        <button
          onClick={() => setActiveTab("qr")}
          className={`flex-1 text-center py-2 rounded-full text-sm transition-all duration-200 ${
            activeTab === "qr"
              ? "bg-semcompDarkBlue text-semcompOffWhite shadow-md font-semibold"
              : "text-semcompDarkBlue/70 hover:text-semcompDarkBlue"
          }`}
        >
          QR Code
        </button>
        <button
          onClick={() => setActiveTab("account")}
          className={`flex-1 text-center py-2 rounded-full text-sm transition-all duration-200 ${
            activeTab === "account"
              ? "bg-semcompDarkBlue text-semcompOffWhite shadow-md font-semibold"
              : "text-semcompDarkBlue/70 hover:text-semcompDarkBlue"
          }`}
        >
          Minha Conta
        </button>
      </div>

      {activeTab === "qr" && (
        <div className="px-6 pb-8 bg-semcompOffWhite/50 mx-auto pt-8 h-full flex flex-col items-center overflow-y-auto">
          <h1 className="text-2xl text-semcompMidDarkBlue font-bold mb-1">
            Meu QR Code
          </h1>
          <p className="text-md text-semcompDarkBlue/75 text-center mb-6 leading-relaxed">
            Utilize seu QR durante a{" "}
            <span className="text-semcompMidBlue font-semibold">{event}</span>{" "}
            para registrar sua presença
          </p>
          <div className="relative p-4 mb-4">
            <div className="absolute top-0 right-0 w-10 h-10 border-r-15 border-t-15 border-semcompMidLightBlue" />
            <div className="absolute bottom-0 left-0 w-10 h-10 border-l-15 border-b-15 border-semcompMidLightBlue" />
            <div className="bg-linear-to-br from-semcompMidLight to-semcompOffWhite p-4 -m-2">
              <QRCode
                value={qrData}
                size={width >= 1280 ? 220 : 200}
                fgColor="#0B2639"
                bgColor="transparent"
              />
            </div>
          </div>

          <p className="text-center font-medium mb-6">{userName}</p>
          <div className="bg-semcompMidLightBlue/15 rounded-xl p-4 flex items-center justify-between gap-4 w-full 2xl:w-[70%] border border-semcompMidLight/40">
            <p className="text-xs text-semcompDarkBlue/75 leading-tight">
              Caso de algum problema ao scannear, forneca o codigo:
            </p>
            <p className="text-xl font-bold tracking-[0.2em] whitespace-nowrap">
              {userCode}
            </p>
          </div>
        </div>
      )}

      {activeTab === "account" && (
        <div className="px-6 pb-8 pt-4 mx-auto w-full 2xl:w-5/6 flex flex-col text-foreground animate-in fade-in duration-300 overflow-y-auto">
          <div className="text-center mb-6">
            <h2 className="text-xl font-bold text-semcompMidDarkBlue font-poppins">
              Minha Conta
            </h2>
            <p className="text-md text-semcompDarkBlue/75">
              Veja abaixo, seus dados e presença
            </p>
          </div>

          <div className="flex flex-col space-y-4 mb-6">
            <div className="flex flex-col text-left">
              <span className="text-sm font-bold text-semcomp-900">
                Nome Completo:
              </span>
              <span className="text-sm text-foreground/90">{userName}</span>
            </div>
            <div className="flex flex-col text-left">
              <span className="text-sm font-bold text-semcomp-900">
                E-mail:
              </span>
              <span className="text-sm text-foreground/90">{userEmail}</span>
            </div>
            <div className="flex flex-col text-left">
              <span className="text-sm font-bold text-semcomp-900">
                Tipo de Cadastro
              </span>
              <span className="text-sm text-foreground/90">
                Aluno USP / Visitante
              </span>
            </div>
            <div className="flex flex-col text-left">
              <div className="flex items-center gap-1">
                <span className="text-sm font-bold text-semcomp-900">
                  Cargo
                </span>
              </div>
              <span className="text-sm text-foreground/90">
                Participante da Semcomp Beta
              </span>
            </div>
          </div>

          <button className="w-full bg-semcompMidDarkBlue hover:bg-semcompDarkBlue/90 text-white py-2.5 rounded-lg text-sm font-semibold transition-all shadow-md mb-8"
           onClick={() => {showNotification("Entre em contato com a organização", "info")}}>
            Editar Informações
          </button>

          <div className="bg-muted/40 rounded-xl p-5 border border-border/50">
            <h3 className="text-center text-semcompMidDarkBlue text-md font-bold text-semcomp-900 mb-4">
              Minha Presença na SEMCOMP
            </h3>
            <div className="relative w-full h-8 bg-background/50 rounded-full border-5 border-border/30 overflow-hidden">
              <div
                className={`absolute inset-y-0 left-0 h-full bg-semcompMidDarkBlue flex items-center transition-all duration-1000 rounded-r-full ${
                  presencePercent > 15 ? "justify-end pr-4" : "justify-start"
                }`}
                style={{ width: `${presencePercent}%` }}
              >
                {presencePercent > 15 && (
                  <span className="text-semcompLightBlue text-xs font-bold">
                    {presencePercent}%
                  </span>
                )}
              </div>
              {presencePercent <= 15 && (
                <div className="absolute right-3 top-1/2 -translate-y-1/2 text-semcompMidDarkBlue text-xs font-bold">
                  {presencePercent}%
                </div>
              )}
            </div>
          </div>

          <button
            onClick={logout}
            className="mt-6 text-xs w-[30%] text-white font-medium mx-auto bg-destructive/50 hover:text-semcompOffWhite hover:bg-destructive/60 transition-colors py-2 px-3 rounded-lg "
          >
            Sair da conta
          </button>
        </div>
      )}
    </div>
  );

  // pagina para telas de computador
  if (width >= 1280) {
    return (
      <div className={`${bgColor} ${textColor} min-h-screen`}>
        <div
          className={`h-[calc(90vh-70px)] w-full bg-cover bg-center ${shadowClass} flex flex-row justify-center items-center gap-10 font-poppins`}
          style={{
            backgroundImage: `url(${heroSrc})`,
            boxShadow: isDarkMode
              ? "inset 0 -160px 60px -40px rgba(11, 38, 57, 0.8)"
              : "inset 0 -180px 40px -40px rgba(53, 123, 163, 0.6)",
          }}
        >
          <div className="h-[85%] w-[28%] bg-semcompOffWhite rounded-sm overflow-hidden shadow-xl">
            {qrAndAccountCard}
          </div>

          <div
            className={`h-[85%] w-[28%] ${headerBgWithOpacity} flex flex-col rounded-sm overflow-hidden text-semcompOffWhite pt-12 pr-10 pl-10 pb-10`}
          >
            <h1 className="text-center text-3xl font-bold pb-4">
              SEMCOMP Beta 2026
            </h1>
            <p className="text-center text-md pb-2">
              Você sabia que vem por aí a prévia da maior semana acadêmica de
              computação do Brasil?
            </p>
            <div
              className="relative h-[50%] bg-cover bg-center bg-black"
            >
              <img src={heroSrc} className="absolute inset-0 w-full h-full object-cover opacity-60" alt="background"/>
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                <img
                  className="h-[80%] drop-shadow-2xl"
                  src={imgLogoBranco}
                  alt="Logo"
                />
              </div>

              <span className="absolute bottom-0 left-1/2 -translate-x-1/2 translate-y-1/2 whitespace-nowrap font-bold text-2xl z-10 text-white drop-shadow-md">
                SEMCOMP Beta
              </span>
            </div>
            <hr className=" border-semcompOffWhite mt-6 mb-3" />
            <span className="text-sm text-justify">
              A SEMCOMP Beta é uma prévia de um evento ainda maior - a Semana de
              Computação da USP São Carlos. Ela acontecerá no dia 16 de maio e
              sua programação inclui palestras, minicursos, concursos, coffee
              break e a nossa famosa gamenight. Participe e faça parte dessa
              experiência única!
            </span>
          </div>
        </div>

        <div
          className={`min-h-[60vh] ${
            isDarkMode ? "bg-semcompAlmostDarkBlue" : "bg-semcompMidLightBlue"
          }  flex flex-col justify-center items-center font-poppins pt-24 pb-24`}
        >
          <div
            className={`border-2 h-[80%] w-[60%] rounded-2xl pt-12 pb-10 pl-16 pr-16 flex flex-col justify-center items-center ${
              isDarkMode
                ? "bg-semcompMidDarkBlue text-semcompOffWhite border-semcompOffWhite"
                : "bg-semcompOffWhite text-semcompDarkBlue border-semcompDarkBlue"
            }`}
          >
            <h1 className="font-bold text-2xl mb-6">Inscrições em Eventos</h1>
            <div className="w-full flex flex-row justify-between font-bold">
              <span>Evento</span>
              <span>Data/Horário</span>
            </div>
            <hr
              className={`w-full border mt-3 mb-3 ${
                isDarkMode
                  ? "border-semcompOffWhite"
                  : "border-semcompAlmostDarkBlue"
              }`}
            />
            <div className="w-full flex flex-col gap-4 mb-20">
              {events && events.length > 0 ? (
                events.map((evento, index) => {
                  const { data, diaSemana } = formatarDataDynamic(evento.data);
                  return (
                    <div
                      key={index}
                      className="flex flex-col justify-center items-center"
                    >
                      <div
                        className={`w-full flex flex-row justify-between items-center py-3 px-6 ${openSubscription === index ? "rounded-t-lg bg-black/15 shadow-inner" : "rounded-lg bg-black/5 hover:bg-black/10"}
                        transition-all duration-300 cursor-pointer`}
                        onClick={()=>setOpenSubscription(openSubscription === index ? -1 : index)}
                      >
                        <div className="w-1/2 flex flex-col text-left gap-1 items-start pr-4">
                          <span className="font-bold text-lg shrink-0">
                            {evento.tipo}
                          </span>
                          <span className="text-sm font-medium wrap-break-words flex-1 opacity-90">
                            {evento.description}
                          </span>
                        </div>
                        <div className="w-auto flex flex-col items-end shrink-0 gap-1">
                          <div className="flex flex-row gap-3 items-center">
                            <span className="font-semibold text-md">{data}</span>
                            <span
                              className={`text-xs px-3 py-1 font-bold rounded-full ${
                                isDarkMode
                                  ? "bg-semcompOffWhite text-semcompMidDarkBlue"
                                  : "bg-semcompDarkBlue text-semcompOffWhite capitalize"
                              } `}
                            >
                              {diaSemana}
                            </span>
                          </div>
                          <span className="text-sm font-medium opacity-80 flex items-center gap-2">
                            {evento.horaStart} às {evento.horaEnd}
                            <ChevronDown 
                              className={`transition-transform duration-300 ${openSubscription === index ? "rotate-180" : ""} ${isDarkMode ? "text-white" : "text-black"}`} 
                              size={20} 
                            />
                          </span>
                        </div>
                      </div>
                      {
                        openSubscription === index && (
                          <div className={`w-full p-6 flex flex-row items-center justify-center rounded-b-lg border-t border-black/10 shadow-lg transition-all animate-in fade-in duration-300 ${
                            isDarkMode 
                              ? "bg-black/20" 
                              : "bg-black/5"
                          }`}>
                              <button className={`px-8 py-3 rounded-xl font-bold uppercase tracking-wide shadow-md hover:-translate-y-1 transition-all duration-300 ${
                                isDarkMode 
                                  ? "bg-semcompOffWhite text-semcompDarkBlue hover:bg-white hover:shadow-white/20" 
                                  : "bg-semcompDarkBlue text-semcompOffWhite hover:bg-semcompMidDarkBlue hover:shadow-semcompDarkBlue/40"
                                }`}
                                onClick={()=>  evento.linkInscricao ? window.open(evento.linkInscricao, "_blank") : showNotification("Este evento ainda não está aberto para inscrições.")}
                              >
                                  Inscreva-se
                              </button>
                            </div>
                        )
                      }
                    </div>
                  );
                })
              ) : (
                <div className="text-center italic mt-6 py-8">
                  Você ainda não está inscrito em nenhum evento. Inscreva-se em
                  eventos para que eles apareçam aqui!
                </div>
              )}
            </div>
          </div>
        </div>

        <ContatoSection />
      </div>
    );
  }

  // Fallback View original
  return (
    <div className="flex justify-center p-4 min-h-screen bg-semcompMidDarkBlue/90 items-center font-poppins">
      <div className="w-full max-w-85 rounded-2xl overflow-hidden shadow-xl animate-in fade-in zoom-in duration-300">
        {qrAndAccountCard}
      </div>
    </div>
  );
}
