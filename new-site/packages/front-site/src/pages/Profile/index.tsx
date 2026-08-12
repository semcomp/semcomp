import { useEffect, useState } from "react";
import QRCode from "react-qr-code";
import useWindowDimensions from "@/hooks/useWindowDimensions";
import { useTheme } from "@/contexts/useTheme";
import ContatoSection from "../Home/sections/ContatoSection";
import { useAuth } from "@/contexts/AuthContext";
import { authAPI } from "@/api";
import { salesAPI } from "@/api/sales";
import type { SaleResponse } from "@/api/sales";
import { ChevronDown } from "lucide-react";
import { useNotification } from "@/contexts/NotificationContext";
import type { EventType } from "@/types/EventType";
import type { UserType } from "@/types/UserType";
import { formatTime, formatDate, formatWeekDay } from "@/lib/utils/formatDate";
import { useNavigate } from "react-router-dom";

const HERO_IMAGES = [
  "/img/Home/Hero/Banner1.webp",
  "/img/Home/Hero/Banner2.webp",
  "/img/Home/Hero/Palestra1.webp",
  "/img/Home/Hero/Palestra2.webp",
  "/img/Home/Hero/Semcomp.webp",
];

const pickRandomHero = () =>
  HERO_IMAGES[Math.floor(Math.random() * HERO_IMAGES.length)];

type Evento = EventType & {
  linkInscricao?: string;
};

let events: Evento[] = [];

// Tipo de exibição para uma compra na tela de perfil.
// Derivado da SaleResponse retornada por GET /api/sales/me (uma venda pode ter vários itens).
export interface PurchaseType {
  id: string;
  item: string;
  date: string;
  amount: number;
  status: string;
}

const SALE_STATUS_LABELS: Record<string, string> = {
  PENDING: "Pendente",
  PAID: "Pago",
  CANCELED: "Cancelado",
  REFUNDED: "Reembolsado",
};

function getProductDisplayName(product: any): string {
  if (!product) return "Produto";

  if (product.kit?.name) return product.kit.name;
  if (product.coffee?.name) return product.coffee.name;

  if (product.type === "COMBO" && product.combo_items?.length) {
    const itemNames = product.combo_items
      .map((ci: any) => ci.item?.kit?.name ?? ci.item?.coffee?.name)
      .filter(Boolean);
    if (itemNames.length > 0) {
      return `Combo (${itemNames.join(" + ")})`;
    }
    return "Combo";
  }

  return product.type ?? "Produto";
}

function mapSaleToPurchase(sale: SaleResponse): PurchaseType {
  const itemsLabel =
  sale.items?.length
    ? sale.items
        .map((it) => {
          return `${it.quantity}x ${getProductDisplayName((it as any).product)}`;
        })
        .join(", ")
    : "Pedido";

  return {
    id: String(sale.id),
    item: itemsLabel,
    date: formatDate(sale.created_at, 2),
    amount: sale.total_amount,
    status: SALE_STATUS_LABELS[sale.status] ?? sale.status,
  };
}

interface ProfileProps extends Partial<UserType> {
  event?: string;
  purchases?: PurchaseType[];
}

export default function Profile({
  user_number = 0,
  name = "Nome do usuário",
  email = "E-mail do usuário",
  presence_rate = 0,
  event = "SEMCOMP",
  purchases = [], // Valor padrão para compras
}: ProfileProps) {
  const { width } = useWindowDimensions();
  const { isDarkMode } = useTheme();
  const { showNotification } = useNotification();

  // Adicionada a aba 'purchases' no state
  const [activeTab, setActiveTab] = useState<"qr" | "account" | "purchases">("qr");
  const [userName, setUserName] = useState(name);
  const [userEmail, setUserEmail] = useState(email);
  const [userCode, setUserCode] = useState<number>(user_number);
  const [presencePercent, setPresencePercent] = useState<number>(presence_rate);
  const [userPurchases, setUserPurchases] = useState<PurchaseType[]>(purchases);
  const [openSubscription, setOpenSubscription] = useState<number>(-1);

  const { logout, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [heroSrc] = useState<string>(() => pickRandomHero());

  useEffect(() => {
    async function fetchProfile() {
      if (!isAuthenticated) {
        navigate("/login", { replace: true });
        return;
      }

      try {
        const response = await authAPI.getProfile();
        setUserName(response.name || name);
        setUserEmail(response.email || email);
        setUserCode(response.user_number || 0);
        setPresencePercent(response.presence_rate ?? 0);
      } catch (err) {
        console.error("Erro ao buscar o perfil", err);
        await logout();
        showNotification("Sua sessão expirou. Faça login novamente.", "warning");
        return;
      }

      // Compras são buscadas em rota própria (GET /api/sales/me), que já
      // retorna apenas os pedidos do usuário autenticado (via token/JWT no backend).
      try {
        const sales = await salesAPI.getMySales();
        setUserPurchases(sales.map(mapSaleToPurchase));
      } catch (err) {
        console.error("Erro ao buscar as compras do usuário", err);
        setUserPurchases([]);
      }
    }
    fetchProfile();
  }, [isAuthenticated, navigate, logout, showNotification, name, email]);

  // EventCardMobile — inline dark: variants
  const EventCardMobile = ({ ev }: { ev: Evento }) => {
    const data = formatDate(ev.dateInit, 2);
    const diaSemana = formatWeekDay(ev.dateInit);

    return (
      <div className="border rounded-xl p-4 mb-3 bg-black/10 border-semcompDarkBlue/20 text-semcompDarkBlue dark:bg-white/10 dark:border-white/20 dark:text-white flex flex-col items-start">
        <div className="w-full">
          <div className="flex items-start gap-2">
            <span className="font-bold whitespace-nowrap">{ev.type}</span>
            <span className="opacity-60">|</span>
            <p className="text-sm leading-relaxed opacity-90 wrap-break-words">{ev.description}</p>
          </div>
          <p className="mt-3 text-sm opacity-80 font-medium text-center">
            {diaSemana} ({data}), {formatTime(ev.dateInit)} às {formatTime(ev.dateEnd)}
          </p>
          <hr className="mb-2 mt-2" />
        </div>
        <div className="w-full flex flex-row justify-center bg-black/10 border-semcompDarkBlue/20 text-semcompDarkBlue dark:bg-white/10 dark:border-white/20 dark:text-white/90 rounded-sm">
          <button
            className="cursor-pointer w-full p-2"
            onClick={() =>
              ev.linkInscricao
                ? window.open(ev.linkInscricao, "_blank")
                : showNotification("Este evento ainda não está aberto para inscrições.")
            }
          >
            Inscreva-se
          </button>
        </div>
      </div>
    );
  };

  // Versão Mobile/Tablet (< 1280px)
  if (width < 1280) {
    return (
      <div className="min-h-screen bg-semcompOffWhite dark:bg-semcompAlmostDarkBlue font-poppins pb-10 transition-colors duration-300">
        {/* Header com Background */}
        <div className="relative h-80 w-full overflow-hidden bg-black">
          <img
            src={heroSrc}
            className="absolute inset-0 w-full h-full object-cover opacity-60"
            alt="SEMCOMP Banner"
          />
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <img src="/img/semcomp/logo_default_branco.webp" alt="SEMCOMP Logo" className="w-1/2 max-w-50 object-contain drop-shadow-2xl" />
          </div>
          <div className="absolute inset-0 bg-linear-to-b from-transparent to-semcompOffWhite dark:to-semcompAlmostDarkBlue" />

          {/* Tabs Seletoras atualizadas para suportar 3 opções */}
          <div className="absolute bottom-10 left-1/2 -translate-x-1/2 flex backdrop-blur-md rounded-full p-1 border w-[90%] max-w-sm z-20 bg-semcompMidLightBlue/40 border-semcompDarkBlue/20 dark:bg-black/40 dark:border-white/20">
            <button
              onClick={() => setActiveTab("qr")}
              className={`flex-1 py-2 text-xs md:text-sm rounded-full transition-all font-bold ${
                activeTab === "qr"
                  ? "bg-semcompDarkBlue text-semcompOffWhite dark:bg-[#D9D9D9] dark:text-[#0B2639]"
                  : "text-semcompDarkBlue dark:text-white opacity-80"
              }`}
            >
              QR Code
            </button>
            <button
              onClick={() => setActiveTab("account")}
              className={`flex-1 py-2 text-xs md:text-sm rounded-full transition-all font-bold ${
                activeTab === "account"
                  ? "bg-semcompDarkBlue text-semcompOffWhite dark:bg-[#D9D9D9] dark:text-[#0B2639]"
                  : "text-semcompDarkBlue dark:text-white opacity-80"
              }`}
            >
              Minha Conta
            </button>
            <button
              onClick={() => setActiveTab("purchases")}
              className={`flex-1 py-2 text-xs md:text-sm rounded-full transition-all font-bold ${
                activeTab === "purchases"
                  ? "bg-semcompDarkBlue text-semcompOffWhite dark:bg-[#D9D9D9] dark:text-[#0B2639]"
                  : "text-semcompDarkBlue dark:text-white opacity-80"
              }`}
            >
              Compras
            </button>
          </div>
        </div>

        {/* Conteúdo Principal */}
        <div className="px-5 -mt-6 relative z-10">
          <div className="bg-gray-200 text-semcompDarkBlue border border-semcompDarkBlue/10 shadow-lg dark:bg-[#D9D9D9] dark:text-[#0B2639] dark:border-0 dark:shadow-none rounded-3xl p-6 md:p-8 flex flex-col items-center shadow-2xl min-h-100">
            {activeTab === "qr" && (
              <>
                <h1 className="text-2xl font-bold mb-1">Meu QR Code</h1>
                <p className="text-center text-sm mb-8 px-2 md:px-4">
                  Utilize seu QR durante a <span className="font-semibold">{event}</span> para registrar sua presença
                </p>

                <div className="relative p-6 mb-6">
                  <div className="absolute top-0 right-0 w-12 h-12 border-t-8 border-r-8 border-[#548EAB]" />
                  <div className="absolute bottom-0 left-0 w-12 h-12 border-b-8 border-l-8 border-[#548EAB]" />
                  <div className="bg-white p-2">
                    <QRCode value={userCode.toString()} size={180} fgColor="#0B2639" />
                  </div>
                </div>

                <p className="font-bold text-lg mb-6 text-center">{userName}</p>

                <div className="bg-semcompMidLightBlue/20 border-semcompDarkBlue/20 dark:bg-[#B7C9D3] dark:border-[#0B2639]/10 rounded-xl p-4 w-full flex flex-row items-center justify-between gap-4 border">
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
                <h2 className="text-2xl font-bold text-center mb-6">Minha Conta</h2>

                <div className="flex flex-col space-y-4 mb-6">
                  <div className="flex flex-col border-b border-black/10 pb-2">
                    <span className="text-xs font-bold opacity-70 text-semcompDarkBlue">Nome Completo:</span>
                    <span className="text-sm font-medium text-semcompDarkBlue">{userName}</span>
                  </div>
                  <div className="flex flex-col border-b border-black/10 pb-2">
                    <span className="text-xs font-bold opacity-70 text-semcompDarkBlue">E-mail:</span>
                    <span className="text-sm font-medium text-semcompDarkBlue">{userEmail}</span>
                  </div>
                </div>

                <div className="bg-white/50 rounded-xl p-4 mb-6 border border-black/10">
                  <h3 className="text-center text-sm font-bold mb-3">Minha Presença</h3>
                  <div className="relative w-full h-6 bg-black/10 rounded-full overflow-hidden">
                    <div
                      className={`absolute inset-y-0 left-0 h-full bg-semcompDarkBlue transition-all duration-1000 ${
                        presencePercent > 15 ? "flex items-center justify-end pr-2" : ""
                      }`}
                      style={{ width: `${presencePercent}%` }}
                    >
                      {presencePercent > 15 && (
                        <span className="text-white text-[10px] font-bold">{presencePercent}%</span>
                      )}
                    </div>
                    {presencePercent <= 15 && (
                      <div className="absolute right-2 top-1/2 -translate-y-1/2 text-semcompDarkBlue text-[10px] font-bold">
                        {presencePercent}%
                      </div>
                    )}
                  </div>
                </div>

                <button className="w-full bg-semcompDarkBlue text-white py-3 rounded-lg text-sm font-semibold mb-4"
                  onClick={() => showNotification("Entre em contato com a organização", "info")}>
                  Editar Informações
                </button>
                <button className="w-full text-red-700 font-bold text-sm py-2" onClick={logout}>
                  Sair da conta
                </button>
              </div>
            )}

            {activeTab === "purchases" && (
              <div className="w-full flex flex-col animate-in fade-in duration-300">
                <h2 className="text-2xl font-bold text-center mb-6">Minhas Compras</h2>
                <div className="flex flex-col gap-4">
                  {userPurchases && userPurchases.length > 0 ? (
                    userPurchases.map((purchase) => (
                      <div key={purchase.id} className="bg-white/50 border border-black/10 rounded-xl p-4">
                        <p className="font-bold text-sm text-semcompDarkBlue">{purchase.item}</p>
                        <div className="flex justify-between items-center mt-2">
                          <span className="text-xs font-semibold opacity-70">{purchase.date}</span>
                          <span className="text-sm font-bold text-green-700">
                            R$ {purchase.amount.toFixed(2)}
                          </span>
                        </div>
                        <div className="mt-2 text-xs font-semibold text-semcompDarkBlue/80">
                          Status: {purchase.status}
                        </div>
                      </div>
                    ))
                  ) : (
                    <p className="text-center opacity-70 text-sm py-4 italic">
                      Nenhuma compra realizada ainda.
                    </p>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Seção Overflow */}
        <div className="mt-12 pt-10 pb-10 px-5 text-center transition-colors bg-semcompMidLightBlue text-semcompOffWhite dark:bg-semcompDarkBlue">
          <h2 className="text-3xl font-bold mb-1 flex items-center justify-center gap-2">
            SEMCOMP Beta 2026
            <span className="flex items-center justify-center w-5 h-5 rounded-full border text-xs font-normal border-semcompDarkBlue/60 text-semcompDarkBlue/60 dark:border-white/60 dark:text-white/60">
              ?
            </span>
          </h2>
          <p className="text-xs mb-6 opacity-80">
            Você sabia que vem por aí a prévia da maior semana acadêmica de computação do Brasil?
          </p>

          <div className="relative rounded-2xl overflow-hidden mb-4 border bg-white border-semcompDarkBlue/20 dark:bg-black/50 dark:border-white/10">
            <img src={heroSrc} className="w-full h-56 object-cover brightness-[0.7]" alt="SEMCOMP Beta"/>
            <div className="absolute inset-0 flex flex-col items-center justify-center pt-4">
              <img src="/img/semcomp/logo_default_branco.webp" className="w-32 mb-2 drop-shadow-2xl" alt="Logo" />
              <h3 className="text-2xl font-black tracking-widest drop-shadow-lg text-white">SEMCOMP Beta</h3>
            </div>
          </div>

          <div className="border-t pt-4 px-2 border-semcompDarkBlue/20 dark:border-white/20">
            <p className="text-[11px] leading-relaxed text-justify opacity-90">
              A SEMCOMP Beta é uma prévia de um evento ainda maior - a Semana de
              Computação da USP São Carlos. Ela acontecerá no dia 16 de maio e
              sua programação inclui palestras, minicursos, concursos, coffee
              break e a nossa famosa gamenight. Participe e faça parte dessa
              experiência única!
            </p>
          </div>
        </div>

        {/* Seção Inscrições */}
        <div className="mt-12 mb-12 px-5">
          <div className="rounded-3xl p-6 border shadow-xl transition-colors bg-semcompOffWhite border-semcompDarkBlue text-semcompDarkBlue dark:bg-[#1A3A4F] dark:border-white/10 dark:text-semcompOffWhite">
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

  // QR Code / Minha Conta / Compras - Versão Desktop
  const qrAndAccountCard = (
    <div className="h-full w-full pt-5 bg-gray-300 flex flex-col text-semcompDarkBlue">
      <div className="flex mx-auto mb-5 w-[85%] rounded-full m-3 p-1 gap-1 border-2 border-semcompOffWhite/20 bg-semcompMidLight/20">
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
        <button
          onClick={() => setActiveTab("purchases")}
          className={`flex-1 text-center py-2 rounded-full text-sm transition-all duration-200 ${
            activeTab === "purchases"
              ? "bg-semcompDarkBlue text-semcompOffWhite shadow-md font-semibold"
              : "text-semcompDarkBlue/70 hover:text-semcompDarkBlue"
          }`}
        >
          Compras
        </button>
      </div>

      {activeTab === "qr" && (
        <div className="px-6 pb-8 bg-semcompOffWhite/50 mx-auto pt-8 h-full flex flex-col items-center overflow-y-auto custom-scrollbar">
          <h1 className="text-2xl text-semcompMidDarkBlue font-bold mb-1">Meu QR Code</h1>
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
                value={userCode.toString()}
                size={width >= 1280 ? 220 : 200}
                fgColor="#0B2639"
                bgColor="transparent"
              />
            </div>
          </div>

          <p className="text-center font-medium mb-6">{userName}</p>
          <div className="bg-semcompMidLightBlue/15 rounded-xl p-4 flex items-center justify-between gap-4 w-full 2xl:w-[70%] border border-semcompMidLight/40">
            <p className="text-xs text-semcompDarkBlue/75 leading-tight">
              Caso de algum problema ao scannear, forneça o codigo:
            </p>
            <p className="text-xl font-bold tracking-[0.2em] whitespace-nowrap">{userCode}</p>
          </div>
        </div>
      )}

      {activeTab === "account" && (
        <div className="px-6 pb-8 pt-4 mx-auto w-full 2xl:w-5/6 flex flex-col text-foreground animate-in fade-in duration-300 overflow-y-auto custom-scrollbar">
          <div className="text-center mb-6">
            <h2 className="text-xl font-bold text-semcompMidDarkBlue font-poppins">Minha Conta</h2>
            <p className="text-md text-semcompDarkBlue/75">Veja abaixo, seus dados e presença</p>
          </div>

          <div className="flex flex-col space-y-4 mb-6">
            <div className="flex flex-col text-left">
              <span className="text-sm font-bold text-semcompDarkBlue">Nome Completo:</span>
              <span className="text-sm text-semcompDarkBlue">{userName}</span>
            </div>
            <div className="flex flex-col text-left">
              <span className="text-sm font-bold text-semcompDarkBlue">E-mail:</span>
              <span className="text-sm text-semcompDarkBlue">{userEmail}</span>
            </div>
          </div>

          <button
            className="w-full bg-semcompMidDarkBlue hover:bg-semcompDarkBlue/90 text-white py-2.5 rounded-lg text-sm font-semibold transition-all shadow-md mb-8"
            onClick={() => showNotification("Entre em contato com a organização", "info")}
          >
            Editar Informações
          </button>

          <div className="bg-semcompOffWhite/40 rounded-xl p-5 border border-border/50">
            <h3 className="text-center text-semcompMidDarkBlue text-md font-bold text-semcomp-900 mb-4">
              Minha Presença na SEMCOMP
            </h3>
            <div className="relative w-full h-8 bg-semcompOffWhite/50 rounded-full border-5 border-border/30 overflow-hidden">
              <div
                className={`absolute inset-y-0 left-0 h-full bg-semcompMidDarkBlue flex items-center transition-all duration-1000 rounded-r-full ${
                  presencePercent > 15 ? "justify-end pr-4" : "justify-start"
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

          <button
            onClick={logout}
            className="mt-6 text-xs text-white font-medium mx-auto bg-destructive/70 hover:text-semcompOffWhite hover:bg-destructive/50 transition-colors py-2 px-3 rounded-lg"
          >
            Sair da conta
          </button>
        </div>
      )}

      {activeTab === "purchases" && (
        <div className="px-6 pb-8 pt-4 mx-auto w-full 2xl:w-5/6 flex flex-col text-foreground animate-in fade-in duration-300 overflow-y-auto custom-scrollbar">
          <div className="text-center mb-6">
            <h2 className="text-xl font-bold text-semcompMidDarkBlue font-poppins">Minhas Compras</h2>
            <p className="text-md text-semcompDarkBlue/75">Veja seu histórico de compras</p>
          </div>

          <div className="flex flex-col gap-3">
            {userPurchases && userPurchases.length > 0 ? (
              userPurchases.map((purchase) => (
                <div key={purchase.id} className="bg-semcompOffWhite/60 rounded-xl p-4 border border-border/50 flex flex-col">
                  <span className="font-bold text-semcompDarkBlue">{purchase.item}</span>
                  <div className="flex justify-between mt-2">
                    <span className="text-xs font-medium text-semcompDarkBlue/70">{purchase.date}</span>
                    <span className="text-sm font-bold text-green-700">R$ {purchase.amount.toFixed(2)}</span>
                  </div>
                  <span className="text-xs font-semibold text-semcompDarkBlue/80 mt-1">Status: {purchase.status}</span>
                </div>
              ))
            ) : (
              <p className="text-center opacity-70 text-sm py-6 italic">
                Você ainda não realizou nenhuma compra.
              </p>
            )}
          </div>
        </div>
      )}
    </div>
  );

  // Versão Desktop Principal
  if (width >= 1280) {
    return (
      <div className="bg-semcompOffWhite text-semcompDarkBlue dark:bg-semcompDarkBlue dark:text-semcompOffWhite min-h-screen">
        <div
          className="h-[calc(90vh-70px)] w-full bg-cover bg-center flex flex-row justify-center items-center gap-10 font-poppins"
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

          <div className="h-[85%] w-[28%] bg-semcompMidDarkBlue/80 dark:bg-semcompDarkBlue/80 flex flex-col rounded-sm overflow-hidden text-semcompOffWhite pt-12 pr-10 pl-10 pb-10">
            <h1 className="text-center text-3xl font-bold pb-4">SEMCOMP Beta 2026</h1>
            <p className="text-center text-md pb-2">
              Você sabia que vem por aí a prévia da maior semana acadêmica de computação do Brasil?
            </p>
            <div className="relative h-[50%] bg-cover bg-center bg-black">
              <img src={heroSrc} className="absolute inset-0 w-full h-full object-cover opacity-60" alt="background"/>
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                <img className="h-[80%] drop-shadow-2xl" src="/img/semcomp/logo_default_branco.webp" alt="Logo" />
              </div>
              <span className="absolute bottom-0 left-1/2 -translate-x-1/2 translate-y-1/2 whitespace-nowrap font-bold text-2xl z-10 text-white drop-shadow-md">
                SEMCOMP Beta
              </span>
            </div>
            <hr className="border-semcompOffWhite mt-6 mb-3" />
            <span className="text-sm text-justify">
              A SEMCOMP Beta é uma prévia de um evento ainda maior - a Semana de
              Computação da USP São Carlos. Ela acontecerá no dia 16 de maio e
              sua programação inclui palestras, minicursos, concursos, coffee
              break e a nossa famosa gamenight. Participe e faça parte dessa
              experiência única!
            </span>
          </div>
        </div>

        <div className="min-h-[60vh] bg-semcompMidLightBlue dark:bg-semcompAlmostDarkBlue flex flex-col justify-center items-center font-poppins pt-24 pb-24">
          <div className="border-2 h-[80%] w-[60%] rounded-2xl pt-12 pb-10 pl-16 pr-16 flex flex-col justify-center items-center bg-semcompOffWhite text-semcompDarkBlue border-semcompDarkBlue dark:bg-semcompMidDarkBlue dark:text-semcompOffWhite dark:border-semcompOffWhite">
            <h1 className="font-bold text-2xl mb-6">Inscrições em Eventos</h1>
            <div className="w-full flex flex-row justify-between font-bold">
              <span>Evento</span>
              <span>Data/Horário</span>
            </div>
            <hr className="w-full border mt-3 mb-3 border-semcompAlmostDarkBlue dark:border-semcompOffWhite" />
            <div className="w-full flex flex-col gap-4 mb-20">
              {events && events.length > 0 ? (
                events.map((evento, index) => {
                  const data = formatDate(evento.dateInit, 2);
                  const diaSemana = formatWeekDay(evento.dateInit);

                  return (
                    <div key={index} className="flex flex-col justify-center items-center">
                      <div
                        className={`w-full flex flex-row justify-between items-center py-3 px-6 ${openSubscription === index ? "rounded-t-lg bg-black/15 shadow-inner" : "rounded-lg bg-black/5 hover:bg-black/10"} transition-all duration-300 cursor-pointer`}
                        onClick={() => setOpenSubscription(openSubscription === index ? -1 : index)}
                      >
                        <div className="w-1/2 flex flex-col text-left gap-1 items-start pr-4">
                          <span className="font-bold text-lg shrink-0">{evento.type}</span>
                          <span className="text-sm font-medium wrap-break-words flex-1 opacity-90">{evento.description}</span>
                        </div>
                        <div className="w-auto flex flex-col items-end shrink-0 gap-1">
                          <div className="flex flex-row gap-3 items-center">
                            <span className="font-semibold text-md">{data}</span>
                            <span className="text-xs px-3 py-1 font-bold rounded-full bg-semcompDarkBlue text-semcompOffWhite capitalize dark:bg-semcompOffWhite dark:text-semcompMidDarkBlue">
                              {diaSemana}
                            </span>
                          </div>
                          <span className="text-sm font-medium opacity-80 flex items-center gap-2">
                            {formatTime(evento.dateInit)} às {formatTime(evento.dateEnd)}
                            <ChevronDown
                              className={`transition-transform duration-300 ${openSubscription === index ? "rotate-180" : ""} text-black dark:text-white`}
                              size={20}
                            />
                          </span>
                        </div>
                      </div>
                      {openSubscription === index && (
                        <div className="w-full p-6 flex flex-row items-center justify-center rounded-b-lg border-t border-black/10 shadow-lg transition-all animate-in fade-in duration-300 bg-black/5 dark:bg-black/20">
                          <button
                            className="px-8 py-3 rounded-xl font-bold uppercase tracking-wide shadow-md hover:-translate-y-1 transition-all duration-300 bg-semcompDarkBlue text-semcompOffWhite hover:bg-semcompMidDarkBlue hover:shadow-semcompDarkBlue/40 dark:bg-semcompOffWhite dark:text-semcompDarkBlue dark:hover:bg-white dark:hover:shadow-white/20"
                            onClick={() => evento.linkInscricao ? window.open(evento.linkInscricao, "_blank") : showNotification("Este evento ainda não está aberto para inscrições.")}
                          >
                            Inscreva-se
                          </button>
                        </div>
                      )}
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

  // Fallback
  return (
    <div className="flex justify-center p-4 min-h-screen bg-semcompMidDarkBlue/90 items-center font-poppins">
      <div className="w-full max-w-85 rounded-2xl overflow-hidden shadow-xl animate-in fade-in zoom-in duration-300">
        {qrAndAccountCard}
      </div>
    </div>
  );
}