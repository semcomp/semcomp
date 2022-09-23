import { PaginationRequest, PaginationResponse } from "../models/Pagination";
import { SemcompApiCreateEventRequest, SemcompApiCreateHouseRequest, SemcompApiEditEventRequest, SemcompApiGetEventsResponse, SemcompApiGetHousesResponse, SemcompApiGetUsersResponse, SemcompApiLoginResponse, SemcompApiPaginationRequest } from "../models/SemcompApiModels";
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

  public async getUsers(pagination: PaginationRequest): Promise<SemcompApiGetUsersResponse> {
    const semcompApiPagination = new SemcompApiPaginationRequest(
      pagination.getPage(),
      pagination.getItems(),
    );

    const response = await this.http.get("/admin/users", semcompApiPagination)

    return new PaginationResponse(response.entities, response.totalNumberOfItems);
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

  public async getEvents(): Promise<SemcompApiGetEventsResponse> {
    return this.http.get("/admin/events");
  }

  public async createEvent(data: SemcompApiCreateEventRequest): Promise<any> {
    return this.http.post("/admin/events", data);
  }

  public async editEvent(id: string, data: SemcompApiEditEventRequest): Promise<any> {
    return this.http.put(`/admin/events/${id}`, data);
  }
}

export default SemcompApi;
