import nodemailer from "nodemailer";

const { env } = process;

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    type: 'OAuth2',
    user: env.GMAIL_EMAIL,
    clientId: env.GMAIL_CLIENT_ID,
    clientSecret: env.GMAIL_CLIENT_SECRET,
    refreshToken: env.GMAIL_REFRESH_TOKEN,
  }
});

export const sendEmail = async function (to, subject, text, html) {
  await transporter.sendMail({
    from: '"Semcomp ❤" <noreply.semcomp@gmail.com>',
    to,
    subject,
    text,
    html,
  });
};
