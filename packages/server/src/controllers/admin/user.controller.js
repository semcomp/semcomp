const AchievementModel = require("../../models/achievement");
const UserModel = require("../../models/user");
const HouseModel = require("../../models/house");
const EventModel = require("../../models/event");
const AdminLog = require("../../models/admin-log");

const { HttpError } = require("../../lib/http-error");

module.exports.list = async (req, res) => {
  const usersFound = await UserModel.find({}, "-password").populate(
    "achievements"
  );
  const housesFound = await HouseModel.find();

  const users = [];
  for (const user of usersFound) {
    let userHouse = "Não possui";
    for (const house of housesFound) {
      if (house.members.includes(user._id.toString())) {
        userHouse = house.name;
      }
    }
    users.push({
      ...user._doc,
      house: {
        name: userHouse,
      },
    });
  }

  return res.status(200).json({
    users,
  });
};

module.exports.listForEnterprise = async (req, res) => {
  const usersFound = await UserModel.find(
    { permission: true },
    "-_id name email course userTelegram"
  );

  return res.status(200).json(usersFound);
};

module.exports.get = async (req, res) => {
  try {
    const { id } = req.params;

    const userFound = await UserModel.findById(id);
    if (!userFound) {
      throw new HttpError(404);
    }

    return res.status(200).json(userFound);
  } catch (e) {
    if (e.statusCode) {
      return res.status(e.statusCode).json(e);
    }
    return res.status(500).json(e);
  }
};

module.exports.getAttendance = async (req, res) => {
  try {
    const userId = req.params.id;

    const user = await UserModel.findById(
      userId,
      "name email nusp course userTelegram"
    );
    if (!user) {
      throw new HttpError(404);
    }

    const attendedEvents = await EventModel.find(
      {
        presentUsers: userId,
      },
      "type name"
    );

    console.log(attendedEvents);

    const totalNumEvents = await EventModel.estimatedDocumentCount();
    let attendancePercent = 100 * (attendedEvents.length / totalNumEvents);
    attendancePercent = Math.round(attendancePercent * 100) / 100; // truncate to precision 2

    return res.status(200).json({ attendancePercent, attendedEvents, user });
  } catch (e) {
    if (e.statusCode) {
      return res.status(e.statusCode).json(e);
    }
    return res.status(500).json(e);
  }
};

module.exports.addUserAchievement = async (req, res) => {
  try {
    const { userId, achievementId } = req.params;

    const user = await UserModel.findById(userId);
    if (!user) {
      throw new HttpError(404);
    }
    const achievement = await AchievementModel.findOne({
      _id: achievementId,
      type: "Individual",
    });
    if (!achievement) {
      throw new HttpError(404);
    }

    if (user.achievements.includes(achievement._id)) {
      throw new HttpError(400);
    }

    user.achievements.push(achievement);

    await user.save();

    return res.status(200).send(user);
  } catch (e) {
    if (e.statusCode) {
      return res.status(e.statusCode).json(e);
    }
    return res.status(500).json(e);
  }
};

module.exports.update = async (req, res) => {
  try {
    const { id } = req.params;

    // self-invoking anonymous function. Returns the object it receives as argument
    const filteredBody = (({ nusp, email, name, password, course }) => ({
      nusp,
      email,
      name,
      password,
      course,
    }))(req.body);

    const newInfo = Object.keys(filteredBody).reduce((acc, key) => {
      const obj = acc;
      if (filteredBody[key] !== undefined) {
        obj[key] = filteredBody[key];
      }
      return obj;
    }, {});

    const updatedUser = await UserModel.findByIdAndUpdate(id, {
      $set: newInfo,
    });

    await AdminLog({
      user: req.adminUser,
      type: "update",
      collectionName: "user",
      objectAfter: JSON.stringify(updatedUser),
    }).save();

    return res.status(200).send(updatedUser);
  } catch (e) {
    if (e.statusCode) {
      return res.status(e.statusCode).json(e);
    }
    return res.status(500).json(e);
  }
};

module.exports.delete = async (req, res) => {
  try {
    const { id } = req.params;

    const userFound = await UserModel.findById(id);
    if (!userFound) {
      throw new HttpError(404);
    }

    await UserModel.findByIdAndDelete(id);

    await AdminLog({
      user: req.adminUser,
      type: "delete",
      collectionName: "user",
      objectBefore: JSON.stringify(userFound),
    }).save();

    return res.status(200).send(userFound);
  } catch (e) {
    if (e.statusCode) {
      return res.status(e.statusCode).json(e);
    }
    return res.status(500).json(e);
  }
};

module.exports.mergePresences = async (req, res) => {
  try {
    const eventsFound = await EventModel.find();

    for (let i = 0; i < eventsFound.length; i += 1) {
      for (let j = 0; j < eventsFound[i].presentUsers.length; j += 1) {
        // eslint-disable-next-line no-await-in-loop
        const userPresent = await UserModel.findById(
          eventsFound[i].presentUsers[j]._id
        );

        if (!userPresent) {
          continue;
        }
        // eslint-disable-next-line no-await-in-loop
        const userPresentOtherAccount = await UserModel.findOne({
          email: userPresent.email,
          _id: { $ne: userPresent._id },
        });

        if (!userPresentOtherAccount) {
          // eslint-disable-next-line no-continue
          continue;
        }

        let addOtherAccount = true;
        for (let k = 0; k < eventsFound[i].presentUsers.length; k += 1) {
          if (
            eventsFound[i].presentUsers[k] ==
            userPresentOtherAccount._id.toString()
          ) {
            addOtherAccount = false;
            break;
          }
        }

        if (addOtherAccount) {
          eventsFound[i].presentUsers.push(userPresentOtherAccount._id);
          // eslint-disable-next-line no-await-in-loop
          await eventsFound[i].save();
        }
      }
    }

    return res.status(200).send();
  } catch (e) {
    if (e.statusCode) {
      return res.status(e.statusCode).json(e);
    }
    return res.status(500).json(e);
  }
};
