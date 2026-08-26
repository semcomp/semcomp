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

  const cardBg = isDarkMode ? "bg-semcompDarkBlue" : "bg-semcompMidLightBlue";
  const inputBg = isDarkMode ? "bg-semcompDarkBlue" : "bg-semcompMidDarkBlue";
  const textPrimary = isDarkMode ? "text-white" : "text-semcompDarkBlue";
  const textMuted = isDarkMode ? "text-slate-400" : "text-slate-600";
  const sectionBorder = isDarkMode ? "border-slate-700" : "border-slate-300";

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

  // --- Estados de UI ---------

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Loader2 className={`h-8 w-8 animate-spin ${textPrimary}`} />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-4 px-4">
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
        <div className="flex min-h-screen flex-col items-center justify-center gap-4 px-4">
          <Lightbulb className={`h-16 w-16 ${textMuted}`} />
          <h1 className={`text-2xl font-bold ${textPrimary}`}>Jogo de Enigmas</h1>
          <p className={`text-center ${textMuted}`}>
            O jogo ainda não começou. Volte mais tarde!
          </p>
        </div>
      );
    }

    return (
      <div className="mx-auto mt-28 flex min-h-screen w-full max-w-3xl flex-col items-center gap-8 px-4 pb-20">
        <div className="text-center">
          <Lightbulb className={`mx-auto h-12 w-12 ${textMuted}`} />
          <h1 className={`mt-3 text-3xl font-bold ${textPrimary}`}>Jogo de Enigmas</h1>
          <p className={`mt-1 ${textMuted}`}>
            {riddlesTotal} enigma{riddlesTotal !== 1 ? "s" : ""} disponíve
            {riddlesTotal !== 1 ? "is" : "l"}
          </p>
        </div>

        {/* Criar equipe */}
        <div className={`w-full rounded-2xl border p-6 ${cardBg} ${sectionBorder}`}>
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
        <div className={`w-full rounded-2xl border p-6 ${cardBg} ${sectionBorder}`}>
          <div className="mb-4 flex items-center gap-2">
            <LogIn className={`h-5 w-5 ${textPrimary}`} />
            <h2 className={`text-lg font-semibold ${textPrimary}`}>Entrar em uma equipe</h2>
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
    );
  }

  // --- Com time — progresso ---------

  if (isFinished) {
    return (
      <div className={`mx-auto mt-28 flex min-h-screen w-full max-w-2xl flex-col items-center gap-6 px-4 pb-20 text-center`}>
        <Trophy className="h-20 w-20 text-yellow-400" />
        <h1 className={`text-3xl font-bold ${textPrimary}`}>Parabéns, {team.name}!</h1>
        <p className={`text-lg ${textMuted}`}>
          Seu time completou todos os {riddlesTotal} enigmas!
        </p>
        <div className={`mt-4 w-full rounded-2xl border p-6 ${cardBg} ${sectionBorder}`}>
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
    );
  }

  return (
    <div className="mx-auto mt-28 flex min-h-screen w-full max-w-3xl flex-col gap-8 px-4 pb-20">
      {/* Card da equipe */}
      <div className={`w-full rounded-2xl border p-6 ${cardBg} ${sectionBorder}`}>
        <div className="mb-4 flex items-start justify-between gap-4">
          <div>
            <h1 className={`text-2xl font-bold ${textPrimary}`}>{team.name}</h1>
            <p className={`mt-1 text-sm ${textMuted}`}>
              Progresso: {progressIndex} / {riddlesTotal} enigma{riddlesTotal !== 1 ? "s" : ""}
            </p>
          </div>
          <div className="text-right">
            <p className={`text-xs uppercase tracking-wider ${textMuted}`}>Código da equipe</p>
            <p className={`mt-1 text-lg font-mono font-bold tracking-[0.25em] text-violet-400`}>
              {team.code}
            </p>
          </div>
        </div>

        {/* Membros */}
        <div className={`border-t pt-4 ${sectionBorder}`}>
          <h3 className={`mb-2 text-sm font-semibold uppercase tracking-widest ${textMuted}`}>
            Membros ({team.members?.length ?? 0}/{5})
          </h3>
          <div className="flex flex-wrap gap-3">
            {team.members?.map((m) => (
              <span
                key={m.user_number}
                className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-sm ${cardBg} ${sectionBorder} ${textPrimary}`}
              >
                <Users className="h-3.5 w-3.5 opacity-60" />
                {m.name || `#${m.user_number}`}
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* Enigma atual */}
      {currentRiddle ? (
        <div className={`w-full rounded-2xl border p-6 ${cardBg} ${sectionBorder}`}>
          <h2 className={`mb-6 text-xl font-bold ${textPrimary}`}>Enigma #{currentRiddle.id}</h2>

          {/* Dica 1 */}
          <div className={`mb-4 rounded-xl border p-4 ${inputBg} ${sectionBorder}`}>
            <div className="mb-1 flex items-center gap-1.5 text-amber-500">
              <Lightbulb className="h-4 w-4" />
              <span className="text-xs font-semibold uppercase tracking-wider">Dica 1</span>
            </div>
            <p className={`${textPrimary}`}>{currentRiddle.hint_1}</p>
          </div>

          {/* Dica 2 */}
          <div className={`mb-6 rounded-xl border p-4 ${inputBg} ${sectionBorder}`}>
            <div className="mb-1 flex items-center gap-1.5 text-amber-500">
              <Lightbulb className="h-4 w-4" />
              <span className="text-xs font-semibold uppercase tracking-wider">Dica 2</span>
            </div>
            <p className={`${textPrimary}`}>{currentRiddle.hint_2}</p>
          </div>

          {/* Imagem (se existir) */}
          {currentRiddle.image_url && (
            <div className="mb-6 flex justify-center">
              <img
                src={currentRiddle.image_url}
                alt="Ilustração do enigma"
                className="max-h-64 rounded-xl object-contain"
              />
            </div>
          )}

          {/* Feedback da última tentativa */}
          {lastSolveResult && !lastSolveResult.correct && (
            <div className={`mb-4 rounded-lg border border-red-600/40 ${isDarkMode ? "bg-red-900/20" : "bg-red-100"} p-3`}>
              <p className="text-sm text-red-600">{lastSolveResult.message}</p>
            </div>
          )}

          {/* Form de resposta */}
          <div className="flex flex-col gap-3 sm:flex-row">
            <div className="flex-1">
              <Input
                label="Sua resposta"
                value={answer}
                onChange={(e) => setAnswer(e.target.value)}
                placeholder="Digite a resposta do enigma..."
              />
            </div>
            <div className="flex items-end pb-3">
              <Button
                onClick={handleSolve}
                disabled={isSolving || !answer.trim()}
              >
                {isSolving ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <Send className="mr-2 h-4 w-4" />
                )}
                Responder
              </Button>
            </div>
          </div>
        </div>
      ) : (
        <div className={`w-full rounded-2xl border p-8 text-center ${cardBg} ${sectionBorder}`}>
          <Loader2 className={`mx-auto h-8 w-8 animate-spin ${textMuted}`} />
          <p className={`mt-3 ${textMuted}`}>Carregando próximo enigma...</p>
        </div>
      )}
    </div>
  );
}