import { Model } from "mongoose";
import House from "../models/house";

import HouseMember, { HouseMemberModel } from "../models/house-member";
import houseService from "./house.service";
import IdServiceImpl from "./id-impl.service";

const idService = new IdServiceImpl();

class HouseMemberService {
  public async find(filters?: Partial<HouseMember>): Promise<HouseMember[]> {
    const houseMembers = await HouseMemberModel.find(filters);

    const entities: HouseMember[] = [];
    for (const houseMember of houseMembers) {
      entities.push(this.mapEntity(houseMember));
    }

    return entities;
  }

  public async findById(id: string): Promise<HouseMember> {
    const entity = await HouseMemberModel.findOne({ id });

    return this.mapEntity(entity);
  }

  public async findOne(filters?: Partial<HouseMember>): Promise<HouseMember> {
    const entity = await HouseMemberModel.findOne(filters);

    return this.mapEntity(entity);
  }

  public async count(filters?: Partial<HouseMember>): Promise<number> {
    const count = await HouseMemberModel.count(filters);

    return count;
  }

  public async create(houseMember: HouseMember): Promise<HouseMember> {
    houseMember.id = await idService.create();
    const entity = await HouseMemberModel.create(houseMember);

    return this.findById(entity.id);
  }

  public async update(houseMember: HouseMember): Promise<HouseMember> {
    const entity = await HouseMemberModel.findOneAndUpdate({ id: houseMember.id }, houseMember);

    return this.findById(entity.id);
  }

  public async delete(houseMember: HouseMember): Promise<HouseMember> {
    const entity = await HouseMemberModel.findOneAndDelete({ id: houseMember.id });

    return entity && this.mapEntity(entity);
  }


  public async assignUserHouse(userId: string): Promise<void> {
    const houseWithLessMembers = await this.getHouseWithLessMembers();

    const houseMember: HouseMember = {
      userId,
      houseId: houseWithLessMembers.id,
    };
    await this.create(houseMember);
  };

  private async getHouseWithLessMembers(): Promise<House> {
    const houses = await houseService.find();

    let houseWithMemberCount: {
      house: House,
      memberCount: number,
    }[] = []
    for (const house of houses) {
      const memberCount = await this.count({ houseId: house.id });
      houseWithMemberCount.push({
        house,
        memberCount,
      })
    }

    return houseWithMemberCount.reduce((prev, curr) => {
      return prev.memberCount < curr.memberCount ? prev : curr;
    }).house;
  };


  private mapEntity(entity: Model<HouseMember> & HouseMember): HouseMember {
    return {
      id: entity.id,
      houseId: entity.houseId,
      userId: entity.userId,
      createdAt: entity.createdAt,
      updatedAt: entity.updatedAt,
    };
  }
};

export default new HouseMemberService();
