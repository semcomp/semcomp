import {
  handleValidationResult,
} from "../../lib/handle-validation-result";
import { handleError } from "../../lib/handle-error";
import eventService from "../../services/event.service";
import userService from "../../services/user.service";
import { PaginationRequest } from "../../lib/pagination";

class EventController {
  public async list(req, res, next) {
    try {
      const pagination = new PaginationRequest(
        +req.query.page,
        +req.query.items,
      );

      const events = await eventService.findWithInfo({ pagination });

      return res.status(200).json(events);
    } catch (error) {
      return handleError(error, next);
    }
  }

  public async create(req, res, next) {
    try {
      handleValidationResult(req);

      const event = req.body;

      const createdEvent = await eventService.create(event);

      return res.status(200).send(createdEvent);
    } catch (error) {
      return handleError(error, next);
    }
  }

  public async update(req, res, next) {
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
  }

  public async delete(req, res, next) {
    try {
      handleValidationResult(req);

      const { id } = req.params;

      const foundEvent = await eventService.findById(id);
      const deletedEvent = await eventService.delete(foundEvent);

      return res.status(200).send(deletedEvent);
    } catch (error) {
      return handleError(error, next);
    }
  }

  public async markUserAttendanceBulk(req, res, next) {
    try {
      const { eventId } = req.params;
      const { emails } = req.body;

      const users = await userService.find({
        filters: { email: emails },
        pagination: new PaginationRequest(1, 9999),
      });
      console.log(users);

      for (const user of users.getEntities()) {
        console.log(user.id);
        await eventService.markAttendance(eventId, user.id, null);
      }

      return res.status(200).json();
    } catch (error) {
      return handleError(error, next);
    }
  }

  public async listUsersAttendancesInfo(req, res, next) {
    try {
      const usersAttendancesInfo = await eventService.listUsersAttendancesInfo();

      return res.status(200).json(usersAttendancesInfo);
    } catch (error) {
      return handleError(error, next);
    }
  }

  public async markUserAttendance(req, res, next) {
    try {
      const { eventId } = req.params;
      const { userId } = req.body;

      const attendance = await eventService.markAttendance(eventId, userId, null);

      return res.status(200).json(attendance);
    } catch (error) {
      return handleError(error, next);
    }
  }
}

export default new EventController();
