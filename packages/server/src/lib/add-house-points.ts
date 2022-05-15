export const addHousePoints = (house, points) => {
  if (house) {
    house.score += Math.floor(+points);
  }
};
