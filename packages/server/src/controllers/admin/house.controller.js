const createError = require("http-errors");

const AchievementModel = require("../../models/achievement");
const HouseModel = require("../../models/house");
const UserModel = require("../../models/user");
const AdminLog = require("../../models/admin-log");

const { addHousePoints } = require("../../lib/add-house-points");
const { assignUserHouse } = require("../../lib/assign-user-house");
const {
  handleValidationResult,
} = require("../../lib/handle-validation-result");
const { handleError } = require("../../lib/handle-error");

const houseController = {
  list: async (req, res, next) => {
    try {
      const foundHouses = await HouseModel.find().populate("achievements");

      return res.status(200).json(foundHouses);
    } catch (error) {
      return handleError(error, next);
    }
  },
  create: async (req, res, next) => {
    try {
      handleValidationResult(req);

      const { name, description, telegramLink } = req.body;

      const createdHouse = new HouseModel({
        name,
        description,
        telegramLink,
        achievements: [],
      });
      await createdHouse.save();

      await AdminLog({
        user: req.adminUser,
        type: "create",
        collectionName: "house",
        objectAfter: JSON.stringify(createdHouse),
      }).save();

      return res.status(200).json(createdHouse);
    } catch (error) {
      return handleError(error, next);
    }
  },
  update: async (req, res, next) => {
    try {
      handleValidationResult(req);

      const { id } = req.params;

      // self-invoking anonymous function. Returns the object it receives as argument
      const filteredBody = (({ name, description, telegramLink }) => ({
        name,
        description,
        telegramLink,
      }))(req.body);

      const newInfo = Object.keys(filteredBody).reduce((acc, key) => {
        const obj = acc;
        if (filteredBody[key] !== undefined) {
          obj[key] = filteredBody[key];
        }
        return obj;
      }, {});

      const houseFound = await HouseModel.findById(id);
      if (!houseFound) {
        throw new createError.NotFound("Casa não encontrada.");
      }

      const updatedHouse = await HouseModel.findByIdAndUpdate(id, {
        $set: newInfo,
      });

      await AdminLog({
        user: req.adminUser,
        type: "update",
        collectionName: "house",
        objectBefore: JSON.stringify(houseFound),
        objectAfter: JSON.stringify(updatedHouse),
      }).save();

      return res.status(200).json(updatedHouse);
    } catch (error) {
      return handleError(error, next);
    }
  },
  assignHouses: async (req, res, next) => {
    try {
      const users = await UserModel.find();
      const houses = await HouseModel.find();

      for (const user of users) {
        let userHasHouse = false;
        for (const house of houses) {
          if (
            house.members.find((member) => {
              return member.toString() === user.id.toString();
            })
          ) {
            userHasHouse = true;
          }
        }

        if (!userHasHouse) {
          await assignUserHouse(user.id);
        }
      }

      return res.status(200).json();
    } catch (error) {
      return handleError(error, next);
    }
  },
  addPoints: async (req, res, next) => {
    try {
      handleValidationResult(req);

      const { id } = req.params;
      const { points } = req.body;

      const foundHouse = await HouseModel.findById(id);

      addHousePoints(foundHouse, points);
      await foundHouse.save();

      await AdminLog({
        user: req.adminUser,
        type: "add-points",
        collectionName: "house",
        objectBefore: JSON.stringify({
          ...foundHouse,
          score: foundHouse.score - Math.floor(+points),
        }),
        objectAfter: JSON.stringify(foundHouse),
      }).save();

      return res.status(200).json();
    } catch (error) {
      return handleError(error, next);
    }
  },
  addHouseAchievement: async (req, res, next) => {
    try {
      handleValidationResult(req);

      const { houseId, achievementId } = req.params;

      const house = await HouseModel.findById(houseId);
      if (!house) {
        throw new createError.NotFound("Casa não encontrada.");
      }
      const achievement = await AchievementModel.findOne({
        _id: achievementId,
        type: "Casa",
      });
      if (!achievement) {
        throw new createError.NotFound("Conquista não encontrada.");
      }

      if (house.achievements.includes(achievement._id)) {
        throw new createError.BadRequest("A casa já possui essa conquista.");
      }

      house.achievements.push(achievement);

      await house.save();

      return res.status(200).json(house);
    } catch (error) {
      return handleError(error, next);
    }
  },
};

module.exports = houseController;
