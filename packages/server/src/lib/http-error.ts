export const HttpError = class Error {
  statusCode;

  /**
   * constructor
   *
   * @param {string} statusCode
   */
  constructor(statusCode) {
    this.statusCode = statusCode;
  }
};
