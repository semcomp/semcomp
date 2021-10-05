const HouseModel = require("../models/house");

module.exports.getHouseWithLessMembers = async function () {
  const houses = await HouseModel.find();

  let houseWithLessMembers = houses[0];
  for (let i = 0; i < houses.length - 1; i += 1) {
    if (houseWithLessMembers.members.length > houses[i + 1].members.length) {
      houseWithLessMembers = houses[i + 1];
    }
  }

  return houseWithLessMembers;
};
