const { validationResult } = require("express-validator");

const UserModel = require("../../models/user");
const { sendEmail } = require("../../lib/send-email");

module.exports.sendEmail = async (req, res) => {
  const validationErrors = validationResult(req);
  if (!validationErrors.isEmpty()) {
    return res.status(400).json({ errors: validationErrors.array() });
  }

  try {
    const { subject, text, html } = req.body;

    const users = await UserModel.find().select("email");

    const promises = [];
    for (let i = 0; i < users.length; i += 1) {
      promises.push(sendEmail(users[i].email, subject, text, html));
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
