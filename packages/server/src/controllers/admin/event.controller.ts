import {
  handleValidationResult,
} from "../../lib/handle-validation-result";
import { handleError } from "../../lib/handle-error";
import eventService from "../../services/event.service";
import subscriptionService from "../../services/subscription.service";
import attendanceService from "../../services/attendance.service";
import userService from "../../services/user.service";

export default {
  list: async (req, res, next) => {
    try {
      const events: any = await eventService.find();

      for (const event of events) {
        const eventAttendances = await attendanceService.find({ eventId: event.id });

        event.attendances = []
        for (const eventAttendance of eventAttendances) {
          const user = await userService.findById(eventAttendance.userId);
          event.attendances.push(user);
        }

        const eventSubscriptions = await subscriptionService.find({ eventId: event.id });

        event.subscriptions = []
        for (const eventSubscription of eventSubscriptions) {
          const user = await userService.findById(eventSubscription.userId);
          event.subscriptions.push(user);
        }
      }

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
