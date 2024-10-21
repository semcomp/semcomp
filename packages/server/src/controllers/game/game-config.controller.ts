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

  public async getIsHappening(req, res, next) {
    try {
      handleValidationResult(req);

      // Busca a configuração do(s) jogo(s) pelo nome (ou outro identificador)
      const foundGames = await gameConfigService.findMany();

      // Se não encontrar nenhum jogo
      if (!foundGames || foundGames.length === 0) {
        return res.status(200).json({ message: 'No games for now' });
      }

      let isHappeningGames = [];
      const now = new Date();

      for (const game of foundGames) {
        const isHappening = now >= new Date(game.startDate) && now <= new Date(game.endDate);
        isHappeningGames.push({
          "title": game.title,
          "prefix": game.eventPrefix,
          "isHappening": isHappening
        });
      }

      
      // Retorna o resultado como um booleano
      return res.status(200).json({ isHappeningGames });
    } catch (error) {
      return handleError(error, next);
    }
  };

}

export default new GameConfigController();
