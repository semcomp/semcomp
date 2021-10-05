module.exports.HttpError = class Error {
  /**
   * constructor
   *
   * @param {string} statusCode
   */
  constructor(statusCode) {
    this.statusCode = statusCode;
  }
};
