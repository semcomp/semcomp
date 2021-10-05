const { getHouseWithLessMembers } = require("./get-house-with-less-members");

module.exports.assignUserHouse = async function (userId) {
  const houseWithLessMembers = await getHouseWithLessMembers();

  houseWithLessMembers.members.push(userId);
  await houseWithLessMembers.save();

  return houseWithLessMembers;
};
