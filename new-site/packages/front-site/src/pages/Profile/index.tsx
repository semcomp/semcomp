import { useEffect, useState } from "react";
import QRCode from "react-qr-code";
import useWindowDimensions from "@/hooks/useWindowDimensions";
import { useTheme } from "@/contexts/useTheme";
import hogwarts from "../../assets/img/profilePics/hogwarts.jpg";
import hogwartsLogo from "../../assets/img/profilePics/hogwartsLogo.png";
import ContatoSection from "../Home/sections/ContatoSection";

type Evento = {
  tipo: string;
  description: string;
  data: string;
  horaStart: string;
  horaEnd: string;
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
    description: "Automação Agêntica de Processos: Construindo bots com Agentes de IA integrados",
    data: "2026-10-20",
    horaStart: "14:00",
    horaEnd: "18:00"
  },
  {
    tipo: "Palestra",
    description: "O Futuro da IA na Engenharia de Software",
    data: "2026-10-21",
    horaStart: "16:30",
    horaEnd: "18:00"
  }
];

// Helper para formatar a data dinamicamente
function formatarDataDynamic(dataIso: string) {
  const dateObj = new Date(dataIso + "T12:00:00");
  const dataFormatada = dateObj.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' });
  const diaDaSemana = dateObj.toLocaleDateString('pt-BR', { weekday: 'long' }); 
  return {
    data: dataFormatada,
    diaSemana: diaDaSemana.charAt(0).toUpperCase() + diaDaSemana.slice(1) // Capitaliza a primeira letra
  };
}

export default function Profile({
  name = "João Gabriel Pieroli da Silva",
  email = "joao.gabriel@example.com",
  code = "0 1 1 2 3 5",
  qrValue = "Um código QR genérico para teste",
  event = "SEMCOMP"
}: ProfileProps) {
  const { width } = useWindowDimensions();
  const { isDarkMode } = useTheme();
  
  const [activeTab, setActiveTab] = useState<"qr" | "account">("qr");
  const [userName, setUserName] = useState(name);
  const [userEmail, setUserEmail] = useState(email);
  const [userCode, setUserCode] = useState(code);
  const [qrData, setQrData] = useState(qrValue);
  const [presencePercent, setPresencePercent] = useState<number>(16);

  // Variáveis do Desktop original
  const bgColor = isDarkMode ? "bg-semcompDarkBlue" : "bg-semcompOffWhite";
  const textColor = isDarkMode ? "text-semcompOffWhite" : "text-semcompDarkBlue";
  const headerBgWithOpacity = isDarkMode ? "bg-semcompDarkBlue/80" : "bg-semcompMidDarkBlue/80";
  const shadowClass = isDarkMode
    ? "shadow-[inset_0_-180px_40px_-40px_theme(colors.semcompDarkBlue/100%)]"
    : "shadow-[inset_0_-180px_40px_-40px_theme(colors.semcompMidLight/100%)]";

  useEffect(() => {
    setUserName(name);
    setUserCode(code);
    setQrData(qrValue);
    setPresencePercent(16);
  }, [name, code, qrValue]);

  // Card de Evento -Mobile
  const EventCardMobile = ({ ev }: { ev: Evento }) => {
    const { data, diaSemana } = formatarDataDynamic(ev.data);
    
    // Lógica Dark Mode para os cards de evento
    const cardBgColor = isDarkMode ? "bg-white/10 border-white/20 text-white" : "bg-black/10 border-semcompDarkBlue/20 text-semcompDarkBlue";
    
    return (
      <div className={`border rounded-xl p-4 mb-3 ${cardBgColor}`}>
        <div className="flex items-start gap-2">
          <span className="font-bold whitespace-nowrap">{ev.tipo}</span>
          <span className="opacity-60">|</span>
          <p className="text-sm leading-tight opacity-90">{ev.description}</p>
        </div>
        <p className="mt-2 text-sm opacity-80 font-medium">
          {diaSemana} ({data}), {ev.horaStart} às {ev.horaEnd}
        </p>
      </div>
    );
  };

  // Mobile (< 1280px)
  if (width < 1280) {
    // Variáveis de Tema para Mobile
    const mMainBg = isDarkMode ? "bg-semcompAlmostDarkBlue" : "bg-semcompOffWhite";
    const mGradientTo = isDarkMode ? "to-semcompAlmostDarkBlue" : "to-semcompOffWhite";
    
    // Tabs
    const mTabsContainer = isDarkMode ? "bg-black/40 border-white/20" : "bg-semcompMidLightBlue/40 border-semcompDarkBlue/20";
    const mTabActive = isDarkMode ? "bg-[#D9D9D9] text-[#0B2639]" : "bg-semcompDarkBlue text-semcompOffWhite";
    const mTabInactive = isDarkMode ? "text-white" : "text-semcompDarkBlue";
    
    // Cards
    const mMainCardBg = isDarkMode ? "bg-[#D9D9D9] text-[#0B2639]" : "bg-gray-200 text-semcompDarkBlue border border-semcompDarkBlue/10 shadow-lg";
    const mFallbackBg = isDarkMode ? "bg-[#B7C9D3] border-[#0B2639]/10" : "bg-semcompMidLightBlue/20 border-semcompDarkBlue/20";
    
    // Seções
    const mOverflowBg = isDarkMode ? "bg-semcompDarkBlue text-white" : "bg-semcompMidLightBlue text-semcompDarkBlue";
    const mInscricoesBg = isDarkMode ? "bg-[#1A3A4F] border-white/10" : "bg-semcompOffWhite border-semcompDarkBlue text-semcompDarkBlue";

    return (
      <div className={`min-h-screen ${mMainBg} font-poppins pb-10 transition-colors duration-300`}>
        {/* Header com Background Hogwarts */}
        <div className="relative h-80 w-full overflow-hidden">
          <img src={hogwarts} className="absolute inset-0 w-full h-full object-cover" alt="Hogwarts" />
          <div className={`absolute inset-0 bg-gradient-to-b from-transparent ${mGradientTo}`} />
          
          {/* Tabs Seletoras */}
          <div className={`absolute bottom-10 left-1/2 -translate-x-1/2 flex backdrop-blur-md rounded-full p-1 border w-[80%] max-w-xs z-20 ${mTabsContainer}`}>
            <button 
              onClick={() => setActiveTab("qr")}
              className={`flex-1 py-2 text-sm rounded-full transition-all font-bold ${activeTab === "qr" ? mTabActive : `${mTabInactive} opacity-80`}`}
            >
              QR Code
            </button>
            <button 
              onClick={() => setActiveTab("account")}
              className={`flex-1 py-2 text-sm rounded-full transition-all font-bold ${activeTab === "account" ? mTabActive : `${mTabInactive} opacity-80`}`}
            >
              Minha Conta
            </button>
          </div>
        </div>

        {/* Conteúdo Principal (Card Central) */}
        <div className="px-5 -mt-6 relative z-10">
          <div className={`${mMainCardBg} rounded-3xl p-6 md:p-8 flex flex-col items-center shadow-2xl min-h-[400px]`}>
            
            {activeTab === "qr" && (
              <>
                <h1 className="text-2xl font-bold mb-1">Meu QR Code</h1>
                <p className="text-center text-sm mb-8 px-2 md:px-4">
                  Utilize seu QR durante a <span className="font-semibold">{event}</span> para registrar sua presença
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
                <div className={`${mFallbackBg} rounded-xl p-4 w-full flex flex-row items-center justify-between gap-4 border`}>
                  <p className="text-[10px] md:text-xs leading-tight flex-1">
                    Caso dê algum problema ao scannear, forneça o código:
                  </p>
                  <p className="text-lg md:text-xl font-black tracking-widest whitespace-nowrap">{userCode}</p>
                </div>
              </>
            )}

            {activeTab === "account" && (
              <div className="w-full flex flex-col animate-in fade-in duration-300">
                 <h2 className="text-2xl font-bold text-center mb-6">Minha Conta</h2>
                 
                 <div className="flex flex-col space-y-4 mb-6">
                    <div className="flex flex-col border-b border-black/10 pb-2">
                      <span className="text-xs font-bold opacity-70">Nome Completo:</span>
                      <span className="text-sm font-medium">{userName}</span>
                    </div>
                    <div className="flex flex-col border-b border-black/10 pb-2">
                      <span className="text-xs font-bold opacity-70">E-mail:</span>
                      <span className="text-sm font-medium">{userEmail}</span>
                    </div>
                 </div>

                 {/* Barra de Progresso Mobile */}
                 <div className="bg-white/50 rounded-xl p-4 mb-6 border border-black/10">
                    <h3 className="text-center text-sm font-bold mb-3">Minha Presença</h3>
                    <div className="relative w-full h-6 bg-black/10 rounded-full overflow-hidden">
                      <div
                        className="absolute inset-y-0 left-0 h-full bg-[#0B2639] flex items-center justify-end pr-2 transition-all duration-1000"
                        style={{ width: `${Math.max(presencePercent, 15)}%` }}
                      >
                         <span className="text-white text-[10px] font-bold">{presencePercent}%</span>
                      </div>
                    </div>
                 </div>

                 <button className="w-full bg-[#0B2639] text-white py-3 rounded-lg text-sm font-semibold mb-4">
                   Editar Informações
                 </button>
                 <button className="w-full text-red-600 font-bold text-sm py-2">
                   Sair da conta
                 </button>
              </div>
            )}
          </div>
        </div>

        {/* Seção Overflow (Grifinória) */}
        <div className={`mt-12 pt-10 pb-10 px-5 text-center transition-colors ${mOverflowBg}`}>
          <h2 className="text-3xl font-bold mb-1 flex items-center justify-center gap-2">
            Overflow 
            <span className={`flex items-center justify-center w-5 h-5 rounded-full border text-xs font-normal ${isDarkMode ? "border-white/60 text-white/60" : "border-semcompDarkBlue/60 text-semcompDarkBlue/60"}`}>?</span>
          </h2>
          <p className="text-xs mb-6 opacity-80">O Overflow é o principal concurso da nossa semana! E sua casa é...</p>
          
          <div className={`relative rounded-2xl overflow-hidden mb-4 border ${isDarkMode ? "bg-black/50 border-white/10" : "bg-white border-semcompDarkBlue/20"}`}>
            <img src={hogwarts} className="w-full h-56 object-cover" />
            <div className="absolute inset-0 flex flex-col items-center justify-center pt-4">
              <img src={hogwartsLogo} className="w-32 mb-2 drop-shadow-2xl" alt="Gryffindor" />
              <h3 className="text-2xl font-black tracking-widest drop-shadow-lg text-white">GRIFINÓRIA</h3>
            </div>
          </div>
          
          <div className={`border-t pt-4 px-2 ${isDarkMode ? "border-white/20" : "border-semcompDarkBlue/20"}`}>
            <p className="text-[11px] leading-relaxed text-justify opacity-90">
              Fundada por Godrico Grifinória, esta casa valoriza a coragem, bravura, ousadia e cavalheirismo, tendo o leão como mascote e as cores vermelho escarlate e dourado. Conhecidos por seu ímpeto heroico, muitas vezes imprudente, seus membros costumam ser nobres e destemidos.
            </p>
            <button className="mt-4 underline text-sm font-semibold hover:opacity-70">Entrar no Grupo da Casa</button>
          </div>
        </div>

        {/* Seção Inscrições */}
        <div className="mt-12 mb-12 px-5">
          <div className={`rounded-3xl p-6 border shadow-xl transition-colors ${mInscricoesBg}`}>
            <h2 className="text-2xl font-bold text-center mb-6">Inscrições em Eventos</h2>
            {events.length > 0 ? (
              events.map((ev, i) => <EventCardMobile key={i} ev={ev} />)
            ) : (
              <p className="opacity-60 text-center text-sm italic">Nenhuma inscrição encontrada.</p>
            )}
          </div>
        </div>

        <ContatoSection />
      </div>
    );
  }

  // Desktop (>= 1280px)
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
          <h1 className="text-2xl text-semcompMidDarkBlue font-bold mb-1">Meu QR Code</h1>
          <p className="text-md text-semcompDarkBlue/75 text-center mb-6 leading-relaxed">
            Utilize seu QR durante a <span className="text-semcompMidBlue font-semibold">{event}</span> para registrar sua presença
          </p>
          <div className="relative p-4 mb-4">
            <div className="absolute top-0 right-0 w-10 h-10 border-r-15 border-t-15 border-semcompMidLightBlue" />
            <div className="absolute bottom-0 left-0 w-10 h-10 border-l-15 border-b-15 border-semcompMidLightBlue" />
            <div className="bg-linear-to-br from-semcompMidLight to-semcompOffWhite p-4 -m-2">
              <QRCode value={qrData} size={width >= 1280 ? 220 : 200} fgColor="#0B2639" bgColor="transparent" />
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
          <h2 className="text-xl font-bold text-semcompMidDarkBlue font-poppins">Minha Conta</h2>
          <p className="text-md text-semcompDarkBlue/75">Veja abaixo, seus dados e presença</p>
        </div>

        <div className="flex flex-col space-y-4 mb-6">
          <div className="flex flex-col text-left">
            <span className="text-sm font-bold text-semcomp-900">Nome Completo:</span>
            <span className="text-sm text-foreground/90">{userName}</span>
          </div>
          <div className="flex flex-col text-left">
            <span className="text-sm font-bold text-semcomp-900">E-mail:</span>
            <span className="text-sm text-foreground/90">{userEmail}</span>
          </div>
          <div className="flex flex-col text-left">
            <span className="text-sm font-bold text-semcomp-900">Tipo de Cadastro</span>
            <span className="text-sm text-foreground/90">Aluno USP / Visitante</span>
          </div>
          <div className="flex flex-col text-left">
            <div className="flex items-center gap-1">
              <span className="text-sm font-bold text-semcomp-900">Cargo</span>
            </div>
            <span className="text-sm text-foreground/90">Participante da Semcomp Beta</span>
          </div>
        </div>

        <button className="w-full bg-semcompMidDarkBlue hover:bg-semcompDarkBlue/90 text-white py-2.5 rounded-lg text-sm font-semibold transition-all shadow-md mb-8">
          Editar Informações
        </button>

        <div className="bg-muted/40 rounded-xl p-5 border border-border/50">
          <h3 className="text-center text-semcompMidDarkBlue text-md font-bold text-semcomp-900 mb-4">
            Minha Presença na SEMCOMP
          </h3>
          <div className="relative w-full h-8 bg-background/50 rounded-full border-5 border-border/30 overflow-hidden">
            <div
              className={`absolute inset-y-0 left-0 h-full bg-semcompMidDarkBlue flex items-center transition-all duration-1000 rounded-r-full ${
                presencePercent > 15 ? 'justify-end pr-4' : 'justify-start'
              }`}
              style={{ width: `${presencePercent}%` }}
            >
              {presencePercent > 15 && (
                <span className="text-semcompLightBlue text-xs font-bold">{presencePercent}%</span>
              )}
            </div>
            {presencePercent <= 15 && (
              <div className="absolute right-3 top-1/2 -translate-y-1/2 text-semcompMidDarkBlue text-xs font-bold">
                {presencePercent}%
              </div>
            )}
          </div>
        </div>

        <button className="mt-6 text-xs w-[30%] text-white font-medium mx-auto bg-destructive/50 hover:text-semcompOffWhite hover:bg-destructive/60 transition-colors py-2 px-3 rounded-lg ">
          Sair da conta
        </button>
      </div>
    )}
    </div>
  );

  if (width >= 1280) {
    return (
      <div className={`${bgColor} ${textColor} min-h-screen`}>
        <div
          className={`h-[calc(90vh-70px)] w-full bg-cover bg-center ${shadowClass} flex flex-row justify-center items-center gap-10 font-poppins`}
          style={{
            backgroundImage: `url(${hogwarts})`,
            boxShadow: isDarkMode
              ? "inset 0 -160px 60px -40px rgba(11, 38, 57, 0.8)"
              : "inset 0 -180px 40px -40px rgba(53, 123, 163, 0.6)"
          }}
        >
          <div className="h-[85%] w-[28%] bg-semcompOffWhite rounded-sm overflow-hidden shadow-xl">
            {qrAndAccountCard}
          </div>

          <div className={`h-[85%] w-[28%] ${headerBgWithOpacity} flex flex-col rounded-sm overflow-hidden text-semcompOffWhite pt-12 pr-10 pl-10 pb-10`}>
            <h1 className="text-center text-3xl font-bold pb-4">SEMCOMP Beta 2026</h1>
            <p className="text-center text-md pb-2">Você sabia que vem por aí a prévia da maior semana acadêmica de computação do Brasil?</p>
            <div
              className="relative h-[50%] bg-cover bg-center "
              style={{ backgroundImage: `url(${hogwarts})` }}
            > 
              <img className="h-[80%] absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" src={hogwartsLogo} alt="Logo" />

              <span className="absolute bottom-0 left-1/2 -translate-x-1/2 translate-y-1/2 whitespace-nowrap font-bold text-2xl">
                SEMCOMP Beta
              </span>
            </div>
            <hr className=" border-semcompOffWhite mt-6 mb-3" />
            <span className="text-sm text-justify">
              A SEMCOMP Beta é uma prévia de um evento ainda maior - a Semana de Computação da USP São Carlos. Ela acontecerá no dia 16 de maio e sua programação inclui palestras, minicursos, concursos, coffee break e a nossa famosa gamenight. Participe e faça parte dessa experiência única!
            </span>
          </div>
        </div>

        <div className={`min-h-[60vh] ${isDarkMode ? "bg-semcompAlmostDarkBlue" : "bg-semcompMidLightBlue"}  flex flex-col justify-center items-center font-poppins pt-24 pb-24`}>
          <div className={`border-2 h-[80%] w-[60%] rounded-2xl pt-12 pb-10 pl-16 pr-16 flex flex-col justify-center items-center ${isDarkMode ? "bg-semcompMidDarkBlue text-semcompOffWhite border-semcompOffWhite" : "bg-semcompOffWhite text-semcompDarkBlue border-semcompDarkBlue"}`}>
            <h1 className="font-bold text-2xl mb-6">Inscrições em Eventos</h1>
            <div className="w-full flex flex-row justify-between font-bold">
              <span>Evento</span>
              <span>Data/Horário</span>
            </div>
            <hr className={`w-full border mt-3 mb-3 ${isDarkMode ? "border-semcompOffWhite" : "border-semcompAlmostDarkBlue"}`}/>
            <div className="w-full flex flex-col gap-4 mb-20">
              {events && events.length > 0 ? (
                events.map((evento, index) => {
                  const { data, diaSemana } = formatarDataDynamic(evento.data);
                  return (
                    <div key={index} className="w-full flex flex-row justify-between items-center py-2 px-4 rounded-lg bg-black/10">
                      <div className="w-1/2 flex flex-col text-left gap-2 items-start pr-4">
                        <span className="font-semibold shrink-0">{evento.tipo} |</span>
                        <span className="text-sm break-all flex-1">{evento.description}</span>
                      </div>
                      <div className="w-auto flex flex-col items-end shrink-0">
                        <div className="flex flex-row gap-2 items-center">
                          <span className="font-semibold">{data}</span>
                          <span className={`text-sm px-2 py-0.5 rounded-full ${isDarkMode ? "bg-semcompOffWhite text-semcompMidDarkBlue" : "bg-semcompDarkBlue text-semcompOffWhite capitalize"} `}>{diaSemana}</span>
                        </div>
                        <span className="text-sm">{evento.horaStart} às {evento.horaEnd}</span>
                      </div>
                    </div>
                  );
                })
              ) : (
                <div className="text-center italic mt-6 py-8">
                  Você ainda não está inscrito em nenhum evento. Inscreva-se em eventos para que eles apareçam aqui!
                </div>
              )}
            </div>
            <div className="w-full flex flex-row justify-center items-center h-[30%]">
              <button className={`bg-black/10 w-[40%] rounded-sm py-3 h-full text-xl`}>Inscreva-se</button>
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