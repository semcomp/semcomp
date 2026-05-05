import { useTheme } from "@/contexts/useTheme";
import { useEffect, useState, type ReactElement } from "react";
import { useCallback } from "react";
import SegmentedControl, { useSegmentedControl } from "@/components/ui/Segcontrol";
import useWindowDimensions from "@/hooks/useWindowDimensions";
import Input from "@/components/ui/Input"
import { useAuth } from "@/contexts/useAuth";
import { useNotification } from "@/contexts/NotificationContext";
import { authAPI } from "@/api";
import TermsModal from "@/components/TermsModal";
import { getTerms } from "@/mock/terms";
import { useNavigate } from "react-router";
import fallbackLoginHero from "@/assets/img/Login/Palestra.avif";

// Load login side images (eagerly)
const _loginModules = import.meta.glob(
    "/src/assets/img/Login/*",
    { eager: true }
) as Record<string, { default: string }>;

const LOGIN_IMAGES = Object.values(_loginModules)
    .map((m) => m.default as string)
    .filter((s) => /\.(webp)$/i.test(s));

const pickRandomLoginHero = () =>
    LOGIN_IMAGES.length
        ? LOGIN_IMAGES[Math.floor(Math.random() * LOGIN_IMAGES.length)]
        : fallbackLoginHero;




export default function loginPage(){
    // variaveis para alterações de modo no forms e modo de luz do site
    const { isLogin, setIsLogin } = useSegmentedControl();
    const { isDarkMode } = useTheme();
    const [loginHeroSrc] = useState<string>(() => pickRandomLoginHero());
    
    // cores e dimensão da janela
    const bgColor = isDarkMode ? "bg-semcompMidDarkBlue" : "bg-semcompOffWhite";
    const textColor = isDarkMode ? "text-semcompOffWhite" : "text-semcompDarkBlue";
    let {width} = useWindowDimensions()
   
    // estados do forms
    const [loading, setLoading] = useState(false);
    const { showNotification } = useNotification();

    // campos a serem preenchidos no forms
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [name, setName] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [acceptTerms, setAcceptTerms] = useState(false);
    const [termsOpen, setTermsOpen] = useState(false);
    const [termsContent, setTermsContent] = useState<string | null>(null);

    const openTerms = useCallback(async () => {
        setTermsOpen(true);
        if (!termsContent) {
            const t = await getTerms();
            setTermsContent(t);
        }
    }, [termsContent]);

    const { isAuthenticated } = useAuth();
    const navigate = useNavigate();
    
    useEffect(() => {
        if (isAuthenticated) {
            showNotification("Você já está logado!", "info");
            navigate("/");
        }
    }, []);

    // função para resetar o forms
    const resetForm = useCallback(() => {
        setEmail("");
        setPassword("");
        setName("");
        setConfirmPassword("");
        setAcceptTerms(false);
    }, []);

    // checagem de formulario, ainda há mais restrições a serem colocadas eventualmente
    const validate = useCallback((): string | null => {
        if (!email.includes("@")) return "Insira um e-mail válido.";
        if (password.length < 8) return "A senha deve ter ao menos 8 caracteres.";
        if (isLogin === false) {
            if (name.trim().length === 0) return "Informe seu nome.";
            if (password !== confirmPassword) return "As senhas não coincidem.";
        }
        return null;
    }, [email, password, confirmPassword, isLogin, name]);

    // Integração com o back-end: api POST para registro de usuário
    const { login } = useAuth();
    const register = async (email: string, name: string, password: string) => {
        try {
            const response = await authAPI.register(name, email, password);
            showNotification(response.message, "success");
            return true;
        } catch (err: any) {
            const message =
              err?.response?.data?.error || err?.response?.data?.message || err?.message || "Erro no login";
            showNotification(message, "warning");
            return false;
        }
    }

    // prototipação da função de envio do forms
    const handleSubmit = useCallback(
        async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        const err = validate();
        if (err) {
            showNotification(err, "warning");
            return;
        }

        setLoading(true);
        try {
            let ok = false;
            if (isLogin) {
                ok = await login(email, password);
            } else {
                if (!acceptTerms) {
                    showNotification("Você deve aceitar os termos de serviço para criar uma conta.", "warning");
                    setLoading(false);
                    return;
                }
                ok = await register(email, name, password);
            }

            if (ok) {
                showNotification(isLogin ? "Login bem-sucedido!" : "Registro bem-sucedido!", "success");
                if (!isLogin) {
                    setIsLogin(true);
                }
            }
        } catch (err) {
            showNotification("Erro ao processar solicitação.", "warning");
        } finally {
            setLoading(false);
        }
        },
        [validate, isLogin, email, password, name, showNotification, login, resetForm, acceptTerms]
    );

    // conteudo do forms
    const formContent = (
        <div className={`w-full max-w-sm flex flex-col items-center justify-center p-8 ${textColor}`}>
            {/* compoenente utilizado para definir qual o modo do formulario */}
            <SegmentedControl islogin={isLogin} setIslogin={setIsLogin} hook={resetForm}/>
            <form onSubmit={handleSubmit} aria-live="polite" className="w-full mt-4">
                {isLogin === false && ( 
                    <div>
                        <label className={`block mb-2 ${!isDarkMode && "text-white"}`}>
                            {/* componente Input customizado */}
                            <Input
                                label="Nome Completo"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                placeholder="Nome completo"
                                required={isLogin === false}
                                aria-label="Nome completo"
                            />
                        </label>

                    </div>
                )}

                <label className={`block mb-2 ${!isDarkMode && "text-white"}`}>
                    <Input
                        label="Email"
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="nome@exemplo.com"
                        required
                        aria-label="Email"
                    />
                </label>

                <label className={`block mb-2 ${!isDarkMode && "text-white"}`}>
                    <Input
                        label="Senha"                        
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="Senha"
                        required
                        aria-label="Senha"
                    />
                </label>

                {isLogin === false && (
                    <>
                    <label className={`block mb-3 ${!isDarkMode && "text-white"}`}>
                        <Input
                            label="Confirmar senha"
                            type="password"
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                            placeholder="Confirmar senha"
                            required
                            aria-label="Confirmar senha"
                        />
                    </label>
                    <label className="flex items-center gap-2 mb-3 text-sm text-white">
                        <input
                            type="checkbox"
                            checked={acceptTerms}
                            onChange={(e) => setAcceptTerms(e.target.checked)}
                            aria-label="Concordo com os termos de serviço"
                            className="w-4 h-4"
                        />
                        <span>
                            Concordo com os{' '}
                            <button type="button" onClick={openTerms} className="underline">
                                Termos de Serviço
                            </button>{' '}
                            da aplicação.
                        </span>
                    </label>
                    </>
                )}
                               

                <button type="submit" className={`w-full px-3 py-4 rounded-md ${isDarkMode ? "bg-semcompMidDarkBlue" : "bg-semcompMidDarkBlue"} text-white text-sm disabled:opacity-50" disabled={loading} mt-6`}>
                    {loading ? "Processando..." : isLogin === true ? "Entrar" : "Criar conta"}
                </button>
            </form>
        </div>
    );

    // variavel de retono da pagina que muda a depender do tamanho da pagina
    let retorno: ReactElement | null;
    const bgContainer = isDarkMode ? "bg-semcompDarkBlue" : "bg-semcompMidLightBlue";

    // dimensao de PC
    if (width >= 1280) {
        retorno = (
            <div className={`h-[calc(100vh-70px)] flex items-center justify-center ${bgColor}`}>
                <div className={`${bgContainer} h-auto w-[98%] min-h-[95%] rounded-3xl shadow-xl flex overflow-hidden`}>
                    <div className="w-1/2 bg-gray-300 relative">
                        <img
                            src={loginHeroSrc}
                            alt="Background"
                            className="absolute inset-0 w-full h-full object-cover"
                        />
                    </div>
                    <div className="w-1/2 flex items-center justify-center">
                        {formContent}
                    </div>
                </div>    
            </div>
        );
    } else if (width >= 800) { // dimensão de tablet
        retorno = (
            <div className={`h-[calc(100vh-70px)] flex items-center justify-center ${bgColor} p-4`}>
                <div className={`relative ${bgContainer} w-[98%] min-h-[85%] rounded-3xl shadow-xl flex items-center justify-center overflow-hidden`}>
                    <img
                        src={loginHeroSrc}
                        alt="Background"
                        className={`absolute inset-0 w-full h-full object-cover ${ isDarkMode ? "opacity-40 brightness-50" : "opacity-90 brightness-50"}`}
                    />
                    <div className={`relative z-10 ${isDarkMode ? "bg-semcompOffWhite/10" : "bg-semcompMidLightBlue/30"} backdrop-blur-md rounded-2xl shadow-2xl m-4`}>
                        {formContent}
                    </div>
                </div>
            </div>
        );
    } else { // diensão de celular
        retorno = (
            <div className={`h-[calc(100vh-70px)] flex items-center justify-center ${bgColor} p-4`}>
                <div className={`${bgContainer} w-[98%] min-h-[85%] rounded-3xl flex flex-col items-center justify-center
                   ${isDarkMode ? "shadow-[-10px_-15px_0px_0px_#163756,15px_-40px_0px_0px_#0e2a44]" : "shadow-[-10px_-15px_0px_0px_#b3cde0,15px_-40px_0px_0px_#dbe9f4]"}
                `}>
                    {formContent}
                </div>
            </div>
        );
    }

    return (
        <>
            {retorno}
            <TermsModal open={termsOpen} onClose={() => setTermsOpen(false)} content={termsContent} />
        </>
    );
}