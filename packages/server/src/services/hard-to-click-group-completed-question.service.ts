import { Model } from "mongoose";

import HardToClickGroupCompletedQuestion, { HardToClickGroupCompletedQuestionModel } from "../models/hard-to-click-group-completed-question";
import IdServiceImpl from "./id-impl.service";

const idService = new IdServiceImpl();

type Filters = {
  id: string | string[];
  hardToClickGroupId: string | string[];
  hardToClickQuestionId: string | string[];
  createdAt: number | number[];
  updatedAt: number | number[];
};

class HardToClickGroupCompletedQuestionService {
  public async find(filters?: Partial<Filters>): Promise<HardToClickGroupCompletedQuestion[]> {
    const hardToClickGroupCompletedQuestions = await HardToClickGroupCompletedQuestionModel.find(filters);

    const entities: HardToClickGroupCompletedQuestion[] = [];
    for (const hardToClickGroupCompletedQuestion of hardToClickGroupCompletedQuestions) {
      entities.push(this.mapEntity(hardToClickGroupCompletedQuestion));
    }

    return entities;
  }

  public async findById(id: string): Promise<HardToClickGroupCompletedQuestion> {
    const entity = await HardToClickGroupCompletedQuestionModel.findOne({ id });

    return this.mapEntity(entity);
  }

  public async findOne(filters?: Partial<HardToClickGroupCompletedQuestion>): Promise<HardToClickGroupCompletedQuestion> {
    const entity = await HardToClickGroupCompletedQuestionModel.findOne(filters);

    return entity && this.mapEntity(entity);
  }

  public async count(filters?: Partial<Filters>): Promise<number> {
    const count = await HardToClickGroupCompletedQuestionModel.count(filters);

    return count;
  }

  public async create(hardToClickGroupCompletedQuestion: HardToClickGroupCompletedQuestion): Promise<HardToClickGroupCompletedQuestion> {
    hardToClickGroupCompletedQuestion.id = await idService.create();
    const entity = await HardToClickGroupCompletedQuestionModel.create(hardToClickGroupCompletedQuestion);

    return this.findById(entity.id);
  }

  public async update(hardToClickGroupCompletedQuestion: HardToClickGroupCompletedQuestion): Promise<HardToClickGroupCompletedQuestion> {
    const entity = await HardToClickGroupCompletedQuestionModel.findOneAndUpdate({ id: hardToClickGroupCompletedQuestion.id }, hardToClickGroupCompletedQuestion);

    return this.findById(entity.id);
  }

  public async delete(hardToClickGroupCompletedQuestion: HardToClickGroupCompletedQuestion): Promise<HardToClickGroupCompletedQuestion> {
    const entity = await HardToClickGroupCompletedQuestionModel.findOneAndDelete({ id: hardToClickGroupCompletedQuestion.id });

    return entity && this.mapEntity(entity);
  }

  private mapEntity(entity: Model<HardToClickGroupCompletedQuestion> & HardToClickGroupCompletedQuestion): HardToClickGroupCompletedQuestion {
    return {
      id: entity.id,
      hardToClickGroupId: entity.hardToClickGroupId,
      hardToClickQuestionId: entity.hardToClickQuestionId,
      createdAt: entity.createdAt,
      updatedAt: entity.updatedAt,
    };
  }
};

export default new HardToClickGroupCompletedQuestionService();
