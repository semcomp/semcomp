export default class HttpError {
  public statusCode: number;
  public errors: string[];

  constructor(statusCode: number, errors: string[]) {
    this.statusCode = statusCode;
    this.errors = errors;
  }
};
