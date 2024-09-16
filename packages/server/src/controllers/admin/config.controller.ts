import {
    handleValidationResult,
  } from "../../lib/handle-validation-result";
  import { handleError } from "../../lib/handle-error";
  import configService from "../../services/config.service";
import { NextFunction, Request, Response } from "express";
import PaymentServiceImpl from "../../services/payment-impl.service";
  
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

    public async delete(req: Request, res: Response, next: NextFunction) {
      try {
        handleValidationResult(req);
  
        const { id } = req.params;
  
        const foundConfig = await configService.getOne();
        if (foundConfig) {
            const config = await configService.delete(foundConfig.id);
            return res.status(200).send(config);
        } else {
          return res.status(400).send("Config not found");
        }
  
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
        const purchasedCoffee = await new PaymentServiceImpl(null,null,null,null).getPurchasedCoffee();
        return res.status(200).json(config.coffeeTotal-purchasedCoffee);
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
  
    public async setOpenSignup(req: Request, res: Response, next: NextFunction) {
      try {
        const { openSignup } = req.body;
  
        const updatedConfig = await configService.setOpenSignup(openSignup);
  
        return res.status(200).json(updatedConfig);
      } catch (error) {
        return handleError(error, next);
      }
    }

    public async setOpenSales(req: Request, res: Response, next: NextFunction) {
      try {
        const { openSales } = req.body;
  
        const updatedConfig = await configService.setOpenSales(openSales);
  
        return res.status(200).json(updatedConfig);
      } catch (error) {
        return handleError(error, next);
      }
    }

    public async setOpenAchievement(req: Request, res: Response, next: NextFunction) {
      try {
        const { openAchievement } = req.body;
  
        const updatedConfig = await configService.setOpenAchievement(openAchievement);
  
        return res.status(200).json(updatedConfig);
      } catch (error) {
        return handleError(error, next);
      }
    }
}

export default new CofigController();
