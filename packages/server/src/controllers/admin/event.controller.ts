import {
  handleValidationResult,
} from "../../lib/handle-validation-result";
import { handleError } from "../../lib/handle-error";
import eventService from "../../services/event.service";
import userService from "../../services/user.service";
import { PaginationRequest } from "../../lib/pagination";
import saleService from "../../services/sale.service";
import PaymentServiceImpl from "../../services/payment-impl.service";
import PaymentStatus from "../../lib/constants/payment-status-enum";

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

  public async calcTotalTimeByEventType(req, res, next) {
    try {
      handleValidationResult(req);

      const { eventType } = req.body;
      const totalTime = await eventService.calcTotalTimeByEventType(eventType);

      return res.status(200).json({ totalTime: totalTime });
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

      for (const user of users.getEntities()) {
        try {
          await eventService.markAttendance(eventId, user.id);
        } catch (markAttendanceError) {
          console.log(markAttendanceError);
        }
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

  public async listUsersAttendancesInfoByEventId(req, res, next) {
    try {
      const { eventId } = req.params;
      const usersAttendancesInfo = await eventService.listUsersAttendancesInfoByEvent(eventId);

      return res.status(200).json(usersAttendancesInfo);
    } catch (error) {
      return handleError(error, next);
    }
  }

  public async markUserAttendance(req, res, next) {
    try {
      const { eventId } = req.params;
      const { userId } = req.body;

      const attendance = await eventService.markAttendance(eventId, userId);

      return res.status(200).json(attendance);
    } catch (error) {
      return handleError(error, next);
    }
  }

  public async getCoffeePermission(req, res, next) {
    try {
      // Pega o userId e coffeeItemId do corpo da requisição
      const { userId, coffeeItemId } = req.body;
      
      // Busca os pagamentos do usuário
      const userPayments = await new PaymentServiceImpl(null, null, null, null).findByUserId(userId);
      if (!userPayments || userPayments.length === 0) {
        // Se não houver pagamentos, retorne a resposta que o acesso ao coffee não é permitido
        return res.status(200).json(false);
      }

      // Filtra os pagamentos aprovados
      const approvedPayments = userPayments.filter(payment => payment.status === PaymentStatus.APPROVED);
      if (approvedPayments.length === 0) {
        return res.status(200).json(false);
      }

      // Para cada pagamento
      for (const payment of approvedPayments) {
        // Para cada saleOption, busque a venda correspondente
        for (const saleId of payment.salesOption) {
          try {
            const sale = await saleService.findById(saleId);
            // Verifica se algum dos itens é igual ao coffeeItemId
            if (sale && sale.items.some(item => item === coffeeItemId)) {
              return res.status(200).json(true); 
            }
          } catch (error) {
            console.log(`Venda não encontrada para o ID: ${saleId}, Error: ${error}`);
          }
        }
      }

      return res.status(200).json(false);
    } catch (error) {
      return handleError(error, next);
    }
  }


  public async getCoffeeOptions(req, res, next) {
    try {
      const options = await saleService.getItemsCoffee();
      return res.status(200).json(options);
    } catch (error) {
      return handleError(error, next);
    }
  }

  public async createAttendanceQrCode(req, res, next) {
    try {
      const { eventId } = req.params;

      const qrCode = await eventService.createAttendanceQrCode(eventId);

      return res.status(200).json(qrCode);
    } catch (error) {
      return handleError(error, next);
    }
  }
}

export default new EventController();
