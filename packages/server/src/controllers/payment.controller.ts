import { handleError } from "../lib/handle-error";
import PaymentService from "../services/payment.service";
import PaymentServiceImpl from "../services/payment-impl.service";
import { NextFunction, Request, Response } from "express";

export default class PaymentController {
  private paymentService: PaymentService;

  constructor(paymentService: PaymentService) {
    this.paymentService = paymentService;
  }

  public async create(req, res, next) {
    try {
      const payment = await this.paymentService.createPayment(
        req.user?.id,
        req.body?.withSocialBenefit,
        req.body?.socialBenefitFileName,
        req.body?.tShirtSize,
        req.body?.foodOption,
        req.body?.saleOption,
        )
      
      return res.status(200).json(payment);
    } catch (error) {
      return handleError(error, next);
    }
  }

  public async receive(req, res, next) {
    try {
      await this.paymentService.receive(req.params.id);

      return res.status(200).json();
    } catch (error) {
      return handleError(error, next);
    }
  };

  public async findByUserId(req, res, next) {
    try {
      const payment = await new PaymentServiceImpl(null, null, null, null).findByUserId(req.params.id);

      return res.status(200).json(payment);
    } catch (error) {
      return handleError(error, next);
    }
  }

  public async getPurchasedCoffee(req, res, next) {
    try {
      const coffeePurchased = await new PaymentServiceImpl(null, null, null, null).getPurchasedCoffee();

      return res.status(200).json(coffeePurchased);
    } catch (error) {
      return handleError(error, next);
    }
  };

  public async getRemainingTShirts(req, res, next) {
    try {
      const availableTShirts = await new PaymentServiceImpl(null, null, null, null).getAvailableTShirts();
      return res.status(200).json(availableTShirts);
    } catch (error) {
      return handleError(error, next);
    }
  }
}
