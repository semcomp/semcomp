import crypto from "crypto";
import bcrypt from "bcryptjs";
import { config } from "dotenv";
config({ path: `./config/env/${process.env.NODE_ENV === "production" ? "production" : "development"}.env` });

import JsonWebToken from "./json-web-token.service";
import HttpError from "../lib/http-error";
import AdminUser from "../models/admin-user";
import adminUserService from "./admin-user.service";
import emailService from "./email.service";

const tokenService = new JsonWebToken(process.env.JWT_PRIVATE_KEY, "30d");

class AdminAuthService {
  public async createToken(adminUser: AdminUser): Promise<string> {
    return tokenService.create({ data: { id: adminUser.id } });
  }

  public async authenticate(token: string): Promise<AdminUser> {
    if (!token) {
      return;
    }

    token = token.replace("Bearer ", "");
    const decoded = tokenService.decode(token);

    const adminUser = await adminUserService.findById(decoded.id);

    return adminUser;
  }

  public async signup(adminUser: AdminUser): Promise<AdminUser> {
    const foundAdminAdminUser = await adminUserService.findOne({ email: adminUser.email });
    if (foundAdminAdminUser) {
      throw new HttpError(401, ['Usuário existente.']);
    }

    const createdAdminUser = await adminUserService.create(adminUser);
    
    await emailService.send(
      createdAdminUser.email,
      "Bem vindo a Semcomp 2023!",
      `Você se cadastrou no nosso backoffice e já está tudo certo!!!`,
      `<div><h1>Voc&ecirc;&nbsp;se&nbsp;cadastrou&nbsp;no&nbsp;nosso&nbsp;app&nbsp;e&nbsp;j&aacute;&nbsp;est&aacute;&nbsp;tudo&nbsp;certo!!!</h1></div>`
    );

    return createdAdminUser;
  }

  public async login(email: string, password: string): Promise<AdminUser> {
    const foundAdminUser = await adminUserService.findOne({ email });
    if (
      !foundAdminUser ||
      !foundAdminUser.password ||
      !bcrypt.compareSync(password, foundAdminUser.password)
    ) {
      throw new HttpError(401, []);
    }

    return foundAdminUser;
  }

  public async forgotPassword(email: string): Promise<AdminUser> {
    const adminUser = await adminUserService.findOne({ email });
    if (!adminUser || !adminUser.password) {
      throw new HttpError(401, []);
    }

    const code = crypto.randomBytes(6).toString("hex");

    adminUser.resetPasswordCode = code;
    await adminUserService.update(adminUser);

    await emailService.send(
      adminUser.email,
      "Recuperação de Senha",
      `Seu código para recuperação de senha: ${adminUser.resetPasswordCode}`,
      `<div><h1>Seu&nbsp;c&oacute;digo&nbsp;para&nbsp;recupera&ccedil;&atilde;o&nbsp;de&nbsp;senha:&nbsp;${adminUser.resetPasswordCode}</h1></div>`
    );

    return adminUser;
  }

  public async resetPassword(email: string, code: string, password: string): Promise<AdminUser> {
    const adminUser = await adminUserService.findOne({ email });
    if (
      !adminUser ||
      !adminUser.password ||
      code !== adminUser.resetPasswordCode
    ) {
      throw new HttpError(401, []);
    }

    adminUser.password = bcrypt.hashSync(adminUser.password, bcrypt.genSaltSync(10));
    await adminUserService.update(adminUser);

    return adminUser;
  }
}

export default new AdminAuthService();
