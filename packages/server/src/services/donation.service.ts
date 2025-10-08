import { FilterQuery, UpdateQuery } from "mongoose";

import Donation, { DonationModel, DonationDocument } from "../models/donation";
import Item from "../models/item";
import { PaginationRequest, PaginationResponse } from "../lib/pagination";

type Filters = FilterQuery<DonationDocument>;


class donationService {
    public async count(filters?: Filters): Promise<number> {
        const count = await DonationModel.countDocuments(filters);
        
        return count;
    }

    private mapEntity(entity: DonationDocument): Donation {
      return {
        id: entity.id,
        houseId: entity.houseId,
        item: entity.item as unknown as Item,
        quantity: entity.quantity,
        points: entity.points
      };
    }

    public async create(donation: Donation): Promise<Donation> {
        const donationPayload = {
                ...donation,
                item: donation.item.id,
            };

        const entity = await DonationModel.create(donationPayload);

        return this.mapEntity(entity.populate("item"));
    }

    public async find({filters, pagination}: { filters?: Filters; pagination: PaginationRequest; }): Promise<PaginationResponse<Donation>> {
        const donations = await DonationModel
            .find(filters)
            .populate("item")
            .skip(pagination.getSkip())
            .limit(pagination.getItems());
        const count = await this.count(filters);
        const entities: Donation[] = [];
        for (const donation of donations) {
            entities.push(this.mapEntity(donation));
        }

        const paginatedResponse = new PaginationResponse(entities, count);

        return paginatedResponse;

    }

    public async findById(id: string): Promise<Donation | null> {
        const entity = await DonationModel.findById(id);

        if (!entity) return null;
        else return this.mapEntity(entity);
    }

    public async update(id: string, payload: UpdateQuery<DonationDocument>): Promise<Donation | null> {
        const entity = await DonationModel.findByIdAndUpdate(id, payload, { new: true }).populate("item");

        if (!entity) return null;
        else return this.mapEntity(entity);
    }

    public async delete(id: string): Promise<Donation | null> {
        const entity = await DonationModel.findByIdAndDelete(id).populate("item");

        if (!entity) return null;
        else return this.mapEntity(entity);

    }
    
};

export default new donationService();
