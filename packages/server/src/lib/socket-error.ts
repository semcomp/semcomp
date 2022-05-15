export const SocketError = class Error {
  message;

  /**
   * constructor
   *
   * @param {string} message
   */
  constructor(message) {
    this.message = message;
  }
};
