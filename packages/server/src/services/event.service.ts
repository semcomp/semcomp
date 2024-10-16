import { Model } from "mongoose";

import Event, { EventModel } from "../models/event";
import subscriptionService from "./subscription.service";
import Attendance from "../models/attendance";
import attendanceService from "./attendance.service";
import userService from "../services/user.service";
import { config } from "dotenv";
config({ path: `./config/env/${process.env.NODE_ENV === "production" ? "production" : "development"}.env` });

import EventTypes from "../lib/constants/event-types-enum";
import Subscription from "../models/subscription";
import IdServiceImpl from "./id-impl.service";
import HttpError from "../lib/http-error";
import User from "../models/user";
import { PaginationRequest, PaginationResponse } from "../lib/pagination";
import houseService from "./house.service";
import houseMemberService from "./house-member.service";
import JsonWebToken from "./json-web-token.service";
import EventPoints from "../lib/constants/event-points-enum";

type Filters = {
  id: string | string[];
  name: string | string[];
  description: string | string[];
  speaker: string | string[];
  location: string | string[];
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

type EventWithInfo = Event & { attendances: Partial<User>[], subscribers: Partial<User>[] };

type UserAttendanceInfo = {
  email: string;
  name: string;
  hours: number;
}

class EventService {
  private idService;
  private tokenService;

  constructor() {
    this.idService = new IdServiceImpl();
    this.tokenService = new JsonWebToken(process.env.JWT_PRIVATE_KEY, "1m");
  }

  public async find({
    filters,
    pagination,
  }: {
    filters?: Partial<Filters>;
    pagination: PaginationRequest;
  }): Promise<PaginationResponse<Event>> {
    const events = await EventModel
      .find(filters)
      .skip(pagination.getSkip())
      .limit(pagination.getItems());
    const count = await this.count(filters);

    const entities: Event[] = [];
    for (const event of events) {
      entities.push(this.mapEntity(event));
    }

    const paginatedResponse = new PaginationResponse(entities, count)

    return paginatedResponse;
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
    event.id = await this.idService.create();
    event.createdAt = Date.now();
    event.updatedAt = Date.now();
    const entity = await EventModel.create(event);

    return this.findById(entity.id);
  }

  public async update(event: Event): Promise<Event> {
    event.updatedAt = Date.now();
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
    const events = await this.find({
      filters: { showOnSchedule: true },
      pagination: new PaginationRequest(1, 9999),
    });
    const userAttendances = await attendanceService.find({ userId });
    const eventsSubscriptions = await subscriptionService.find({ userId });

    const eventsInfo = [];
    for (const event of events.getEntities()) {
      let hasAttended = false;
      let isSubscribed = false;
      if (userId) {
        hasAttended = !!userAttendances.find((attendance) => attendance.eventId === event.id);
        isSubscribed = !!eventsSubscriptions.find((subscription) => subscription.eventId === event.id);
      }

      const eventSubscriptionsCount = eventsSubscriptions.filter((subscription) => {
        return subscription.eventId === event.id;
      }).length;

      eventsInfo.push({
        ...event,
        hasAttended,
        isSubscribed,
        subscriptionsCount: eventSubscriptionsCount,
      });
    }

    return eventsInfo;
  }

  public async getCurrent(userId: string) {
    const events = await this.find({
      filters: { showStream: true },
      pagination: new PaginationRequest(1, 9999),
    });
    const userAttendances = await attendanceService.find({
      userId,
    });
    const eventsSubscriptions = await subscriptionService.find();

    let currentEvent;
    for (const event of events.getEntities()) {
      const now = Date.now();

      const startedDate = event.startDate;
      const endDate = event.endDate;

      if (now > startedDate && now < endDate) {
        let hasAttended = false;
        let isSubscribed = false;
        if (userId) {
          hasAttended = !!userAttendances.find((attendance) => attendance.eventId === event.id);
          isSubscribed = !!eventsSubscriptions.find((subscription) => {
            return subscription.eventId === event.id && subscription.userId === userId;
          });
        }

        const eventSubscriptionsCount = eventsSubscriptions.filter((subscription) => {
          return subscription.eventId === event.id;
        }).length;

        currentEvent = {
          ...event,
          hasAttended,
          isSubscribed,
          subscriptionsCount: eventSubscriptionsCount,
        };
      }
    }

    return currentEvent;
  }

  public async getSubscribables(userId: string) {
    type EventsByType = {
      [key: string]: Event[];
    };

    type EventsByTypeAndTime = {
      [key: string]: [{
        startDate: number,
        endDate: number,
        events: (Event & {
          hasAttended?: boolean;
          isSubscribed?: boolean;
          subscriptionsCount?: number;
        })[],
      }],
    };

    const desiredEventTypesEnum = {
      MINICURSO: EventTypes.MINICURSO,
      CULTURAL: EventTypes.CULTURAL,
      GAMENIGHT: EventTypes.GAME_NIGHT,
      HACKATHON: EventTypes.HACKATHON,
      CONCURSO: EventTypes.CONCURSO,
      CONTEST: EventTypes.CONTEST,
      RODA: EventTypes.RODA,
    };
    const events = await this.find({
      filters: {
        type: Object.values(desiredEventTypesEnum),
        showOnSubscribables: true,
      },
      pagination: new PaginationRequest(1, 9999),
    });
    const userAttendances = await attendanceService.find({
      userId,
    });
    const eventsSubscriptions = await subscriptionService.find();

    const eventsByType: EventsByType = {};
    for (const event of events.getEntities()) {
      if (!eventsByType[event.type]) {
        eventsByType[event.type] = [event];
        continue;
      }

      eventsByType[event.type].push(event);
    }

    const eventsByTypeAndTime: EventsByTypeAndTime = {};
    for (let [key, events] of Object.entries(eventsByType) as [string, Event[]][]) {
      events = events.sort((a, b) => (b.endDate - b.startDate) - (a.endDate - a.startDate))
      for (const event of events) {
        if (!eventsByTypeAndTime[key]) {
          eventsByTypeAndTime[key] = [{
            startDate: event.startDate,
            endDate: event.endDate,
            events: [event],
          }];
          continue;
        }

        let eventsOfThisTypeAndTime = eventsByTypeAndTime[key].find((eventOfThisType) => {
          return ((eventOfThisType.startDate >= event.startDate && eventOfThisType.startDate <= event.endDate) ||
            (eventOfThisType.endDate >= event.startDate && eventOfThisType.endDate <= event.endDate) ||
            (event.startDate >= eventOfThisType.startDate && event.startDate <= eventOfThisType.endDate));
        });

        if (eventsOfThisTypeAndTime) {
          if (event.startDate < eventsOfThisTypeAndTime.startDate) {
            eventsOfThisTypeAndTime.startDate = event.startDate;
          }
          if (event.endDate > eventsOfThisTypeAndTime.endDate) {
            eventsOfThisTypeAndTime.endDate = event.endDate;
          }
          eventsOfThisTypeAndTime.events.push(event);
        } else {
          eventsByTypeAndTime[key].push({
            startDate: event.startDate,
            endDate: event.endDate,
            events: [event],
          });
        }
      }
    }

    for (const type of Object.keys(eventsByTypeAndTime)) {
      eventsByTypeAndTime[type] = eventsByTypeAndTime[type].sort((a, b) => a.startDate - b.startDate);
      for (const eventsByTime of eventsByTypeAndTime[type]) {
        eventsByTime.events = eventsByTime.events.sort((a, b) => a.startDate - b.startDate);
        for (const event of eventsByTime.events) {
          let hasAttended = false;
          let isSubscribed = false;
          if (userId) {
            hasAttended = !!userAttendances.find((attendance) => attendance.eventId === event.id);
            isSubscribed = !!eventsSubscriptions.find((subscription) => {
              return subscription.eventId === event.id && subscription.userId === userId;
            });
          }

          const eventSubscriptionsCount = eventsSubscriptions.filter((subscription) => {
            return subscription.eventId === event.id;
          }).length;

          event.hasAttended = hasAttended;
          event.isSubscribed = isSubscribed;
          event.subscriptionsCount = eventSubscriptionsCount;
        }
      }
    }

    return eventsByTypeAndTime;
  }

  public async createAttendanceQrCode(eventId: string): Promise<string> {
    return this.tokenService.create({ data: { eventId } });
  }

  public async markAttendanceByQrCode(token: string, userId: string) {
      console.log(token);
      const { eventId } = this.tokenService.decode(token);
      console.log("ID: ", eventId);
      return await this.markAttendance(eventId, userId);

  }

  public async markAttendance(eventId: string, userId: string) {
    const event = await this.findById(eventId);

    if (await attendanceService.findOne({ userId, eventId })) {
      return { message: "Presença já cadastrada!" };
    }

    if(event.type === EventTypes.MINICURSO){
      const subscription = await subscriptionService.findOne({ userId: userId, eventId: eventId});
      if(!subscription){
        throw new HttpError(400, ["Usuário não está inscrito nesse minicurso!"]);
      }
    }

    const attendance: Attendance = {
      userId: userId,
      eventId: eventId,
    }
    await attendanceService.create(attendance);

    let pointsForAttendance = 0;

    if (
      event.type === EventTypes.MINICURSO ||
      event.type === EventTypes.PALESTRA
    ) {
      pointsForAttendance = EventPoints[event.type];
    }

    const userHouseMembership = await houseMemberService.findOne({ userId });
    const userHouse = await houseService.findOne({ id: userHouseMembership.houseId });
    userHouse.score = userHouse.score + pointsForAttendance;
    await houseService.update(userHouse);

    return { message: "Presença salva com sucesso!" };
  }

  public async subscribe(eventId: string, userId: string, info: object) {
    const event = await this.findById(eventId);
    const subscriptionsCount = await subscriptionService.count({ eventId });

    if (subscriptionsCount >= event.maxOfSubscriptions) {
      throw new HttpError(400, ["O evento está cheio!"]);
    }

    const subscriptions = await subscriptionService.find({ userId });
    for (const subscription of subscriptions) {
      const subscribedEvent = await this.findById(subscription.eventId);
      if (
        (subscribedEvent.startDate >= event.startDate && subscribedEvent.startDate <= event.endDate) ||
        (subscribedEvent.endDate >= event.startDate && subscribedEvent.endDate <= event.endDate) ||
        (event.startDate >= subscribedEvent.startDate && event.startDate <= subscribedEvent.endDate)
      ) {
        throw new HttpError(400, ["O usuário já esta inscrito em um evento nesse horário!"]);
      }
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

  public async findWithInfo({
    pagination,
  }: {
    pagination: PaginationRequest;
  }): Promise<PaginationResponse<EventWithInfo>> {
    const events = await this.find({ pagination });
    const eventIds = events.getEntities().map((event) => event.id);
    const attendances = await attendanceService.find({ eventId: eventIds });
    const attendancesUserIds = attendances.map((attendance) => attendance.userId);
    const subscriptions = await subscriptionService.find({ eventId: eventIds });
    const subscriptionsUserIds = subscriptions.map((subscription) => subscription.userId);
    const users = await userService.minimalFind({ id: [...attendancesUserIds, ...subscriptionsUserIds] });


    const entities: EventWithInfo[] = [];
    for (const event of events.getEntities()) {
      const eventAttendances = attendances.filter((attendance) => attendance.eventId === event.id);
      const eventUserAttendances = eventAttendances.map(
        (eventAttendance) => users.find((user) => user.id === eventAttendance.userId)
      );
      const eventSubscription = subscriptions.filter((subscription) => subscription.eventId === event.id);
      const eventUserSubscription = eventSubscription.map(
        (eventSubscription) => users.find((user) => user.id === eventSubscription.userId)
      );

      entities.push({
        ...event,
        attendances: eventUserAttendances,
        subscribers: eventUserSubscription,
      });
    }

    return new PaginationResponse<EventWithInfo>(entities, events.getTotalNumberOfItems());
  }

  public async listUsersAttendancesInfo(): Promise<UserAttendanceInfo[]> {
    const users = await userService.find({
      pagination: new PaginationRequest(1, 9999),
    });
    const attendances = await attendanceService.find();
    const events = await this.find({
      pagination: new PaginationRequest(1, 9999),
    });

    const usersAttendancesInfo: UserAttendanceInfo[] = [];
    for (const user of users.getEntities()) {
      const userAttendances = attendances.filter(attendance => attendance.userId === user.id);

      let hours = 0;
      for (const userAttendance of userAttendances) {
        const event = events.getEntities().find(event => event.id === userAttendance.eventId);

        const startDate = new Date(event.startDate);
        const endDate = new Date(event.endDate);
        hours += endDate.getHours() - startDate.getHours();
      }
      usersAttendancesInfo.push({
        email: user.email,
        name: user.name,
        hours,
      });
    }

    return usersAttendancesInfo;
  }

  public async listUsersAttendancesInfoByEvent(eventId: string): Promise<UserAttendanceInfo[]> {
    // pega todos os usuários
    const users = await userService.find({
      pagination: new PaginationRequest(1, 9999),
    });

    // pega todas as presenças daquele evento
    const attendances = await attendanceService.find({ eventId: eventId });

    const events = await this.find({
      pagination: new PaginationRequest(1, 9999),
    });

    // cria um array de objetos com as informações de presença de cada usuário
    const usersAttendancesInfo: UserAttendanceInfo[] = [];
    for (const user of users.getEntities()) {
      const userAttendances = attendances.filter(attendance => attendance.userId === user.id);

      if (userAttendances.length === 0) continue;

      let hours = 0;
      for (const userAttendance of userAttendances) {
        const event = events.getEntities().find(event => event.id === userAttendance.eventId);

        const startDate = new Date(event.startDate);
        const endDate = new Date(event.endDate);
        hours += endDate.getHours() - startDate.getHours();
      }
      usersAttendancesInfo.push({
        email: user.email,
        name: user.name,
        hours,
      });
    }

    return usersAttendancesInfo;
  }

  private mapEntity(entity: Model<Event> & Event): Event {
    return {
      id: entity.id,
      name: entity.name,
      description: entity.description,
      speaker: entity.speaker,
      location: entity.location,
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
