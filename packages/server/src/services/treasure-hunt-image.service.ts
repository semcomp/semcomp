import { Model } from "mongoose";
import HttpError from "../lib/http-error";
import QRCode from 'qrcode';

import Status from "../lib/constants/status-treasure-hunt-image";
import TreasureHuntImage, { TreasureHuntImageModel } from "../models/treasure-hunt-image";
import IdServiceImpl from "./id-impl.service";
import { PaginationRequest, PaginationResponse } from "../lib/pagination";

const idService = new IdServiceImpl();

type Filters = TreasureHuntImage | {
  id: string[];
  status: Status[];
  imgUrl: string[];
  createdAt: number[];
  updatedAt: number[];
};

class TreasureHuntImageService {
  public async find({
    filters,
    pagination,
  }: {
    filters?: Partial<Filters>;
    pagination: PaginationRequest;
  }): Promise<PaginationResponse<TreasureHuntImage>> {
    const items = await TreasureHuntImageModel
      .find(filters)
      .skip(pagination.getSkip())
      .limit(pagination.getItems());
    const count = await this.count(filters);

    const entities: TreasureHuntImage[] = [];
    for (const item of items) {
      entities.push(this.mapEntity(item));
    }

    const paginatedResponse = new PaginationResponse(entities, count)

    return paginatedResponse;
  }

  public async findById(id: string): Promise<TreasureHuntImage> {
    const entity = await TreasureHuntImageModel.findOne({ id });

    return this.mapEntity(entity);
  }

  public async findOne(filters?: Partial<Filters>): Promise<TreasureHuntImage> {
    const entity = await TreasureHuntImageModel.findOne(filters);

    return entity && this.mapEntity(entity);
  }

  public async count(filters?: Partial<Filters>): Promise<number> {
    const count = await TreasureHuntImageModel.count(filters);

    return count;
  }

  public async create(TreasureHuntImage: TreasureHuntImage): Promise<TreasureHuntImage> {
    TreasureHuntImage.id = await idService.create();
    TreasureHuntImage.createdAt = Date.now();
    TreasureHuntImage.updatedAt = Date.now();
    const entity = await TreasureHuntImageModel.create(TreasureHuntImage);

    return this.findById(entity.id);
  }

  public async update(TreasureHuntImage: TreasureHuntImage): Promise<TreasureHuntImage> {
    TreasureHuntImage.updatedAt = Date.now();
    const entity = await TreasureHuntImageModel.findOneAndUpdate({ id: TreasureHuntImage.id }, TreasureHuntImage);

    return this.findById(entity.id);
  }

  public async delete(TreasureHuntImage: TreasureHuntImage): Promise<TreasureHuntImage> {
    const entity = await TreasureHuntImageModel.findOneAndDelete({ id: TreasureHuntImage.id });

    return entity && this.mapEntity(entity);
  }

  private mapEntity(entity: Model<TreasureHuntImage> & TreasureHuntImage): TreasureHuntImage {
    return {
      id: entity.id,
      place: entity.place,
      status: entity.status,
      imgUrl: entity.imgUrl,
      createdAt: entity.createdAt,
      updatedAt: entity.updatedAt,
    };
  }

  async generateQrCodes(id: string) : Promise<void> {

        await QRCode.toFile(`./qr-code/${id}.png`, `http://localhost:3000/treasure-hunt?id=${id}`, {
        color: {
            dark: '#000000',
            light: '#ffffff',
        },
        errorCorrectionLevel: 'H',
        type: "png",
        });
    }
};

export default new TreasureHuntImageService();
