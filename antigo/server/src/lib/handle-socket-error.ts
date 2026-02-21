import { Socket } from "socket.io";

import Game from "./constants/game-enum";

export function handleSocketError(error: any, socket: Socket, game: Game): any {
  console.log(error);
  
  if (error.code === 11000) {
    // Erro de chave duplicada Mongo
    if (error.keyPattern?.name && error.keyPattern?.game) {
      return socket.emit(`${game}-error-message`, "Já existe um grupo com este nome neste jogo");
    } else if (error.keyPattern?.userId) {
      return socket.emit(`${game}-error-message`, "Você já está em um grupo neste jogo");
    } else {
      return socket.emit(`${game}-error-message`, "Dados duplicados. Tente novamente");
    }
  }
  
  // Tratar erros de validação do Mongoose
  if (error.name === 'ValidationError') {
    const messages = Object.values(error.errors).map((err: any) => err.message);
    return socket.emit(`${game}-error-message`, messages.join(', '));
  }
  
  // Tratar erros HTTP customizados
  if (error.status && error.message) {
    return socket.emit(`${game}-error-message`, error.message);
  }
  
  // Tratar erros de SocketError (já tratados)
  if (error.message && !error.message.includes('E11000')) {
    return socket.emit(`${game}-error-message`, error.message);
  }
  
  // Para outros erros, logar e enviar mensagem genérica
  console.error('Unhandled error:', error);
  return socket.emit(`${game}-error-message`, "Erro interno do servidor. Tente novamente");
}
