import { PaginationRequest, PaginationResponse } from "../models/Pagination";
import { SemcompApiCreateEventRequest, SemcompApiCreateHouseRequest, SemcompApiCreateGameQuestionRequest, SemcompApiEditEventRequest, SemcompApiEditGameQuestionRequest, SemcompApiGetEventsResponse, SemcompApiGetHousesResponse, SemcompApiGetGameQuestionsResponse, SemcompApiGetTShirtsResponse, SemcompApiGetUsersResponse, SemcompApiLoginResponse, SemcompApiPaginationRequest, SemcompApiGetGameGroupsResponse, SemcompApiUser } from "../models/SemcompApiModels";
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

    const response = await this.http.get("/admin/users", semcompApiPagination);

    return new PaginationResponse(response.entities, response.totalNumberOfItems);
  }
 
  public async getHouses(pagination: PaginationRequest): Promise<SemcompApiGetHousesResponse> {
    const semcompApiPagination = new SemcompApiPaginationRequest(
      pagination.getPage(),
      pagination.getItems(),
    );

    const response = await this.http.get("/admin/houses", semcompApiPagination);

    return new PaginationResponse(response.entities, response.totalNumberOfItems);
  }

  public async addPoints(houseId, points){
    return this.http.post('/admin/houses/' + houseId + '/add-points', {points});
  }

  public async editHouse(houseId, data: SemcompApiCreateHouseRequest): Promise<any> {
    console.log(houseId, data);
    return this.http.put("/admin/houses/" + houseId, data);
  }

  public async createHouse(data: SemcompApiCreateHouseRequest): Promise<any> {
    return this.http.post("/admin/houses", data);
  }

  public async getTShirts(pagination: PaginationRequest): Promise<SemcompApiGetTShirtsResponse> {
    const semcompApiPagination = new SemcompApiPaginationRequest(
      pagination.getPage(),
      pagination.getItems(),
    );

    const response = await this.http.get("/admin/t-shirts", semcompApiPagination);

    return new PaginationResponse(response.entities, response.totalNumberOfItems);
  }

  public async createTShirt(data: any): Promise<any> {
    return this.http.post("/admin/t-shirts", data);
  }

  public async editTShirt(id: string, data: any): Promise<any> {
    return this.http.put(`/admin/t-shirts/${id}`, data);
  }

  public async getSubscriptions(eventId: string) : Promise<any> {
    return this.http.get(`/admin/subscription/event/${eventId}`);
  }

  public async getEvents(pagination: PaginationRequest): Promise<SemcompApiGetEventsResponse> {
    const semcompApiPagination = new SemcompApiPaginationRequest(
      pagination.getPage(),
      pagination.getItems(),
    );

    const response = await this.http.get("/admin/events", semcompApiPagination);

    return new PaginationResponse(response.entities, response.totalNumberOfItems);
  }

  public async createEvent(data: SemcompApiCreateEventRequest): Promise<any> {
    return this.http.post("/admin/events", data);
  }

  public async editEvent(id: string, data: SemcompApiEditEventRequest): Promise<any> {
    return this.http.put(`/admin/events/${id}`, data);
  }

  public async markAttendance(eventId: string, userId: string): Promise<any> {
    return this.http.post(`/admin/events/${eventId}/mark-attendance`, { userId: userId });
  }

  public async getGameQuestions(pagination: PaginationRequest): Promise<SemcompApiGetGameQuestionsResponse> {
    const semcompApiPagination = new SemcompApiPaginationRequest(
      pagination.getPage(),
      pagination.getItems(),
    );

    const response = await this.http.get("/admin/game/questions", semcompApiPagination);

    return new PaginationResponse(response.entities, response.totalNumberOfItems);
  }

  public async createGameQuestion(data: SemcompApiCreateGameQuestionRequest): Promise<any> {
    return this.http.post("/admin/game/questions", data);
  }

  public async editGameQuestion(id: string, data: SemcompApiEditGameQuestionRequest): Promise<any> {
    return this.http.put(`/admin/game/questions/${id}`, data);
  }

  public async getGameGroups(pagination: PaginationRequest): Promise<SemcompApiGetGameGroupsResponse> {
    const semcompApiPagination = new SemcompApiPaginationRequest(
      pagination.getPage(),
      pagination.getItems(),
    );

    const response = await this.http.get("/admin/game/groups", semcompApiPagination);

    return new PaginationResponse(response.entities, response.totalNumberOfItems);
  }
}

export default SemcompApi;
