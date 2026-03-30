type Game = {
  id: string;
  game: string;
  title: string;
  hasGroups: boolean;
  description: string;
  rules: string;
  eventPrefix: string;
  startDate: Date;
  endDate: Date;
  numberOfQuestions: number;
  maximumNumberOfMembersInGroup: number;
  createdAt?: number;
  updatedAt?: number;
}


export default Game;
