import jwt from "jsonwebtoken";

import TokenService from "./token.service";

export default class JsonWebToken implements TokenService {
  private key: string;
  private expiresIn: string;

  constructor(key: string, expiresIn: string) {
    this.key = key;
    this.expiresIn = expiresIn;
  }

  public create(payload: any): string {
    return jwt.sign(payload, this.key, {
      expiresIn: this.expiresIn,
    });
  }

  public decode(token: string) {
    // console.log(this.key);
    // console.log(token);
    return jwt.verify(token, this.key).data;
  }
}
