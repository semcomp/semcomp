import { SemcompApiGetUsersResponse } from "../models/SemcompApiModels";
import Http from "./http";

class SemcompApi {
  private http: Http;

  constructor(http: Http) {
    this.http = http;
  }

  public async login(email: string, password: string): Promise<any> {
    return this.http.post(
      "/admin/auth/login",
      { email, password },
    );
  }

  public async getUsers(): Promise<SemcompApiGetUsersResponse> {
    return this.http.get("/admin/users");
  }
}

export default SemcompApi;
