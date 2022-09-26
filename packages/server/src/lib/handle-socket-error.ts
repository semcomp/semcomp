import { Socket } from "socket.io";

import Game from "./constants/game-enum";

export function handleSocketError(error: any, socket: Socket, game: Game): any {
  console.log(error);
  if (error.message) {
    return socket.emit(`${game}-error-message`, error.message);
  }
  return socket.emit(`${game}-error-message`, "Erro de conexão");
}
