import { useEffect, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { useTheme } from "@/contexts/useTheme";
import { useNotification } from "@/contexts/NotificationContext";
import { authAPI } from "@/api";
import { isValidEmail } from "@/utils/validateEmail";

type VerificationState = "verifying" | "success" | "error";

export default function VerifyEmailPage() {
  const { isDarkMode } = useTheme();
  const { showNotification } = useNotification();
  const [searchParams] = useSearchParams();
  const token = searchParams.get("token");

  const [state, setState] = useState<VerificationState>(token ? "verifying" : "error");
  const [resendEmail, setResendEmail] = useState("");
  const [resending, setResending] = useState(false);

  useEffect(() => {
    if (!token) return;

    let cancelled = false;
    authAPI
      .verifyEmail(token)
      .then(() => {
        if (!cancelled) setState("success");
      })
      .catch(() => {
        if (!cancelled) setState("error");
      });

    return () => {
      cancelled = true;
    };
  }, [token]);

  const handleResend = async () => {
    if (!isValidEmail(resendEmail)) {
      showNotification("Insira um e-mail válido.", "warning");
      return;
    }

    setResending(true);
    try {
      const response = await authAPI.resendVerification(resendEmail);
      showNotification(response.message, "success");
    } catch (err: any) {
      const message =
        err?.response?.data?.error || err?.response?.data?.message || err?.message || "Erro ao reenviar e-mail";
      showNotification(message, "warning");
    } finally {
      setResending(false);
    }
  };

  const container = isDarkMode
    ? "bg-semcompDarkBlue text-semcompOffWhite"
    : "bg-semcompOffWhite text-semcompDarkBlue";

  const card = isDarkMode
    ? "border-semcompMidLightBlue/30 bg-semcompAlmostDarkBlue/50"
    : "border-semcompMidLightBlue/30 bg-white";

  const subtitle = isDarkMode ? "text-semcompLightBlue" : "text-semcompMidDarkBlue";

  const inputClass = `w-full px-3 py-3 rounded-md border-2 text-sm ${
    isDarkMode ? "border-semcompMidDarkBlue" : "border-semcompOffWhite bg-semcompMidDarkBlue"
  }`;

  return (
    <section className={`flex h-screen w-full items-center justify-center px-4 py-10 ${container}`}>
      <div className={`w-full max-w-xl rounded-3xl border p-8 text-center shadow-lg ${card} -translate-y-20`}>
        {state === "verifying" && (
          <>
            <p className="font-poppins text-sm font-bold uppercase tracking-[0.2em] text-semcompMidLightBlue">
              Confirmando
            </p>
            <h1 className="mt-3 font-poppins text-3xl font-extrabold md:text-4xl">Verificando seu e-mail...</h1>
            <div className="mt-8 flex justify-center">
              <div className="h-10 w-10 animate-spin rounded-full border-4 border-semcompMidLightBlue/30 border-t-semcompMidDarkBlue" />
            </div>
          </>
        )}

        {state === "success" && (
          <>
            <p className="font-poppins text-sm font-bold uppercase tracking-[0.2em] text-semcompMidLightBlue">
              Sucesso
            </p>
            <h1 className="mt-3 font-poppins text-3xl font-extrabold md:text-4xl">E-mail confirmado!</h1>
            <p className={`mt-4 font-poppins text-sm md:text-base ${subtitle}`}>
              Sua conta foi ativada com sucesso. Você já pode entrar no site.
            </p>
            <div className="mt-8 flex items-center justify-center gap-3">
              <Link
                to="/login"
                className="rounded-xl bg-semcompMidDarkBlue px-5 py-2 font-poppins text-sm font-semibold text-semcompOffWhite transition hover:bg-semcompAlmostDarkBlue"
              >
                Ir para login
              </Link>
            </div>
          </>
        )}

        {state === "error" && (
          <>
            <p className="font-poppins text-sm font-bold uppercase tracking-[0.2em] text-semcompMidLightBlue">
              Link inválido
            </p>
            <h1 className="mt-3 font-poppins text-3xl font-extrabold md:text-4xl">
              Link de confirmação inválido ou expirado
            </h1>
            <p className={`mt-4 font-poppins text-sm md:text-base ${subtitle}`}>
              Informe seu e-mail para receber um novo link de confirmação.
            </p>

            <div className="mt-6 flex flex-col items-center gap-3">
              <input
                type="email"
                value={resendEmail}
                onChange={(e) => setResendEmail(e.target.value)}
                placeholder="nome@exemplo.com"
                aria-label="Email"
                className={inputClass}
              />
              <button
                type="button"
                onClick={handleResend}
                disabled={resending}
                className="w-full rounded-xl bg-semcompMidDarkBlue px-5 py-2 font-poppins text-sm font-semibold text-semcompOffWhite transition hover:bg-semcompAlmostDarkBlue disabled:opacity-50"
              >
                {resending ? "Enviando..." : "Reenviar e-mail de confirmação"}
              </button>
              <Link to="/login" className={`text-sm underline ${subtitle}`}>
                Voltar para login
              </Link>
            </div>
          </>
        )}
      </div>
    </section>
  );
}
