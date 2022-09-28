import { Router } from "express";

import HouseController from '../controllers/house.controller';

const router = Router();

router.get(
  '/scores',
  HouseController.getScores,
);

export default router;
