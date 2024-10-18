import {
    handleValidationResult,
  } from "../../lib/handle-validation-result";
  import { handleError } from "../../lib/handle-error";
  import gameConfigService from "../../services/game-config.service";
  
  class GameConfigController {

    public async getConfig(req, res, next) {
      try {
        handleValidationResult(req);
  
        const { game, index } = req.params;
  
        const foundConfig = await gameConfigService.findOne({ game });
  
        return res.status(200).json(foundConfig);
      } catch (error) {
        return handleError(error, next);
      }
    };

  }
  
  export default new GameConfigController();
  