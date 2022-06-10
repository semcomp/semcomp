import { Model } from "mongoose";

import RiddlethonGroupCompletedQuestion, { RiddlethonGroupCompletedQuestionModel } from "../models/riddlethon-group-completed-question";
import IdServiceImpl from "./id-impl.service";

const idService = new IdServiceImpl();

type Filters = {
  id: string | string[];
  riddlethonGroupId: string | string[];
  riddlethonQuestionId: string | string[];
  createdAt: number | number[];
  updatedAt: number | number[];
};

class RiddlethonGroupCompletedQuestionService {
  public async find(filters?: Partial<Filters>): Promise<RiddlethonGroupCompletedQuestion[]> {
    const riddlethonGroupCompletedQuestions = await RiddlethonGroupCompletedQuestionModel.find(filters);

    const entities: RiddlethonGroupCompletedQuestion[] = [];
    for (const riddlethonGroupCompletedQuestion of riddlethonGroupCompletedQuestions) {
      entities.push(this.mapEntity(riddlethonGroupCompletedQuestion));
    }

    return entities;
  }

  public async findById(id: string): Promise<RiddlethonGroupCompletedQuestion> {
    const entity = await RiddlethonGroupCompletedQuestionModel.findOne({ id });

    return this.mapEntity(entity);
  }

  public async findOne(filters?: Partial<RiddlethonGroupCompletedQuestion>): Promise<RiddlethonGroupCompletedQuestion> {
    const entity = await RiddlethonGroupCompletedQuestionModel.findOne(filters);

    return entity && this.mapEntity(entity);
  }

  public async count(filters?: Partial<Filters>): Promise<number> {
    const count = await RiddlethonGroupCompletedQuestionModel.count(filters);

    return count;
  }

  public async create(riddlethonGroupCompletedQuestion: RiddlethonGroupCompletedQuestion): Promise<RiddlethonGroupCompletedQuestion> {
    riddlethonGroupCompletedQuestion.id = await idService.create();
    const entity = await RiddlethonGroupCompletedQuestionModel.create(riddlethonGroupCompletedQuestion);

    return this.findById(entity.id);
  }

  public async update(riddlethonGroupCompletedQuestion: RiddlethonGroupCompletedQuestion): Promise<RiddlethonGroupCompletedQuestion> {
    const entity = await RiddlethonGroupCompletedQuestionModel.findOneAndUpdate({ id: riddlethonGroupCompletedQuestion.id }, riddlethonGroupCompletedQuestion);

    return this.findById(entity.id);
  }

  public async delete(riddlethonGroupCompletedQuestion: RiddlethonGroupCompletedQuestion): Promise<RiddlethonGroupCompletedQuestion> {
    const entity = await RiddlethonGroupCompletedQuestionModel.findOneAndDelete({ id: riddlethonGroupCompletedQuestion.id });

    return entity && this.mapEntity(entity);
  }

  private mapEntity(entity: Model<RiddlethonGroupCompletedQuestion> & RiddlethonGroupCompletedQuestion): RiddlethonGroupCompletedQuestion {
    return {
      id: entity.id,
      riddlethonGroupId: entity.riddlethonGroupId,
      riddlethonQuestionId: entity.riddlethonQuestionId,
      createdAt: entity.createdAt,
      updatedAt: entity.updatedAt,
    };
  }
};

export default new RiddlethonGroupCompletedQuestionService();
