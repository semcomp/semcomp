import userService from "../../services/user.service";
import { handleError } from "../../lib/handle-error";
import { handleValidationResult } from "../../lib/handle-validation-result";
import emailService from "../../services/email.service";
import { PaginationRequest } from "../../lib/pagination";

class EmailController {
  public async send(req, res, next) {
    handleValidationResult(req);

    try {
      const { subject, text, html } = req.body;

      const users = await userService.find({ pagination: new PaginationRequest(1, 9999) });

      const promises = [];
      for (const user of users.getEntities()) {
        promises.push(emailService.send(user.email, subject, text, html));
      }

      await Promise.all(promises);

      return res.status(200).json();
    } catch (error) {
      return handleError(error, next);
    }
  };
}

export default new EmailController();
