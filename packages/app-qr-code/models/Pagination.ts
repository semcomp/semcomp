export class PaginationRequest {
  private onChange: () => void;
  private page: number;
  private items: number;

  constructor(onChange: () => void, page?: number, items?: number) {
    this.onChange = onChange;

    this.page = 1;
    if (page) {
      this.page = page
    }

    this.items = 10;
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

  public setPage(page: number): void {
    this.page = page;
    this.onChange()
  }

  public setItems(items: number): void {
    this.items = items;
    this.onChange()
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
