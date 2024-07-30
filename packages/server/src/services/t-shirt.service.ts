import { Model } from "mongoose";

import HttpError from "../lib/http-error";
import { PaginationRequest, PaginationResponse } from "../lib/pagination";
import TShirt, { TShirtModel } from "../models/t-shirt";
import IdServiceImpl from "./id-impl.service";
import PaymentServiceImpl from "./payment-impl.service";
import PaymentStatus from "../lib/constants/payment-status-enum";

const idService = new IdServiceImpl();
const paymentService = new PaymentServiceImpl(null, null, null, null);

class TShirtService {
  public async find({
    filters,
    pagination,
  }: {
    filters?: Partial<TShirt>;
    pagination: PaginationRequest;
  }): Promise<PaginationResponse<TShirt>> {
    const tShirts = await TShirtModel
      .find(filters)
      .skip(pagination.getSkip())
      .limit(pagination.getItems());
    const count = await this.count(filters);

    const entities: TShirt[] = [];
    for (const tShirt of tShirts) {
      entities.push(this.mapEntity(tShirt));
    }

    const paginatedResponse = new PaginationResponse(entities, count)

    return paginatedResponse;
  }

  public async findById(id: string): Promise<TShirt> {
    const entity = await TShirtModel.findOne({ id });

    return this.mapEntity(entity);
  }

  public async findOne(filters?: Partial<TShirt>): Promise<TShirt> {
    const entity = await TShirtModel.findOne(filters);

    return entity && this.mapEntity(entity);
  }

  public async findMany(filters?: Partial<TShirt>): Promise<TShirt[]> {
    const tShirts = await TShirtModel.find(filters);
    const entities: TShirt[] = [];
    for (const tShirt of tShirts) {
      entities.push(this.mapEntity(tShirt));
    }

    return entities;
  }

  public async count(filters?: Partial<TShirt>): Promise<number> {
    const count = await TShirtModel.count(filters);

    return count;
  }

  public async create(tShirt: TShirt): Promise<TShirt> {
    tShirt.id = await idService.create();
    tShirt.createdAt = Date.now();
    tShirt.updatedAt = Date.now();
    const entity = await TShirtModel.create(tShirt);

    return this.findById(entity.id);
  }

  public async update(tShirt: TShirt): Promise<TShirt> {
    const paymentsWithThisTShirtSize = await paymentService.count({ tShirtSize: tShirt.size });
    if (paymentsWithThisTShirtSize > tShirt.quantity) {
      throw new HttpError(400, ["O número de camisetas não pode ser menos que o já utilizado!"]);
    }

    tShirt.updatedAt = Date.now();
    const entity = await TShirtModel.findOneAndUpdate({ id: tShirt.id }, tShirt);

    return this.findById(entity.id);
  }

  public async delete(tShirt: TShirt): Promise<TShirt> {
    const entity = await TShirtModel.findOneAndDelete({ id: tShirt.id });

    return entity && this.mapEntity(entity);
  }

  public async findWithUsedQuantity({
    pagination,
  }: {
    pagination: PaginationRequest;
  }): Promise<PaginationResponse<(TShirt & { usedQuantity: number })>> {
    const tShirts = await this.find({ pagination });

    const entities: (TShirt & { usedQuantity: number })[] = [];
    for (const tShirt of tShirts.getEntities()) {

      let countTShirt = await paymentService.count({ tShirtSize: tShirt.size, status: PaymentStatus.APPROVED });
      countTShirt += await paymentService.count({ tShirtSize: tShirt.size, status: PaymentStatus.PENDING });
      
      entities.push({
        ...tShirt,
        usedQuantity: countTShirt,
      });
    }

    return new PaginationResponse<(TShirt & { usedQuantity: number })>(entities, tShirts.getTotalNumberOfItems());
  }

  private mapEntity(entity: Model<TShirt> & TShirt): TShirt {
    return {
      id: entity.id,
      size: entity.size,
      quantity: entity.quantity,
      createdAt: entity.createdAt,
      updatedAt: entity.updatedAt,
    };
  }
}

export default new TShirtService();
