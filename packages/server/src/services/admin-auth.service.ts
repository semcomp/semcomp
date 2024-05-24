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
      throw new HttpError(409, ['Usuário existente.']);
    }

    const createdAdminUser = await adminUserService.create(adminUser);
    
    await emailService.send(
      createdAdminUser.email,
      "Bem vindo a Semcomp 2024!",
      `Você se cadastrou no nosso backoffice e já está tudo certo!!!`,
      `<div style={{ fontFamily: 'Arial, sans-serif', fontSize: '16px', lineHeight: '1.6' }}>
      <p>Você se cadastrou no nosso backoffice e já está tudo certo!!!</p>
      <div style={{ marginTop: '20px' }}>
        <h3 style={{ margin: '0', fontSize: '18px', fontWeight: 'bold', color: '#333' }}>
          Você se cadastrou no nosso app e já está tudo certo!!!
        </h3>
      </div>
    </div>`
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
      throw new HttpError(401, ['Credenciais inválidas.']);
    }

    return foundAdminUser;
  }

  public async forgotPassword(email: string): Promise<AdminUser> {
    const adminUser = await adminUserService.findOne({ email });
    if (!adminUser || !adminUser.password) {
      throw new HttpError(401, ['Credenciais inválidas.']);
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
      throw new HttpError(401,  ['Credenciais inválidas.']);
    }

    adminUser.password = bcrypt.hashSync(adminUser.password, bcrypt.genSaltSync(10));
    await adminUserService.update(adminUser);

    return adminUser;
  }

  public async authToDelete(adminUser: AdminUser): Promise<void> {
    const adminRoles = (await adminUserService.findById(adminUser.id)).adminRole;
    if (!adminRoles.includes("delete")) {
      throw new HttpError(403, ['Você não possui permissão para realizar exclusão.']);
    }
  }
}

export default new AdminAuthService();
