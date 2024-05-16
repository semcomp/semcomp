import {
    handleValidationResult,
  } from "../../lib/handle-validation-result";
  import { handleError } from "../../lib/handle-error";
  import eventService from "../../services/event.service";
  import subscriptionService from "../../services/subscription.service";
  import { PaginationRequest } from "../../lib/pagination";
  import userService from "../../services/user.service";
  
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

    public async getUsersByEvent(req, res, next) {
      try {
          handleValidationResult(req);
    
          const { eventId } = req.params;
          console.log(eventId);
          
          const eventsSubscriptions = await subscriptionService.find();
          console.log(eventsSubscriptions);
          
          const subscriptions = eventsSubscriptions.filter((subscription) => {
            return subscription.eventId === eventId;
          });
          console.log('Event Subs', subscriptions);
          
          
          let users = [];
          for(const subscription of subscriptions) {
            const user = await userService.findById(subscription.userId);
            console.log(user);
            users.push({"Name": user.name, "E-mail": user.email});
          }

          console.log(users);
          return res.status(200).json(users);
        } catch (error) {
          return handleError(error, next);
        }
      return 0;
  }
  
}
  
export default new SubscriptionController();
  