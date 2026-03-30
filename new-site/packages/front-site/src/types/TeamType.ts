export type TeamType = {
  frente: {
    nomeDaFrente: string,
    membros: {
      nome: string,
      position: string
      linkedin: string,
    }[],
  }[],
}