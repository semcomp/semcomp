/**
 * handleSocketError
 *
 * @param {object} error
 * @param {object} socket
 * @param {string} eventsPrefix
 *
 * @return {object}
 */
export function handleSocketError(error, socket, eventsPrefix) {
  console.log(error);
  if (error.message) {
    return socket.emit(`${eventsPrefix}error-message`, error.message);
  }
  return socket.emit(`${eventsPrefix}error-message`, "Erro de conexão");
}
