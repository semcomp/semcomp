import { FilterQuery, UpdateQuery } from "mongoose";
import Item, { ItemDocument, ItemModel} from "../models/item";
import { PaginationRequest, PaginationResponse } from "../lib/pagination";

type Filters = FilterQuery<ItemDocument>;


class itemService {
    public async count(filters?: Filters): Promise<number> {
        const count = await ItemModel.countDocuments(filters);
        
        return count;
    }

    private mapEntity(entity: ItemDocument): Item {
      return {
        id: entity.id,
        name: entity.name,
        value: entity.value,
        maxQuantity: entity.maxQuantity,
        tier: entity.tier,
        tierQuantity: entity.tierQuantity,
        totalQuantity: entity.totalQuantity,
      };
    }

    public async create(item: Item): Promise<Item> {
        const entity = await ItemModel.create(item);

        return this.mapEntity(entity);
    }

    public async find({filters, pagination}: { filters?: Filters; pagination: PaginationRequest; }): Promise<PaginationResponse<Item>> {
        const items = await ItemModel
            .find(filters)
            .skip(pagination.getSkip())
            .limit(pagination.getItems());
        const count = await this.count(filters);
        const entities: Item[] = [];
        for (const item of items) {
            entities.push(this.mapEntity(item));
        }

        const paginatedResponse = new PaginationResponse(entities, count);

        return paginatedResponse;

    }

    public async update(id: string, payload: UpdateQuery<ItemDocument>): Promise<Item | null> {
        const entity = await ItemModel.findByIdAndUpdate(id, payload, { new: true });

        if (!entity) return null;
        else return this.mapEntity(entity);
    }

    public async delete(id: string): Promise<Item | null> {
        const entity = await ItemModel.findByIdAndDelete(id);

        if (!entity) return null;
        else return this.mapEntity(entity);

    }
    
};

export default new itemService();
