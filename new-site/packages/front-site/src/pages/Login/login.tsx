import { useTheme } from "@/contexts/useTheme";
import { useState, type ReactElement } from "react";
import { useCallback } from "react";
import SegmentedControl, { useSegmentedControl } from "@/components/ui/segcontrol";
import useWindowDimensions from "@/hooks/useWindowDimensions";



export default function loginPage(){
    const { islogin, setIslogin } = useSegmentedControl();
    const { isDarkMode } = useTheme();
    const bgColor = isDarkMode ? "bg-semcompMidDarkBlue" : "bg-semcompOffWhite";
    const textColor = isDarkMode ? "text-semcompOffWhite" : "text-semcompDarkBlue";
    let {width} = useWindowDimensions()
   
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState<string | null>(null);

    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [name, setName] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [remember, setRemember] = useState(false);

    const resetForm = useCallback(() => {
        setEmail("");
        setPassword("");
        setName("");
        setConfirmPassword("");
        setRemember(false);
        setMessage(null);
    }, []);

    const validate = useCallback((): string | null => {
        if (!email.includes("@")) return "Insira um e-mail válido.";
        if (password.length < 6) return "A senha deve ter ao menos 6 caracteres.";
        if (islogin === false) {
        if (name.trim().length === 0) return "Informe seu nome.";
        if (password !== confirmPassword) return "As senhas não coincidem.";
        }
        return null;
    }, [email, password, confirmPassword, islogin, name]);

    const handleSubmit = useCallback(
        async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setMessage(null);
        const err = validate();
        if (err) {
            setMessage(err);
            return;
        }

        setLoading(true);
        try {
            // Exemplo: adaptar para sua API
            // const url = mode === "login" ? "/api/auth/login" : "/api/auth/register";
            // await fetch(url, { method: "POST", body: JSON.stringify({ email, password, name }) });

            await new Promise((r) => setTimeout(r, 700)); // simula requisição
            setMessage(islogin === true ? "Login realizado (simulado)." : "Cadastro realizado (simulado).");
            // após sucesso, redirecionar ou atualizar estado global
        } catch (err) {
            setMessage("Erro ao conectar com o servidor.");
        } finally {
            setLoading(false);
        }
        },
        [validate, islogin, email, password, name]
    );

    const formContent = (
        <div className={`w-full max-w-sm flex flex-col items-center justify-center p-8 ${textColor}`}>
            <SegmentedControl islogin={islogin} setIslogin={setIslogin} hook={resetForm}/>
            <form onSubmit={handleSubmit} aria-live="polite" className="w-full mt-4">
                {islogin === false && (
                    <label className="block mb-2">
                        <div className="text-sm mb-1">Nome</div>
                        <input
                            className="w-full px-3 py-2 mb-3 rounded-md border border-gray-300 text-sm"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            placeholder="Seu nome completo"
                            required={islogin === false}
                            aria-label="Nome"
                        />
                    </label>
                )}

                <label className="block mb-2">
                    <div className="text-sm mb-1">Email</div>
                    <input
                        className="w-full px-3 py-2 mb-3 rounded-md border border-gray-300 text-sm"
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="nome@exemplo.com"
                        required
                        aria-label="Email"
                    />
                </label>

                <label className="block mb-2">
                    <div className="text-sm mb-1">Senha</div>
                    <input
                        className="w-full px-3 py-2 mb-3 rounded-md border border-gray-300 text-sm"
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="Senha"
                        required
                        aria-label="Senha"
                    />
                </label>

                {islogin === false && (
                    <label className="block mb-3">
                        <div className="text-sm mb-1">Confirmar senha</div>
                        <input
                            className="w-full px-3 py-2 rounded-md border border-gray-300 text-sm"
                            type="password"
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                            placeholder="Confirmar senha"
                            required
                            aria-label="Confirmar senha"
                        />
                    </label>
                )}

                {islogin === true && (
                    <label className="flex items-center gap-2 mb-3 text-sm text-gray-700">
                        <input
                            type="checkbox"
                            checked={remember}
                            onChange={(e) => setRemember(e.target.checked)}
                            aria-label="Lembrar-me"
                            className="w-4 h-4"
                        />
                        <span>Lembrar-me</span>
                    </label>
                )}

                {message && (
                    <div className={`${message.includes("Erro") ? "text-red-700" : "text-green-700"} mb-3`}>
                        {message}
                    </div>
                )}

                <button type="submit" className="w-full px-3 py-2 rounded-md bg-blue-600 text-white text-sm disabled:opacity-50" disabled={loading}>
                    {loading ? "Processando..." : islogin === true ? "Entrar" : "Criar conta"}
                </button>
            </form>
        </div>
    );

    let retorno: ReactElement | null;
    const bgContainer = isDarkMode ? "bg-semcompDarkBlue" : "bg-semcompMidDarkBlue";

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
    } else if (width >= 800) {
        retorno = (
            <div className={`h-[calc(100vh-70px)] flex items-center justify-center ${bgColor} p-4`}>
                <div className={`relative ${bgContainer} w-[98%] min-h-[85%] rounded-3xl shadow-xl flex items-center justify-center overflow-hidden`}>
                    <img 
                        src="https://diariodepernambuco.com.br/dpmais/wp-content/uploads/2025/11/Lionel-Messi.webp" 
                        alt="Background" 
                        className="absolute inset-0 w-full h-full object-cover opacity-40 brightness-50"
                    />
                    <div className="relative z-10 bg-white/10 backdrop-blur-md rounded-2xl shadow-2xl m-4">
                        {formContent}
                    </div>
                </div>
            </div>
        );
    } else {
        retorno = (
            <div className={`h-[calc(100vh-70px)] flex items-center justify-center ${bgColor} p-4`}>
                <div className={`${bgContainer} w-[98%] min-h-[85%] rounded-3xl shadow-xl flex flex-col items-center justify-center`}>
                    {formContent}
                </div>
            </div>
        );
    }

    // preciso ver uma forma mais inteligente de decrementar da main o tamanho do header, visto que se alguma hora for definido que ele muda de tamanho a pagina quebra
    return (
        retorno
    );
}