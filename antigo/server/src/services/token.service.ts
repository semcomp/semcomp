export default interface TokenService {
  create(payload: any): string;
  decode(token: string): any;
}
