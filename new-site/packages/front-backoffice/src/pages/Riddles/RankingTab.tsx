import { useCallback, useEffect, useRef, useState } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { RefreshCw, Trophy, Users } from "lucide-react";
import { teamsAPI } from "@/api/teams";
import type { TeamRankingEntry } from "@/types/TeamRankingType";

/** Intervalo do polling do ranking. Não há precedente de polling no backoffice;
 *  20s é o meio-termo entre acompanhar a competição ao vivo e não martelar a
 *  API. O polling é pausado quando a aba do navegador não está visível — e
 *  para de vez quando o usuário sai da aba "Ranking", porque este componente é
 *  desmontado junto (ver Riddles/index.tsx). */
const POLL_INTERVAL_MS = 20_000;

/** Uma tabela dedicada, e não o CrudTable: o ranking é somente leitura, tem
 *  ordem fixa (definida pelo backend) e nenhuma ação de linha — reaproveitar o
 *  CrudTable exigiria desligar edição, exclusão, ordenação por coluna, filtro e
 *  paginação, o que sairia mais confuso do que a tabela abaixo. O visual (borda,
 *  cabeçalho, zebra) segue o mesmo padrão do CrudTable. */
export function RankingTab() {
  const [teams, setTeams] = useState<TeamRankingEntry[]>([]);
  const [riddlesTotal, setRiddlesTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  // Evita setState depois do unmount (o polling pode estar em voo).
  const mountedRef = useRef(true);

  // showSpinner só é ligado no refresh manual: na montagem o estado inicial de
  // `loading` já é true (ligar de novo aqui seria um setState síncrono dentro
  // do efeito), e o polling atualiza em silêncio, sem piscar a tela.
  const fetchRanking = useCallback(async (showSpinner = false) => {
    try {
      if (showSpinner) setLoading(true);
      const response = await teamsAPI.getRanking();
      if (!mountedRef.current) return;
      setTeams(response.teams);
      setRiddlesTotal(response.riddlesTotal);
      setError(null);
    } catch (err: any) {
      console.error("Erro ao buscar ranking:", err);
      if (!mountedRef.current) return;
      // Mantém a última lista carregada na tela: uma falha pontual do polling
      // não deve apagar o ranking que o operador está acompanhando.
      setError(err.response?.data?.message || "Erro ao carregar o ranking");
    } finally {
      if (mountedRef.current) setLoading(false);
    }
  }, []);

  useEffect(() => {
    mountedRef.current = true;
    fetchRanking();

    let intervalId: number | undefined;

    const startPolling = () => {
      if (intervalId !== undefined) return;
      intervalId = window.setInterval(() => fetchRanking(), POLL_INTERVAL_MS);
    };

    const stopPolling = () => {
      if (intervalId === undefined) return;
      window.clearInterval(intervalId);
      intervalId = undefined;
    };

    // Aba do navegador em segundo plano: para o polling e retoma com um refresh
    // imediato ao voltar, para o operador não olhar dados velhos.
    const handleVisibilityChange = () => {
      if (document.hidden) {
        stopPolling();
      } else {
        fetchRanking();
        startPolling();
      }
    };

    if (!document.hidden) startPolling();
    document.addEventListener("visibilitychange", handleVisibilityChange);

    return () => {
      mountedRef.current = false;
      stopPolling();
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, [fetchRanking]);

  const formatFinishedAt = (finishedAt: string | null) => {
    if (!finishedAt) return "—";
    const date = new Date(finishedAt);
    return Number.isNaN(date.getTime()) ? "—" : date.toLocaleString("pt-BR");
  };

  return (
    <div className="space-y-4">
      {error && (
        <div className="rounded-lg bg-red-900/20 border border-red-700 p-4 text-red-200">
          {error}
        </div>
      )}

      <div className="flex justify-end">
        <Button
          variant="outline"
          size="sm"
          onClick={() => fetchRanking(true)}
          disabled={loading}
        >
          <RefreshCw className={`w-4 h-4 mr-2 ${loading ? "animate-spin" : ""}`} />
          Atualizar
        </Button>
      </div>

      {loading && teams.length === 0 ? (
        <div className="flex items-center justify-center py-12">
          <p className="text-slate-400">Carregando ranking...</p>
        </div>
      ) : (
        <div className="rounded-xl border border-border overflow-hidden">
          {/* table-fixed + w-1/5 nos cabeçalhos: as 5 colunas ficam com a mesma
              fatia da largura. Com layout fixo só a primeira linha (o header)
              define as larguras, então basta declarar nos <th>. */}
          <Table className="table-fixed">
            <TableHeader>
              <TableRow className="border-border bg-muted/30 hover:bg-muted/30">
                <TableHead className="text-muted-foreground text-xs font-semibold uppercase tracking-wider w-1/5">
                  Posição
                </TableHead>
                <TableHead className="text-muted-foreground text-xs font-semibold uppercase tracking-wider w-1/5">
                  Equipe
                </TableHead>
                <TableHead className="text-muted-foreground text-xs font-semibold uppercase tracking-wider w-1/5">
                  Progresso
                </TableHead>
                <TableHead className="text-muted-foreground text-xs font-semibold uppercase tracking-wider w-1/5">
                  Status
                </TableHead>
                <TableHead className="text-muted-foreground text-xs font-semibold uppercase tracking-wider w-1/5">
                  Finalizado em
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {teams.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center py-12 text-muted-foreground">
                    <div className="flex flex-col items-center gap-2">
                      <Trophy className="w-8 h-8 opacity-30" />
                      <p>Nenhuma equipe cadastrada ainda</p>
                    </div>
                  </TableCell>
                </TableRow>
              ) : (
                teams.map((team, i) => (
                  <TableRow
                    key={team.teamId}
                    className={`border-border transition-colors ${
                      i % 2 === 0 ? "bg-transparent" : "bg-muted/10"
                    }`}
                  >
                    <TableCell className="font-semibold tabular-nums">
                      {team.position}º
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-col">
                        <span className="font-medium">{team.name}</span>
                        <span className="flex items-center gap-1 text-xs text-muted-foreground">
                          <Users className="w-3 h-3" />
                          {team.membersCount}{" "}
                          {team.membersCount === 1 ? "integrante" : "integrantes"}
                        </span>
                      </div>
                    </TableCell>
                    {/* Enigmas ativos efetivamente resolvidos — não o
                        current_riddle_index, que é um ID e não bate com a
                        contagem quando há riddles desativados na fila. */}
                    <TableCell className="tabular-nums">
                      {team.solvedCount} / {riddlesTotal}
                    </TableCell>
                    <TableCell>
                      {team.finished ? (
                        <Badge className="bg-emerald-600/20 text-emerald-300 border-emerald-700">
                          Finalizado
                        </Badge>
                      ) : (
                        <Badge variant="secondary">Em andamento</Badge>
                      )}
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {formatFinishedAt(team.finishedAt)}
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  );
}
