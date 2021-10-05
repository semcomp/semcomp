const nodemailer = require("nodemailer");

const { env } = process;

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: env.EMAIL,
    pass: env.PASSWORD,
  },
});

module.exports.sendEmail = async function (to, subject, text, html) {
  await transporter.sendMail({
    from: '"Semcomp ❤" <noreply.semcomp@gmail.com>',
    to,
    subject,
    text,
    html,
  });
};
