module.exports.addHousePoints = (house, points) => {
  if (house) {
    house.score += Math.floor(+points);
  }
};
