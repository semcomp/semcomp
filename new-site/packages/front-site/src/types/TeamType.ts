export type TeamType = {
  frente: {
    nomeDaFrente: string,
    membros: {
      nome: string,
      position: string
      photo: string,
      linkedin: string,
    }[],
  }[],
}