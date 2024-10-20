import axios, { AxiosError, AxiosInstance, AxiosRequestConfig, AxiosResponse } from "axios";
import { SemcompApiPaginationRequest } from "../models/SemcompApiModels";

class Http {
  private instance: AxiosInstance;
  private token: string;
  private callbackOnTokenRefresh: CallableFunction;
  private callbackOnBadToken: CallableFunction;
  private callbackMessageError: CallableFunction;

  constructor(
    url: string,
    token: string,
    callbackOnTokenRefresh: CallableFunction,
    callbackOnBadToken: CallableFunction,
    callbackMessageError: CallableFunction,
  ) {
    this.instance = axios.create({
      baseURL: url,
      timeout: 10000,
    });
    this.token = token;
    this.callbackOnTokenRefresh = callbackOnTokenRefresh;
    this.callbackOnBadToken = callbackOnBadToken;
    this.callbackMessageError = callbackMessageError;

    this.configure();
  }

  private configure(): void {
    this.instance.interceptors.request.use(this.onRequest.bind(this), this.onRequestError.bind(this));
    this.instance.interceptors.response.use(this.onResponse.bind(this), this.onResponseError.bind(this));
  }

  private onRequest(config: AxiosRequestConfig): AxiosRequestConfig {
    if (this.token) {
      config.headers.authorization = this.token;
    }

    return config;
  }

  private onRequestError(error: AxiosError): Promise<AxiosError> {
    return Promise.reject(error);
  }

  private onResponse(response: AxiosResponse): AxiosResponse {
    if (response.headers.authorization && response.headers.authorization !== this.token) {
      this.token = response.headers.authorization;
      this.callbackOnTokenRefresh();
    }
    return response;
  }

  private onResponseError(error: AxiosError): Promise<AxiosError> {
    const response = error.response;
    let message = '';
    
    if (response && response.data) {
      message = (error.response.data as { message: string }).message;      
    }
    
    if (response && message) {
      this.callbackMessageError(message[0]);
    } else if (response && response.status === 401) {
      this.token = null;
      this.callbackOnBadToken();
    }

    return Promise.reject(error);
  }

  public setToken(token: string): void {
    this.token = token;
  }

  public getToken(): string {
    return this.token;
  }

  public async get(
    url: string,
    pagination?: SemcompApiPaginationRequest,
  ): Promise<any> {
    const defaultPagination = new SemcompApiPaginationRequest();
    const config = { params: { page: defaultPagination.getPage(), items: defaultPagination.getItems() } };
    if (pagination) {
      config.params = { page: pagination.getPage(), items: pagination.getItems() };
    }

    const { data } = await this.instance.get(url, config);
    return data;
  }

  public async post(url: string, body?: any): Promise<any> {
    const { data } = await this.instance.post(url, body);
    return data;
  }

  public async put(url: string, body?: any): Promise<any> {
    const { data } = await this.instance.put(url, body);
    return data;
  }

  public async patch(url: string, body?: any): Promise<any> {
    const { data } = await this.instance.patch(url, body);
    return data;
  }

  public async delete(url: string): Promise<any> {
    const { data } = await this.instance.delete(url);
    return data;
  }
}

export default Http;
