import crypto from "crypto";
import bcrypt from "bcryptjs";
import createError from "http-errors";
import 'dotenv/config'

import { sendEmail } from "../lib/send-email";
import JsonWebToken from "./json-web-token.service";
import userService from "./user.service";
import User from "../models/user";
import houseMemberService from "./house-member.service";
import Disability from "../lib/constants/disabilities-enum";

const tokenService = new JsonWebToken(process.env.JWT_PRIVATE_KEY, "30d");

class AuthService {
  public async createToken(user: User): Promise<string> {
    return tokenService.create({ data: { id: user.id } });
  }

  public async authenticate(token: string): Promise<User> {
    if (token) {
      token = token.replace("Bearer ", "");
      const decoded = tokenService.decode(token);

      const user = await userService.findById(decoded.id);

      return user;
    }
  }

  public async signup(user: User): Promise<User> {
    const foundUser = (await userService.find({ email: user.email }))[0];
    if (foundUser) {
      throw new createError.Unauthorized();
    }

    user.password = bcrypt.hashSync(user.password, bcrypt.genSaltSync(10));

    const createdUser = await userService.create(user);

    try {
      await houseMemberService.assignUserHouse(createdUser.id);
    } catch (error) {
      await userService.create(createdUser);
      throw error;
    }

    await sendEmail(
      createdUser.email,
      "Bem vindo à Semcomp 24!",
      `Você se cadastrou no nosso site e já está tudo certo!
      Aperte os cintos porque estamos prestes a levantar voo (ainda que dentro de casa). Pegue seus fones de ouvido e separe seu computador e celular para assistir às palestras e minicursos que estão chegando.
      Fique de olho no nosso site (https://semcomp.icmc.usp.br/), Facebook (https://www.facebook.com/Semcomp), Youtube (https://www.youtube.com/channel/UCPF97UIRX8AnkS9gU907g1Q) e Instagram (https://www.instagram.com/semcompusp/) para não perder nenhum detalhe da programação incrível que preparamos para você.
      Nos vemos no sábado dia 25/09! Até mais!`,
      `<div>
      <h1>Voc&ecirc;&nbsp;se&nbsp;cadastrou&nbsp;no&nbsp;nosso&nbsp;site&nbsp;e&nbsp;j&aacute;&nbsp;est&aacute;&nbsp;tudo&nbsp;certo!</h1>
      <p>Aperte&nbsp;os&nbsp;cintos&nbsp;porque&nbsp;estamos&nbsp;prestes&nbsp;a&nbsp;levantar&nbsp;voo&nbsp;(ainda&nbsp;que&nbsp;dentro&nbsp;de&nbsp;casa).&nbsp;Pegue&nbsp;seus&nbsp;fones&nbsp;de&nbsp;ouvido&nbsp;e&nbsp;separe&nbsp;seu&nbsp;computador&nbsp;e&nbsp;celular&nbsp;para&nbsp;assistir&nbsp;&agrave;s&nbsp;palestras&nbsp;e&nbsp;minicursos&nbsp;que&nbsp;est&atilde;o&nbsp;chegando.</p>
      <p>Fique&nbsp;de&nbsp;olho&nbsp;no&nbsp;nosso&nbsp;site&nbsp;(<a href="https://semcomp.icmc.usp.br/">https://semcomp.icmc.usp.br/</a>),&nbsp;Facebook&nbsp;(<a href="https://www.facebook.com/Semcomp">https://www.facebook.com/Semcomp</a>),&nbsp;Youtube&nbsp;(<a href="https://www.youtube.com/channel/UCPF97UIRX8AnkS9gU907g1Q">https://www.youtube.com/channel/UCPF97UIRX8AnkS9gU907g1Q</a>)&nbsp;e&nbsp;Instagram&nbsp;(<a href="https://www.instagram.com/semcompusp/">https://www.instagram.com/semcompusp/</a>)&nbsp;para&nbsp;n&atilde;o&nbsp;perder&nbsp;nenhum&nbsp;detalhe&nbsp;da&nbsp;programa&ccedil;&atilde;o&nbsp;incr&iacute;vel&nbsp;que&nbsp;preparamos&nbsp;para&nbsp;voc&ecirc;.</p>
      <p>Nos&nbsp;vemos&nbsp;no&nbsp;sábado&nbsp;dia&nbsp;25/09!&nbsp;At&eacute;&nbsp;mais!</p>
      </div>`
    );

    return createdUser;
  }

  public async signupUspSecondStep(
    user: User,
    course: string,
    discord: string,
    userTelegram: string,
    permission: boolean,
    disabilities: Disability[],
  ): Promise<void> {
    user.course = course;
    user.discord = discord;
    user.telegram = userTelegram;
    user.permission = permission;
    await userService.update(user);
    await houseMemberService.assignUserHouse(user.id);

    await sendEmail(
      user.email,
      "Bem vindo à Semcomp 24!",
      `Você se cadastrou no nosso site e já está tudo certo!
      Aperte os cintos porque estamos prestes a levantar voo (ainda que dentro de casa). Pegue seus fones de ouvido e separe seu computador e celular para assistir às palestras e minicursos que estão chegando.
      Fique de olho no nosso site (https://semcomp.icmc.usp.br/), Facebook (https://www.facebook.com/Semcomp), Youtube (https://www.youtube.com/channel/UCPF97UIRX8AnkS9gU907g1Q) e Instagram (https://www.instagram.com/semcompusp/) para não perder nenhum detalhe da programação incrível que preparamos para você.
      Nos vemos no sábado dia 19/06! Até mais!`,
      `<div>
      <h1>Voc&ecirc;&nbsp;se&nbsp;cadastrou&nbsp;no&nbsp;nosso&nbsp;site&nbsp;e&nbsp;j&aacute;&nbsp;est&aacute;&nbsp;tudo&nbsp;certo!</h1>
      <p>Aperte&nbsp;os&nbsp;cintos&nbsp;porque&nbsp;estamos&nbsp;prestes&nbsp;a&nbsp;levantar&nbsp;voo&nbsp;(ainda&nbsp;que&nbsp;dentro&nbsp;de&nbsp;casa).&nbsp;Pegue&nbsp;seus&nbsp;fones&nbsp;de&nbsp;ouvido&nbsp;e&nbsp;separe&nbsp;seu&nbsp;computador&nbsp;e&nbsp;celular&nbsp;para&nbsp;assistir&nbsp;&agrave;s&nbsp;palestras&nbsp;e&nbsp;minicursos&nbsp;que&nbsp;est&atilde;o&nbsp;chegando.</p>
      <p>Fique&nbsp;de&nbsp;olho&nbsp;no&nbsp;nosso&nbsp;site&nbsp;(<a href="https://semcomp.icmc.usp.br/">https://semcomp.icmc.usp.br/</a>),&nbsp;Facebook&nbsp;(<a href="https://www.facebook.com/Semcomp">https://www.facebook.com/Semcomp</a>),&nbsp;Youtube&nbsp;(<a href="https://www.youtube.com/channel/UCPF97UIRX8AnkS9gU907g1Q">https://www.youtube.com/channel/UCPF97UIRX8AnkS9gU907g1Q</a>)&nbsp;e&nbsp;Instagram&nbsp;(<a href="https://www.instagram.com/semcompusp/">https://www.instagram.com/semcompusp/</a>)&nbsp;para&nbsp;n&atilde;o&nbsp;perder&nbsp;nenhum&nbsp;detalhe&nbsp;da&nbsp;programa&ccedil;&atilde;o&nbsp;incr&iacute;vel&nbsp;que&nbsp;preparamos&nbsp;para&nbsp;voc&ecirc;.</p>
      <p>Nos&nbsp;vemos&nbsp;no&nbsp;sábado&nbsp;dia&nbsp;19/06!&nbsp;At&eacute;&nbsp;mais!</p>
      </div>`
    );
  }

  public async login(email: string, password: string): Promise<User> {
    const foundUser = (await userService.find({ email }))[0];
    if (
      !foundUser ||
      !foundUser.password ||
      !bcrypt.compareSync(password, foundUser.password)
    ) {
      throw new createError.Unauthorized();
    }

    return foundUser;
  }

  public async forgotPassword(email: string): Promise<void> {
    const user = (await userService.find({ email }))[0];
    if (!user || !user.password) {
      throw new createError.Unauthorized();
    }

    const code = crypto.randomBytes(6).toString("hex");

    user.resetPasswordCode = code;
    await userService.update(user);

    await sendEmail(
      user.email,
      "Recuperação de Senha",
      `Seu código para recuperação de senha: ${user.resetPasswordCode}`,
      `<div>
      <h1>Seu&nbsp;c&oacute;digo&nbsp;para&nbsp;recupera&ccedil;&atilde;o&nbsp;de&nbsp;senha:&nbsp;${user.resetPasswordCode}</h1>
      </div>`
    );
  }

  public async resetPassword(email: string, code: string, password: string) {
    const user = (await userService.find({ email }))[0];
    if (
      !user ||
      !user.password ||
      code !== user.resetPasswordCode
    ) {
      throw new createError.Unauthorized();
    }

    user.password = bcrypt.hashSync(user.password, bcrypt.genSaltSync(10));
    await userService.update(user);

    return user;
  }

  public async authenticateUser(nusp: string, email: string, name: string): Promise<User> {
    let currentUser = (await userService.find({ nusp, email }))[0];

    if (!currentUser) {
      currentUser = {
        nusp,
        email,
        name,
      };
      await userService.create(currentUser);
    }

    return currentUser;
  }
}

export default new AuthService();
