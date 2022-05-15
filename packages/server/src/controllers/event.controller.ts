import eventService from "../services/event.service";

import { formatEvent } from "../lib/format-event";
import { handleValidationResult } from "../lib/handle-validation-result";
import { handleError } from "../lib/handle-error";

/**
 * formatEventResponse
 *
 * @param {object} event
 *
 * @return {object}
 */
function formatEventResponse(event) {
  return formatEvent(event, [
    "_id",
    "name",
    "description",
    "speaker",
    "link",
    "startDate",
    "endDate",
    "type",
  ]);
}

const eventController = {
  getInfo: async (req, res, next) => {
    try {
      const events = await eventService.getInfo(req.user);

      return res.status(200).json(events);
    } catch (error) {
      return handleError(error, next);
    }
  },
  getCurrent: async (req, res, next) => {
    try {
      const event = await eventService.getCurrent(req.user);

      return res.status(200).json(event);
    } catch (error) {
      return handleError(error, next);
    }
  },
  getSubscribables: async (req, res, next) => {
    try {
      const events = await eventService.getSubscribables(req.user);

      return res.status(200).json(events);
    } catch (error) {
      return handleError(error, next);
    }
  },
  getOne: async (req, res, next) => {
    try {
      handleValidationResult(req);

      const { id } = req.params;

      const event = await eventService.get(id);

      return res.status(200).json(formatEventResponse(event));
    } catch (error) {
      return handleError(error, next);
    }
  },
  markPresence: async (req, res, next) => {
    try {
      const { eventId } = req.params;

      const presence = await eventService.markPresence(
        eventId,
        req.user,
        req.userHouse
      );

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
        req.user,
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

      const subscription = await eventService.unsubscribe(eventId, req.user);

      return res.status(200).json(subscription);
    } catch (error) {
      return handleError(error, next);
    }
  },
};

export default eventController;
