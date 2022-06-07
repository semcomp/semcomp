import { Model } from "mongoose";

import Attendance, { AttendanceModel } from "../models/attendance";
import IdServiceImpl from "./id-impl.service";

const idService = new IdServiceImpl();

class AttendanceService {
  public async find(filters?: Partial<Attendance>): Promise<Attendance[]> {
    const attendances = await AttendanceModel.find(filters);

    const entities: Attendance[] = [];
    for (const attendance of attendances) {
      entities.push(this.mapEntity(attendance));
    }

    return entities;
  }

  public async findById(id: string): Promise<Attendance> {
    const entity = await AttendanceModel.findOne({ id });

    return this.mapEntity(entity);
  }

  public async findOne(filters?: Partial<Attendance>): Promise<Attendance> {
    const entity = await AttendanceModel.findOne(filters);

    return entity && this.mapEntity(entity);
  }

  public async count(filters?: Partial<Attendance>): Promise<number> {
    const count = await AttendanceModel.count(filters);

    return count;
  }

  public async create(attendance: Attendance): Promise<Attendance> {
    attendance.id = await idService.create();
    const entity = await AttendanceModel.create(attendance);

    return this.findById(entity.id);
  }

  public async update(attendance: Attendance): Promise<Attendance> {
    const entity = await AttendanceModel.findOneAndUpdate({ id: attendance.id }, attendance);

    return this.findById(entity.id);
  }

  public async delete(attendance: Attendance): Promise<Attendance> {
    const entity = await AttendanceModel.findOneAndDelete({ id: attendance.id });

    return entity && this.mapEntity(entity);
  }

  private mapEntity(entity: Model<Attendance> & Attendance): Attendance {
    return {
      id: entity.id,
      eventId: entity.eventId,
      userId: entity.userId,
      createdAt: entity.createdAt,
      updatedAt: entity.updatedAt,
    };
  }
};

export default new AttendanceService();
