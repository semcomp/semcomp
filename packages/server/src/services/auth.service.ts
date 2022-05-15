import crypto from "crypto";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import createError from "http-errors";

import { sendEmail } from "../lib/send-email";
import { assignUserHouse } from "../lib/assign-user-house";
import UserModel from "../models/user";

const authService = {
  createToken: (user) => {
    return jwt.sign({ data: { id: user._id } }, process.env.JWT_PRIVATE_KEY, {
      expiresIn: "30d",
    });
  },
  signup: async (
    email,
    name,
    password,
    course,
    discord,
    userTelegram,
    permission,
    disabilities
  ) => {
    const foundUser = await UserModel.findOne({ email });
    if (foundUser) {
      throw new createError.Unauthorized();
    }

    const createdUser = new UserModel({
      email,
      nusp: null,
      name,
      password,
      course,
      discord,
      userTelegram,
      permission,
      disabilities,
    }) as any;
    await createdUser.save();
    await assignUserHouse(createdUser.id);

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
  },
  signupUspSecondStep: async (
    user,
    course,
    discord,
    userTelegram,
    permission,
    disabilities
  ) => {
    user.course = course;
    user.discord = discord;
    user.userTelegram = userTelegram;
    user.permission = permission;
    user.disabilities = disabilities;
    await user.save();
    await assignUserHouse(user.id);

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
  },
  login: async (email, password) => {
    const foundUser = await UserModel.findOne({ email }).populate("house");
    if (
      !foundUser ||
      !foundUser.password ||
      !bcrypt.compareSync(password, foundUser.password)
    ) {
      throw new createError.Unauthorized();
    }

    return foundUser;
  },
  forgotPassword: async (email) => {
    const foundUser = await UserModel.findOne({ email });
    if (!foundUser || !foundUser.password) {
      throw new createError.Unauthorized();
    }

    const code = crypto.randomBytes(6).toString("hex");

    foundUser.resetPasswordCode = code;
    await foundUser.save();

    await sendEmail(
      foundUser.email,
      "Recuperação de Senha",
      `Seu código para recuperação de senha: ${foundUser.resetPasswordCode}`,
      `<div>
      <h1>Seu&nbsp;c&oacute;digo&nbsp;para&nbsp;recupera&ccedil;&atilde;o&nbsp;de&nbsp;senha:&nbsp;${foundUser.resetPasswordCode}</h1>
      </div>`
    );
  },
  resetPassword: async (email, code, password) => {
    const foundUser = await UserModel.findOne({ email }).populate("house");
    if (
      !foundUser ||
      !foundUser.password ||
      code !== foundUser.resetPasswordCode
    ) {
      throw new createError.Unauthorized();
    }

    foundUser.password = password;
    await foundUser.save();

    return foundUser;
  },
  authenticateUser: async (nusp, email, name) => {
    let currentUser = await UserModel.findOne({ nusp, email });

    if (!currentUser) {
      currentUser = new UserModel({
        nusp,
        email,
        name,
      });
      await currentUser.save();
    }

    return currentUser;
  },
};

export default authService;
