import { useEffect, useState, useCallback } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useTheme } from "@/contexts/useTheme";
import { useNotification } from "@/contexts/NotificationContext";
import { Button } from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import { riddleAPI } from "@/api/riddle";
import type { MyGame, SolveResult, Team } from "@/api/riddle";
import {
  Users,
  UserPlus,
  LogIn,
  Trophy,
  Lightbulb,
  Send,
  Loader2,
} from "lucide-react";

export default function Riddle() {
  const { isAuthenticated } = useAuth();
  const { isDarkMode } = useTheme();
  const { showNotification } = useNotification();

  // Estado do jogo
  const [myGame, setMyGame] = useState<MyGame | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Forms
  const [teamName, setTeamName] = useState("");
  const [joinCode, setJoinCode] = useState("");
  const [answer, setAnswer] = useState("");

  // Estados de operação
  const [isCreating, setIsCreating] = useState(false);
  const [isJoining, setIsJoining] = useState(false);
  const [isSolving, setIsSolving] = useState(false);
  const [lastSolveResult, setLastSolveResult] = useState<SolveResult | null>(null);

  // Mesmo fundo das demais páginas do site (ver Profile: bg-semcompMidLightBlue dark:bg-semcompAlmostDarkBlue).
  const pageBg = isDarkMode ? "bg-semcompAlmostDarkBlue" : "bg-semcompMidLightBlue";
  const cardBg = isDarkMode ? "bg-semcompDarkBlue" : "bg-semcompMidLightBlue";
  const textPrimary = isDarkMode ? "text-white" : "text-semcompDarkBlue";
  const textMuted = isDarkMode ? "text-slate-400" : "text-slate-600";
  const sectionBorder = isDarkMode ? "border-slate-700" : "border-slate-300";

  // Card da pregunta — "bolha branca" da referencia, com sombra; escuro usa tokens do projeto.
  const questionCard = isDarkMode
    ? "rounded-2xl border border-slate-700 shadow-xl p-8 flex flex-col items-center bg-semcompDarkBlue"
    : "rounded-2xl border border-gray-100 shadow-xl p-8 flex flex-col items-center bg-white";

  const questionInput = isDarkMode
    ? "border-2 border-semcompOffWhite bg-semcompDarkBlue text-white placeholder:text-white"
    : "border-2 border-gray-300 bg-white text-gray-800 placeholder:text-gray-400";

  // --- Fetch inicial ---------

  const fetchGame = useCallback(async () => {
    try {
      setError(null);
      setLoading(true);

      const game = await riddleAPI.getMyGame();
      setMyGame(game);
      setLastSolveResult(null);
    } catch (err: any) {
      console.error("Erro ao carregar jogo:", err);
      setError("Erro ao carregar o estado do jogo.");
      setMyGame(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (isAuthenticated) fetchGame();
  }, [isAuthenticated, fetchGame]);

  // --- Ações ---------

  const handleCreateTeam = async () => {
    const trimmed = teamName.trim();
    if (!trimmed) {
      showNotification("Digite um nome para a equipe.", "warning");
      return;
    }
    try {
      setIsCreating(true);
      await riddleAPI.createTeam(trimmed);
      showNotification("Equipe criada com sucesso!", "success");
      setTeamName("");
      await fetchGame();
    } catch (err: any) {
      const msg = err?.response?.data?.message || "Erro ao criar equipe.";
      showNotification(msg, "error");
    } finally {
      setIsCreating(false);
    }
  };

  const handleJoinTeam = async () => {
    const normalized = joinCode.trim().toUpperCase();
    if (!normalized) {
      showNotification("Digite um código de convite.", "warning");
      return;
    }
    try {
      setIsJoining(true);
      await riddleAPI.joinTeam(normalized);
      showNotification("Você entrou na equipe!", "success");
      setJoinCode("");
      await fetchGame();
    } catch (err: any) {
      const msg = err?.response?.data?.message || "Erro ao entrar na equipe.";
      showNotification(msg, "error");
    } finally {
      setIsJoining(false);
    }
  };

  const handleSolve = async () => {
    const trimmed = answer.trim();
    if (!trimmed || !myGame?.current_riddle) return;
    try {
      setIsSolving(true);
      const result = await riddleAPI.solve(myGame.current_riddle.id, trimmed);
      setLastSolveResult(result);
      if (result.correct) {
        setAnswer("");
        if (result.finished) {
          showNotification("Parabéns! Seu time completou o jogo!", "success");
        } else {
          showNotification("Resposta correta!", "success");
        }
      } else {
        showNotification("Resposta incorreta! Tente novamente.", "warning");
      }
      // Recarrega para atualizar current_riddle / finished
      await fetchGame();
    } catch (err: any) {
      const msg = err?.response?.data?.message || "Erro ao resolver enigma.";
      showNotification(msg, "error");
    } finally {
      setIsSolving(false);
    }
  };

  const handleAnswerSubmit = (e: { preventDefault: () => void }) => {
    e.preventDefault();
    if (!answer.trim()) {
      showNotification("Você deve fornecer uma resposta.", "warning");
      return;
    }
    handleSolve();
  };

  // --- Estados de UI ---------

  if (loading) {
    return (
      <div className={`flex min-h-screen items-center justify-center ${pageBg}`}>
        <Loader2 className={`h-8 w-8 animate-spin ${textPrimary}`} />
      </div>
    );
  }

  if (error) {
    return (
      <div className={`flex min-h-screen flex-col items-center justify-center gap-4 px-4 ${pageBg}`}>
        <p className={`text-lg ${textPrimary}`}>{error}</p>
        <Button variant="outline" onClick={fetchGame}>Tentar novamente</Button>
      </div>
    );
  }

  const team: Team | null = myGame?.team ?? null;
  const currentRiddle = myGame?.current_riddle ?? null;
  const riddlesTotal = myGame?.riddles_total ?? 0;
  const isFinished = team?.finished_at != null;
  const progressIndex = team ? Math.min(team.current_riddle_index + 1, riddlesTotal) : 0;

  // --- Sem time — criar ou entrar ---------

  if (!team) {
    if (riddlesTotal === 0) {
      return (
        <div className={`flex min-h-screen flex-col items-center justify-center gap-4 px-4 ${pageBg}`}>
          <Lightbulb className={`h-16 w-16 ${textMuted}`} />
          <h1 className={`text-2xl font-bold ${textPrimary}`}>Jogo de Enigmas</h1>
          <p className={`text-center ${textMuted}`}>
            O jogo ainda não começou. Volte mais tarde!
          </p>
        </div>
      );
    }

    return (
      <div className={`min-h-screen w-full pt-28 ${pageBg}`}>
      <div className="mx-auto flex w-full max-w-3xl flex-col items-center gap-8 px-4 pb-20">
        <div className="text-center">
          <Lightbulb className={`mx-auto h-12 w-12 ${textMuted}`} />
          <h1 className={`mt-3 text-3xl font-bold ${textPrimary}`}>Jogo de Enigmas</h1>
          <p className={`mt-1 ${textMuted}`}>
            {riddlesTotal} enigma{riddlesTotal !== 1 ? "s" : ""} disponíve
            {riddlesTotal !== 1 ? "is" : "l"}
          </p>
        </div>

        {/* Criar equipe */}
        <div className={`w-full rounded-2xl border p-6 shadow-md ${cardBg} ${sectionBorder}`}>
          <div className="mb-4 flex items-center gap-2">
            <UserPlus className={`h-5 w-5 ${textPrimary}`} />
            <h2 className={`text-lg font-semibold ${textPrimary}`}>Criar equipe</h2>
          </div>
          <Input
            label="Nome da equipe"
            value={teamName}
            onChange={(e) => setTeamName(e.target.value)}
            placeholder="Ex: Os Enigmeros"
          />
          <Button
            className="mt-2 w-full"
            onClick={handleCreateTeam}
            disabled={isCreating || !teamName.trim()}
          >
            {isCreating ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Users className="mr-2 h-4 w-4" />}
            Criar equipe
          </Button>
        </div>

        {/* Entrar em equipe */}
        <div className={`w-full rounded-2xl border p-6 shadow-md ${cardBg} ${sectionBorder}`}>
          <div className="mb-4 flex items-center gap-2">
            <LogIn className={`h-5 w-5 ${textPrimary}`} />
            <h2 className={`text-lg font-semibold ${textPrimary}`}>Entrar em una equipe</h2>
          </div>
          <Input
            label="Código de convite"
            value={joinCode}
            onChange={(e) => setJoinCode(e.target.value.toUpperCase())}
            placeholder="Ex: ABC123ZY"
          />
          <Button
            className="mt-2 w-full"
            variant="secondary"
            onClick={handleJoinTeam}
            disabled={isJoining || !joinCode.trim()}
          >
            {isJoining ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <LogIn className="mr-2 h-4 w-4" />}
            Entrar na equipe
          </Button>
        </div>
      </div>
      </div>
    );
  }

  // --- Com time — finalizado ---------

  if (isFinished) {
    return (
      <div className={`min-h-screen w-full pt-28 ${pageBg}`}>
      <div className="mx-auto flex w-full max-w-2xl flex-col items-center gap-6 px-4 pb-20 text-center">
        <Trophy className="h-20 w-20 text-yellow-400" />
        <h1 className={`text-3xl font-bold ${textPrimary}`}>Parabéns, {team.name}!</h1>
        <p className={`text-lg ${textMuted}`}>
          Seu time completou todos os {riddlesTotal} enigmas!
        </p>
        <div className={`w-full rounded-2xl border border-gray-100 shadow-xl bg-white p-6 dark:border-slate-700 dark:bg-semcompDarkBlue`}>
          <h3 className={`mb-3 text-sm font-semibold uppercase tracking-widest ${textMuted}`}>Membros</h3>
          <ul className="space-y-2">
            {team.members?.map((m) => (
              <li key={m.user_number} className={`flex items-center gap-2 ${textPrimary}`}>
                <Users className="h-4 w-4 opacity-60" />
                <span>{m.name || `#${m.user_number}`}</span>
              </li>
            ))}
          </ul>
        </div>
        <Button variant="outline" onClick={fetchGame}>
          Atualizar
        </Button>
      </div>
      </div>
    );
  }

  // --- Com time — jogo ativo ---------

  const riddleTitle = currentRiddle?.hint_1?.trim() || (currentRiddle ? `Enigma #${currentRiddle.id}` : "");
  const riddleClue = currentRiddle?.hint_2?.trim() ?? null;
  const progressPct = riddlesTotal > 0 ? Math.round((progressIndex / riddlesTotal) * 100) : 0;

  return (
    <div className={`min-h-screen w-full pt-28 ${pageBg}`}>
    <div className="mx-auto flex w-full max-w-4xl flex-col items-center gap-8 px-4 pb-20">
      {/* Barra da equipe */}
      <div className="flex flex-col items-center gap-3">
        <div className="flex items-center gap-3">
          <h1 className={`text-2xl font-bold ${textPrimary}`}>{team.name}</h1>
          <span className="rounded-md border px-2 py-0.5 font-mono text-sm font-bold tracking-[0.2em] text-violet-400">
            {team.code}
          </span>
        </div>
        <div className="flex flex-wrap justify-center gap-2">
          {team.members?.map((m) => (
            <span
              key={m.user_number}
              className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-sm ${cardBg} ${sectionBorder} ${textPrimary}`}
            >
              <Users className="h-3.5 w-3.5 opacity-60" />
              {m.name || `#${m.user_number}`}
            </span>
          ))}
          <span className={`text-xs ${textMuted}`}>
            {team.members?.length ?? 0}/{5} membros
          </span>
        </div>
      </div>

      {/* Card da pregunta — bolha branca da referencia */}
      {currentRiddle ? (
        <div className={questionCard}>
          {/* Título */}
          <div className="flex items-center justify-center gap-2">
            <Lightbulb className="h-5 w-5 shrink-0 text-yellow-500" />
            <h1
              className={`text-2xl leading-tight font-bold sm:text-3xl ${
                isDarkMode ? "text-white" : "text-gray-800"
              }`}
            >
              {riddleTitle}
            </h1>
          </div>

          {/* Progreso */}
          <div className="mt-6 w-full max-w-sm">
            <div className={`flex justify-between text-xs ${textMuted}`}>
              <span>Enigma {progressIndex} de {riddlesTotal}</span>
              <span>{progressPct}%</span>
            </div>
            <div className="mt-1 h-1.5 rounded-full bg-primary/20">
              <div className="h-1.5 rounded-full bg-primary" style={{ width: `${progressPct}%` }} />
            </div>
          </div>

          {/* Imagem (se existir) */}
          {currentRiddle.image_url && (
            <div className="mt-6 rounded-xl overflow-hidden shadow-lg">
              <img
                src={currentRiddle.image_url}
                alt="Ilustração do enigma"
                className="max-h-64 w-[500px] object-contain"
              />
            </div>
          )}

          {/* Dica — chip amarelo (hint_2) */}
          {riddleClue && (
            <div
              className={`mt-6 w-full max-w-xl rounded-xl border p-5 shadow-sm ${
                isDarkMode
                  ? "bg-yellow-500/15 border-yellow-500/40"
                  : "bg-yellow-50 border-yellow-200"
              }`}
            >
              <div className="flex items-center gap-2">
                <Lightbulb
                  className={`h-4 w-4 shrink-0 ${
                    isDarkMode ? "text-yellow-300" : "text-yellow-700"
                  }`}
                />
                <p
                  className={`text-sm leading-relaxed ${
                    isDarkMode ? "text-yellow-300" : "text-yellow-700"
                  }`}
                >
                  {riddleClue}
                </p>
              </div>
            </div>
          )}

          {/* Feedback da última tentativa */}
          {lastSolveResult && !lastSolveResult.correct && (
            <div
              className={`mt-4 rounded-lg border border-red-600/40 p-3 ${
                isDarkMode ? "bg-red-900/20" : "bg-red-100"
              }`}
            >
              <p className="text-sm text-red-600">{lastSolveResult.message}</p>
            </div>
          )}

          {/* Form de resposta — input com botón dentro, como a referencia */}
          <form className="mt-6 w-full max-w-xl" onSubmit={handleAnswerSubmit}>
            <div className="relative">
              <input
                className={`w-full rounded-lg border-2 py-4 pl-4 pr-32 text-sm ${questionInput}`}
                value={answer}
                onChange={(e) => setAnswer(e.target.value)}
                placeholder="Digite sua resposta aqui..."
                aria-label="Sua resposta"
              />
              <Button
                type="submit"
                className={`absolute right-2 top-1/2 -translate-y-1/2 h-9`}
                disabled={isSolving || !answer.trim()}
              >
                {isSolving ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <Send className="mr-2 h-4 w-4" />
                )}
                Enviar
              </Button>
            </div>
          </form>
        </div>
      ) : (
        <div className={`w-full rounded-2xl border p-8 text-center ${cardBg} ${sectionBorder}`}>
          <Loader2 className={`mx-auto h-8 w-8 animate-spin ${textMuted}`} />
          <p className={`mt-3 ${textMuted}`}>Carregando próximo enigma...</p>
        </div>
      )}
    </div>
    </div>
  );
}