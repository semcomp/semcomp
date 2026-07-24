import client from "./client";

export interface Sponsor {
  cnpj: string;
  name: string;
  website: string;
  logo: string;
  clicks: number;
  packages?: SponsorPackage[];
}

export interface SponsorPackage {
  sponsor_cnpj: string;
  year: number;
  package: string;
}

export interface SponsorListResponse {
  page: number;
  limit: number;
  sort_by: string;
  sort_order: string;
  search_by: string;
  search_value: string;
  total_records: number;
  filtered_records: number;
  sponsors: Sponsor[];
}

export const sponsorsAPI = {
  getAll: (
    page = 1,
    limit = 10,
    sortBy = "name",
    sortOrder = "asc",
    searchBy?: string,
    searchValue?: string
  ): Promise<SponsorListResponse> =>
    client
      .get("/admin/sponsors", {
        params: { page, limit, sort_by: sortBy, sort_order: sortOrder, search_by: searchBy, search_value: searchValue },
      })
      .then((r) => r.data),

  getByCNPJ: (cnpj: string): Promise<Sponsor> =>
    client.get(`/admin/sponsors/${cnpj}`).then((r) => r.data),

  create: (formData: FormData): Promise<{ message: string; sponsor: Sponsor }> =>
    client
      .post("/admin/sponsors", formData, { headers: { "Content-Type": "multipart/form-data" } })
      .then((r) => r.data),

  update: (cnpj: string, formData: FormData): Promise<{ message: string; sponsor: Sponsor }> =>
    client
      .put(`/admin/sponsors/${cnpj}`, formData, { headers: { "Content-Type": "multipart/form-data" } })
      .then((r) => r.data),

  delete: (cnpj: string): Promise<{ message: string }> =>
    client.delete(`/admin/sponsors/${cnpj}`).then((r) => r.data),

  getPackages: (cnpj: string, year?: number): Promise<SponsorPackage[]> =>
    client.get(`/admin/sponsors/${cnpj}/packages`, { params: year ? { year } : {} }).then((r) => r.data),

  addPackage: (cnpj: string, year: number, pkg: string): Promise<{ message: string; package: SponsorPackage }> =>
    client.post(`/admin/sponsors/${cnpj}/packages`, { year, package: pkg }).then((r) => r.data),

  removePackage: (cnpj: string, year: number, pkg: string): Promise<{ message: string }> =>
    client.delete(`/admin/sponsors/${cnpj}/packages/${year}/${encodeURIComponent(pkg)}`).then((r) => r.data),
};
