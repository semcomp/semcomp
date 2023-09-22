import {
    handleValidationResult,
  } from "../../lib/handle-validation-result";
  import { handleError } from "../../lib/handle-error";
  import eventService from "../../services/event.service";
  import subscriptionService from "../../services/subscription.service";
  import { PaginationRequest } from "../../lib/pagination";
  
  class SubscriptionController {
    public async findByEventId(req, res, next) {
        try {
            handleValidationResult(req);
      
            const { eventId } = req.params;

            const eventsSubscriptions = await subscriptionService.find();

            const subs = eventsSubscriptions.filter((subscription) => {
              return subscription.eventId === eventId;
            }).length;
      
            return res.status(200).json(subs);
          } catch (error) {
            return handleError(error, next);
          }
        return 0;
    }
  
}
  
export default new SubscriptionController();
  