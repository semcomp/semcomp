import { useTheme } from "@/contexts/useTheme";
import { useState, type ReactElement } from "react";
import { useCallback } from "react";
import SegmentedControl, { useSegmentedControl } from "@/components/ui/Segcontrol";
import useWindowDimensions from "@/hooks/useWindowDimensions";
import Input from "@/components/ui/Input"
import { useAuth } from "@/contexts/AuthContext";
import axios from "axios";
import { BASEURL } from "@/constants/ApiURL";
import Notification from "@/components/Notification";
import type { NotificationType } from "@/types/NotificationType";
import type { APIResponse } from "@/types/APIResponseType";

/* obs: deve ser implementar uma maneira mais inteligente de lidar com a altura do header
visto que se algo mudar na altura dele, o resto da pagina neste componente pode potencialmente
quebrar. */

export default function loginPage(){
    // variaveis para alterações de modo no forms e modo de luz do site
    const { isLogin, setIsLogin } = useSegmentedControl();
    const { isDarkMode } = useTheme();
    
    // cores e dimensão da janela
    const bgColor = isDarkMode ? "bg-semcompMidDarkBlue" : "bg-semcompOffWhite";
    const textColor = isDarkMode ? "text-semcompOffWhite" : "text-semcompDarkBlue";
    let {width} = useWindowDimensions()
   
    // estados do forms com mensagem a ser exibida
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState<string>("");

    // campos a serem preenchidos no forms
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [name, setName] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [remember, setRemember] = useState(false);

    // função para resetar o forms
    const resetForm = useCallback(() => {
        setEmail("");
        setPassword("");
        setName("");
        setConfirmPassword("");
        setRemember(false);
        setMessage("");
    }, []);

    // checagem de formulario, ainda há mais restrições a serem colocadas eventualmente
    const validate = useCallback((): string | null => {
        if (!email.includes("@")) return "Insira um e-mail válido.";
        if (password.length < 6) return "A senha deve ter ao menos 6 caracteres.";
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
            const response = await axios.post(`${BASEURL}/register`, {
                name: name,
                email: email,
                password: password,
              });

            const apiResponse:APIResponse = {message: response.data.message as string, type: "success"};
            return apiResponse;
        } catch (err:any){
            const apiResponse:APIResponse = {message: err.message as string, type: "warning"};
            return apiResponse;
        }
    }

    // prototipação da função de envio do forms
    const handleSubmit = useCallback(
        async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setMessage("");
        const err = validate();
        if (err) {
            setMessage(err);
            return;
        }

        setLoading(true);
        try {
            // cchc
            if (isLogin){
                await login(email, password)
            } else {
                await register(email, name, password);
            }
        } catch (err) {
            setMessage("Erro ao conectar com o servidor.");
        } finally {
            setLoading(false);
        }
        },
        [validate, isLogin, email, password, name]
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
                )}

                {isLogin ? (
                    <label className="flex items-center gap-2 mb-3 text-sm text-white underline">
                        <input
                            type="checkbox"
                            checked={remember}
                            onChange={(e) => setRemember(e.target.checked)}
                            aria-label="Lembrar-me"
                            className="w-4 h-4"
                        />
                        <span>Lembrar-me</span>
                    </label>
                ) 
                    :
                (
                    <label className="flex items-center gap-2 mb-3 text-sm text-white underline">
                        <input
                            type="checkbox"
                            checked={remember}
                            onChange={(e) => setRemember(e.target.checked)}
                            aria-label="Concordo com os termos de serviço"
                            className="w-4 h-4"
                        />
                        <span>Concordo com os termos de serviço da aplicação.</span>
                    </label>
                )
                }

                {message && (
                    <div className={`${message.includes("Erro") ? "text-red-700" : "text-green-700"} mb-3`}>
                        {message}
                    </div>
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
                            src="https://diariodepernambuco.com.br/dpmais/wp-content/uploads/2025/11/Lionel-Messi.webp" 
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
                        src="https://diariodepernambuco.com.br/dpmais/wp-content/uploads/2025/11/Lionel-Messi.webp" 
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
        retorno 
    );
}