import { PaginationRequest, PaginationResponse } from "../models/Pagination";
import { SemcompApiGetEventsResponse, SemcompApiLoginResponse, SemcompApiPaginationRequest } from "../models/SemcompApiModels";
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

  public async getEvents(pagination: PaginationRequest): Promise<SemcompApiGetEventsResponse> {
    const semcompApiPagination = new SemcompApiPaginationRequest(
      pagination.getPage(),
      pagination.getItems(),
    );

    const response = await this.http.get("/admin/events", semcompApiPagination);

    return new PaginationResponse(response.entities, response.totalNumberOfItems);
  }

  public async generateQrCode(eventId: string): Promise<any> {
    return this.http.post(`/admin/events/${eventId}/qr-code`);
  }
}

export default SemcompApi;
