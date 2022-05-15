import { ObjectId } from "mongodb";

import AchievementModel from "../models/achievement";

const eventService = {
  getUserAchievements: async (user, userHouse) => {
    const achievements = await AchievementModel.find();

    const achievementsWithUserInfo = [];
    for (const achievement of achievements) {
      const userHaveAchievement = user.achievements.find(
        (userAchievement) =>
          userAchievement.toString() === achievement._id.toString()
      );
      const userHouseHaveAchievement = userHouse.achievements.find(
        (houseAchievement) =>
          houseAchievement.toString() === achievement._id.toString()
      );

      achievementsWithUserInfo.push({
        ...achievement._doc,
        isEarned:
          userHaveAchievement || userHouseHaveAchievement ? true : false,
      });
    }

    return achievementsWithUserInfo;
  },
  get: async (filter?) => {
    return AchievementModel.find(filter);
  },
  create: async ({
    title,
    description,
    startDate,
    endDate,
    type,
    category,
    eventId,
    eventType,
    minPercentage,
    numberOfAchievements,
    numberOfPresences,
  }) => {
    const newAchievement = new AchievementModel() as any;

    newAchievement._id = new ObjectId();
    newAchievement.title = title;
    newAchievement.description = description;
    newAchievement.startDate = startDate;
    newAchievement.endDate = endDate;
    newAchievement.type = type;
    newAchievement.category = category;
    newAchievement.event = eventId;
    if (eventType) {
      newAchievement.eventType = eventType;
    }
    newAchievement.minPercentage = minPercentage;
    newAchievement.numberOfAchievements = numberOfAchievements;
    newAchievement.numberOfPresences = numberOfPresences;

    await newAchievement.save();

    return newAchievement;
  },
  update: async (
    id,
    {
      title,
      description,
      startDate,
      endDate,
      type,
      category,
      eventId,
      eventType,
      minPercentage,
      numberOfAchievements,
      numberOfPresences,
    }
  ) => {
    return AchievementModel.findByIdAndUpdate(
      id,
      {
        title,
        description,
        startDate,
        endDate,
        type,
        category,
        event: eventId,
        eventType,
        minPercentage,
        numberOfAchievements,
        numberOfPresences,
      },
      { new: true }
    );
  },
  delete: async (id) => {
    return AchievementModel.findByIdAndDelete(id);
  },
};

export default eventService;
