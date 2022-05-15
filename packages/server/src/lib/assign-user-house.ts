import { getHouseWithLessMembers } from "./get-house-with-less-members";

export const assignUserHouse = async function (userId) {
  const houseWithLessMembers = await getHouseWithLessMembers();

  houseWithLessMembers.members.push(userId);
  await houseWithLessMembers.save();

  return houseWithLessMembers;
};
