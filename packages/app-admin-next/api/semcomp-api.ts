import { PaginationRequest, PaginationResponse } from "../models/Pagination";
import {
  SemcompApiCreateEventRequest,
  SemcompApiCreateHouseRequest,
  SemcompApiCreateGameQuestionRequest,
  SemcompApiEditEventRequest,
  SemcompApiEditGameQuestionRequest,
  SemcompApiGetEventsResponse,
  SemcompApiGetHousesResponse,
  SemcompApiGetGameQuestionsResponse,
  SemcompApiGetTShirtsResponse,
  SemcompApiGetUsersResponse,
  SemcompApiLoginResponse,
  SemcompApiPaginationRequest,
  SemcompApiGetGameGroupsResponse, 
  SemcompApiGetGameWinnersResponse,
  SemcompApiUser,
  SemcompApiGetAdminUserResponse,
  SemcompApiGetTreasureHuntImageResponse,
  SemcompApiCreateTreasureHuntImageRequest,
  SemcompApiEditTreasureHuntImageRequest,
  SemcompApiGetAchievementsResponse,
  SemcompApiCreateAchievementRequest,
  SemcompApiEditAchievementRequest,
  SemcompApiGetSalesResponse,
  SemcompApiSale,
  SemcompApiGetGameConfigResponse,
  SemcompApiGetPaymentsResponse,
  SemcompApiGetDonationsResponse,
  SemcompApiDonation,
  SemcompApiGetItemsResponse,
  SemcompApiItem,
} from "../models/SemcompApiModels";
import Http from "./http";

class SemcompApi {
  private http: Http;

  constructor(http: Http) {
    this.http = http;
  }

  // AUTH
  public async login(email: string, password: string): Promise<SemcompApiLoginResponse> {
    return this.http.post(
      "/admin/auth/login",
      { email, password },
    );
  }
  public async signup(email: string, password: string): Promise<SemcompApiLoginResponse> {
    return this.http.post(
      "/admin/auth/signup",
      { email, password },
    );
  }

  // USERS
  public async getUsers(pagination: PaginationRequest): Promise<SemcompApiGetUsersResponse> {
    const semcompApiPagination = new SemcompApiPaginationRequest(
      pagination.getPage(),
      pagination.getItems(),
    );

    const response = await this.http.get("/admin/users", semcompApiPagination);

    return new PaginationResponse(response.entities, response.totalNumberOfItems);
  }

  public async updateKitStatus(id: string, changedData: object): Promise<any> {
    return this.http.put(`/admin/users/${id}`, changedData);
  }

  public async addUserAchievement(userId: string, achievementId: string): Promise<any> {
    return this.http.post(`/admin/users/${userId}/achievements/${achievementId}`, {});
  }

  // Donations
  public async getDonations(pagination: PaginationRequest): Promise<SemcompApiGetDonationsResponse> {
    const semcompApiPagination = new SemcompApiPaginationRequest(
      pagination.getPage(),
      pagination.getItems(),
    );

    const response = await this.http.get("/admin/donations", semcompApiPagination);
    return new PaginationResponse(response.entities, response.totalNumberOfItems);
  }

  public async createDonation(data: SemcompApiDonation): Promise<any> {
     return this.http.post("/admin/donations", data);
  }

  public async deleteDonation(id: string): Promise<any> {
      return this.http.delete("/admin/donations" + id);
  }

  // Items
  public async getItems(pagination: PaginationRequest): Promise<SemcompApiGetItemsResponse> {
    const semcompApiPagination = new SemcompApiPaginationRequest(
      pagination.getPage(),
      pagination.getItems(),
    );

    const response = await this.http.get("/admin/items", semcompApiPagination);
    return new PaginationResponse(response.entities, response.totalNumberOfItems);
  }

  public async createItems(data: SemcompApiItem): Promise<any> {
      const response = await this.http.post("/admin/items", data);
      return response;
  }

  public async deleteItems(id: string): Promise<any> {
      const response = await this.http.delete("/admin/items" + id);
      return response;
  }

  // ADMIN-USERS
  public async getAdminUsers(pagination: PaginationRequest): Promise<SemcompApiGetAdminUserResponse> {
    const semcompApiPagination = new SemcompApiPaginationRequest(
      pagination.getPage(),
      pagination.getItems(),
    );

    const response = await this.http.get("/admin/admin-users", semcompApiPagination);
    return new PaginationResponse(response.entities, response.totalNumberOfItems);
  }

  public async deleteAdminUser(id: string): Promise<any> {
    const response = await this.http.delete("/admin/admin-users/" + id);

    return response;
  }

  public async getAdminRole(id: String): Promise<any> {
    const response = await this.http.get("/admin/admin-users/role/" + id);

    return response;
  }

  public async editAdminRole(id: string, data: any): Promise<any> {
    return this.http.put(`/admin/admin-users/${id}`, data);
  }

  // HOUSE
  public async getHouses(pagination: PaginationRequest): Promise<SemcompApiGetHousesResponse> {
    const semcompApiPagination = new SemcompApiPaginationRequest(
      pagination.getPage(),
      pagination.getItems(),
    );

    const response = await this.http.get("/admin/houses", semcompApiPagination);
    return new PaginationResponse(response.entities, response.totalNumberOfItems);
  }

  public async addPoints(houseId, points) {
    return this.http.post('/admin/houses/' + houseId + '/add-points', { points });
  }

  public async editHouse(houseId, data: SemcompApiCreateHouseRequest): Promise<any> {
    return this.http.put("/admin/houses/" + houseId, data);
  }

  public async createHouse(data: SemcompApiCreateHouseRequest): Promise<any> {
    return this.http.post("/admin/houses", data);
  }

  public async addHouseAchievement(houseId: string, achievementId: string): Promise<any> {
    return this.http.post(`/admin/houses/${houseId}/achievements/${achievementId}`, {});
  }

  // T-SHIRTS
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

  // SALES
  public async getSales(pagination: PaginationRequest): Promise<SemcompApiGetSalesResponse> {
    const semcompApiPagination = new SemcompApiPaginationRequest(
      pagination.getPage(),
      pagination.getItems(),
    );

    const response = await this.http.get("/admin/sales", semcompApiPagination);

    return new PaginationResponse(response.entities, response.totalNumberOfItems);
  }

  public async createSale(data: any): Promise<any> {
    return this.http.post("/admin/sales", data);
  }

  public async editSale(id: string, data: any): Promise<any> {
    return this.http.put(`/admin/sales/${id}`, data);
  } 

  // SUBSCRIPTIONS
  public async getSubscriptions(eventId: string): Promise<any> {
    return this.http.get(`/admin/subscription/event/${eventId}`);
  }

  public async getSubscriptionsUsers(eventId: string): Promise<any> {
    return this.http.get(`/admin/subscription/event/users/${eventId}`);
  }

  // EVENTS
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

  public async getAttendance(eventId: string): Promise<any> {
    return this.http.get(`/admin/events/${eventId}/attendances-info`);
  }
  
  public async getCoffeePermission(userId: string, coffeeItemId: string): Promise<boolean>{
    const response = await this.http.post(
      `/admin/events/get-coffee-permission`, 
      { userId: userId, coffeeItemId: coffeeItemId }
    );
    return response;
  }

  public async getCoffeeOptions(): Promise<SemcompApiSale[]> {
    const response = await this.http.get("/admin/events/get-coffee-options");
    return response;
  }

  public async deleteEvent(eventId: string): Promise<any> {
    const response = await this.http.delete(`/admin/events/${eventId}`);
    return response;
  }

  // GAME 
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

    const response = await this.http.get("/admin/game/groups/get-last-index", semcompApiPagination);
    return new PaginationResponse(response.entities, response.totalNumberOfItems);
  }

  public async getGameWinner(): Promise<SemcompApiGetGameGroupsResponse> {
    const response = await this.http.get("/admin/game/groups/winner");
    return response;
  }

  public async getTreasureHuntImages(pagination: PaginationRequest): Promise<SemcompApiGetTreasureHuntImageResponse> {
    const semcompApiPagination = new SemcompApiPaginationRequest(
      pagination.getPage(),
      pagination.getItems(),
    );

    const response = await this.http.get("/admin/treasure-hunt-images/", semcompApiPagination);

    return new PaginationResponse(response.entities, response.totalNumberOfItems);
  }

  public async createTreasureHuntImage(data: SemcompApiCreateTreasureHuntImageRequest): Promise<any> {
    return this.http.post("/admin/treasure-hunt-images", data);
  }

  public async editTreasureHuntImage(id: string, data: SemcompApiEditTreasureHuntImageRequest): Promise<any> {
    return this.http.put(`/admin/treasure-hunt-images/${id}`, data);
  }

  public async deleteTreasureHuntImage(id: string): Promise<any> {
    return this.http.delete(`/admin/treasure-hunt-images/${id}`);
  }

  public async generateQRCodeTreasureHuntImage(id: string): Promise<any> {
    return this.http.get(`/admin/treasure-hunt-images/qr-code/${id}`);
  }

  // ACHIEVEMENTS
  public async getAchievement(pagination: PaginationRequest): Promise<SemcompApiGetAchievementsResponse> {
    const semcompApiPagination = new SemcompApiPaginationRequest(
      pagination.getPage(),
      pagination.getItems(),
    );
  
    const response = await this.http.get("admin/achievements", semcompApiPagination);
    
    return new PaginationResponse(response.entities, response.totalNumberOfItems);
  }

  public async createAchievement(data: SemcompApiCreateAchievementRequest): Promise<any> {
    return this.http.post("/admin/achievements", data);
  }

  public async editAchievement(id: string, data: SemcompApiEditAchievementRequest): Promise<any> {
    return this.http.put(`/admin/achievements/${id}`, data);
  }

  public async deleteAchievement(id: string): Promise<any> {
    const response = await this.http.delete("/admin/achievements/" + id);
    return response;
  }

  // CONFIG
  public async getConfig(): Promise<any> {
    return this.http.get(`/config`);
  }


  public async getCoffeeTotal(): Promise<any> {
    return this.http.get(`/config/coffee-total`);
  }

  public async updateConfig(config: any): Promise<any> {
    return this.http.put(
      "/config",
      { config },
    );
  }

  public async getCoffeeRemainings(): Promise<any> {
    return this.http.get(`/config/coffee-remaining`);
  }

  public async setConfigSignup(setSignup): Promise<any> {
    return this.http.post('/config/open-signup', { openSignup: setSignup });
  }

  public async setConfigSales(setSales): Promise<any> {
    return this.http.post('/config/open-sales', { openSales: setSales });
  }

  // PAYMENT
  public async getPaymentComplete(pagination: PaginationRequest): Promise<SemcompApiGetUsersResponse> {
    const semcompApiPagination = new SemcompApiPaginationRequest(
      pagination.getPage(),
      pagination.getItems(),
    );

    const response = await this.http.get("/admin/payments/get-payment-complete", semcompApiPagination);
    return new PaginationResponse(response.entities, response.totalNumberOfItems);
  }

  public async getPayments(): Promise<SemcompApiGetPaymentsResponse> {
    const response = await this.http.get("/admin/payments");
    return response;
  }

  // GAME-CONFIG
  public async getGameConfig(pagination: PaginationRequest): Promise<SemcompApiGetGameConfigResponse> {
    const semcompApiPagination = new SemcompApiPaginationRequest(
      pagination.getPage(),
      pagination.getItems(),
    );

    const response = await this.http.get("/admin/games-config", semcompApiPagination);

    return new PaginationResponse(response.entities, response.totalNumberOfItems);
  }

  public async createGameConfig(data: any): Promise<any> {
    return this.http.post("/admin/games-config", data);
  }

  public async editGameConfig(id: string, data: any): Promise<any> {
    return this.http.put(`/admin/games-config/${id}`, data);
  }

  public async deleteGameConfig(id: string): Promise<any> {
    return this.http.delete(`/admin/games-config/${id}`);
  }

  // ATTENDANCES
  public async getDetailedAttendances(data: any): Promise<any> {
    return this.http.post("/admin/attendances/list-attendance-info-with-event-type-rate", data);
  }
}

export default SemcompApi;
