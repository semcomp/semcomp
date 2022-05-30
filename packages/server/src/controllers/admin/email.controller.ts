import { validationResult } from "express-validator";

import UserModel from "../../models/user";
import { sendEmail as sendEmailAdapter } from "../../lib/send-email";
import userService from "../../services/user.service";

export const sendEmail = async (req, res) => {
  const validationErrors = validationResult(req);
  if (!validationErrors.isEmpty()) {
    return res.status(400).json({ errors: validationErrors.array() });
  }

  try {
    const { subject, text, html } = req.body;

    const users = await userService.find();

    const promises = [];
    for (const user of users) {
      promises.push(sendEmailAdapter(user.email, subject, text, html));
    }

    await Promise.all(promises);

    return res.status(200).json();
  } catch (e) {
    if (e.statusCode) {
      return res.status(e.statusCode).json(e);
    }
    return res.status(500).json(e);
  }
};
