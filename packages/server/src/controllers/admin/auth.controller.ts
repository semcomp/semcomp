import bcrypt from "bcryptjs";
import crypto from "crypto";
import createError from "http-errors";
import jwt from "jsonwebtoken";

import AdminUserModel from "../../models/admin-user";

import { sendEmail } from "../../lib/send-email";
import {
  handleValidationResult,
} from "../../lib/handle-validation-result";

/**
 * formatAdminUserResponse
 *
 * @param {object} user
 *
 * @return {object} Formated user
 */
function formatAdminUserResponse(user) {
  return {
    email: user.email,
    name: user.name,
    id: user._id,
  };
}

const authController = {
  signup: async (req, res, next) => {
    try {
      handleValidationResult(req);

      const { email, password, key } = req.body;

      if (key !== process.env.ADMIN_KEY) {
        throw new createError.Forbidden("Palavra chave incorreta.");
      }

      const foundAdminUser = await AdminUserModel.findOne({ email });
      if (foundAdminUser) {
        throw new createError.Unauthorized();
      }

      const createdAdminUser = new AdminUserModel({
        email,
        password,
      }) as any;
      await createdAdminUser.save();

      await sendEmail(
        createdAdminUser.email,
        "Bem vindo a Semcomp 2021!",
        `Você se cadastrou no nosso app e já está tudo certo!!!`,
        `<div><h1>Voc&ecirc;&nbsp;se&nbsp;cadastrou&nbsp;no&nbsp;nosso&nbsp;app&nbsp;e&nbsp;j&aacute;&nbsp;est&aacute;&nbsp;tudo&nbsp;certo!!!</h1></div>`
      );

      const token = jwt.sign(
        { data: { id: createdAdminUser._id } },
        process.env.JWT_PRIVATE_KEY,
        {
          expiresIn: "30d",
        }
      );

      res.setHeader("Authorization", `Bearer ${token}`);

      return res.status(200).json(formatAdminUserResponse(createdAdminUser));
    } catch (error) {
      console.log(error);

      if (!(error instanceof createError.HttpError)) {
        error = new createError.InternalServerError("Erro no servidor.");
      }

      return next(error);
    }
  },
  login: async (req, res, next) => {
    try {
      handleValidationResult(req);

      const { email, password } = req.body;

      const foundAdminUser = await AdminUserModel.findOne({ email });
      if (
        !foundAdminUser ||
        !foundAdminUser.password ||
        !bcrypt.compareSync(password, foundAdminUser.password)
      ) {
        throw new createError.Unauthorized();
      }

      const token = jwt.sign(
        { data: { id: foundAdminUser._id } },
        process.env.JWT_PRIVATE_KEY,
        {
          expiresIn: "30d",
        }
      );

      res.setHeader("Authorization", `Bearer ${token}`);

      return res.status(200).json(formatAdminUserResponse(foundAdminUser));
    } catch (error) {
      console.log(error);

      if (!(error instanceof createError.HttpError)) {
        error = new createError.InternalServerError("Erro no servidor.");
      }

      return next(error);
    }
  },
  forgotPassword: async (req, res, next) => {
    try {
      handleValidationResult(req);

      const { email } = req.body;

      const foundAdminUser = await AdminUserModel.findOne({ email });
      if (!foundAdminUser || !foundAdminUser.password) {
        throw new createError.Unauthorized();
      }

      const code = crypto.randomBytes(6).toString("hex");

      foundAdminUser.resetPasswordCode = code;
      await foundAdminUser.save();

      await sendEmail(
        foundAdminUser.email,
        "Recuperação de Senha",
        `Seu código para recuperação de senha: ${foundAdminUser.resetPasswordCode}`,
        `<div><h1>Seu&nbsp;c&oacute;digo&nbsp;para&nbsp;recupera&ccedil;&atilde;o&nbsp;de&nbsp;senha:&nbsp;${foundAdminUser.resetPasswordCode}</h1></div>`
      );

      return res.status(200).json();
    } catch (error) {
      console.log(error);

      if (!(error instanceof createError.HttpError)) {
        error = new createError.InternalServerError("Erro no servidor.");
      }

      return next(error);
    }
  },
  resetPassword: async (req, res, next) => {
    try {
      handleValidationResult(req);

      const { email, code, password } = req.body;

      const foundAdminUser = await AdminUserModel.findOne({ email });
      if (
        !foundAdminUser ||
        !foundAdminUser.password ||
        code !== foundAdminUser.resetPasswordCode
      ) {
        throw new createError.Unauthorized();
      }

      foundAdminUser.password = password;
      await foundAdminUser.save();

      const token = jwt.sign(
        { data: { id: foundAdminUser._id } },
        process.env.JWT_PRIVATE_KEY,
        {
          expiresIn: "30d",
        }
      );

      res.setHeader("Authorization", `Bearer ${token}`);

      return res.status(200).json(formatAdminUserResponse(foundAdminUser));
    } catch (error) {
      console.log(error);

      if (!(error instanceof createError.HttpError)) {
        error = new createError.InternalServerError("Erro no servidor.");
      }

      return next(error);
    }
  },
};

export default authController;
