import {
    handleValidationResult,
  } from "../../lib/handle-validation-result";
  import { handleError } from "../../lib/handle-error";
  import configService from "../../services/config.service";
import { NextFunction, Request, Response } from "express";
  
  class CofigController {
    public async getOne(req: Request, res: Response, next: NextFunction) {
      try {
        const config = await configService.getOne();
  
        return res.status(200).json(config);
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
  
        const config = req.body.config;
        
        const foundConfig = await configService.getOne();
        const updatedEvent = await configService.update({
          ...foundConfig.toObject(),
          ...config,
        });
  
        return res.status(200).json(updatedEvent);
      } catch (error) {
        return handleError(error, next);
      }
    }

    public async setCoffeeQuantity(req: Request, res: Response, next: NextFunction) {
      try {
        handleValidationResult(req);
        const value = req.body.value;

        const foundConfig = await configService.getOne();
        foundConfig['coffeeQuantity'] = foundConfig['coffeeQuantity'] + value;

        const updatedEvent = await configService.update({
          ...foundConfig.toObject(),
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
  
        const foundConfig = await configService.getOne();
        if (foundConfig) {
            const deletedEvent = await configService.delete(foundConfig);
            return res.status(200).send(deletedEvent);
        } else {

        }
  
      } catch (error) {
        return handleError(error, next);
      }
    }
  
    public async getCoffeeQuantity(req: Request, res: Response, next: NextFunction) {
      try {
        const config = await configService.getOne();
  
        return res.status(200).json(config.coffeeQuantity);
      } catch (error) {
        return handleError(error, next);
      }
    }

    public async getCoffeeTotal(req: Request, res: Response, next: NextFunction) {
      try {
        const config = await configService.getOne();
  
        return res.status(200).json(config.coffeeTotal);
      } catch (error) {
        return handleError(error, next);
      }
    }

    public async getRemainingCoffee(req: Request, res: Response, next: NextFunction) {
      try {
        const config = await configService.getOne();
  
        return res.status(200).json(config.coffeeTotal-config.coffeeQuantity);
      } catch (error) {
        return handleError(error, next);
      }
    }

    public async setCoffeeTotal(req: Request, res: Response, next: NextFunction) {
      try {
        const { quantity } = req.body;
  
        const updatedConfig = await configService.setCoffeeTotal(quantity);
  
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
  
    public async setOpenSingup(req: Request, res: Response, next: NextFunction) {
      try {
        const { bool } = req.body;
  
        const updatedConfig = await configService.setOpenSingup(bool);
  
        return res.status(200).json();
      } catch (error) {
        return handleError(error, next);
      }
    }
}

export default new CofigController();
