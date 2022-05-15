import houseService from "../services/house.service";

import { formatHouse } from "../lib/format-house";
import { handleError } from "../lib/handle-error";

/**
 * formatHouseResponse
 *
 * @param {object} house
 *
 * @return {object}
 */
function formatHouseResponse(house) {
  return formatHouse(house, ["name", "score"]);
}

const houseController = {
  getScores: async (req, res, next) => {
    try {
      const houses = await houseService.get();

      const formatedHouses = houses.map((house) => {
        return {
          ...formatHouseResponse(house),
          achievements: [],
        };
      });

      return res.status(200).json(formatedHouses);
    } catch (error) {
      return handleError(error, next);
    }
  },
};

export default houseController;
