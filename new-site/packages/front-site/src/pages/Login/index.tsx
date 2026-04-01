import React, { useCallback, useContext, useState } from "react";
import { useTheme } from "@/contexts/useTheme";

type Mode = "login" | "register";

export default function LoginPage(): React.ReactElement {
  const [mode, setMode] = useState<Mode>("login");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [remember, setRemember] = useState(false);

  const { isDarkMode } = useTheme()

  const textColor = isDarkMode ? "text-semcompOffWhite" : "text-semcompDarkBlue";
  const gradientFrom = isDarkMode ? "from-semcompLightBlue/80" : "from-semcompDarkBlue/80";
  const gradientVia  = isDarkMode ? "via-semcompLightBlue" : "via-semcompDarkBlue";
  const gradientTo = isDarkMode ? "to-semcompOffWhite" : "to-semcompOffBlack";

  const resetForm = useCallback(() => {
    setEmail("");
    setPassword("");
    setName("");
    setConfirmPassword("");
    setRemember(false);
    setMessage(null);
  }, []);

  const toggleMode = useCallback(
    (next: Mode) => {
      setMode(next);
      resetForm();
    },
    [resetForm]
  );

  const validate = useCallback((): string | null => {
    if (!email.includes("@")) return "Insira um e-mail válido.";
    if (password.length < 6) return "A senha deve ter ao menos 6 caracteres.";
    if (mode === "register") {
      if (name.trim().length === 0) return "Informe seu nome.";
      if (password !== confirmPassword) return "As senhas não coincidem.";
    }
    return null;
  }, [email, password, confirmPassword, mode, name]);

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
        setMessage(mode === "login" ? "Login realizado (simulado)." : "Cadastro realizado (simulado).");
        // após sucesso, redirecionar ou atualizar estado global
      } catch (err) {
        setMessage("Erro ao conectar com o servidor.");
      } finally {
        setLoading(false);
      }
    },
    [validate, mode, email, password, name]
  );

  return (
    <div className={`min-h-screen flex items-center justify-center bg-gray-100 p-6`}>
      <div className="w-96 max-w-full bg-white p-7 shadow-lg rounded-lg" role="main" aria-labelledby="auth-title">
        <h2 id="auth-title" className="m-0 mb-2 text-xl font-semibold">
          {mode === "login" ? "Entrar" : "Criar conta"}
        </h2>

        <div className="flex justify-center gap-2 mb-3">
          <button
            onClick={() => toggleMode("login")}
            aria-pressed={mode === "login"}
            className={`bg-transparent border-none cursor-pointer ${mode === "login" ? "text-gray-900 font-semibold" : "text-gray-500 font-medium"}`}
          >
            Login
          </button>
          <span className="text-gray-200">|</span>
          <button
            onClick={() => toggleMode("register")}
            aria-pressed={mode === "register"}
            className={`bg-transparent border-none cursor-pointer ${mode === "register" ? "text-gray-900 font-semibold" : "text-gray-500 font-medium"}`}
          >
            Registrar
          </button>
        </div>

        <form onSubmit={handleSubmit} aria-live="polite">
          {mode === "register" && (
            <label className="block mb-2">
              <div className="text-sm mb-1">Nome</div>
              <input
                className="w-full px-3 py-2 mb-3 rounded-md border border-gray-300 text-sm"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Seu nome completo"
                required={mode === "register"}
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

          {mode === "register" && (
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

          {mode === "login" && (
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
            {loading ? "Processando..." : mode === "login" ? "Entrar" : "Criar conta"}
          </button>
        </form>

        <div className="mt-4 text-sm text-gray-500 text-center">
          Ao continuar você concorda com os termos e a política de privacidade.
        </div>
      </div>
    </div>
  );
}
