import { Model } from "mongoose";

import Attendance, { AttendanceModel } from "../models/attendance";
import IdServiceImpl from "./id-impl.service";
import eventService from "./event.service";
import EventTypes from "../lib/constants/event-types-enum";

const idService = new IdServiceImpl();

type Filters = {
  id: string | string[];
  eventId: string | string[];
  userId: string | string[];
  createdAt: number | number[];
  updatedAt: number | number[];
};

class AttendanceService {
  public async find(filters?: Partial<Filters>, optional?: string): Promise<Attendance[]> {
    const attendances = await AttendanceModel.find(filters, optional);

    const entities: Attendance[] = [];
    for (const attendance of attendances) {
      entities.push(this.mapEntity(attendance));
    }

    return entities;
  }

  public async findById(id: string): Promise<Attendance> {
    const entity = await AttendanceModel.findOne({ id });

    return entity && this.mapEntity(entity);
  }

  public async findOne(filters?: Partial<Filters>): Promise<Attendance> {
    const entity = await AttendanceModel.findOne(filters);

    return entity && this.mapEntity(entity);
  }

  public async count(filters?: Partial<Attendance>): Promise<number> {
    const count = await AttendanceModel.countDocuments(filters);

    return count;
  }

  public async create(attendance: Attendance): Promise<Attendance> {
    attendance.id = await idService.create();
    attendance.createdAt = Date.now();
    attendance.updatedAt = Date.now();
    const entity = await AttendanceModel.create(attendance);

    return this.findById(entity.id);
  }

  public async findByUserId(userId: string): Promise<Attendance[]> {
    return this.find({ userId });
  }

  public async update(attendance: Attendance): Promise<Attendance> {
    attendance.updatedAt = Date.now();
    const entity = await AttendanceModel.findOneAndUpdate({ id: attendance.id }, attendance);

    return this.findById(entity.id);
  }

  public async delete(attendance: Attendance): Promise<Attendance> {
    const entity = await AttendanceModel.findOneAndDelete({ id: attendance.id });

    return entity && this.mapEntity(entity);
  }

  public async listAttendanceInfoWithEventTypeRate(eventType: EventTypes): Promise<Attendance[]> {
    const totalPalestraHours = await eventService.calcTotalTimeByEventType(eventType);
    const allEvents = [EventTypes.CONCURSO, EventTypes.RODA, EventTypes.CULTURAL, EventTypes.FEIRA, EventTypes.PALESTRA];
    
    // Calcula a proporcao das horas de eventos do tipo "eventType"
    // para cada usuario com presenca em Attendance
    const userAttendancePipeline = [
      {
        $lookup: {
          from: "event",
          localField: "eventId",
          foreignField: "id",
          as: "eventDetails"
        }
      },
      {
        $unwind: "$eventDetails"
      },
      {
        $match: {
          "eventDetails.type": { $in: allEvents }
        }
      },
      {
        $addFields: {
          eventDurationHours: {
            $divide: [{ $subtract: ["$eventDetails.endDate", "$eventDetails.startDate"] }, 3600000]
          },
          isPalestra: {
            $cond: { if: { $eq: ["$eventDetails.type", "Palestra"] }, then: true, else: false }
          }
        }
      },
      {
        $group: {
          _id: "$userId",
          hours: { $sum: "$eventDurationHours" },
          palestraHours: {
            $sum: { $cond: [{ $eq: ["$isPalestra", true] }, "$eventDurationHours", 0] }
          }
        }
      },
  		{
        $lookup: {
          from: "user",
          localField: "_id",
          foreignField: "id",
          as: "userDetails"
        } 
      },
  		{
        $unwind: "$userDetails"
      },
      {
        $addFields: {
          percentage: {
            $cond: {
              if: { $gt: [totalPalestraHours, 0] },
              then: { $multiply: [{ $divide: ["$palestraHours", "$totalPalestraHours"] }, 100] },
              else: 0
            }
          }
        }
      },
      {
        $project: {
          hours: { $round: ["$hours", 2] },
          percentage: { $round: ["$percentage", 2] },
          name: "$userDetails.name",
          email: "$userDetails.email",
          course: "$userDetails.course"
        }
      }
    ];

    const result = await AttendanceModel.aggregate(userAttendancePipeline);
    return result;
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
