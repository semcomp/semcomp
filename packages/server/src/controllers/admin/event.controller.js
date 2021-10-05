const createError = require("http-errors");

const EventModel = require("../../models/event");
const SubscriptionModel = require("../../models/subscription");

const {
  handleValidationResult,
} = require("../../lib/handle-validation-result");
const { handleError } = require("../../lib/handle-error");

module.exports = {
  list: async (req, res, next) => {
    try {
      const eventsFound = await EventModel.find().populate(
        "presentUsers",
        "name email nusp"
      );

      const events = [];
      for (const event of eventsFound) {
        const subscriptions = await SubscriptionModel.find({
          event: event.id,
        }).populate("user", "name email nusp");

        events.push({ ...event._doc, subscriptions });
      }

      return res.status(200).json(events);
    } catch (error) {
      return handleError(error, next);
    }
  },
  listSubscriptionsEmails: async (req, res, next) => {
    try {
      const eventsFound = await EventModel.find().populate(
        "presentUsers",
        "name email nusp"
      );

      const events = [];
      for (const event of eventsFound) {
        const subscriptions = await SubscriptionModel.find({
          event: event.id,
        }).populate("user", "name email nusp");

        events.push({ ...event._doc, subscriptions });
      }

      return res.status(200).json(events);
    } catch (error) {
      return handleError(error, next);
    }
  },
  create: async (req, res, next) => {
    try {
      handleValidationResult(req);

      const {
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
        needInfoOnSubscription,
      } = req.body;

      const createdEvent = new EventModel({
        name,
        description,
        speaker,
        maxOfSubscriptions,
        link,
        startDate,
        endDate,
        type,
        presentUsers: [],
        isInGroup,
        showOnSchedule,
        showOnSubscribables,
        showStream,
        needInfoOnSubscription,
      });
      await createdEvent.save();

      return res.status(200).send(createdEvent);
    } catch (error) {
      return handleError(error, next);
    }
  },
  update: async (req, res, next) => {
    try {
      handleValidationResult(req);

      const { id } = req.params;

      // self-invoking anonymous function. Returns the object it receives as argument
      const filteredBody = (({
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
        needInfoOnSubscription,
      }) => ({
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
        needInfoOnSubscription,
      }))(req.body);

      const newInfo = Object.keys(filteredBody).reduce((acc, key) => {
        const obj = acc;
        if (filteredBody[key] !== undefined) {
          obj[key] = filteredBody[key];
        }
        return obj;
      }, {});

      const updatedEvent = await EventModel.findByIdAndUpdate(id, {
        $set: newInfo,
      });

      return res.status(200).send(updatedEvent);
    } catch (error) {
      return handleError(error, next);
    }
  },
  delete: async (req, res, next) => {
    try {
      handleValidationResult(req);

      const { id } = req.params;

      const eventFound = await EventModel.findById(id);
      if (!eventFound) {
        throw new createError.NotFound();
      }

      await EventModel.findByIdAndDelete(id);

      return res.status(200).send(eventFound);
    } catch (error) {
      return handleError(error, next);
    }
  },
};
