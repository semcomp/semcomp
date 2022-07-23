import nodemailer from "nodemailer";

const { env } = process;

class EmailService {
  private transporter: nodemailer.Transporter;

  constructor() {
    this.transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        type: 'OAuth2',
        user: env.GMAIL_EMAIL,
        clientId: env.GMAIL_CLIENT_ID,
        clientSecret: env.GMAIL_CLIENT_SECRET,
        refreshToken: env.GMAIL_REFRESH_TOKEN,
      }
    });
  }

  public async send(to: string, subject: string, text: string, html: string): Promise<void> {
    await this.transporter.sendMail({
      from: '"Semcomp ❤" <noreply.semcomp@gmail.com>',
      to,
      subject,
      text,
      html,
    });
  }
}

export default new EmailService();
