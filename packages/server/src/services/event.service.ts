import { Model } from "mongoose";

import Event, { EventModel } from "../models/event";
import subscriptionService from "./subscription.service";
import Attendance from "../models/attendance";
import attendanceService from "./attendance.service";

import EventTypes from "../lib/constants/event-types-enum";
import Subscription from "../models/subscription";
import IdServiceImpl from "./id-impl.service";
import houseService from "./house.service";
import HttpError from "../lib/http-error";

const idService = new IdServiceImpl();

type Filters = {
  id: string | string[];
  name: string | string[];
  description: string | string[];
  speaker: string | string[];
  link: string | string[];
  maxOfSubscriptions: number | number[];
  startDate: number | number[];
  endDate: number | number[];
  type: EventTypes | EventTypes[];
  isInGroup: boolean | boolean[];
  showOnSchedule: boolean | boolean[];
  showOnSubscribables: boolean | boolean[];
  showStream: boolean | boolean[];
  needInfoOnSubscription: boolean | boolean[];
  createdAt: number | number[];
  updatedAt: number | number[];
};

class EventService {
  public async find(filters?: Partial<Filters>): Promise<Event[]> {
    const events = await EventModel.find(filters);

    const entities: Event[] = [];
    for (const event of events) {
      entities.push(this.mapEntity(event));
    }

    return entities;
  }

  public async findById(id: string): Promise<Event> {
    const entity = await EventModel.findOne({ id });

    return this.mapEntity(entity);
  }

  public async count(filters?: Partial<Filters>): Promise<number> {
    const count = await EventModel.count(filters);

    return count;
  }

  public async create(event: Event): Promise<Event> {
    event.id = await idService.create();
    const entity = await EventModel.create(event);

    return this.findById(entity.id);
  }

  public async update(event: Event): Promise<Event> {
    const entity = await EventModel.findOneAndUpdate({ id: event.id }, event);

    return this.findById(entity.id);
  }

  public async delete(event: Event): Promise<Event> {
    const entity = await EventModel.findOneAndDelete({ id: event.id });

    const attendances = await attendanceService.find({ eventId: event.id });
    for (const attendance of attendances) {
      await attendanceService.delete(attendance);
    }

    const subscriptions = await subscriptionService.find({ eventId: event.id });
    for (const subscription of subscriptions) {
      await subscriptionService.delete(subscription);
    }

    return entity && this.mapEntity(entity);
  }

  public async getInfo(userId: string) {
    const events = await this.find({ showOnSchedule: true });
    const userAttendances = await attendanceService.find({
      userId,
    });
    const eventsSubscriptions = await subscriptionService.find();

    const eventsInfo = [];
    for (const event of events) {
      let hasAttend = false;
      let isSubscribed = false;
      if (userId) {
        hasAttend = !!userAttendances.find((attendance) => attendance.eventId === event.id);
        isSubscribed = !!eventsSubscriptions.find((subscription) => {
          return subscription.eventId === event.id && subscription.userId === userId;
        });
      }

      const eventSubscriptionsCount = eventsSubscriptions.filter((subscription) => {
        return subscription.eventId === event.id;
      }).length;

      eventsInfo.push({
        ...event,
        hasAttend,
        isSubscribed,
        subscriptionsCount: eventSubscriptionsCount,
      });
    }

    return eventsInfo;
  }

  public async getCurrent(userId: string) {
    const events = await this.find({ showStream: true });
    const userAttendances = await attendanceService.find({
      userId,
    });
    const eventsSubscriptions = await subscriptionService.find();

    let currentEvent;
    for (const event of events) {
      const now = Date.now();

      const startedDate = event.startDate;
      const endDate = event.endDate;

      if (now > startedDate && now < endDate) {
        let hasAttend = false;
        let isSubscribed = false;
        if (userId) {
          hasAttend = !!userAttendances.find((attendance) => attendance.eventId === event.id);
          isSubscribed = !!eventsSubscriptions.find((subscription) => {
            return subscription.eventId === event.id && subscription.userId === userId;
          });
        }

        const eventSubscriptionsCount = eventsSubscriptions.filter((subscription) => {
          return subscription.eventId === event.id;
        }).length;

        currentEvent = {
          ...event,
          hasAttend,
          isSubscribed,
          subscriptionsCount: eventSubscriptionsCount,
        };
      }
    }

    return currentEvent;
  }

  public async getSubscribables(userId: string) {
    const desiredEventTypesEnum = {
      MINICURSO: EventTypes.MINICURSO,
      GAMENIGHT: EventTypes.GAME_NIGHT,
      CONCURSO: EventTypes.CONCURSO,
      CONTEST: EventTypes.CONTEST,
      RODA: EventTypes.RODA,
    };
    const events = await this.find({
      type: Object.values(desiredEventTypesEnum),
      showOnSubscribables: true,
    });
    const userAttendances = await attendanceService.find({
      userId,
    });
    const eventsSubscriptions = await subscriptionService.find();

    const eventsInfo = [];
    for (const eventType of Object.values(desiredEventTypesEnum)) {
      eventsInfo.push({
        type: eventType,
        items: [],
      });
    }

    for (const event of events) {
      const eventsInfoOfType = eventsInfo.find(
        (eventInfo) => eventInfo.type === event.type
      );

      let itemsOnThisHour = eventsInfoOfType.items.find((eventInfoOfType) => {
        return (
          eventInfoOfType.startDate === event.startDate &&
          eventInfoOfType.endDate === event.endDate
        );
      });

      if (!itemsOnThisHour) {
        itemsOnThisHour = {
          startDate: event.startDate,
          endDate: event.endDate,
          events: [],
        };

        eventsInfoOfType.items.push(itemsOnThisHour);
      }

      let hasAttend = false;
      let isSubscribed = false;
      if (userId) {
        hasAttend = !!userAttendances.find((attendance) => attendance.eventId === event.id);
        isSubscribed = !!eventsSubscriptions.find((subscription) => {
          return subscription.eventId === event.id && subscription.userId === userId;
        });
      }

      const eventSubscriptionsCount = eventsSubscriptions.filter((subscription) => {
        return subscription.eventId === event.id;
      }).length;

      itemsOnThisHour.events.push({
        ...event,
        hasAttend,
        isSubscribed,
        subscriptionsCount: eventSubscriptionsCount,
      });
    }

    return eventsInfo.filter((eventInfo) => eventInfo.items.length > 0);
  }

  public async markPresence(eventId: string, userId: string, userHouse: any) {
    const event = await this.findById(eventId);
    const subscription = await subscriptionService.findOne({ userId, eventId });

    if (
      (event.type === EventTypes.MINICURSO ||
        event.type === EventTypes.GAME_NIGHT ||
        event.type === EventTypes.CONCURSO ||
        event.type === EventTypes.CONTEST) &&
      !subscription
    ) {
      throw new HttpError(400, ["Não inscrito no evento!"]);
    }

    if (await attendanceService.findById(userId)) {
      throw new HttpError(400, ["Presença já existente!"]);
    }

    const now = Date.now();

    const newStartedDateObj = new Date(event.startDate);
    newStartedDateObj.setMinutes(newStartedDateObj.getMinutes() - 5);

    const newEndDateObj = new Date(event.endDate);
    newEndDateObj.setMinutes(newEndDateObj.getMinutes() + 5);

    if (now > newStartedDateObj.getDate() && now < newEndDateObj.getDate()) {
      const attendance: Attendance = {
        userId: userId,
        eventId: eventId,
      }
      await attendanceService.create(attendance);

      // await houseService.addHousePoints(userHouse, event.type === EventTypes.MINICURSO ? 30 : 10);

      // await userHouse.save();

      return { message: "Presença salva com sucesso!" };
    }
    if (now < newStartedDateObj.getDate()) {
      throw new HttpError(400, ["O evento ainda não começou!"]);
    }
    throw new HttpError(400, ["O evento já terminou!"]);
  }

  public async subscribe(eventId: string, userId: string, info: object) {
    const event = await this.findById(eventId);
    const subscriptionsCount = await subscriptionService.count({ eventId });

    if (subscriptionsCount >= event.maxOfSubscriptions) {
      throw new HttpError(400, ["O evento está cheio!"]);
    }

    const subscription = await subscriptionService.findOne({ userId, eventId });

    if (event.type !== "Contest" && subscription) {
      throw new HttpError(400, ["O usuário já esta inscrito em um evento nesse horário!"]);
    }

    const newSubscription: Subscription = {
      userId, eventId, info, hasGroup: true
    };
    await subscriptionService.create(newSubscription);

    return { message: "Inscrição salva com sucesso!" };
  }

  public async unsubscribe(eventId: string, userId: string) {
    const subscription = await subscriptionService.findOne({ eventId, userId });
    await subscriptionService.delete(subscription);

    return { message: "Inscrição removida com sucesso!" };
  }

  private mapEntity(entity: Model<Event> & Event): Event {
    return {
      id: entity.id,
      name: entity.name,
      description: entity.description,
      speaker: entity.speaker,
      link: entity.link,
      maxOfSubscriptions: entity.maxOfSubscriptions,
      startDate: entity.startDate,
      endDate: entity.endDate,
      type: entity.type,
      isInGroup: entity.isInGroup,
      showOnSchedule: entity.showOnSchedule,
      showOnSubscribables: entity.showOnSubscribables,
      showStream: entity.showStream,
      needInfoOnSubscription: entity.needInfoOnSubscription,
      createdAt: entity.createdAt,
      updatedAt: entity.updatedAt,
    };
  }
};

export default new EventService();
