import {
  handleValidationResult,
} from "../../lib/handle-validation-result";
import { handleError } from "../../lib/handle-error";
import eventService from "../../services/event.service";

export default {
  list: async (req, res, next) => {
    try {
      const events: any = await eventService.findWithInfo();

      return res.status(200).json(events);
    } catch (error) {
      return handleError(error, next);
    }
  },
  create: async (req, res, next) => {
    try {
      handleValidationResult(req);

      const event = req.body;

      const createdEvent = await eventService.create(event);

      return res.status(200).send(createdEvent);
    } catch (error) {
      return handleError(error, next);
    }
  },
  update: async (req, res, next) => {
    try {
      handleValidationResult(req);

      const { id } = req.params;

      const event = req.body;

      const foundEvent = await eventService.findById(id);
      const updatedEvent = await eventService.update({
        ...foundEvent,
        ...event,
      });

      return res.status(200).json(updatedEvent);
    } catch (error) {
      return handleError(error, next);
    }
  },
  delete: async (req, res, next) => {
    try {
      handleValidationResult(req);

      const { id } = req.params;

      const foundEvent = await eventService.findById(id);
      const deletedEvent = await eventService.delete(foundEvent);

      return res.status(200).send(deletedEvent);
    } catch (error) {
      return handleError(error, next);
    }
  },
};
