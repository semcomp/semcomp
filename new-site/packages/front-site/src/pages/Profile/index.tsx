import { useEffect, useRef, useState, memo } from "react";
import QRCode from "react-qr-code";
import useWindowDimensions from "@/hooks/useWindowDimensions";
import ContatoSection from "../Home/sections/ContatoSection";
import { useAuth } from "@/contexts/AuthContext";
import { authAPI, absenceJustificationsAPI, papfeAPI, client } from "@/api";
import { salesAPI } from "@/api/sales";
import type { SaleResponse } from "@/api/sales";
import { ChevronDown, Megaphone, Eye } from "lucide-react";
import { useNotification } from "@/contexts/NotificationContext";
import { useFeatureFlags } from "@/contexts/FeatureFlagsContext";
import { isPendingSale } from "@/lib/pendingSale";
import type { EventType } from "@/types/EventType";
import type { SigninEventType } from "@/types/SigninEventType";
import type { UserType } from "@/types/UserType";
import type { NoticeType } from "@/types/NoticeType";
import type { PapfeDocumentType } from "@/types/PapfeDocumentType";
import { papfeStatusOf } from "@/types/PapfeDocumentType";
import { formatTime, formatDate, formatWeekDay } from "@/lib/utils/formatDate";
import { signinEventsAPI } from "@/api/signinEvents";
import { useNavigate } from "react-router-dom";
import { AnimatedBackground } from "@/components/AnimatedBackground";
import JustifyAbsenceModal, { JustifyAbsenceStatusBadge } from "@/components/JustifyAbsenceModal";
import type { JustifyAbsenceStatus } from "@/components/JustifyAbsenceModal";
import { PapfeStatusBadge } from "@/components/PapfeStatusBadge";
import PapfeUploadModal from "@/components/PapfeUploadModal";
import RejectionReasonModal from "@/components/RejectionReasonModal";

type EditableProfile = {
  name: string;
  city: string;
  profession: string;
  linkedin: string;
  telegram: string;
};

function StatusEyeButton({ onClick }: { onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      aria-label="Ver motivo da negativa"
      title="Ver motivo da negativa"
      className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-semcompDarkBlue text-white transition-colors hover:bg-semcompMidDarkBlue dark:bg-semcompOffWhite dark:text-semcompDarkBlue dark:hover:bg-white"
    >
      <Eye className="w-4 h-4" />
    </button>
  );
}

export interface PurchaseType {
  id: string;
  item: string;
  date: string;
  amount: number;
  status: string;
  statusColor: string;
}

const SALE_STATUS_STYLES: Record<string, { label: string; color: string }> = {
  PAGO: { label: "Pago", color: "text-green-700" },
  PENDENTE: { label: "Pendente", color: "text-yellow-600" },
  CANCELADO: { label: "Cancelado", color: "text-red-700" },
  REEMBOLSADO: { label: "Reembolsado", color: "text-blue-700" },
  REJEITADO: { label: "Rejeitado", color: "text-orange-600" },
  EXPIRADO: { label: "Expirado", color: "text-gray-500" },
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

  const style = SALE_STATUS_STYLES[sale.status] ?? { label: sale.status, color: "text-gray-500" };

  return {
    id: String(sale.id),
    item: itemsLabel,
    date: formatDate(sale.created_at, 2),
    amount: sale.total_amount,
    status: style.label,
    statusColor: style.color,
  };
}

const EventCardMobile = memo(({ ev, subscription, onSignin, isSigningIn, onCancel, isCanceling }: {
  ev: EventType;
  subscription: SigninEventType | undefined;
  onSignin: () => void;
  isSigningIn: boolean;
  onCancel: () => void;
  isCanceling: boolean;
}) => {
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
        <hr className="mb-2 mt-2"/>
      </div>
      <div className="w-full flex flex-col justify-center bg-black/10 border-semcompDarkBlue/20 text-semcompDarkBlue dark:bg-white/10 dark:border-white/20 dark:text-white/90 rounded-sm">
        {subscription ? (
          <>
            <span className={`w-full p-2 text-center text-sm font-semibold ${
              subscription.status === "Inscrito" ? "text-green-700 dark:text-green-400" : "text-yellow-700 dark:text-yellow-400"
            }`}>
              {subscription.status === "Inscrito"
                ? "Inscrito"
                : `Lista de Espera - ${subscription.user_wait_list_position}ª posição`}
            </span>
            <button
              className="cursor-pointer w-full p-2 text-sm text-red-600 dark:text-red-400 border-t border-black/10 disabled:opacity-50 disabled:cursor-not-allowed"
              disabled={isCanceling}
              onClick={onCancel}
            >
              {isCanceling ? "Cancelando..." : "Desistir"}
            </button>
          </>
        ) : (
          <button
            className="cursor-pointer w-full p-2 disabled:opacity-50 disabled:cursor-not-allowed"
            disabled={isSigningIn}
            onClick={onSignin}
          >
            {isSigningIn ? "Inscrevendo..." : "Inscrever-se"}
          </button>
        )}
      </div>
    </div>
  );
});

interface BackendNoticeResponse {
  notices: Array<{
    id: number;
    title: string;
    content: string;
    date_time: string;
  }>;
  TotalRecords: number;
  FilteredRecords: number;
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
  purchases = [],
}: ProfileProps) {
  const { width } = useWindowDimensions();
  const { showNotification } = useNotification();

  const [activeTab, setActiveTab] = useState<"qr" | "account" | "purchases">("qr");
  const [userName, setUserName] = useState(name);
  const [userEmail, setUserEmail] = useState(email);
  const [userCode, setUserCode] = useState<number>(user_number);
  const [presencePercent, setPresencePercent] = useState<number>(presence_rate);
  const [openSubscription, setOpenSubscription] = useState<number>(-1);
  const [justifyOpen, setJustifyOpen] = useState(false);
  const [justificationStatus, setJustificationStatus] = useState<JustifyAbsenceStatus | null>(null);
  const [absenceRejectionReason, setAbsenceRejectionReason] = useState("");
  const [papfeDoc, setPapfeDoc] = useState<PapfeDocumentType | null>(null);
  const [papfeModalOpen, setPapfeModalOpen] = useState(false);
  const [reasonModal, setReasonModal] = useState<"papfe" | "absence" | null>(null);
  const [userPurchases, setUserPurchases] = useState<PurchaseType[]>(purchases);
  const [userCity, setUserCity] = useState("");
  const [userProfession, setUserProfession] = useState("");
  const [userLinkedin, setUserLinkedin] = useState("");
  const [userTelegram, setUserTelegram] = useState("");
  const [notices, setNotices] = useState<NoticeType[]>([]);
  const [signinEvents, setSigninEvents] = useState<EventType[]>([]);
  const [mySignins, setMySignins] = useState<SigninEventType[]>([]);
  const [signingInKey, setSigningInKey] = useState<string | null>(null);
  const [cancelingKey, setCancelingKey] = useState<string | null>(null);
  const [cancelConfirm, setCancelConfirm] = useState<{ eventName: string; eventInitDate: string } | null>(null);

  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [editForm, setEditForm] = useState<EditableProfile>({ name: "", city: "", profession: "", linkedin: "", telegram: "" });

  // Justificativas "Aprovado" ou "Negado" são finais e não podem ser editadas.
  const justificationLocked =
    justificationStatus === "aprovado" || justificationStatus === "negado";

  const { logout, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const { isFeatureEnabled } = useFeatureFlags();
  const [pendingSalesCount, setPendingSalesCount] = useState(0);

  const logoutRef = useRef(logout);
  const showNotificationRef = useRef(showNotification);
  logoutRef.current = logout;
  showNotificationRef.current = showNotification;

  const handleJustifySubmitted = (status: JustifyAbsenceStatus) => {
    setJustificationStatus(status);
    setAbsenceRejectionReason("");
  };

  const handlePapfeSubmitted = (doc: PapfeDocumentType) => {
    setPapfeDoc(doc);
  };

  useEffect(() => {
    if (!isAuthenticated) {
      navigate("/login", { replace: true });
      return;
    }

    const controller = new AbortController();

    async function fetchProfile() {
      try {
        const response = await authAPI.getProfile();
        if (controller.signal.aborted) return;
        setUserName(response.name || name);
        setUserEmail(response.email || email);
        setUserCode(response.user_number || 0);
        setPresencePercent(response.presence_rate ?? 0);
        setUserCity(response.city ?? "");
        setUserProfession(response.profession ?? "");
        setUserLinkedin(response.linkedin ?? "");
        setUserTelegram(response.telegram ?? "");

        const mine = await absenceJustificationsAPI.getMine();
        if (mine) {
          setJustificationStatus(mine.status);
          if (mine.status === "negado")
            setAbsenceRejectionReason(mine.rejection_reason ?? "");
        }

        const papfeDocResponse = await papfeAPI.getMine();
        setPapfeDoc(papfeDocResponse);
      } catch (err) {
        if (controller.signal.aborted) return;
        console.error("Erro ao buscar o perfil", err);
        await logoutRef.current();
        showNotificationRef.current("Sua sessão expirou. Faça login novamente.", "warning");
        return;
      }

      try {
        const sales = await salesAPI.getMySales();
        if (controller.signal.aborted) return;
        setUserPurchases(sales.map(mapSaleToPurchase));
        setPendingSalesCount(sales.filter(isPendingSale).length);
      } catch (err) {
        if (controller.signal.aborted) return;
        console.error("Erro ao buscar as compras do usuário", err);
        setUserPurchases([]);
        setPendingSalesCount(0);
      }

      try {
        const response = await client.get<BackendNoticeResponse>(
          "/api/notices",
          { params: { page: 1, limit: 10, sort_by: "date_time", sort_order: "desc" } }
        );
        if (controller.signal.aborted) return;
        const formattedNotices: NoticeType[] = (
          response.data.notices || []
        ).map((notice) => ({
          ...notice,
          date: notice.date_time
            ? new Date(notice.date_time).toLocaleDateString("pt-BR", {
                day: "2-digit",
                month: "2-digit",
                year: "numeric",
                hour: "2-digit",
                minute: "2-digit",
              })
            : "",
        }));
        setNotices(formattedNotices);
      } catch (err) {
        console.error("Erro ao buscar o mural de avisos", err);
      }
    }

    fetchProfile();
    return () => controller.abort();
  }, [isAuthenticated, navigate, name, email]);

  useEffect(() => {
    if (!isAuthenticated) return;
    Promise.all([signinEventsAPI.getSigninEvents(), signinEventsAPI.getMySignins()])
      .then(([events, signins]) => {
        setSigninEvents(events);
        setMySignins(signins);
      })
      .catch((err) => console.error("Erro ao buscar eventos de inscrição", err));
  }, [isAuthenticated]);

  function getSubscription(ev: EventType): SigninEventType | undefined {
    return mySignins.find(
      (s) =>
        s.event_name === ev.name &&
        new Date(s.event_init_date).getTime() === new Date(ev.dateInit).getTime()
    );
  }

  async function handleCancelSignin(eventName: string, eventInitDate: string) {
    const key = `${eventName}::${eventInitDate}`;
    setCancelingKey(key);
    try {
      await signinEventsAPI.deleteSignin(eventName, eventInitDate);
      const updatedSignins = await signinEventsAPI.getMySignins();
      setMySignins(updatedSignins);
      showNotification("Inscrição cancelada com sucesso.", "info");
    } catch {
      showNotification("Erro ao cancelar inscrição.", "warning");
    } finally {
      setCancelingKey(null);
    }
  }

  async function handleSignin(eventName: string, eventInitDate: string) {
    const key = `${eventName}::${eventInitDate}`;
    setSigningInKey(key);
    try {
      await signinEventsAPI.createSignin(eventName, eventInitDate);
      const updatedSignins = await signinEventsAPI.getMySignins();
      setMySignins(updatedSignins);
      showNotification("Inscrição realizada com sucesso!", "info");
    } catch {
      showNotification("Erro ao se inscrever no evento.", "warning");
    } finally {
      setSigningInKey(null);
    }
  }

  const cancelConfirmModal = cancelConfirm && (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm" onClick={() => setCancelConfirm(null)}>
      <div
        className="bg-white dark:bg-semcompMidDarkBlue rounded-2xl p-6 mx-4 max-w-sm w-full shadow-xl text-semcompDarkBlue dark:text-semcompOffWhite"
        onClick={(e) => e.stopPropagation()}
      >
        <h3 className="text-lg font-bold mb-2 text-center">Cancelar inscrição?</h3>
        <p className="text-sm text-center opacity-70 mb-6">Tem certeza que deseja desistir deste evento? Você pode perder sua vaga.</p>
        <div className="flex gap-3">
          <button
            className="flex-1 py-2.5 rounded-xl border border-black/20 dark:border-white/20 text-sm font-semibold transition-colors hover:bg-black/5 dark:hover:bg-white/10"
            onClick={() => setCancelConfirm(null)}
          >
            Voltar
          </button>
          <button
            className="flex-1 py-2.5 rounded-xl bg-red-600 text-white text-sm font-semibold hover:bg-red-700 transition-colors"
            onClick={() => {
              handleCancelSignin(cancelConfirm.eventName, cancelConfirm.eventInitDate);
              setCancelConfirm(null);
            }}
          >
            Confirmar
          </button>
        </div>
      </div>
    </div>
  );

  function startEditing() {
    setEditForm({ name: userName, city: userCity, profession: userProfession, linkedin: userLinkedin, telegram: userTelegram });
    setIsEditing(true);
  }

  async function saveProfile() {
    setIsSaving(true);
    try {
      const res = await authAPI.updateProfile({
        name: editForm.name.trim(),
        city: editForm.city.trim(),
        profession: editForm.profession.trim() || null,
        linkedin: editForm.linkedin.trim() || null,
        telegram: editForm.telegram.trim() || null,
      });
      setUserName(res.user.name);
      setUserCity(res.user.city);
      setUserProfession(res.user.profession ?? "");
      setUserLinkedin(res.user.linkedin ?? "");
      setUserTelegram(res.user.telegram ?? "");
      setIsEditing(false);
      showNotification("Perfil atualizado com sucesso!", "success");
    } catch {
      showNotification("Erro ao atualizar perfil. Tente novamente.", "error");
    } finally {
      setIsSaving(false);
    }
  }

  // Versão Mobile/Tablet (< 1280px)
  if (width < 1280) {
    return (
      <div className="min-h-screen bg-semcompMidLightBlue dark:bg-semcompAlmostDarkBlue font-poppins transition-colors duration-300">
        {cancelConfirmModal}
        {/* Header com Background */}
        <div className="relative h-80 w-full overflow-hidden bg-semcompMidLightBlue dark:bg-semcompDarkBlue">
          <AnimatedBackground />
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-[1]">
            <img src="/img/semcomp/logo_default_branco.webp" alt="SEMCOMP Logo" className="w-1/2 max-w-50 object-contain drop-shadow-2xl" />
          </div>
          <div className="absolute inset-0 bg-linear-to-b from-transparent to-semcompMidLightBlue dark:to-semcompAlmostDarkBlue" />
          <div
            className="absolute bottom-0 left-0 right-0 h-24 z-[1] pointer-events-none"
            style={{
              backdropFilter: 'blur(6px)',
              WebkitBackdropFilter: 'blur(6px)',
              maskImage: 'linear-gradient(to bottom, transparent 0%, black 100%)',
              WebkitMaskImage: 'linear-gradient(to bottom, transparent 0%, black 100%)',
            }}
          />

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
          <div className="bg-gray-200 text-semcompDarkBlue border border-semcompDarkBlue/10 shadow-lg dark:bg-[#D9D9D9] dark:text-[#0B2639] dark:border-0 dark:shadow-none rounded-3xl w-full md:w-[70%] xl:w-full mx-auto p-6 md:p-8 flex flex-col items-center shadow-2xl min-h-100">
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
                    <QRCode
                      value={userCode.toString()}
                      size={180}
                      fgColor="#0B2639"
                    />
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
                <h2 className="text-2xl font-bold text-center mb-6">
                  Minha Conta
                </h2>

                {isEditing ? (
                  <div className="flex flex-col space-y-3 mb-6">
                    {([
                      { label: "Nome Completo", key: "name" as const, required: true },
                      { label: "Cidade de Residência", key: "city" as const, required: true },
                      { label: "Profissão", key: "profession" as const },
                      { label: "LinkedIn", key: "linkedin" as const },
                      { label: "Telegram", key: "telegram" as const },
                    ]).map(({ label, key, required }) => (
                      <div key={key} className="flex flex-col border-b border-black/10 pb-2">
                        <span className="text-xs font-bold opacity-70 text-semcompDarkBlue mb-1">{label}{required ? "" : " (opcional)"}:</span>
                        <input
                          className="text-sm font-medium text-semcompDarkBlue bg-transparent border-b border-semcompDarkBlue/30 focus:border-semcompDarkBlue outline-none py-0.5"
                          value={editForm[key]}
                          onChange={e => setEditForm(f => ({ ...f, [key]: e.target.value }))}
                        />
                      </div>
                    ))}
                    <div className="flex flex-col border-b border-black/10 pb-2 opacity-50">
                      <span className="text-xs font-bold opacity-70 text-semcompDarkBlue">E-mail (não editável):</span>
                      <span className="text-sm font-medium text-semcompDarkBlue">{userEmail}</span>
                    </div>
                  </div>
                ) : (
                  <div className="flex flex-col space-y-4 mb-6">
                    {[
                      { label: "Nome Completo", value: userName },
                      { label: "E-mail", value: userEmail },
                      ...(userCity ? [{ label: "Cidade de Residência", value: userCity }] : []),
                      ...(userProfession ? [{ label: "Profissão", value: userProfession }] : []),
                      ...(userLinkedin ? [{ label: "LinkedIn", value: userLinkedin }] : []),
                      ...(userTelegram ? [{ label: "Telegram", value: userTelegram }] : []),
                    ].map(({ label, value }) => (
                      <div key={label} className="flex flex-col border-b border-black/10 pb-2">
                        <span className="text-xs font-bold opacity-70 text-semcompDarkBlue">{label}:</span>
                        <span className="text-sm font-medium text-semcompDarkBlue">{value}</span>
                      </div>
                    ))}
                  </div>
                )}

                <button className="w-full bg-semcompDarkBlue text-white py-3 rounded-lg text-sm font-semibold mb-4 disabled:cursor-not-allowed disabled:opacity-50"
                  disabled={justificationLocked}
                  onClick={() => setJustifyOpen(true)}>
                  Justificar Ausência
                </button>
                {justificationStatus && (
                  <div className="flex items-center justify-center gap-2 mb-6">
                    <JustifyAbsenceStatusBadge status={justificationStatus} />
                    {justificationStatus === "negado" &&
                      absenceRejectionReason && (
                        <StatusEyeButton
                          onClick={() => setReasonModal("absence")}
                        />
                      )}
                  </div>
                )}

                <button className="w-full bg-semcompDarkBlue text-white py-3 rounded-lg text-sm font-semibold mb-4"
                  onClick={() => setPapfeModalOpen(true)}>
                  {papfeDoc ? "Atualizar Comprovante PAPFE" : "Enviar Comprovante PAPFE"}
                </button>
                {papfeDoc && (
                  <div className="flex items-center justify-center gap-2 mb-6">
                    <PapfeStatusBadge status={papfeStatusOf(papfeDoc)} />
                    {papfeDoc.is_approved === false &&
                      papfeDoc.rejection_reason && (
                        <StatusEyeButton
                          onClick={() => setReasonModal("papfe")}
                        />
                      )}
                  </div>
                )}

                <div className="bg-white/50 rounded-xl p-4 mb-6 border border-black/10">
                  <h3 className="text-center text-sm font-bold mb-3">
                    Minha Presença
                  </h3>
                  <div className="relative w-full h-6 bg-black/10 rounded-full overflow-hidden">
                    <div
                      className={`absolute inset-y-0 left-0 h-full bg-semcompDarkBlue transition-all duration-1000 ${
                        presencePercent > 15
                          ? "flex items-center justify-end pr-2"
                          : ""
                      }`}
                      style={{ width: `${presencePercent}%` }}
                    >
                      {presencePercent > 15 && (
                        <span className="text-white text-[10px] font-bold">
                          {presencePercent}%
                        </span>
                      )}
                    </div>
                    {presencePercent <= 15 && (
                      <div className="absolute right-2 top-1/2 -translate-y-1/2 text-semcompDarkBlue text-[10px] font-bold">
                        {presencePercent}%
                      </div>
                    )}
                  </div>
                </div>

                {isEditing ? (
                  <div className="flex gap-3 mb-4">
                    <button
                      className="flex-1 bg-semcompDarkBlue text-white py-3 rounded-lg text-sm font-semibold disabled:opacity-60"
                      onClick={saveProfile}
                      disabled={isSaving || !editForm.name.trim() || !editForm.city.trim()}
                    >
                      {isSaving ? "Salvando..." : "Salvar"}
                    </button>
                    <button
                      className="flex-1 border border-semcompDarkBlue text-semcompDarkBlue py-3 rounded-lg text-sm font-semibold"
                      onClick={() => setIsEditing(false)}
                      disabled={isSaving}
                    >
                      Cancelar
                    </button>
                  </div>
                ) : (
                  <button
                    className="w-full bg-semcompDarkBlue text-white py-3 rounded-lg text-sm font-semibold mb-4"
                    onClick={startEditing}
                  >
                    Editar Informações
                  </button>
                )}
                <button className="w-full text-red-700 font-bold text-sm py-2" onClick={logout}>
                  Sair da conta
                </button>
              </div>
            )}

            {activeTab === "purchases" && (
              <div className="w-full flex flex-col animate-in fade-in duration-300">
                <h2 className="text-2xl font-bold text-center mb-6">Minhas Compras</h2>
                {isFeatureEnabled("loja") && pendingSalesCount > 0 && (
                  <button
                    onClick={() => navigate("/loja/pagamentos")}
                    className="w-full bg-semcompDarkBlue text-white py-3 rounded-lg text-sm font-semibold mb-4"
                  >
                    Ver pagamentos pendentes ({pendingSalesCount})
                  </button>
                )}
                <div className="flex flex-col gap-4">
                  {userPurchases && userPurchases.length > 0 ? (
                    userPurchases.map((purchase) => (
                      <div key={purchase.id} className="bg-white/50 border border-black/10 rounded-xl p-4">
                        <p className="font-bold text-sm text-semcompDarkBlue">{purchase.item}</p>
                        <div className="flex justify-between items-center mt-2">
                          <span className="text-xs font-semibold opacity-70">{purchase.date}</span>
                          <span className={`text-sm font-bold ${purchase.statusColor}`}>
                            R$ {purchase.amount.toFixed(2)}
                          </span>
                        </div>
                        <div className="mt-2 text-xs font-semibold text-semcompDarkBlue/80">
                          Status: {purchase.status}
                        </div>
                      </div>
                    ))
                  ) : (
                    <p className="text-center opacity-70 text-sm py-4 italic text-semcompDarkBlue">
                      Nenhuma compra realizada ainda.
                    </p>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Seção Overflow */}
        <div
          className="mt-12 pt-10 pb-10 px-5 text-center transition-colors text-semcompOffWhite  bg-semcompMidDarkBlue dark:bg-semcompDarkBlue"
        >
          <h2 className="text-3xl font-bold mb-1 flex items-center justify-center gap-2">
            SEMCOMP 29
          </h2>
          <p className="text-sm md:text-md mb-6 opacity-80">
            Um encontro entre a computação, a cultura e a diversidade brasileira
          </p>

          <div className="relative rounded-2xl overflow-hidden mb-4 w-[60%] lg:w-[40%] xl:w-full mx-auto">
            <img src="/img/Profile/Card.svg" className="w-full h-full object-cover" alt="SEMCOMP 29 Brasilidades"/>
          </div>

          <div className="border-t pt-4 w-full md:w-[70%] xl:w-full mx-auto px-2 border-semcompDarkBlue/20 dark:border-white/20">
            <p className="text-[12px] md:text-[16px] leading-relaxed text-justify opacity-90">
              Este ano, a SEMCOMP celebra o tema BRASILIDADES! Essa proposta nasce da diversidade, criatividade e riqueza cultural do Brasil, conectando a computação às diferentes formas de expressão que fazem parte da nossa identidade. Venha descobrir, compartilhar e vivenciar as muitas faces do nosso país durante a SEMCOMP!
            </p>
          </div>
        </div>

        {/* Mural de Avisos (Mobile) */}
        <div className="mt-12 px-5">
          <div className="rounded-3xl p-6 border shadow-xl transition-colors bg-semcompOffWhite border-semcompDarkBlue text-semcompDarkBlue dark:bg-[#1A3A4F] dark:border-white/10 dark:text-semcompOffWhite">
            <div className="flex items-center justify-center gap-2 mb-6">
              <Megaphone className="w-6 h-6 text-semcompDarkBlue dark:text-semcompOffWhite" />
              <h2 className="text-2xl font-bold text-center">
                Mural de Avisos
              </h2>
            </div>
            <div className="flex flex-col gap-4">
              {notices.length > 0 ? (
                notices.map((notice, index) => (
                  <div
                    key={index}
                    className="p-4 rounded-xl border bg-black/5 border-semcompDarkBlue/20 dark:bg-white/10 dark:border-white/20 text-left flex flex-col gap-1"
                  >
                    <div className="flex justify-between items-start gap-2">
                      <h3 className="font-bold text-base text-semcompDarkBlue dark:text-white">
                        {notice.title}
                      </h3>
                      {notice.date && (
                        <span className="text-[10px] opacity-70 font-medium whitespace-nowrap">
                          {notice.date}
                        </span>
                      )}
                    </div>
                    <p className="text-sm opacity-90 leading-relaxed text-semcompDarkBlue/80 dark:text-white/80">
                      {notice.content}
                    </p>
                  </div>
                ))
              ) : (
                <p className="opacity-60 text-center text-sm italic">
                  Nenhum aviso no momento.
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Seção Inscrições */}
        <div className="mt-12 mb-12 px-5">
          <div className="rounded-3xl p-6 border shadow-xl transition-colors bg-semcompOffWhite border-semcompDarkBlue text-semcompDarkBlue dark:bg-[#1A3A4F] dark:border-white/10 dark:text-semcompOffWhite">
            <h2 className="text-2xl font-bold text-center mb-6">Inscrições em Eventos</h2>
            {signinEvents.length > 0 ? (
              signinEvents.map((ev, i) => (
                <EventCardMobile
                  key={i}
                  ev={ev}
                  subscription={getSubscription(ev)}
                  onSignin={() => handleSignin(ev.name, ev.dateInit)}
                  isSigningIn={signingInKey === `${ev.name}::${ev.dateInit}`}
                  onCancel={() => setCancelConfirm({ eventName: ev.name, eventInitDate: ev.dateInit })}
                  isCanceling={cancelingKey === `${ev.name}::${ev.dateInit}`}
                />
              ))
            ) : (
              <p className="opacity-60 text-center text-sm italic">Nenhum evento disponível para inscrição.</p>
            )}
          </div>
        </div>

        <div className="bg-semcompOffWhite dark:bg-semcompDarkBlue text-semcompDarkBlue dark:text-semcompOffWhite transition-colors duration-300">
          <ContatoSection />
        </div>
        <JustifyAbsenceModal open={justifyOpen} onClose={() => setJustifyOpen(false)} onSubmitted={handleJustifySubmitted} />
        <PapfeUploadModal open={papfeModalOpen} onClose={() => setPapfeModalOpen(false)} onSubmitted={handlePapfeSubmitted} />
        <RejectionReasonModal
          open={reasonModal === "absence"}
          onClose={() => setReasonModal(null)}
          title="Justificativa de ausência"
          statusBadge={
            <JustifyAbsenceStatusBadge status={justificationStatus ?? "em_analise"} />
          }
          rejectionReason={absenceRejectionReason}
        />
        <RejectionReasonModal
          open={reasonModal === "papfe"}
          onClose={() => setReasonModal(null)}
          title="Comprovante PAPFE"
          statusBadge={<PapfeStatusBadge status={papfeStatusOf(papfeDoc)} />}
          rejectionReason={papfeDoc?.rejection_reason ?? ""}
        />
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
            <p className="text-xl font-bold tracking-[0.2em] whitespace-nowrap">
              {userCode}
            </p>
          </div>
        </div>
      )}

      {activeTab === "account" && (
        <div className="px-6 pb-8 pt-4 mx-auto w-full 2xl:w-5/6 flex flex-col text-foreground animate-in fade-in duration-300 overflow-y-auto custom-scrollbar">
          <div className="text-center mb-6">
            <h2 className="text-xl font-bold text-semcompMidDarkBlue font-poppins">
              Minha Conta
            </h2>
            <p className="text-md text-semcompDarkBlue/75">
              Veja abaixo, seus dados e presença
            </p>
          </div>

          {isEditing ? (
            <div className="flex flex-col space-y-3 mb-6">
              {([
                { label: "Nome Completo", key: "name" as const, required: true },
                { label: "Cidade de Residência", key: "city" as const, required: true },
                { label: "Profissão", key: "profession" as const },
                { label: "LinkedIn", key: "linkedin" as const },
                { label: "Telegram", key: "telegram" as const },
              ]).map(({ label, key, required }) => (
                <div key={key} className="flex flex-col text-left">
                  <span className="text-xs font-bold text-semcompDarkBlue mb-0.5">{label}{required ? "" : " (opcional)"}:</span>
                  <input
                    className="text-sm text-semcompDarkBlue bg-semcompOffWhite/60 border border-semcompDarkBlue/20 focus:border-semcompDarkBlue outline-none rounded px-2 py-1"
                    value={editForm[key]}
                    onChange={e => setEditForm(f => ({ ...f, [key]: e.target.value }))}
                  />
                </div>
              ))}
              <div className="flex flex-col text-left opacity-50">
                <span className="text-xs font-bold text-semcompDarkBlue">E-mail (não editável):</span>
                <span className="text-sm text-semcompDarkBlue">{userEmail}</span>
              </div>
            </div>
          ) : (
            <div className="flex flex-col space-y-4 mb-6">
              {[
                { label: "Nome Completo", value: userName },
                { label: "E-mail", value: userEmail },
                ...(userCity ? [{ label: "Cidade de Residência", value: userCity }] : []),
                ...(userProfession ? [{ label: "Profissão", value: userProfession }] : []),
                ...(userLinkedin ? [{ label: "LinkedIn", value: userLinkedin }] : []),
                ...(userTelegram ? [{ label: "Telegram", value: userTelegram }] : []),
              ].map(({ label, value }) => (
                <div key={label} className="flex flex-col text-left">
                  <span className="text-sm font-bold text-semcompDarkBlue">{label}:</span>
                  <span className="text-sm text-semcompDarkBlue">{value}</span>
                </div>
              ))}
            </div>
          )}

          {isEditing ? (
            <div className="flex gap-2 mb-8">
              <button
                className="flex-1 bg-semcompMidDarkBlue hover:bg-semcompDarkBlue/90 text-white py-2.5 rounded-lg text-sm font-semibold transition-all shadow-md disabled:opacity-60"
                onClick={saveProfile}
                disabled={isSaving || !editForm.name.trim() || !editForm.city.trim()}
              >
                {isSaving ? "Salvando..." : "Salvar"}
              </button>
              <button
                className="flex-1 border border-semcompDarkBlue/40 text-semcompDarkBlue py-2.5 rounded-lg text-sm font-semibold hover:bg-semcompDarkBlue/5 transition-all"
                onClick={() => setIsEditing(false)}
                disabled={isSaving}
              >
                Cancelar
              </button>
            </div>
          ) : (
            <button
              className="w-full bg-semcompMidDarkBlue hover:bg-semcompDarkBlue/90 text-white py-2.5 rounded-lg text-sm font-semibold transition-all shadow-md mb-8"
              onClick={startEditing}
            >
              Editar Informações
            </button>
          )}

          <button
            onClick={() => setJustifyOpen(true)}
            disabled={justificationLocked}
            className="w-full bg-semcompMidDarkBlue hover:bg-semcompDarkBlue/90 text-white py-2.5 rounded-lg text-sm font-semibold transition-all shadow-md mb-4 disabled:cursor-not-allowed disabled:opacity-50"
          >
            Justificar Ausência
          </button>
          {justificationStatus && (
            <div className="flex items-center justify-center gap-2 mb-8">
              <JustifyAbsenceStatusBadge status={justificationStatus} />
              {justificationStatus === "negado" && absenceRejectionReason && (
                <StatusEyeButton onClick={() => setReasonModal("absence")} />
              )}
            </div>
          )}

          <button
            onClick={() => setPapfeModalOpen(true)}
            className="w-full bg-semcompMidDarkBlue hover:bg-semcompDarkBlue/90 text-white py-2.5 rounded-lg text-sm font-semibold transition-all shadow-md mb-4"
          >
            {papfeDoc ? "Atualizar Comprovante PAPFE" : "Enviar Comprovante PAPFE"}
          </button>
          {papfeDoc && (
            <div className="flex items-center justify-center gap-2 mb-8">
              <PapfeStatusBadge status={papfeStatusOf(papfeDoc)} />
              {papfeDoc.is_approved === false && papfeDoc.rejection_reason && (
                <StatusEyeButton onClick={() => setReasonModal("papfe")} />
              )}
            </div>
          )}

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

          {isFeatureEnabled("loja") && pendingSalesCount > 0 && (
            <button
              onClick={() => navigate("/loja/pagamentos")}
              className="w-full bg-semcompMidDarkBlue hover:bg-semcompDarkBlue/90 text-white py-2.5 rounded-lg text-sm font-semibold transition-all shadow-md mb-4"
            >
              Ver pagamentos pendentes ({pendingSalesCount})
            </button>
          )}

          <div className="flex flex-col gap-3">
            {userPurchases && userPurchases.length > 0 ? (
              userPurchases.map((purchase) => (
                <div key={purchase.id} className="bg-semcompOffWhite/60 rounded-xl p-4 border border-border/50 flex flex-col">
                  <span className="font-bold text-semcompDarkBlue">{purchase.item}</span>
                  <div className="flex justify-between mt-2">
                    <span className="text-xs font-medium text-semcompDarkBlue/70">{purchase.date}</span>
                    <span className={`text-sm font-bold ${purchase.statusColor}`}>R$ {purchase.amount.toFixed(2)}</span>
                  </div>
                  <span className="text-xs font-semibold text-semcompDarkBlue/80 mt-1">Status: {purchase.status}</span>
                </div>
              ))
            ) : (
              <p className="text-center opacity-70 text-sm py-6 italic text-semcompDarkBlue">
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
      <div className="bg-semcompMidLightBlue text-semcompDarkBlue dark:bg-semcompDarkBlue dark:text-semcompOffWhite min-h-screen">
        {cancelConfirmModal}
        <div
          className="relative overflow-hidden h-[calc(90vh-70px)] w-full flex flex-row justify-center items-center gap-10 font-poppins"
        >
          <AnimatedBackground />
          <div
            className="absolute bottom-0 left-0 right-0 h-48 z-5 pointer-events-none"
            style={{
              backdropFilter: 'blur(8px)',
              WebkitBackdropFilter: 'blur(8px)',
              maskImage: 'linear-gradient(to bottom, transparent 0%, black 100%)',
              WebkitMaskImage: 'linear-gradient(to bottom, transparent 0%, black 100%)',
            }}
          />
          <div className="absolute bottom-0 left-0 right-0 h-48 z-5 pointer-events-none bg-linear-to-b from-transparent to-semcompMidLightBlue dark:to-semcompAlmostDarkBlue" />
          <div className="relative z-10 h-[85%] w-[28%] bg-semcompOffWhite rounded-sm overflow-hidden shadow-xl">
            {qrAndAccountCard}
          </div>

          <div className="relative z-10 h-[85%] w-[28%] bg-semcompMidDarkBlue dark:bg-semcompDarkBlue flex flex-col rounded-sm overflow-hidden text-semcompOffWhite pt-12 pr-10 pl-10 pb-10">
            <h1 className="text-center text-3xl font-bold pb-4">SEMCOMP 29</h1>
            <p className="text-center text-md pb-2">
            Um encontro entre a computação, a cultura e a diversidade brasileira
            </p>
            <div className="relative h-[50%] bg-semcompOffWhite dark:bg-semcompDarkBlue overflow-hidden rounded-xl">
              <img src="/img/Profile/Card.svg" className="absolute inset-0 w-full h-full object-cover" alt="background"/>
            </div>
            <hr className="border-semcompOffWhite mt-6 mb-3" />
            <span className="text-sm text-justify">
              Este ano, a SEMCOMP celebra o tema BRASILIDADES! Essa proposta nasce da diversidade, criatividade e riqueza cultural do Brasil, conectando a computação às diferentes formas de expressão que fazem parte da nossa identidade. Venha descobrir, compartilhar e vivenciar as muitas faces do nosso país durante a SEMCOMP!
            </span>
          </div>
        </div>

        {/* Mural de Avisos (Desktop) */}
        <div className="bg-semcompMidLightBlue dark:bg-semcompAlmostDarkBlue py-16 flex justify-center font-poppins">
          <div className="w-[60%] border-2 rounded-2xl p-8 bg-semcompOffWhite text-semcompDarkBlue border-semcompDarkBlue dark:bg-semcompMidDarkBlue dark:text-semcompOffWhite dark:border-semcompOffWhite shadow-xl">
            <div className="flex items-center justify-center gap-3 mb-6">
              <Megaphone className="w-7 h-7 text-semcompDarkBlue dark:text-semcompOffWhite" />
              <h1 className="font-bold text-2xl">Mural de Avisos</h1>
            </div>
            <div className="flex flex-col gap-4">
              {notices && notices.length > 0 ? (
                notices.map((notice, index) => (
                  <div
                    key={index}
                    className="p-5 rounded-xl border bg-black/5 border-semcompDarkBlue/20 dark:bg-black/20 dark:border-white/15 transition-all hover:shadow-md text-left flex flex-col gap-1"
                  >
                    <div className="flex justify-between items-start gap-4">
                      <h3 className="font-bold text-lg text-semcompDarkBlue dark:text-white">
                        {notice.title}
                      </h3>
                      {notice.date && (
                        <span className="text-xs opacity-70 font-medium whitespace-nowrap pt-1">
                          {notice.date}
                        </span>
                      )}
                    </div>
                    <p className="text-sm opacity-90 leading-relaxed text-semcompDarkBlue/80 dark:text-white/80">
                      {notice.content}
                    </p>
                  </div>
                ))
              ) : (
                <div className="text-center italic py-4 opacity-70">
                  Nenhum aviso no momento.
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Seção Inscrições */}
        <div className="bg-semcompMidLightBlue/80 dark:bg-semcompAlmostDarkBlue flex flex-col justify-center items-center font-poppins py-16">
          <div className="border-2 w-[60%] rounded-2xl p-8 flex flex-col justify-center items-center bg-semcompOffWhite text-semcompDarkBlue border-semcompDarkBlue dark:bg-semcompMidDarkBlue dark:text-semcompOffWhite dark:border-semcompOffWhite">
            <h1 className="font-bold text-2xl mb-6">Inscrições em Eventos</h1>
            <div className="w-full flex flex-row justify-between font-bold">
              <span>Evento</span>
              <span>Data/Horário</span>
            </div>
            <hr className="w-full border mt-3 mb-3 border-semcompAlmostDarkBlue dark:border-semcompOffWhite" />
            <div className="w-full flex flex-col gap-4">
              {signinEvents.length > 0 ? (
                signinEvents.map((evento, index) => {
                  const data = formatDate(evento.dateInit, 2);
                  const diaSemana = formatWeekDay(evento.dateInit);
                  const subscription = getSubscription(evento);
                  const key = `${evento.name}::${evento.dateInit}`;

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
                          {subscription ? (
                            <div className="flex flex-col items-center gap-3">
                              <span className={`text-lg font-bold ${
                                subscription.status === "Inscrito"
                                  ? "text-green-600 dark:text-green-400"
                                  : "text-yellow-600 dark:text-yellow-400"
                              }`}>
                                {subscription.status === "Inscrito"
                                  ? "Você está inscrito"
                                  : `Você está na lista de espera (${subscription.user_wait_list_position}ª posição)`}
                              </span>
                              <button
                                className="px-6 py-2 rounded-xl font-bold text-sm uppercase tracking-wide shadow-sm hover:-translate-y-0.5 transition-all duration-300 bg-red-600 text-white hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:translate-y-0"
                                disabled={cancelingKey === key}
                                onClick={() => setCancelConfirm({ eventName: evento.name, eventInitDate: evento.dateInit })}
                              >
                                {cancelingKey === key ? "Cancelando..." : "Desistir"}
                              </button>
                            </div>
                          ) : (
                            <button
                              className="px-8 py-3 rounded-xl font-bold uppercase tracking-wide shadow-md hover:-translate-y-1 transition-all duration-300 bg-semcompDarkBlue text-semcompOffWhite hover:bg-semcompMidDarkBlue hover:shadow-semcompDarkBlue/40 dark:bg-semcompOffWhite dark:text-semcompDarkBlue dark:hover:bg-white dark:hover:shadow-white/20 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:translate-y-0"
                              disabled={signingInKey === key}
                              onClick={() => handleSignin(evento.name, evento.dateInit)}
                            >
                              {signingInKey === key ? "Inscrevendo..." : "Inscrever-se"}
                            </button>
                          )}
                        </div>
                      )}
                    </div>
                  );
                })
              ) : (
                <div className="text-center italic mt-6 py-8">
                  Em breve, serão abertas as inscrições para os eventos!
                </div>
              )}
            </div>
          </div>
        </div>
        <div className="bg-semcompOffWhite dark:bg-semcompDarkBlue text-semcompDarkBlue dark:text-semcompOffWhite transition-colors duration-300">
          <ContatoSection />
        </div>
        <JustifyAbsenceModal open={justifyOpen} onClose={() => setJustifyOpen(false)} onSubmitted={handleJustifySubmitted} />
        <PapfeUploadModal open={papfeModalOpen} onClose={() => setPapfeModalOpen(false)} onSubmitted={handlePapfeSubmitted} />
        <RejectionReasonModal
          open={reasonModal === "absence"}
          onClose={() => setReasonModal(null)}
          title="Justificativa de ausência"
          statusBadge={
            <JustifyAbsenceStatusBadge status={justificationStatus ?? "em_analise"} />
          }
          rejectionReason={absenceRejectionReason}
        />
        <RejectionReasonModal
          open={reasonModal === "papfe"}
          onClose={() => setReasonModal(null)}
          title="Comprovante PAPFE"
          statusBadge={<PapfeStatusBadge status={papfeStatusOf(papfeDoc)} />}
          rejectionReason={papfeDoc?.rejection_reason ?? ""}
        />
      </div>
    );
  }

  // Fallback
  return (
    <div className="flex justify-center p-4 min-h-screen bg-semcompMidDarkBlue/90 items-center font-poppins">
      <div className="w-full max-w-85 rounded-2xl overflow-hidden shadow-xl animate-in fade-in zoom-in duration-300">
        {qrAndAccountCard}
      </div>
      <JustifyAbsenceModal open={justifyOpen} onClose={() => setJustifyOpen(false)} onSubmitted={handleJustifySubmitted} />
      <PapfeUploadModal open={papfeModalOpen} onClose={() => setPapfeModalOpen(false)} onSubmitted={handlePapfeSubmitted} />
      <RejectionReasonModal
        open={reasonModal === "absence"}
        onClose={() => setReasonModal(null)}
        title="Justificativa de ausência"
        statusBadge={
          <JustifyAbsenceStatusBadge status={justificationStatus ?? "em_analise"} />
        }
        rejectionReason={absenceRejectionReason}
      />
      <RejectionReasonModal
        open={reasonModal === "papfe"}
        onClose={() => setReasonModal(null)}
        title="Comprovante PAPFE"
        statusBadge={<PapfeStatusBadge status={papfeStatusOf(papfeDoc)} />}
        rejectionReason={papfeDoc?.rejection_reason ?? ""}
      />
    </div>
  );
}
