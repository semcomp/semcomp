import {
  handleValidationResult,
} from "../../lib/handle-validation-result";
import { handleError } from "../../lib/handle-error";
import gameGroupService from "../../services/game-group.service";
import cacheManagerService from '../../services/cache-manager.service';

class GameGroupController {
  public async getGroupByUserIdAndGame(req, res, next) {
    try {
      handleValidationResult(req);
      const { userId } = req.params;
      const { game } = req.params;
      
      const group = await gameGroupService.findUserGroupWithMembers(userId, game);
      
      return res.status(200).json(group);
    } catch (error) {
      return handleError(error, next);
    }
  }
  
  public async create(req, res, next) {
    try {
      handleValidationResult(req);

      const { game } = req.params;
      const { name } = req.body;
      const { user } = req;

      const createdGroup = await gameGroupService.create({
        game, name
      });
      await gameGroupService.join(
        user.id,
        createdGroup.id,
      );

      return res.status(200).json(createdGroup);
    } catch (error) {
      return handleError(error, next);
    }
  };

  public async join(req, res, next) {
    try {
      const { id } = req.query;
      const { game } = req.params;
      const { user } = req;

      // Busca o grupo para verificar se pertence ao jogo correto
      const group = await gameGroupService.findById(id);
      if (!group) {
        return res.status(404).json({ message: "Grupo não encontrado" });
      }

      // Verifica se o grupo pertence ao jogo correto
      if (group.game !== game) {
        return res.status(400).json({ message: "Grupo não pertence ao jogo informado" });
      }

      const joinedGroup = await gameGroupService.join(user.id, id);

      return res.status(200).json(joinedGroup);
    } catch (error) {
      return handleError(error, next);
    }
  };

  public async leave(req, res, next) {
    try {
      const { user } = req;
      await gameGroupService.leave(user.id);
      
      // Limpar cache do usuário em todos os jogos
      cacheManagerService.clearUserCache(user.id);
      
      return res.status(200).json();
    } catch (error) {
      return handleError(error, next);
    }
  };

  public async useClue(req, res, next) {
    try {
      handleValidationResult(req);
      const { user } = req;
      const { game } = req.params;

      const result = await gameGroupService.useClue(user.id, game);

      cacheManagerService.clearUserCache(user.id);
      return res.status(200).json(result);
    } catch (error) {
      return handleError(error, next);
    }
  };
}

export default new GameGroupController();
