import { handleValidationResult } from "../lib/handle-validation-result";
import { handleError } from "../lib/handle-error";
import treasureHuntImageService from "../services/treasure-hunt-image.service";

const treasureHuntImageController = {
  getOne: async (req, res, next) => {
    try {
        handleValidationResult(req);
        
        const id = req.params.id;
        const image = await treasureHuntImageService.findById(id);

      return res.status(200).json(image);
    } catch (error) {
      return handleError(error, next);
    }
  },
};

export default treasureHuntImageController;
