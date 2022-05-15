import createError from "http-errors";
import { ObjectId } from "mongodb";

import EventModel from "../models/event";
import SubscriptionModel from "../models/subscription";
import subscriptionService from "./subscription.service";

import { formatEvent } from "../lib/format-event";
import { addHousePoints } from "../lib/add-house-points";
import eventTypeEnum from "../lib/constants/event-type-enum";

const eventService = {
  getInfo: async (user) => {
    const events = await EventModel.find({ showOnSchedule: true });
    let userSubscriptions;
    if (user) {
      userSubscriptions = await SubscriptionModel.find({ user: user._id });
    }

    const eventsInfo = [];
    for (const event of events) {
      eventsInfo.push({
        ...formatEvent(event, [
          "_id",
          "name",
          "description",
          "speaker",
          "link",
          "startDate",
          "endDate",
          "type",
        ]),
        wasPresent: user ? event.presentUsers.includes(user._id) : false,
        isSubscribed: user
          ? !!userSubscriptions.find(
            (subscription) =>
              event._id.toString() === subscription.event._id.toString()
          )
          : false,
      });
    }

    return eventsInfo;
  },
  getCurrent: async (user) => {
    const events = await EventModel.find({ showStream: true });
    let userSubscriptions;
    if (user) {
      userSubscriptions = await SubscriptionModel.find({ user: user._id });
    }

    let currentEvent;
    for (const event of events) {
      const now = Date.now();

      const startedDateObj = new Date(event.startDate).getDate();
      const endDateObj = new Date(event.endDate).getDate();

      if (now > startedDateObj && now < endDateObj) {
        currentEvent = {
          ...formatEvent(event, [
            "_id",
            "name",
            "description",
            "speaker",
            "link",
            "startDate",
            "endDate",
            "type",
          ]),
          wasPresent: user ? event.presentUsers.includes(user._id) : false,
          isSubscribed: user
            ? !!userSubscriptions.find(
              (subscription) =>
                event._id.toString() === subscription.event._id.toString()
            )
            : false,
        };
      }
    }

    return currentEvent;
  },
  getSubscribables: async (user) => {
    const desiredEventTypesEnum = {
      MINICURSO: eventTypeEnum.MINICURSO,
      GAMENIGHT: eventTypeEnum.GAME_NIGHT,
      CONCURSO: eventTypeEnum.CONCURSO,
      CONTEST: eventTypeEnum.CONTEST,
      RODA: eventTypeEnum.RODA,
    };
    const events = await EventModel.find({
      type: { $in: Object.values(desiredEventTypesEnum) },
      showOnSubscribables: true,
    });
    const userSubscriptions = await subscriptionService.get({ user: user.id });

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
          eventInfoOfType.startDate.getTime() === event.startDate.getTime() &&
          eventInfoOfType.endDate.getTime() === event.endDate.getTime()
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

      itemsOnThisHour.events.push({
        ...formatEvent(event, [
          "id",
          "name",
          "description",
          "speaker",
          "maxOfSubscriptions",
          "link",
          "type",
          "isInGroup",
          "needInfoOnSubscription",
        ]),
        isSubscribed: !!userSubscriptions.find(
          (subscription) =>
            subscription.event.toString() === event.id.toString()
        ),
      });
    }

    return eventsInfo.filter((eventInfo) => eventInfo.items.length > 0);
  },
  markPresence: async (eventId, user, userHouse) => {
    const event = await eventService.getOne(eventId);
    const subscription = await SubscriptionModel.findOne({
      user: user._id,
      event: eventId,
    });

    if (
      (event.type === eventTypeEnum.MINICURSO ||
        event.type === eventTypeEnum.GAME_NIGHT ||
        event.type === eventTypeEnum.CONCURSO ||
        event.type === eventTypeEnum.CONTEST) &&
      !subscription
    ) {
      throw new createError.BadRequest("Não inscrito no evento!");
    }

    if (
      event.presentUsers.find(
        (presentUser) => presentUser.toString() === user._id.toString()
      )
    ) {
      throw new createError.BadRequest("Presença já existente!");
    }

    const now = Date.now();

    const newStartedDateObj = new Date(event.startDate);
    newStartedDateObj.setMinutes(newStartedDateObj.getMinutes() - 5);

    const newEndDateObj = new Date(event.endDate);
    newEndDateObj.setMinutes(newEndDateObj.getMinutes() + 5);

    if (now > newStartedDateObj.getDate() && now < newEndDateObj.getDate()) {
      event.presentUsers.push(user);
      addHousePoints(userHouse, event.type === "Minicurso" ? 30 : 10);
      await userHouse.save();
      await event.save();
      await user.save();

      return { message: "Presença salva com sucesso!" };
    }
    if (now < newStartedDateObj.getDate()) {
      throw new createError.BadRequest("O evento ainda não começou!");
    }
    throw new createError.BadRequest("O evento já terminou!");
  },
  subscribe: async (eventId, user, info) => {
    const event = await eventService.getOne(eventId);
    const numberOfSubscribes = await subscriptionService.count({
      event: eventId,
    });

    if (numberOfSubscribes >= event.maxOfSubscriptions) {
      throw new createError.BadRequest(`O evento está cheio!`);
    }

    const subscriptions = await SubscriptionModel.find({
      user: user.id,
    }).populate("event");

    if (
      event.type !== "Contest" &&
      subscriptions.find((subscription) => {
        return (
          new Date(subscription.event.startDate).getTime() ===
          new Date(event.startDate).getTime() &&
          new Date(subscription.event.endDate).getTime() ===
          new Date(event.endDate).getTime() &&
          subscription.event.type === event.type
        );
      })
    ) {
      throw new createError.BadRequest(
        `O usuário já esta inscrito em um evento nesse horário!`
      );
    }

    await subscriptionService.create(user.id, event.id, info, true);

    return { message: "Inscrição salva com sucesso!" };
  },
  unsubscribe: async (eventId, user) => {
    await subscriptionService.delete({ event: eventId, user: user.id });

    return { message: "Inscrição removida com sucesso!" };
  },
  get: async (filter) => {
    const events = await EventModel.find(filter);

    return events;
  },
  getOne: async (id) => {
    const event = await EventModel.findById(id);

    if (!event) {
      throw new createError.NotFound(
        `Não foi encontrado evento com o id ${id}`
      );
    }

    return event;
  },
  create: async ({
    name,
    description,
    speaker,
    maxOfSubscriptions,
    link,
    startDate,
    endDate,
    type,
    isInGroup,
    showOnSchedule,
    showOnSubscribables,
    showStream,
  }) => {
    const newEvent = new EventModel() as any;

    newEvent._id = new ObjectId();
    newEvent.name = name;
    newEvent.description = description;
    newEvent.speaker = speaker;
    newEvent.maxOfSubscriptions = maxOfSubscriptions;
    newEvent.link = link;
    newEvent.startDate = startDate;
    newEvent.endDate = endDate;
    newEvent.type = type;
    newEvent.presentUsers = [];
    newEvent.isInGroup = isInGroup;
    newEvent.showOnSchedule = showOnSchedule;
    newEvent.showOnSubscribables = showOnSubscribables;
    newEvent.showStream = showStream;

    await newEvent.save();

    return newEvent;
  },
  update: async (
    id,
    {
      name,
      description,
      speaker,
      maxOfSubscriptions,
      link,
      startDate,
      endDate,
      type,
      isInGroup,
      showOnSchedule,
      showOnSubscribables,
      showStream,
    }
  ) => {
    const updatedEvent = await EventModel.findByIdAndUpdate(
      id,
      {
        name,
        description,
        speaker,
        maxOfSubscriptions,
        link,
        startDate,
        endDate,
        type,
        isInGroup,
        showOnSchedule,
        showOnSubscribables,
        showStream,
      },
      { new: true }
    );

    return updatedEvent;
  },
  delete: async (id) => {
    const deletedEvent = await EventModel.findByIdAndDelete(id);

    await subscriptionService.delete({ event: id });

    return deletedEvent;
  },
};

export default eventService;
