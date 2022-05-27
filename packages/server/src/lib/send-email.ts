import nodemailer from "nodemailer";

const { env } = process;

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: env.EMAIL,
    pass: env.PASSWORD,
  },
});

export const sendEmail = async function (to, subject, text, html) {
  // await transporter.sendMail({
  //   from: '"Semcomp ❤" <noreply.semcomp@gmail.com>',
  //   to,
  //   subject,
  //   text,
  //   html,
  // });
};
