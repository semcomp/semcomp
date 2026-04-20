import { useEffect, useState } from "react";
import QRCode from "react-qr-code";

import useWindowDimensions from "@/hooks/useWindowDimensions"
import { useTheme } from "@/contexts/useTheme"
import hogwarts from "../../assets/img/profilePics/hogwarts.jpg"
import hogwartsLogo from "../../assets/img/profilePics/hogwartsLogo.png"
import ContatoSection from "../Home/sections/ContatoSection"

interface ProfileProps {
  name: string;
  email: string;
  code: string;
  qrValue: string;
  event?: string;
}

export default function Profile({
  name = "João Gabriel Pieroli da Silva",
  email = "joao.gabriel@example.com",
  code = "011235",
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

  const headerBgWithOpacity = isDarkMode ? "bg-semcompDarkBlue/80" : "bg-semcompMidDarkBlue/80";
  const shadowClass = isDarkMode
  ? "shadow-[inset_0_-180px_40px_-40px_theme(colors.semcompDarkBlue/100%)]"
  : "shadow-[inset_0_-180px_40px_-40px_theme(colors.semcompMidLight/100%)]";

  useEffect(() => {
    // Chamada de API para buscar os dados do usuário
    setUserName(name);
    setUserCode(code);
    setQrData(qrValue);
    // TODO: substituir por chamada real para presença do usuário
    setPresencePercent(16);
  }, [name, code, qrValue]);

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
      
      {/* Card do QR Code*/ }
      {activeTab === "qr" && (
        <div className="px-6 pb-8 bg-semcompOffWhite/50 mx-auto pt-8 h-full flex flex-col items-center">
          <h1 className="text-2xl text-semcompMidDarkBlue font-bold mb-1">Meu QR Code</h1>
          <p className="text-md text-semcompDarkBlue/75 text-center mb-6 leading-relaxed">
            Utilize seu QR durante a <span className="text-semcompMidBlue font-semibold">{event}</span> para registrar sua presença
          </p>
          <div className="relative p-4 mb-4">
            <div className="absolute top-0 right-0 w-10 h-10 border-r-15 border-t-15 border-semcompMidLightBlue" />
            <div className="absolute bottom-0 left-0 w-10 h-10 border-l-15 border-b-15 border-semcompMidLightBlue" />
            { /* QR Code gerado a partir do valor qrData */}
            <div className="bg-linear-to-br from-semcompMidLight to-semcompOffWhite p-4 -m-2">
              <QRCode value={qrData} size={width >= 1280 ? 220 : 200} fgColor="#0B2639" bgColor="transparent" />
            </div>
          </div>

          <p className="text-center font-medium mb-6">{userName}</p>
          { /* Código de Fallback */ }
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
      <div className="px-6 pb-8 pt-4 mx-auto w-full 2xl:w-5/6 flex flex-col text-foreground animate-in fade-in duration-300">
        {/* Título e Subtítulo conforme a imagem */}
        <div className="text-center mb-6">
          <h2 className="text-xl font-bold text-semcompMidDarkBlue font-poppins">Minha Conta</h2>
          <p className="text-md text-semcompDarkBlue/75">Veja abaixo, seus dados e presença</p>
        </div>

        {/* Lista de Campos */}
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

        {/* Botão de Edição */}
        <button className="w-full bg-semcompMidDarkBlue hover:bg-semcompDarkBlue/90 text-white py-2.5 rounded-lg text-sm font-semibold transition-all shadow-md mb-8">
          Editar Informações
        </button>

        {/* Seção de Presença */}
        <div className="bg-muted/40 rounded-xl p-5 border border-border/50">
          <h3 className="text-center text-semcompMidDarkBlue text-md font-bold text-semcomp-900 mb-4">
            Minha Presença na SEMCOMP
          </h3>
          
          {/* Barra de Progresso */}
          <div className="relative w-full h-8 bg-background/50 rounded-full border-5 border-border/30 overflow-hidden">
            {/* preenchimento da barra */}
            <div
              className={`absolute inset-y-0 left-0 h-full bg-semcompMidDarkBlue flex items-center transition-all duration-1000 rounded-r-full ${
                presencePercent > 12 ? 'justify-end pr-4' : 'justify-start'
              }`}
              style={{ width: `${presencePercent}%` }}
            >
              {/* mostra o texto dentro da barra quando houver espaço suficiente */}
              {presencePercent > 15 && (
                <span className="text-semcompLightBlue text-xs font-bold">{presencePercent}%</span>
              )}
            </div>

            {/* para porcentagens pequenas, exibe o texto fora da barra */}
            {presencePercent <= 15 && (
              <div className="absolute right-3 top-1/2 -translate-y-1/2 text-semcompMidDarkBlue text-xs font-bold">
                {presencePercent}%
              </div>
            )}
          </div>
        </div>

        {/* Logout */}
        <button className="mt-6 text-xs w-[30%] text-white font-medium mx-auto bg-destructive/50 hover:text-semcompOffWhite hover:bg-destructive/60 transition-colors py-2 px-3 rounded-lg ">
          Sair da conta
        </button>
      </div>
    )}
        </div>
      );

      if (width >= 1280) {
        return (
          <div>
            <div
              className={`h-[calc(90vh-70px)] w-full bg-cover bg-center ${shadowClass} flex flex-row justify-center items-center gap-7 font-poppins`}
              style={{
                backgroundImage: `url(${hogwarts})`,
                boxShadow: isDarkMode
                  ? "inset 0 -160px 60px -40px rgba(11, 38, 57, 0.8)"
                  : "inset 0 -180px 40px -40px rgba(53, 123, 163, 0.6)"
              }}
            >
              <div className="h-[80%] w-[28%] bg-semcompOffWhite rounded-sm overflow-hidden shadow-xl">
                {qrAndAccountCard}
              </div>

              <div className={`h-[80%] w-[28%] ${headerBgWithOpacity} flex flex-col rounded-sm overflow-hidden text-semcompOffWhite pt-12 pr-10 pl-10 pb-10`}>
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
            <ContatoSection />
          </div>
      );
    }

  return (
    <div className="flex justify-center p-4 min-h-screen bg-semcompMidDarkBlue/90 items-center font-poppins">
      <div className="w-full max-w-85 rounded-2xl overflow-hidden shadow-xl animate-in fade-in zoom-in duration-300">
        {qrAndAccountCard}
      </div>
    </div>
  );
}