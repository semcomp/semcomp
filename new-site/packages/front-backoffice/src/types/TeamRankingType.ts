/** Uma linha do ranking de equipes do jogo de enigmas.
 *
 *  `position` é calculada pelo backend a cada requisição a partir da ordenação
 *  (terminadas primeiro, por data de conclusão; depois as em andamento, por
 *  progresso) — não existe posição persistida no banco, então nunca guarde nem
 *  reordene esse valor no front.
 *
 *  `solvedCount` é a contagem real de enigmas ATIVOS que a equipe resolveu, já
 *  calculada pelo backend. Não existe aqui o `current_riddle_index` da equipe
 *  de propósito: ele é um ID, não uma contagem, e exibi-lo enganaria o admin
 *  quando há riddles desativados no meio da fila. */
export interface TeamRankingEntry {
  position: number;
  teamId: number;
  name: string;
  solvedCount: number;
  riddlesTotal: number;
  finished: boolean;
  finishedAt: string | null;
  membersCount: number;
}

export interface TeamRankingResponse {
  teams: TeamRankingEntry[];
  riddlesTotal: number;
}
