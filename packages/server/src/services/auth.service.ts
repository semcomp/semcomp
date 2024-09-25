import crypto from "crypto";
import bcrypt from "bcryptjs";
import { config } from "dotenv";
config({
  path: `./config/env/${process.env.NODE_ENV === "production" ? "production" : "development"}.env`,
});

import JsonWebToken from "./json-web-token.service";
import userService from "./user.service";
import User from "../models/user";
import houseMemberService from "./house-member.service";
import Disability from "../lib/constants/disability-enum";
import HttpError from "../lib/http-error";
import userDisabilityService from "./user-disability.service";
import UserDisability from "../models/user-disability";
import emailService from "./email.service";
import ConfigService from "./config.service";

const tokenService = new JsonWebToken(process.env.JWT_PRIVATE_KEY, "30d");

class AuthService {
  public async createToken(user: User): Promise<string> {
    return tokenService.create({ data: { id: user.id } });
  }

  public async authenticate(token: string): Promise<User> {
    if (!token) {
      return;
    }

    token = token.replace("Bearer ", "");
    const decoded = tokenService.decode(token);

    const user = await userService.findById(decoded.id);

    return user;
  }

  public async signup(user: User, disabilities: Disability[]): Promise<User> {
    const config = await ConfigService.getOne();
    if (config === undefined) {
      throw new HttpError(401, ["Erro ao acessar as Configs(auth.service.ts)"]);
    }
    if (!config.openSignup) {
      throw new HttpError(503, ["Inscrições encerradas!"]);
    }

    const foundUser = await userService.findOne({ email: user.email });
    if (foundUser) {
      throw new HttpError(401, []);
    }

    const createdUser = await userService.create(user);

    try {
      await houseMemberService.assignUserHouse(createdUser.id);
    } catch (error) {
      await userService.delete(createdUser);
      throw error;
    }

    for (const disability of disabilities) {
      const userDisability: UserDisability = {
        userId: createdUser.id,
        disability,
      };
      await userDisabilityService.create(userDisability);
    }
    try {
      await emailService.send(
        createdUser.email,
        "Bem vinde à Semcomp 27!",
        `Você se cadastrou no nosso site e já está tudo certo!
        Se prepare para a 27° edição da maior Semana de Computação do Brasil! Aproveite o melhor das nossas palestras, minicursos, concursos e eventos culturais!
        Fique de olho no nosso site (https://semcomp.icmc.usp.br/), Twitter (https://twitter.com/semcomp), e Instagram (https://www.instagram.com/semcomp/) para não perder nenhum detalhe da programação incrível que preparamos especialmente para VOCÊ!`,
        `<div>
        <h1>Voc&ecirc; se cadastrou no nosso site e j&aacute; est&aacute; tudo certo!</h1>
        <p>Se prepare para a 27&deg; edi&ccedil;&atilde;o da maior Semana de Computa&ccedil;&atilde;o do Brasil! Aproveite o melhor das nossas palestras, minicursos, concursos e eventos culturais!</p>
        <p>Fique de olho no nosso <a href="https://semcomp.icmc.usp.br/">site</a>, <a href="https://twitter.com/semcomp">Twitter</a>, e <a href="https://www.instagram.com/semcomp/">Instagram</a>&nbsp;para n&atilde;o perder nenhum detalhe da programa&ccedil;&atilde;o incr&iacute;vel que preparamos especialmente para VOC&Ecirc;!</p>
        </div>`,
      );
    } catch {}

    return createdUser;
  }

  public async login(email: string, password: string): Promise<User> {
    const foundUser = await userService.findOne({ email });
    if (
      !foundUser ||
      !foundUser.password ||
      !bcrypt.compareSync(password, foundUser.password)
    ) {
      throw new HttpError(401, ["Usuário não encontrado"]);
    }

    return foundUser;
  }

  public async forgotPassword(email: string): Promise<User> {
    const user = await userService.findOne({ email });
    if (!user || !user.password) {
      throw new HttpError(401, []);
    }

    const code = crypto.randomBytes(6).toString("hex");

    user.resetPasswordCode = code;
    await userService.update(user);

    try {
      await emailService.send(
        user.email,
        "Recuperação de Senha",
        `Seu código para recuperação de senha: ${user.resetPasswordCode}`,
        `<div>
        <h1>Seu&nbsp;c&oacute;digo&nbsp;para&nbsp;recupera&ccedil;&atilde;o&nbsp;de&nbsp;senha:&nbsp;${user.resetPasswordCode}</h1>
        </div>`,
      );
    } catch (e) {
      console.log(e);
      throw new HttpError(503, []);
    }

    return user;
  }

  public async resetPassword(
    email: string,
    code: string,
    password: string,
  ): Promise<User> {
    const user = await userService.findOne({ email });
    if (!user || !user.password || code !== user.resetPasswordCode) {
      throw new HttpError(401, []);
    }

    user.password = bcrypt.hashSync(password, bcrypt.genSaltSync(10));
    await userService.update(user);

    return user;
  }
}

export default new AuthService();
