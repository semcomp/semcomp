import {
    handleValidationResult,
  } from "../../lib/handle-validation-result";
  import { handleError } from "../../lib/handle-error";
  import configService from "../../services/config.service";
import { NextFunction, Request, Response } from "express";
  
  class CofigController {
    public async list(req: Request, res: Response, next: NextFunction) {
      try {
        const configs = await configService.get();
  
        return res.status(200).json(configs);
      } catch (error) {
        return handleError(error, next);
      }
    }
  
    public async create(req: Request, res: Response, next: NextFunction) {
      try {
        handleValidationResult(req);
  
        const config = req.body;
  
        const createdConfig = await configService.create(config);
  
        return res.status(200).send(createdConfig);
      } catch (error) {
        return handleError(error, next);
      }
    }
  
    public async update(req: Request, res: Response, next: NextFunction) {
      try {
        handleValidationResult(req);
  
        const { id } = req.params;
  
        const config = req.body;
  
        const foundConfig = await configService.getOne(id);
        const updatedEvent = await configService.update({
          ...foundConfig,
          ...config,
        });
  
        return res.status(200).json(updatedEvent);
      } catch (error) {
        return handleError(error, next);
      }
    }
  
    public async delete(req: Request, res: Response, next: NextFunction) {
      try {
        handleValidationResult(req);
  
        const { id } = req.params;
  
        const foundConfig = await configService.getOne(id);
        if (foundConfig) {
            const deletedEvent = await configService.delete(foundConfig);
            return res.status(200).send(deletedEvent);
        } else {

        }
  
      } catch (error) {
        return handleError(error, next);
      }
    }
  
    public async setCoffeeQuantity(req: Request, res: Response, next: NextFunction) {
      try {
        const { quantity } = req.body;
  
        const updatedConfig = await configService.setCoffeeQuantity(quantity);
  
        return res.status(200).json();
      } catch (error) {
        return handleError(error, next);
      }
    }

    public async setSwitchBeta(req: Request, res: Response, next: NextFunction) {
        try {
          const { bool } = req.body;
    
          const updatedConfig = await configService.setSwitchBeta(bool);
    
          return res.status(200).json();
        } catch (error) {
          return handleError(error, next);
        }
      }
}

export default new CofigController();
