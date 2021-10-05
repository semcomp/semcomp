const { Router } = require("express");
const { param, body } = require("express-validator");

const AdminAuthMiddleware = require("../../middlewares/admin-auth.middleware");
const AdminEventController = require("../../controllers/admin/event.controller");

const router = Router();

router.get(
  "/",
  [AdminAuthMiddleware.authenticate, AdminAuthMiddleware.isAuthenticated],
  AdminEventController.list
);

router.get(
  "/:id/emails",
  [AdminAuthMiddleware.authenticate, AdminAuthMiddleware.isAuthenticated],
  AdminEventController.listSubscriptionsEmails
);

router.post(
  "/",
  [
    body("name", "Invalid field 'name'").not().isEmpty(),
    body("description", "Invalid field 'description'").not().isEmpty(),
    body("link", "Invalid field 'link'").not().isEmpty(),
    body("startDate", "Invalid field 'dateStart'").not().isEmpty(),
    body("endDate", "Invalid field 'dateEnd'").not().isEmpty(),
    body("type", "Invalid field 'dateEnd'").not().isEmpty(),
    AdminAuthMiddleware.authenticate,
    AdminAuthMiddleware.isAuthenticated,
  ],
  AdminEventController.create
);

router.put(
  "/:id",
  [
    param("id", "Invalid field 'id'").not().isEmpty(),
    AdminAuthMiddleware.authenticate,
    AdminAuthMiddleware.isAuthenticated,
  ],
  AdminEventController.update
);

router.delete(
  "/:id",
  [
    param("id", "Invalid field 'id'").not().isEmpty(),
    AdminAuthMiddleware.authenticate,
    AdminAuthMiddleware.isAuthenticated,
  ],
  AdminEventController.delete
);

module.exports = router;
