import { Model } from "mongoose";

import HttpError from "../lib/http-error";
import { PaginationRequest, PaginationResponse } from "../lib/pagination";
import Sale, { SaleModel } from "../models/sales";
import IdServiceImpl from "./id-impl.service";
import PaymentServiceImpl from "./payment-impl.service";
import PaymentStatus from "../lib/constants/payment-status-enum";
import SaleType from "../lib/constants/sales-types-enum";

const idService = new IdServiceImpl();
const paymentService = PaymentServiceImpl;

class SaleService {
  public async find({
    filters,
    pagination,
  }: {
    filters?: Partial<Sale>;
    pagination: PaginationRequest;
  }): Promise<PaginationResponse<Sale>> {
    const Sales = await SaleModel
      .find(filters)
      .sort({ type: 1 })
      .skip(pagination.getSkip())
      .limit(pagination.getItems());
    const count = await this.count(filters);

    const entities: Sale[] = [];
    for (const Sale of Sales) {
      entities.push(this.mapEntity(Sale));
    }

    const paginatedResponse = new PaginationResponse(entities, count)

    return paginatedResponse;
  }

  public async findById(id: string): Promise<Sale> {
    const entity = await SaleModel.findOne({ id });
    return this.mapEntity(entity);
  }

  public async findOne(filters?: Partial<Sale>): Promise<Sale> {
    const entity = await SaleModel.findOne(filters);

    return entity && this.mapEntity(entity);
  }

  public async count(filters?: Partial<Sale>): Promise<number> {
    const count = await SaleModel.countDocuments(filters);

    return count;
  }

  public async create(sale: Sale): Promise<Sale> {
    sale.id = idService.create();
    sale.createdAt = Date.now();
    sale.updatedAt = Date.now();
    const entity = await SaleModel.create(sale);
    return this.findById(entity.id);
  }

  public async update(sale: Sale): Promise<Sale> {
    if (SaleType[sale.type] === SaleType.ITEM) {
      const allSales = (await this.findWithUsedQuantity({ pagination: new PaginationRequest(0, 9999) })).getEntities();
      
      const paymentWithItem = allSales.find((s) => s.id === sale.id)?.usedQuantity;
      if (paymentWithItem > sale.quantity) {
        throw new HttpError(400, [`A quantidade não pode ser menor do que a já comprada (${paymentWithItem})!`]);
      }

      // Atualiza a quantidade das vendas que usam o item
      for (const s of allSales.filter((s) => SaleType[s.type] === SaleType.SALE)) {
        const allQuantities = s.items.filter((item) => item !== sale.id)
                                     .map((item) => allSales.find((p) => p.id === item).quantity);
        const least = Math.min(...allQuantities);
        const bigger = Math.max(...allQuantities);

        if (s.items.includes(sale.id) && (
              (sale.quantity < least || sale.quantity <= bigger) || (sale.items.length === 1)
            )
        ) {
          s.updatedAt = Date.now();
          const entity = await SaleModel.findOneAndUpdate({ id: s.id }, {...s, quantity: sale.quantity});
        }
      }
    }

    sale.updatedAt = Date.now();
    const entity = await SaleModel.findOneAndUpdate({ id: sale.id }, sale);
    return this.findById(entity.id);
  }

  public async delete(sale: Sale, filters?: Partial<Sale>): Promise<Sale> {
    if (SaleType[sale.type] === SaleType.ITEM) {
      const sales = await this.find({ filters: {type: SaleType.SALE}, pagination: new PaginationRequest(0, 9999) });
      
      for (const s of sales.getEntities()) {
        if (s.items.includes(sale.id)) {
          throw new HttpError(400, [`O item não pode ser deletado pois está sendo usado em uma venda!`]);
        }
      }
    }

    const entity = await SaleModel.findOneAndDelete({ id: sale.id });
    return entity && this.mapEntity(entity);
  }

  public async findWithUsedQuantity({
    pagination,
  }: {
    pagination: PaginationRequest;
  }): Promise<PaginationResponse<(Sale & { usedQuantity: number })>> {
    const response = await this.find({ pagination });
    const allSales = response.getEntities();

    const entities: (Sale & { usedQuantity: number })[] = [];
    const sales = allSales.filter((sale) => SaleType[sale.type] === SaleType.SALE);
    const items = allSales.filter((sale) => SaleType[sale.type] === SaleType.ITEM);
    
    const itemsQuantities = {};
    items.forEach((item) => {
      itemsQuantities[item.id] = 0;
    });

    for (const sale of sales) {
      let countSale = await new PaymentServiceImpl(null, null, null, null).count({ salesOption: [sale.id], status: PaymentStatus.APPROVED });
      countSale += await new PaymentServiceImpl(null, null, null, null).count({ salesOption: [sale.id], status: PaymentStatus.PENDING });
      
      sale.items.forEach((item) => {
        itemsQuantities[item] += countSale;
      });

      entities.push({
        ...sale,
        usedQuantity: countSale,
      });
    }

    items.forEach((item) => {
      entities.push({
        ...item,
        usedQuantity: itemsQuantities[item.id],
      });
    });

    return new PaginationResponse<(Sale & { usedQuantity: number })>(entities, response.getTotalNumberOfItems());
  }

  public async getItems(): Promise<Sale[]> {
    const sales = await this.find({ pagination: new PaginationRequest(0, 9999) });
    
    if (sales) {
      const items = sales.getEntities().filter((sale) => SaleType[sale.type] === SaleType.ITEM);
      return items;
    }

    return null;
  }

  public async getItemsCoffee(): Promise<Sale[]>{
    const sales = await this.find({ pagination: new PaginationRequest(0, 9999) });
  
    if (sales) {
      // Filtrando os itens que possuem type 'ITEM' e hasCoffee true
      const items = sales.getEntities().filter((sale) => 
        SaleType[sale.type] === SaleType.ITEM && sale.hasCoffee === true
      );
      return items;
    }
  
    return null;
  }

  public async getSales(): Promise<Sale[]> {
    const sales = await this.find({ pagination: new PaginationRequest(0, 9999) });
  
    return sales ? sales.getEntities() : null;
  }

  public async getAvailables(): Promise<(Sale & {usedQuantity: number})[]> {
    const sales = await this.findWithUsedQuantity({ pagination: new PaginationRequest(0, 9999) });
    const withoutItems = sales.getEntities().filter((sale) => SaleType[sale.type] === SaleType.SALE);
    const items = sales.getEntities().filter((sale) => SaleType[sale.type] === SaleType.ITEM);

    if (withoutItems.length === 0) {
      return [];
    }
  
    const entities: (Sale & { usedQuantity: number })[] = [];
    for (const sale of withoutItems) {
      const lowestQuantity = Math.min(...items.filter((item) => sale.items.includes(item.id)).map(i => i.quantity - i.usedQuantity));
      if (lowestQuantity > 0 && sale.quantity > sale.usedQuantity) {
        entities.push(sale);
      }
    }

    return entities;
  }

  private mapEntity(entity: Model<Sale> & Sale): Sale {
    return {
      id: entity.id,
      name: entity.name,
      type: entity.type,
      quantity: entity.quantity,
      items: entity.items,
      hasTShirt: entity.hasTShirt,
      hasKit: entity.hasKit,
      hasCoffee: entity.hasCoffee,
      price: entity.price,
      createdAt: entity.createdAt,
      updatedAt: entity.updatedAt,
    };
  }
}

export default new SaleService();
