// import { useTheme } from "@/contexts/useTheme";
// import { useEffect, useState, type ReactElement } from "react";
// import { useCallback } from "react";
// import SegmentedControl, { useSegmentedControl } from "@/components/ui/Segcontrol";
// import useWindowDimensions from "@/hooks/useWindowDimensions";
// import Input from "@/components/ui/Input"
// import { useAuth } from "@/contexts/useAuth";
// import { useNotification } from "@/contexts/NotificationContext";
// import { authAPI } from "@/api";
// import TermsModal from "@/components/TermsModal";
// import { getTerms } from "@/mock/terms";
// import { useNavigate } from "react-router";
// import fallbackLoginHero from "@/assets/img/Login/Palestra.avif";

// // Load login side images (eagerly)
// const _loginModules = import.meta.glob(
//     "/src/assets/img/Login/*",
//     { eager: true }
// ) as Record<string, { default: string }>;

// const LOGIN_IMAGES = Object.values(_loginModules)
//     .map((m) => m.default as string)
//     .filter((s) => /\.(webp)$/i.test(s));

// const pickRandomLoginHero = () =>
//     LOGIN_IMAGES.length
//         ? LOGIN_IMAGES[Math.floor(Math.random() * LOGIN_IMAGES.length)]
//         : fallbackLoginHero;




// export default function loginPage(){
//     // variaveis para alterações de modo no forms e modo de luz do site
//     const { isLogin, setIsLogin } = useSegmentedControl();
//     const { isDarkMode } = useTheme();
//     const [loginHeroSrc] = useState<string>(() => pickRandomLoginHero());
    
//     // cores e dimensão da janela
//     const bgColor = isDarkMode ? "bg-semcompMidDarkBlue" : "bg-semcompOffWhite";
//     const textColor = isDarkMode ? "text-semcompOffWhite" : "text-semcompDarkBlue";
//     let {width} = useWindowDimensions()
   
//     // estados do forms
//     const [loading, setLoading] = useState(false);
//     const { showNotification } = useNotification();

//     // campos a serem preenchidos no forms
//     const [email, setEmail] = useState("");
//     const [password, setPassword] = useState("");
//     const [name, setName] = useState("");
//     const [confirmPassword, setConfirmPassword] = useState("");
//     const [acceptTerms, setAcceptTerms] = useState(false);
//     const [termsOpen, setTermsOpen] = useState(false);
//     const [termsContent, setTermsContent] = useState<string | null>(null);

//     const openTerms = useCallback(async () => {
//         setTermsOpen(true);
//         if (!termsContent) {
//             const t = await getTerms();
//             setTermsContent(t);
//         }
//     }, [termsContent]);

//     const { isAuthenticated } = useAuth();
//     const navigate = useNavigate();
    
//     useEffect(() => {
//         if (isAuthenticated) {
//             showNotification("Você já está logado!", "info");
//             navigate("/");
//         }
//     }, []);

//     // função para resetar o forms
//     const resetForm = useCallback(() => {
//         setEmail("");
//         setPassword("");
//         setName("");
//         setConfirmPassword("");
//         setAcceptTerms(false);
//     }, []);

//     // checagem de formulario, ainda há mais restrições a serem colocadas eventualmente
//     const validate = useCallback((): string | null => {
//         if (!email.includes("@")) return "Insira um e-mail válido.";
//         if (password.length < 8) return "A senha deve ter ao menos 8 caracteres.";
//         if (isLogin === false) {
//             if (name.trim().length === 0) return "Informe seu nome.";
//             if (password !== confirmPassword) return "As senhas não coincidem.";
//         }
//         return null;
//     }, [email, password, confirmPassword, isLogin, name]);

//     // Integração com o back-end: api POST para registro de usuário
//     const { login } = useAuth();
//     const register = async (email: string, name: string, password: string) => {
//         try {
//             const response = await authAPI.register(name, email, password);
//             showNotification(response.message, "success");
//             return true;
//         } catch (err: any) {
//             const message =
//               err?.response?.data?.error || err?.response?.data?.message || err?.message || "Erro no login";
//             showNotification(message, "warning");
//             return false;
//         }
//     }

//     // prototipação da função de envio do forms
//     const handleSubmit = useCallback(
//         async (e: React.FormEvent<HTMLFormElement>) => {
//         e.preventDefault();
//         const err = validate();
//         if (err) {
//             showNotification(err, "warning");
//             return;
//         }

//         setLoading(true);
//         try {
//             let ok = false;
//             if (isLogin) {
//                 ok = await login(email, password);
//             } else {
//                 if (!acceptTerms) {
//                     showNotification("Você deve aceitar os termos de serviço para criar uma conta.", "warning");
//                     setLoading(false);
//                     return;
//                 }
//                 ok = await register(email, name, password);
//             }

//             if (ok) {
//                 showNotification(isLogin ? "Login bem-sucedido!" : "Registro bem-sucedido!", "success");
//                 if (!isLogin) {
//                     setIsLogin(true);
//                 }
//             }
//         } catch (err) {
//             showNotification("Erro ao processar solicitação.", "warning");
//         } finally {
//             setLoading(false);
//         }
//         },
//         [validate, isLogin, email, password, name, showNotification, login, resetForm, acceptTerms]
//     );

//     // conteudo do forms
//     const formContent = (
//         <div className={`w-full max-w-sm flex flex-col items-center justify-center p-8 ${textColor}`}>
//             {/* compoenente utilizado para definir qual o modo do formulario */}
//             <SegmentedControl islogin={isLogin} setIslogin={setIsLogin} hook={resetForm}/>
//             <form onSubmit={handleSubmit} aria-live="polite" className="w-full mt-4">
//                 {isLogin === false && ( 
//                     <div>
//                         <label className={`block mb-2 ${!isDarkMode && "text-white"}`}>
//                             {/* componente Input customizado */}
//                             <Input
//                                 label="Nome Completo"
//                                 value={name}
//                                 onChange={(e) => setName(e.target.value)}
//                                 placeholder="Nome completo"
//                                 required={isLogin === false}
//                                 aria-label="Nome completo"
//                             />
//                         </label>

//                     </div>
//                 )}

//                 <label className={`block mb-2 ${!isDarkMode && "text-white"}`}>
//                     <Input
//                         label="Email"
//                         type="email"
//                         value={email}
//                         onChange={(e) => setEmail(e.target.value)}
//                         placeholder="nome@exemplo.com"
//                         required
//                         aria-label="Email"
//                     />
//                 </label>

//                 <label className={`block mb-2 ${!isDarkMode && "text-white"}`}>
//                     <Input
//                         label="Senha"                        
//                         type="password"
//                         value={password}
//                         onChange={(e) => setPassword(e.target.value)}
//                         placeholder="Senha"
//                         required
//                         aria-label="Senha"
//                     />
//                 </label>

//                 {isLogin === false && (
//                     <>
//                     <label className={`block mb-3 ${!isDarkMode && "text-white"}`}>
//                         <Input
//                             label="Confirmar senha"
//                             type="password"
//                             value={confirmPassword}
//                             onChange={(e) => setConfirmPassword(e.target.value)}
//                             placeholder="Confirmar senha"
//                             required
//                             aria-label="Confirmar senha"
//                         />
//                     </label>
//                     <label className="flex items-center gap-2 mb-3 text-sm text-white">
//                         <input
//                             type="checkbox"
//                             checked={acceptTerms}
//                             onChange={(e) => setAcceptTerms(e.target.checked)}
//                             aria-label="Concordo com os termos de serviço"
//                             className="w-4 h-4"
//                         />
//                         <span>
//                             Concordo com os{' '}
//                             <button type="button" onClick={openTerms} className="underline">
//                                 Termos de Serviço
//                             </button>{' '}
//                             da aplicação.
//                         </span>
//                     </label>
//                     </>
//                 )}
                               

//                 <button type="submit" className={`w-full px-3 py-4 rounded-md ${isDarkMode ? "bg-semcompMidDarkBlue" : "bg-semcompMidDarkBlue"} text-white text-sm disabled:opacity-50" disabled={loading} mt-6`}>
//                     {loading ? "Processando..." : isLogin === true ? "Entrar" : "Criar conta"}
//                 </button>
//             </form>
//         </div>
//     );

//     // variavel de retono da pagina que muda a depender do tamanho da pagina
//     let retorno: ReactElement | null;
//     const bgContainer = isDarkMode ? "bg-semcompDarkBlue" : "bg-semcompMidLightBlue";

//     // dimensao de PC
//     if (width >= 1280) {
//         retorno = (
//             <div className={`h-[calc(100vh-70px)] flex items-center justify-center ${bgColor}`}>
//                 <div className={`${bgContainer} h-auto w-[98%] min-h-[95%] rounded-3xl shadow-xl flex overflow-hidden`}>
//                     <div className="w-1/2 bg-gray-300 relative">
//                         <img
//                             src={loginHeroSrc}
//                             alt="Background"
//                             className="absolute inset-0 w-full h-full object-cover"
//                         />
//                     </div>
//                     <div className="w-1/2 flex items-center justify-center">
//                         {formContent}
//                     </div>
//                 </div>    
//             </div>
//         );
//     } else if (width >= 800) { // dimensão de tablet
//         retorno = (
//             <div className={`h-[calc(100vh-70px)] flex items-center justify-center ${bgColor} p-4`}>
//                 <div className={`relative ${bgContainer} w-[98%] min-h-[85%] rounded-3xl shadow-xl flex items-center justify-center overflow-hidden`}>
//                     <img
//                         src={loginHeroSrc}
//                         alt="Background"
//                         className={`absolute inset-0 w-full h-full object-cover ${ isDarkMode ? "opacity-40 brightness-50" : "opacity-90 brightness-50"}`}
//                     />
//                     <div className={`relative z-10 ${isDarkMode ? "bg-semcompOffWhite/10" : "bg-semcompMidLightBlue/30"} backdrop-blur-md rounded-2xl shadow-2xl m-4`}>
//                         {formContent}
//                     </div>
//                 </div>
//             </div>
//         );
//     } else { // diensão de celular
//         retorno = (
//             <div className={`h-[calc(100vh-70px)] flex items-center justify-center ${bgColor} p-4`}>
//                 <div className={`${bgContainer} w-[98%] min-h-[85%] rounded-3xl flex flex-col items-center justify-center
//                    ${isDarkMode ? "shadow-[-10px_-15px_0px_0px_#163756,15px_-40px_0px_0px_#0e2a44]" : "shadow-[-10px_-15px_0px_0px_#b3cde0,15px_-40px_0px_0px_#dbe9f4]"}
//                 `}>
//                     {formContent}
//                 </div>
//             </div>
//         );
//     }

//     return (
//         <>
//             {retorno}
//             <TermsModal open={termsOpen} onClose={() => setTermsOpen(false)} content={termsContent} />
//         </>
//     );
// }
// import { useTheme } from "@/contexts/useTheme";
// import { useEffect, useState, type ReactElement } from "react";
// import { useCallback } from "react";
// import SegmentedControl, { useSegmentedControl } from "@/components/ui/Segcontrol";
// import Input from "@/components/ui/Input"
// import { useAuth } from "@/contexts/useAuth";
// import { useNotification } from "@/contexts/NotificationContext";
// import { authAPI } from "@/api";
// import TermsModal from "@/components/TermsModal";
// import { getTerms } from "@/mock/terms";
// import { useNavigate } from "react-router";
// import fallbackLoginHero from "@/assets/img/Login/Palestra.avif";

// const _loginModules = import.meta.glob(
//     "/src/assets/img/Login/*",
//     { eager: true }
// ) as Record<string, { default: string }>;

// const LOGIN_IMAGES = Object.values(_loginModules)
//     .map((m) => m.default as string)
//     .filter((s) => /\.(webp)$/i.test(s));

// const pickRandomLoginHero = () =>
//     LOGIN_IMAGES.length
//         ? LOGIN_IMAGES[Math.floor(Math.random() * LOGIN_IMAGES.length)]
//         : fallbackLoginHero;

// export default function LoginPage(): ReactElement {
//     const { isLogin, setIsLogin } = useSegmentedControl();
//     const { isDarkMode } = useTheme();
//     const [loginHeroSrc] = useState<string>(() => pickRandomLoginHero());
    
//     const bgColor = isDarkMode ? "bg-semcompMidDarkBlue" : "bg-semcompOffWhite";
//     const textColor = isDarkMode ? "text-semcompOffWhite" : "text-semcompDarkBlue";
   
//     const [loading, setLoading] = useState(false);
//     const { showNotification } = useNotification();

//     const [email, setEmail] = useState("");
//     const [password, setPassword] = useState("");
//     const [name, setName] = useState("");
//     const [confirmPassword, setConfirmPassword] = useState("");
//     const [acceptTerms, setAcceptTerms] = useState(false);
//     const [termsOpen, setTermsOpen] = useState(false);
//     const [termsContent, setTermsContent] = useState<string | null>(null);

//     const openTerms = useCallback(async () => {
//         setTermsOpen(true);
//         if (!termsContent) {
//             const t = await getTerms();
//             setTermsContent(t);
//         }
//     }, [termsContent]);

//     const { isAuthenticated, login } = useAuth();
//     const navigate = useNavigate();
    
//     useEffect(() => {
//         if (isAuthenticated) {
//             showNotification("Você já está logado!", "info");
//             navigate("/");
//         }
//     }, [isAuthenticated, navigate, showNotification]);

//     const resetForm = useCallback(() => {
//         setEmail("");
//         setPassword("");
//         setName("");
//         setConfirmPassword("");
//         setAcceptTerms(false);
//     }, []);

//     const validate = useCallback((): string | null => {
//         if (!email.includes("@")) return "Insira um e-mail válido.";
//         if (password.length < 8) return "A senha deve ter ao menos 8 caracteres.";
//         if (isLogin === false) {
//             if (name.trim().length === 0) return "Informe seu nome.";
//             if (password !== confirmPassword) return "As senhas não coincidem.";
//         }
//         return null;
//     }, [email, password, confirmPassword, isLogin, name]);

//     const register = useCallback(async (emailParam: string, nameParam: string, passwordParam: string) => {
//         try {
//             const response = await authAPI.register(nameParam, emailParam, passwordParam);
//             showNotification(response.message, "success");
//             return true;
//         } catch (err: any) {
//             const message =
//               err?.response?.data?.error || err?.response?.data?.message || err?.message || "Erro no login";
//             showNotification(message, "warning");
//             return false;
//         }
//     }, [showNotification]);

//     const handleSubmit = useCallback(
//         async (e: React.FormEvent<HTMLFormElement>) => {
//             e.preventDefault();
//             const err = validate();
//             if (err) {
//                 showNotification(err, "warning");
//                 return;
//             }

//             setLoading(true);
//             try {
//                 let ok = false;
//                 if (isLogin) {
//                     ok = await login(email, password);
//                 } else {
//                     if (!acceptTerms) {
//                         showNotification("Você deve aceitar os termos de serviço para criar uma conta.", "warning");
//                         setLoading(false);
//                         return;
//                     }
//                     ok = await register(email, name, password);
//                 }

//                 if (ok) {
//                     showNotification(isLogin ? "Login bem-sucedido!" : "Registro bem-sucedido!", "success");
//                     if (!isLogin) {
//                         setIsLogin(true);
//                     }
//                 }
//             } catch (err) {
//                 showNotification("Erro ao processar solicitação.", "warning");
//             } finally {
//                 setLoading(false);
//             }
//         },
//         [validate, isLogin, email, password, name, showNotification, login, register, acceptTerms, setIsLogin]
//     );

//     // Conteúdo do formulário otimizado e com margens mais compactas (p-6, mt-3, mb-2)
//     const formContent = (
//         <div className={`w-full max-w-sm flex flex-col items-center justify-center p-6 ${textColor}`}>
//             <SegmentedControl islogin={isLogin} setIslogin={setIsLogin} hook={resetForm}/>
//             <form onSubmit={handleSubmit} aria-live="polite" className="w-full mt-1">
//                 {isLogin === false && ( 
//                     <label className={`block mb-2 ${!isDarkMode ? "text-white" : ""}`}>
//                         <Input
//                             label="Nome Completo"
//                             value={name}
//                             onChange={(e) => setName(e.target.value)}
//                             placeholder="Nome completo"
//                             required={isLogin === false}
//                             aria-label="Nome completo"
//                         />
//                     </label>
//                 )}

//                 <label className={`block mb-2 ${!isDarkMode ? "text-white" : ""}`}>
//                     <Input
//                         label="Email"
//                         type="email"
//                         value={email}
//                         onChange={(e) => setEmail(e.target.value)}
//                         placeholder="nome@exemplo.com"
//                         required
//                         aria-label="Email"
//                     />
//                 </label>

//                 <label className={`block mb-1 ${!isDarkMode ? "text-white" : ""}`}>
//                     <Input
//                         label="Senha"                        
//                         type="password"
//                         value={password}
//                         onChange={(e) => setPassword(e.target.value)}
//                         placeholder="Senha"
//                         required
//                         aria-label="Senha"
//                     />
//                 </label>

//                 {isLogin === false && (
//                     <>
//                         <label className={`block mb-2 ${!isDarkMode ? "text-white" : ""}`}>
//                             <Input
//                                 label="Confirmar senha"
//                                 type="password"
//                                 value={confirmPassword}
//                                 onChange={(e) => setConfirmPassword(e.target.value)}
//                                 placeholder="Confirmar senha"
//                                 required
//                                 aria-label="Confirmar senha"
//                             />
//                         </label>
//                         <label className="flex items-center gap-2 mb-2 text-sm text-white">
//                             <input
//                                 type="checkbox"
//                                 checked={acceptTerms}
//                                 onChange={(e) => setAcceptTerms(e.target.checked)}
//                                 aria-label="Concordo com os termos de serviço"
//                                 className="w-4 h-4 cursor-pointer"
//                             />
//                             <span>
//                                 Concordo com os{' '}
//                                 <button type="button" onClick={openTerms} className="underline font-semibold text-semcompMidDarkBlue dark:text-semcompOffWhite hover:brightness-110">
//                                     Termos de Serviço
//                                 </button>
//                             </span>
//                         </label>
//                     </>
//                 )}
                               
//                 <button 
//                     type="submit" 
//                     disabled={loading}
//                     className="w-full mt-4 px-3 py-3 rounded-md bg-semcompMidDarkBlue text-white text-sm font-bold disabled:opacity-50 hover:brightness-110 transition-all"
//                 >
//                     {loading ? "Processando..." : isLogin === true ? "Entrar" : "Criar conta"}
//                 </button>
//             </form>
//         </div>
//     );

//     const bgContainer = isDarkMode ? "bg-semcompDarkBlue" : "bg-semcompMidLightBlue";
//     const mobileShadow = isDarkMode 
//         ? "shadow-[-10px_-15px_0px_0px_#163756,15px_-40px_0px_0px_#0e2a44]" 
//         : "shadow-[-10px_-15px_0px_0px_#b3cde0,15px_-40px_0px_0px_#dbe9f4]";

//     return (
//         <>
//             <div className={`h-[calc(100vh-80px)] w-full flex items-center justify-center ${bgColor} overflow-hidden`}>
                
//                 {/* 1. MODO DESKTOP (Travado em h-[600px] para nunca quebrar ou criar rolagem) */}
//                 <div className={`hidden min-[1280px]:flex ${bgContainer} h-[650px] w-[95%] max-w-[1150px] rounded-3xl shadow-xl overflow-hidden`}>
//                     <div className="w-1/2 bg-gray-300 relative">
//                         <img
//                             src={loginHeroSrc}
//                             alt="Background Desktop"
//                             className="absolute inset-0 w-full h-full object-cover"
//                         />
//                     </div>
//                     <div className="w-1/2 flex items-center justify-center">
//                         {formContent}
//                     </div>
//                 </div>

//                 {/* 2. MODO TABLET / IPAD (Travado em h-[600px] para evitar rolagem vertical no iPad) */}
//                 <div className={`hidden min-[800px]:flex min-[1280px]:hidden relative ${bgContainer} w-[90%] max-w-[500px] h-[650px] rounded-3xl shadow-xl items-center justify-center overflow-hidden`}>
//                     <img
//                         src={loginHeroSrc}
//                         alt="Background Tablet"
//                         className={`absolute inset-0 w-full h-full object-cover ${isDarkMode ? "opacity-40 brightness-50" : "opacity-90 brightness-50"}`}
//                     />
//                     <div className={`relative z-10 ${isDarkMode ? "bg-semcompOffWhite/10" : "bg-semcompMidLightBlue/30"} backdrop-blur-md rounded-2xl shadow-2xl m-4`}>
//                         {formContent}
//                     </div>
//                 </div>

//                 {/* 3. MODO MOBILE */}
//                 <div className={`flex min-[800px]:hidden ${bgContainer} w-[80%] min-h-[500px] rounded-3xl flex-col items-center justify-center p-4 ${mobileShadow}`}>
//                     {formContent}
//                 </div>

//             </div>

//             <TermsModal open={termsOpen} onClose={() => setTermsOpen(false)} content={termsContent} />
//         </>
//     );
// }
import { useTheme } from "@/contexts/useTheme";
import { useEffect, useState, useCallback, type ReactElement } from "react";
import SegmentedControl, { useSegmentedControl } from "@/components/ui/Segcontrol";
import Input from "@/components/ui/Input";
import Select from "@/components/ui/Select";
import { useAuth } from "@/contexts/useAuth";
import { useNotification } from "@/contexts/NotificationContext";
import { authAPI } from "@/api";
import TermsModal from "@/components/TermsModal";
import { getTerms } from "@/mock/terms";
import { useNavigate } from "react-router";
import fallbackLoginHero from "@/assets/img/Login/Palestra.avif";
import { isValidEmail } from "@/utils/validateEmail";

const RESEND_COOLDOWN_SECONDS = 60;

const _loginModules = import.meta.glob("/src/assets/img/Login/*", { eager: true }) as Record<string, { default: string }>;
const LOGIN_IMAGES = Object.values(_loginModules)
    .map((m) => m.default as string)
    .filter((s) => /\.(webp)$/i.test(s));

const pickRandomLoginHero = () =>
    LOGIN_IMAGES.length ? LOGIN_IMAGES[Math.floor(Math.random() * LOGIN_IMAGES.length)] : fallbackLoginHero;

export default function LoginPage(): ReactElement {
    const { isLogin, setIsLogin } = useSegmentedControl();
    const { isDarkMode } = useTheme();
    const [loginHeroSrc] = useState<string>(() => pickRandomLoginHero());
    
    const bgColor = isDarkMode ? "bg-semcompMidDarkBlue" : "bg-semcompOffWhite";
    const textColor = isDarkMode ? "text-semcompOffWhite" : "text-semcompDarkBlue";
    const inputBg = isDarkMode ? "bg-semcompDarkBlue text-white border-gray-600" : "bg-white text-gray-800 border-gray-300";
   
    const [loading, setLoading] = useState(false);
    const { showNotification } = useNotification();

    // --- ESTADOS BÁSICOS ---
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [name, setName] = useState("");
    const [acceptTerms, setAcceptTerms] = useState(false);
    const [termsOpen, setTermsOpen] = useState(false);
    const [termsContent, setTermsContent] = useState<string | null>(null);

    const [pendingVerificationEmail, setPendingVerificationEmail] = useState<string | null>(null);
    const [resendCooldown, setResendCooldown] = useState(0);
    const [resending, setResending] = useState(false);

    const [age, setAge] = useState("");
    const [gender, setGender] = useState("");
    const [city, setCity] = useState("");
    const [education, setEducation] = useState("");
    const [profession, setProfession] = useState("");
    const [linkedin, setLinkedin] = useState("");
    const [telegram, setTelegram] = useState("");
    const [hasPapfe, setHasPapfe] = useState(false);

    const [hasDisability, setHasDisability] = useState(false);
    const [disabilities, setDisabilities] = useState<string[]>([]);
    const [currentDisability, setCurrentDisability] = useState("");

    const handleAddDisability = (e?: React.MouseEvent | React.KeyboardEvent) => {
        if (e) e.preventDefault();
        if (currentDisability.trim() && !disabilities.includes(currentDisability.trim())) {
            setDisabilities([...disabilities, currentDisability.trim()]);
            setCurrentDisability("");
        }
    };

    const handleRemoveDisability = (tagToRemove: string) => {
        setDisabilities(disabilities.filter(tag => tag !== tagToRemove));
    };

    const openTerms = useCallback(async () => {
        setTermsOpen(true);
        if (!termsContent) {
            const t = await getTerms();
            setTermsContent(t);
        }
    }, [termsContent]);

    const { isAuthenticated, login } = useAuth(); // Adicionado isAuthLoading por segurança
    const navigate = useNavigate();

    // Só roda na montagem: evita que este efeito redirecione para "/" logo após um
    // login bem-sucedido nesta própria página, competindo com o navigate("/profile")
    // que o AuthContext já dispara. O propósito aqui é apenas afastar quem *chega*
    // em /login já autenticado.
    useEffect(() => {
        if (isAuthenticated) {
            showNotification("Você já está logado!", "info");
            navigate("/");
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const resetForm = useCallback(() => {
        setEmail(""); setPassword(""); setName(""); setConfirmPassword("");
        setAcceptTerms(false); setAge(""); setGender(""); setCity("");
        setEducation(""); setProfession(""); setLinkedin(""); setTelegram("");
        setHasPapfe(false); setHasDisability(false); setDisabilities([]);
    }, []);

    // Evita que o painel de "verifique seu e-mail" vaze entre os modos login/cadastro
    useEffect(() => {
        setPendingVerificationEmail(null);
        setResendCooldown(0);
    }, [isLogin]);

    useEffect(() => {
        if (resendCooldown <= 0) return;
        const interval = setInterval(() => {
            setResendCooldown((seconds) => Math.max(0, seconds - 1));
        }, 1000);
        return () => clearInterval(interval);
    }, [resendCooldown]);

    const validate = useCallback((): string | null => {
        if (!isValidEmail(email)) return "Insira um e-mail válido.";
        if (password.length < 8) return "A senha deve ter ao menos 8 caracteres.";
        if (!isLogin) {
            if (name.trim().length === 0) return "Informe seu nome.";
            if (password !== confirmPassword) return "As senhas não coincidem.";
            if (!age || Number(age) <= 0) return "Informe uma idade válida.";
            if (!city.trim()) return "Informe sua cidade.";
            if (!gender) return "Selecione seu gênero.";
            if (!education) return "Selecione sua formação.";
            if (hasDisability && disabilities.length === 0) return "Adicione ao menos uma deficiência ou desmarque a opção.";
        }
        return null;
    }, [email, password, confirmPassword, isLogin, name, age, city, gender, education, hasDisability, disabilities]);

    // Atualize seu authAPI.register no futuro para receber os novos campos!
    const register = useCallback(async () => {
        try {
            // Exemplo: enviando todos os dados no payload
            const payload = {
                name, email, password, age: Number(age), gender, city,
                education, profession, linkedin, telegram, hasPapfe,
                disabilities: hasDisability ? disabilities : []
            };

            console.log(hasPapfe)
            
            const response = await authAPI.register(payload.name, payload.email, payload.password, payload.age, payload.gender, payload.city, payload.education, payload.hasPapfe, payload.disabilities, payload.profession, payload.linkedin, payload.telegram);
            showNotification(response.message || "Registro realizado!", "success");
            return true;
        } catch (err: any) {
            const message = err?.response?.data?.error || err?.response?.data?.message || err?.message || "Erro no cadastro";
            showNotification(message, "warning");
            return false;
        }
    }, [name, email, password, age, gender, city, education, profession, linkedin, telegram, hasPapfe, hasDisability, disabilities, showNotification]);

    const handleResend = useCallback(async () => {
        if (!pendingVerificationEmail || resendCooldown > 0) return;
        setResending(true);
        try {
            const response = await authAPI.resendVerification(pendingVerificationEmail);
            showNotification(response.message, "success");
            setResendCooldown(RESEND_COOLDOWN_SECONDS);
        } catch (err: any) {
            const message =
              err?.response?.data?.error || err?.response?.data?.message || err?.message || "Erro ao reenviar e-mail";
            showNotification(message, "warning");
        } finally {
            setResending(false);
        }
    }, [pendingVerificationEmail, resendCooldown, showNotification]);

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
                if (isLogin) {
                    const result = await login(email, password);
                    if (result.status === 403) {
                        setPendingVerificationEmail(email);
                    }
                } else {
                    if (!acceptTerms) {
                        showNotification("Você deve aceitar os termos de serviço para criar uma conta.", "warning");
                        setLoading(false);
                        return;
                    }
                    const ok = await register();
                    if (ok) {
                        setPendingVerificationEmail(email);
                    }
                }
            } catch (err) {
                showNotification("Erro ao processar solicitação.", "warning");
            } finally {
                setLoading(false);
            }
        },
        [validate, isLogin, email, password, showNotification, login, register, acceptTerms]
    );

    const pendingVerificationPanel = (
        <div className={`w-full max-w-sm flex flex-col items-center justify-center p-6 text-center ${textColor}`}>
            <h2 className="text-lg font-bold mb-2">Verifique seu e-mail</h2>
            <p className={`text-sm mb-6 ${!isDarkMode ? "text-white" : ""}`}>
                Enviamos um link de confirmação para <strong>{pendingVerificationEmail}</strong>.
                Verifique sua caixa de entrada (e o spam) para ativar sua conta.
            </p>
            <button
                type="button"
                onClick={handleResend}
                disabled={resending || resendCooldown > 0}
                className="w-full px-3 py-3 rounded-md bg-semcompMidDarkBlue text-white text-sm font-bold disabled:opacity-50 hover:brightness-110 transition-all"
            >
                {resendCooldown > 0
                    ? `Reenviar e-mail (${resendCooldown}s)`
                    : resending
                        ? "Enviando..."
                        : "Reenviar e-mail"}
            </button>
            <button
                type="button"
                onClick={() => setPendingVerificationEmail(null)}
                className={`mt-4 text-sm underline ${!isDarkMode ? "text-white" : ""}`}
            >
                Voltar
            </button>
        </div>
    );

    const formContent = pendingVerificationEmail ? pendingVerificationPanel : (
        <div className={`w-full ${isLogin ? "max-w-sm" : "max-w-lg"} flex flex-col items-center justify-center p-6 ${textColor} transition-all duration-300`}>
            <SegmentedControl islogin={isLogin} setIslogin={setIsLogin} hook={resetForm}/>
            
            {/* Altura máxima com scroll interno suave para não estourar os 650px do card */}
            <form onSubmit={handleSubmit} aria-live="polite" className="w-full mt-4 max-h-[460px] overflow-y-auto p-1 space-y-3 scrollbar-thin scrollbar-thumb-gray-400">
                
                {/* === MODO LOGIN === */}
                {isLogin && (
                    <div className="space-y-3">
                        <Input label="Email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="nome@exemplo.com" required />
                        <Input label="Senha" type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="••••••••" required />
                    </div>
                )}

                {/* === MODO CADASTRO (GRID 2 COLUNAS) === */}
                {!isLogin && (
                    <>
                        <p className="text-xs font-bold uppercase tracking-wider opacity-70 border-b border-gray-400/30 pb-1">Dados de Acesso</p>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                            <div className="sm:col-span-2">
                                <Input label="Nome Completo *" value={name} onChange={(e) => setName(e.target.value)} placeholder="Seu nome" required />
                            </div>
                            <div className="sm:col-span-2">
                                <Input label="Email *" type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="nome@exemplo.com" required />
                            </div>
                            <Input label="Senha *" type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Mínimo 8 caracteres" required />
                            <Input label="Confirmar Senha *" type="password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} placeholder="Repita a senha" required />
                        </div>

                        <p className="text-xs font-bold uppercase tracking-wider opacity-70 border-b border-gray-400/30 pb-1 pt-2">Dados Pessoais</p>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                            <Input label="Idade *" type="number" value={age} onChange={(e) => setAge(e.target.value)} placeholder="Ex: 21" required />
                            
                            {/* Select de Gênero */}
                            <div className="flex flex-col gap-1">
                                <Select
                                    label="Gênero *"
                                    value={gender}
                                    onChange={(e) => setGender(e.target.value)}
                                    placeholder="Selecione..."
                                    required
                                >
                                    <option value="Cisgênero Feminino" className="bg-semcompDarkBlue text-white">Feminino</option>
                                    <option value="Cisgênero Masculino" className="bg-semcompDarkBlue text-white">Masculino</option>
                                    <option value="Transgênero Feminino" className="bg-semcompDarkBlue text-white">Mulher Trans</option>
                                    <option value="Transgênero Masculino" className="bg-semcompDarkBlue text-white">Homem Trans</option>
                                    <option value="Não-binário" className="bg-semcompDarkBlue text-white">Não-binário</option>
                                    <option value="Outro" className="bg-semcompDarkBlue text-white">Outro / Preferir não dizer</option>
                                </Select>
                            </div>

                            <Input label="Cidade *" value={city} onChange={(e) => setCity(e.target.value)} placeholder="Ex: São Carlos - SP" required />
                            
                            {/* Select de Formação */}
                            <div className="flex flex-col gap-1">
                                <Select
                                    label="Formação *"
                                    value={education}
                                    onChange={(e) => setEducation(e.target.value)}
                                    placeholder="Selecione..."
                                    required
                                >
                                    <option value="Ensino Médio" className="bg-semcompDarkBlue text-white">Ensino Médio</option>
                                    <option value="Graduação em Andamento" className="bg-semcompDarkBlue text-white">Graduação (Em andamento)</option>
                                    <option value="Graduação Concluída" className="bg-semcompDarkBlue text-white">Graduação (Concluída)</option>
                                    <option value="Pós-graduação" className="bg-semcompDarkBlue text-white">Pós-graduação / Mestrado / Doutorado</option>
                                </Select>
                            </div>

                            <div className="sm:col-span-2">
                                <Input label="Profissão / Curso" value={profession} onChange={(e) => setProfession(e.target.value)} placeholder="Ex: Estudante de Computação / Desenvolvedor" />
                            </div>
                        </div>

                        <p className="text-xs font-bold uppercase tracking-wider opacity-70 border-b border-gray-400/30 pb-1 pt-2">Acessibilidade & Permanência</p>
                        <div className="space-y-3 bg-black/5 dark:bg-white/5 p-3 rounded-lg border border-gray-400/20">
                            
                            {/* Toggle PAPFE */}
                            <label className="flex items-center justify-between cursor-pointer text-sm font-medium">
                                <span>Possui apoio PAPFE (USP)?</span>
                                <input type="checkbox" checked={hasPapfe} onChange={(e) => setHasPapfe(e.target.checked)} className="w-5 h-5 rounded accent-semcompMidDarkBlue cursor-pointer" />
                            </label>

                            <hr className="border-gray-400/20" />

                            {/* Toggle Deficiência */}
                            <label className="flex items-center justify-between cursor-pointer text-sm font-medium">
                                <span>Possui alguma deficiência (PCD)?</span>
                                <input type="checkbox" checked={hasDisability} onChange={(e) => {
                                    setHasDisability(e.target.checked);
                                    if (!e.target.checked) setDisabilities([]); // Limpa se desmarcar
                                }} className="w-5 h-5 rounded accent-semcompMidDarkBlue cursor-pointer" />
                            </label>

                            {/* Campo Multivalorado Condicional */}
                            {hasDisability && (
                                <div className="pt-2 animate-fadeIn">
                                    <label className="text-xs font-semibold block mb-1">Qual(is) deficiência(s)? *</label>
                                    <div className="flex gap-2">
                                        <input 
                                            type="text" 
                                            value={currentDisability} 
                                            onChange={(e) => setCurrentDisability(e.target.value)}
                                            onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); handleAddDisability(); } }}
                                            placeholder="Digite e clique em Adicionar" 
                                            className={`flex-1 p-2 rounded-md border text-sm ${inputBg}`}
                                        />
                                        <button 
                                            type="button" 
                                            onClick={handleAddDisability}
                                            className="px-3 py-1.5 bg-semcompMidDarkBlue text-white rounded-md text-xs font-bold hover:brightness-110"
                                        >
                                            + Adicionar
                                        </button>
                                    </div>

                                    {/* Lista de Tags Adicionadas */}
                                    <div className="flex flex-wrap gap-1.5 mt-2">
                                        {disabilities.length === 0 && <span className="text-xs opacity-60 italic">Nenhuma adicionada ainda.</span>}
                                        {disabilities.map((tag, idx) => (
                                            <span key={idx} className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-semcompMidDarkBlue text-white">
                                                {tag}
                                                <button type="button" onClick={() => handleRemoveDisability(tag)} className="hover:text-red-300 font-bold">×</button>
                                            </span>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>

                        <p className="text-xs font-bold uppercase tracking-wider opacity-70 border-b border-gray-400/30 pb-1 pt-2">Redes Sociais (Opcional)</p>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                            <Input label="LinkedIn" value={linkedin} onChange={(e) => setLinkedin(e.target.value)} placeholder="linkedin.com/in/você" />
                            <Input label="Telegram" value={telegram} onChange={(e) => setTelegram(e.target.value)} placeholder="@seuusuario" />
                        </div>

                        {/* Termos de Serviço */}
                        <label className="flex items-center gap-2 pt-2 text-sm">
                            <input type="checkbox" checked={acceptTerms} onChange={(e) => setAcceptTerms(e.target.checked)} className="w-4 h-4 rounded accent-semcompMidDarkBlue cursor-pointer" />
                            <span>
                                Concordo com os{' '}
                                <button type="button" onClick={openTerms} className="underline font-semibold text-semcompMidDarkBlue dark:text-semcompOffWhite hover:brightness-110">
                                    Termos de Serviço
                                </button>
                            </span>
                        </label>
                    </>
                )}
                               
                <button 
                    type="submit" 
                    disabled={loading}
                    className="w-full mt-4 px-3 py-3 rounded-md bg-semcompMidDarkBlue text-white text-sm font-bold disabled:opacity-50 hover:brightness-110 transition-all shadow-md sticky bottom-0 z-10"
                >
                    {loading ? "Processando..." : isLogin ? "Entrar" : "Criar conta"}
                </button>
            </form>
        </div>
    );

    const bgContainer = isDarkMode ? "bg-semcompDarkBlue" : "bg-semcompMidLightBlue";
    const mobileShadow = isDarkMode 
        ? "shadow-[-10px_-15px_0px_0px_#163756,15px_-40px_0px_0px_#0e2a44]" 
        : "shadow-[-10px_-15px_0px_0px_#b3cde0,15px_-40px_0px_0px_#dbe9f4]";

    return (
        <div className={`${bgColor}`}>
            <div className={`min-h-screen w-full flex items-center justify-center overflow-hidden`}>
                
                {/* 1. MODO DESKTOP (Ajuste de largura dinâmica na coluna da foto vs formulário) */}
                <div className={`hidden min-[1280px]:flex ${bgContainer} h-[680px] w-[95%] max-w-[1150px] rounded-3xl shadow-xl overflow-hidden transition-all duration-300`}>
                    <div className={`${isLogin ? "w-1/2" : "w-5/12"} bg-gray-300 relative transition-all duration-300`}>
                        <img src={loginHeroSrc} alt="Background Desktop" className="absolute inset-0 w-full h-full object-cover" />
                    </div>
                    <div className={`${isLogin ? "w-1/2" : "w-7/12"} flex items-center justify-center transition-all duration-300`}>
                        {formContent}
                    </div>
                </div>

                {/* 2. MODO TABLET */}
                <div className={`hidden min-[800px]:flex min-[1280px]:hidden relative ${bgContainer} w-[90%] max-w-[600px] h-[680px] rounded-3xl shadow-xl items-center justify-center overflow-hidden`}>
                    <img src={loginHeroSrc} alt="Background Tablet" className={`absolute inset-0 w-full h-full object-cover ${isDarkMode ? "opacity-40 brightness-50" : "opacity-90 brightness-50"}`} />
                    <div className={`relative z-10 ${isDarkMode ? "bg-semcompOffWhite/10" : "bg-semcompMidLightBlue/30"} backdrop-blur-md rounded-2xl shadow-2xl m-4 w-full max-w-[540px] flex justify-center`}>
                        {formContent}
                    </div>
                </div>

                {/* 3. MODO MOBILE */}
                <div className={`flex min-[800px]:hidden ${bgContainer} w-[90%] max-w-[450px] min-h-[500px] rounded-3xl flex-col items-center justify-center p-4 ${mobileShadow}`}>
                    {formContent}
                </div>

            </div>

            <TermsModal open={termsOpen} onClose={() => setTermsOpen(false)} content={termsContent} />
        </div>
    );
}