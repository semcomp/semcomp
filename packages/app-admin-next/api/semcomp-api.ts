import { SemcompApiCreateHouseRequest, SemcompApiGetHousesResponse, SemcompApiGetUsersResponse, SemcompApiLoginResponse } from "../models/SemcompApiModels";
import Http from "./http";

class SemcompApi {
  private http: Http;

  constructor(http: Http) {
    this.http = http;
  }

  public async login(email: string, password: string): Promise<SemcompApiLoginResponse> {
    return this.http.post(
      "/admin/auth/login",
      { email, password },
    );
  }

  public async getUsers(): Promise<SemcompApiGetUsersResponse> {
    return this.http.get("/admin/users");
  }

  public async getHouses(): Promise<SemcompApiGetHousesResponse> {
    return this.http.get("/admin/houses");
  }

  public async createHouse(data: SemcompApiCreateHouseRequest): Promise<any> {
    return this.http.post("/admin/houses", data);
  }

  public async getTShirts(): Promise<any> {
    return this.http.get("/admin/t-shirts");
  }

  public async createTShirt(data: any): Promise<any> {
    return this.http.post("/admin/t-shirts", data);
  }

  public async editTShirt(id: string, data: any): Promise<any> {
    return this.http.put(`/admin/t-shirts/${id}`, data);
  }
}

export default SemcompApi;
