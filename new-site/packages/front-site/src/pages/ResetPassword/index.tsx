import { useState, useCallback, type ReactElement } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { useTheme } from "@/contexts/useTheme";
import { useNotification } from "@/contexts/NotificationContext";
import { authAPI } from "@/api";

type ResetState = "form" | "success";

export default function ResetPasswordPage(): ReactElement {
    const { isDarkMode } = useTheme();
    const { showNotification } = useNotification();
    const [searchParams] = useSearchParams();
    const token = searchParams.get("token") ?? "";

    const [newPassword, setNewPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [loading, setLoading] = useState(false);
    const [state, setState] = useState<ResetState>("form");

    const container = isDarkMode
        ? "bg-semcompDarkBlue text-semcompOffWhite"
        : "bg-semcompOffWhite text-semcompDarkBlue";

    const card = isDarkMode
        ? "border-semcompMidLightBlue/30 bg-semcompAlmostDarkBlue/50"
        : "border-semcompMidLightBlue/30 bg-white";

    const subtitle = isDarkMode ? "text-semcompLightBlue" : "text-semcompMidDarkBlue";

    const inputClass = `w-full px-3 py-3 rounded-md border text-sm ${
        isDarkMode
            ? "bg-semcompDarkBlue text-white border-gray-600"
            : "bg-white text-gray-800 border-gray-300"
    }`;

    const handleSubmit = useCallback(
        async (e: React.FormEvent<HTMLFormElement>) => {
            e.preventDefault();

            if (!token) {
                showNotification("Token de redefinição inválido.", "warning");
                return;
            }
            if (newPassword.length < 8) {
                showNotification("A senha deve ter ao menos 8 caracteres.", "warning");
                return;
            }
            if (newPassword !== confirmPassword) {
                showNotification("As senhas não coincidem.", "warning");
                return;
            }

            setLoading(true);
            try {
                await authAPI.resetPassword(token, newPassword);
                setState("success");
            } catch (err: any) {
                const message =
                    err?.response?.data?.error ||
                    err?.response?.data?.message ||
                    err?.message ||
                    "Erro ao redefinir senha";
                showNotification(message, "warning");
            } finally {
                setLoading(false);
            }
        },
        [token, newPassword, confirmPassword, showNotification]
    );

    return (
        <section className={`flex h-screen w-full items-center justify-center px-4 py-10 ${container}`}>
            <div className={`w-full max-w-xl rounded-3xl border p-8 text-center shadow-lg ${card} -translate-y-20`}>
                {state === "form" && (
                    <>
                        <p className="font-poppins text-sm font-bold uppercase tracking-[0.2em] text-semcompMidLightBlue">
                            Recuperação de senha
                        </p>
                        <h1 className="mt-3 font-poppins text-3xl font-extrabold md:text-4xl">
                            {token ? "Nova senha" : "Link inválido"}
                        </h1>

                        {!token ? (
                            <>
                                <p className={`mt-4 font-poppins text-sm md:text-base ${subtitle}`}>
                                    O link de recuperação é inválido ou já expirou.
                                </p>
                                <div className="mt-6">
                                    <Link
                                        to="/login"
                                        className="rounded-xl bg-semcompMidDarkBlue px-5 py-2 font-poppins text-sm font-semibold text-semcompOffWhite transition hover:bg-semcompAlmostDarkBlue"
                                    >
                                        Voltar para login
                                    </Link>
                                </div>
                            </>
                        ) : (
                            <>
                                <p className={`mt-4 font-poppins text-sm md:text-base ${subtitle}`}>
                                    Escolha uma nova senha com pelo menos 8 caracteres.
                                </p>
                                <form onSubmit={handleSubmit} className="mt-6 flex flex-col gap-3 text-left">
                                    <div className="flex flex-col gap-1">
                                        <label className="text-xs font-semibold">Nova senha *</label>
                                        <input
                                            type="password"
                                            value={newPassword}
                                            onChange={(e) => setNewPassword(e.target.value)}
                                            placeholder="Mínimo 8 caracteres"
                                            required
                                            className={inputClass}
                                        />
                                    </div>
                                    <div className="flex flex-col gap-1">
                                        <label className="text-xs font-semibold">Confirmar senha *</label>
                                        <input
                                            type="password"
                                            value={confirmPassword}
                                            onChange={(e) => setConfirmPassword(e.target.value)}
                                            placeholder="Repita a senha"
                                            required
                                            className={inputClass}
                                        />
                                    </div>
                                    <button
                                        type="submit"
                                        disabled={loading}
                                        className="mt-2 w-full rounded-xl bg-semcompMidDarkBlue px-5 py-3 font-poppins text-sm font-semibold text-semcompOffWhite transition hover:bg-semcompAlmostDarkBlue disabled:opacity-50"
                                    >
                                        {loading ? "Salvando..." : "Redefinir senha"}
                                    </button>
                                    <Link to="/login" className={`text-center text-sm underline ${subtitle}`}>
                                        Voltar para login
                                    </Link>
                                </form>
                            </>
                        )}
                    </>
                )}

                {state === "success" && (
                    <>
                        <p className="font-poppins text-sm font-bold uppercase tracking-[0.2em] text-semcompMidLightBlue">
                            Sucesso
                        </p>
                        <h1 className="mt-3 font-poppins text-3xl font-extrabold md:text-4xl">
                            Senha redefinida!
                        </h1>
                        <p className={`mt-4 font-poppins text-sm md:text-base ${subtitle}`}>
                            Sua senha foi atualizada com sucesso. Você já pode entrar com a nova senha.
                        </p>
                        <div className="mt-8">
                            <Link
                                to="/login"
                                className="rounded-xl bg-semcompMidDarkBlue px-5 py-2 font-poppins text-sm font-semibold text-semcompOffWhite transition hover:bg-semcompAlmostDarkBlue"
                            >
                                Ir para login
                            </Link>
                        </div>
                    </>
                )}
            </div>
        </section>
    );
}
