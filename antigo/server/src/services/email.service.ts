import nodemailer from "nodemailer";
import { google } from "googleapis";
import { OAuth2Client } from "googleapis-common";

const { env } = process;

class EmailService {
  private oAuth2Client: OAuth2Client;

  constructor() {
    this.oAuth2Client = new google.auth.OAuth2(
      process.env.GMAIL_CLIENT_ID,
      process.env.GMAIL_CLIENT_SECRET,
      process.env.GOOGLE_REDIRECT_URL,
    );
    this.oAuth2Client.setCredentials({ refresh_token: process.env.GMAIL_REFRESH_TOKEN });
  }

  public async send(to: string, subject: string, text: string, html: string): Promise<void> {
    const accessToken = await this.oAuth2Client.getAccessToken();
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        type: 'OAuth2',
        user: env.GMAIL_EMAIL,
        clientId: env.GMAIL_CLIENT_ID,
        clientSecret: env.GMAIL_CLIENT_SECRET,
        refreshToken: env.GMAIL_REFRESH_TOKEN,
        accessToken,
      }
    } as any);

    await transporter.sendMail({
      from: '"Semcomp ❤" <noreply.semcomp@gmail.com>',
      to,
      subject,
      text,
      html,
    });
  }
}

export default new EmailService();
