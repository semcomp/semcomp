export class PaginationRequest {
  private page: number;
  private items: number;

  constructor(page?: number, items?: number) {
    this.page = 1;
    if (page) {
      this.page = page
    }

    this.items = 25;
    if (items) {
      this.items = items
    }
  }

  public getPage(): number {
    return this.page;
  }

  public getItems(): number {
    return this.items;
  }

  public getSkip(): number {
    return (this.getPage() - 1) * this.getItems();
  }
};

export class PaginationResponse<T> {
  private entities: T[];
  private totalNumberOfItems: number;

  constructor(entities: T[], totalNumberOfItems: number) {
    this.entities = entities;
    this.totalNumberOfItems = totalNumberOfItems;
  }

  public getEntities(): T[] {
    return this.entities;
  }

  public getTotalNumberOfItems(): number {
    return this.totalNumberOfItems;
  }
};
