import eventService from "../services/event.service";

import { handleValidationResult } from "../lib/handle-validation-result";
import { handleError } from "../lib/handle-error";

const eventController = {
  getInfo: async (req, res, next) => {
    try {
      const events = await eventService.getInfo(req.user?.id);

      return res.status(200).json(events);
    } catch (error) {
      return handleError(error, next);
    }
  },
  getCurrent: async (req, res, next) => {
    try {
      const event = await eventService.getCurrent(req.user?.id);

      return res.status(200).json(event);
    } catch (error) {
      return handleError(error, next);
    }
  },
  getSubscribables: async (req, res, next) => {
    try {
      const events = await eventService.getSubscribables(req.user.id);

      return res.status(200).json(events);
    } catch (error) {
      return handleError(error, next);
    }
  },
  getOne: async (req, res, next) => {
    try {
      handleValidationResult(req);

      const { id } = req.params;

      const event = await eventService.find(id);

      return res.status(200).json(event);
    } catch (error) {
      return handleError(error, next);
    }
  },
  markPresence: async (req, res, next) => {
    try {
      const { eventId } = req.params;

      const presence = await eventService.markAttendance(eventId, req.user.id);

      return res.status(200).json(presence);
    } catch (error) {
      return handleError(error, next);
    }
  },
  subscribe: async (req, res, next) => {
    try {
      const { eventId } = req.params;
      const { info } = req.body;

      const subscription = await eventService.subscribe(
        eventId,
        req.user.id,
        info
      );

      return res.status(200).json(subscription);
    } catch (error) {
      return handleError(error, next);
    }
  },
  unsubscribe: async (req, res, next) => {
    try {
      const { eventId } = req.params;

      const subscription = await eventService.unsubscribe(eventId, req.user.id);

      return res.status(200).json(subscription);
    } catch (error) {
      return handleError(error, next);
    }
  },
};

export default eventController;
