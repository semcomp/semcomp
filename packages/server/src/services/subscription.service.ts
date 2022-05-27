import { Model } from "mongoose";

import Subscription, { SubscriptionModel } from "../models/subscription";
import IdServiceImpl from "./id-impl.service";

const idService = new IdServiceImpl();

class SubscriptionService {
  public async find(filters?: Partial<Subscription>): Promise<Subscription[]> {
    const subscriptions = await SubscriptionModel.find(filters);

    const entities: Subscription[] = [];
    for (const subscription of subscriptions) {
      entities.push(this.mapEntity(subscription));
    }

    return entities;
  }

  public async findById(id: string): Promise<Subscription> {
    const entity = await SubscriptionModel.findOne({ id });

    return this.mapEntity(entity);
  }

  public async count(filters?: Partial<Subscription>): Promise<number> {
    const count = await SubscriptionModel.count(filters);

    return count;
  }

  public async create(subscription: Subscription): Promise<Subscription> {
    subscription.id = await idService.create();
    const entity = await SubscriptionModel.create(subscription);

    return this.findById(entity.id);
  }

  public async update(subscription: Subscription): Promise<Subscription> {
    const entity = await SubscriptionModel.findOneAndUpdate({ id: subscription.id });

    return this.findById(entity.id);
  }

  public async delete(subscription: Subscription): Promise<Subscription> {
    const entity = await SubscriptionModel.findOneAndDelete({ id: subscription.id });

    return this.findById(entity.id);
  }

  private mapEntity(entity: Model<Subscription> & Subscription): Subscription {
    return {
      id: entity.id,
      eventId: entity.eventId,
      userId: entity.userId,
      info: entity.info,
      hasGroup: entity.hasGroup,
      createdAt: entity.createdAt,
      updatedAt: entity.updatedAt,
    };
  }
};

export default new SubscriptionService();
