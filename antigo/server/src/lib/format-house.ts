export const formatHouse = function (house, fields) {
  const formatedHouse = {
    _id: house._id,
    name: house.name,
    description: house.description,
    users: house.users,
    score: house.score,
    createdAt: house.createdAt,
    updatedAt: house.updatedAt,
  };

  for (const field of Object.keys(formatedHouse)) {
    if (fields.indexOf(field) === -1) delete formatedHouse[field];
  }

  return formatedHouse;
};
