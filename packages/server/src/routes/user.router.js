const { Router } = require("express");
const { body } = require("express-validator");

const AuthMiddleware = require("../middlewares/auth.middleware");
const UserController = require("../controllers/user.controller");

const router = Router();

router.put(
  "/",
  [
    body("name", "Invalid field 'name'").optional().not().isEmpty(),
    body("permission", "Invalid field 'permission'").optional().isBoolean(),
    AuthMiddleware.authenticate,
    AuthMiddleware.isAuthenticated,
  ],
  UserController.update
);

module.exports = router;
