import { Model } from "mongoose";

import HttpError from "../lib/http-error";
import Payment, { PaymentModel } from "../models/payment";
import IdService from "./id.service";
import { UserService } from "./user.service";
import PaymentIntegrationService from "./payment-integration.service";
import tShirtService from "./t-shirt.service";
import PaymentService from "./payment.service";
import TShirtSize from "../lib/constants/t-shirt-size-enum";
import PaymentStatus from "../lib/constants/payment-status-enum";

export default class PaymentServiceImpl implements PaymentService {
  private idService: IdService;
  private paymentIntegrationService: PaymentIntegrationService;
  private userService: UserService;
  private notificationUrl: string;

  constructor(
    idService: IdService,
    paymentIntegrationService: PaymentIntegrationService,
    userService: UserService,
    notificationUrl: string,
  ) {
    this.idService = idService;
    this.paymentIntegrationService = paymentIntegrationService;
    this.userService = userService;
    this.notificationUrl = notificationUrl;
  }

  public async find(filters?: Partial<Payment>): Promise<Payment[]> {
    const payments = await PaymentModel.find(filters);

    const entities: Payment[] = [];
    for (const payment of payments) {
      entities.push(this.mapEntity(payment));
    }

    return entities;
  }

  public async findById(id: string): Promise<Payment> {
    const entity = await PaymentModel.findOne({ id });

    return this.mapEntity(entity);
  }

  public async findOne(filters?: Partial<Payment>): Promise<Payment> {
    const entity = await PaymentModel.findOne(filters);

    return entity && this.mapEntity(entity);
  }

  public async count(filters?: Partial<Payment>): Promise<number> {
    const count = await PaymentModel.count(filters);

    return count;
  }

  public async create(payment: Payment): Promise<Payment> {
    payment.id = await this.idService.create();
    payment.createdAt = Date.now();
    payment.updatedAt = Date.now();
    const entity = await PaymentModel.create(payment);

    return this.findById(entity.id);
  }

  public async update(payment: Payment): Promise<Payment> {
    payment.updatedAt = Date.now();
    const entity = await PaymentModel.findOneAndUpdate({ id: payment.id }, payment);

    return this.findById(entity.id);
  }

  public async delete(payment: Payment): Promise<Payment> {
    const entity = await PaymentModel.findOneAndDelete({ id: payment.id });

    return entity && this.mapEntity(entity);
  }

  public async createPayment(
    userId: string,
    withSocialBenefit: boolean,
    socialBenefitFileName: string,
    tShirtSize: TShirtSize,
  ): Promise<Payment> {
    const user = await this.userService.findById(userId);
    if (!user) {
      throw new HttpError(400, []);
    }

    const tShirt = await tShirtService.findOne({ size: tShirtSize });
    if (!tShirt) {
      throw new HttpError(400, []);
    }

    const price = withSocialBenefit ? 32.5 : 65.00;

    const payment = await this.findOne({ userId });
    if (payment) {
      if (
        payment.withSocialBenefit !== withSocialBenefit ||
        payment.socialBenefitFileName !== socialBenefitFileName ||
        payment.tShirtSize !== tShirtSize
      ) {
        payment.socialBenefitFileName = socialBenefitFileName;

        if (payment.tShirtSize !== tShirtSize) {
          payment.tShirtSize = tShirtSize;
          const paymentsWithThisTShirtSize = await this.count({ tShirtSize });
          if (paymentsWithThisTShirtSize >= tShirt.quantity) {
            throw new HttpError(400, ["Camisetas deste tamanho estão esgotadas!"]);
          }
        }

        if (payment.withSocialBenefit !== withSocialBenefit) {
          const paymentResponse = await this.paymentIntegrationService.create(
            price,
            user.email,
            "Semcomp",
            `${this.notificationUrl}/${payment.id}`
          );

          payment.paymentIntegrationId = paymentResponse.id;
          payment.qrCode = paymentResponse.qrCode;
          payment.qrCodeBase64 = paymentResponse.qrCodeBase64;
        }

        await this.update(payment);
      }

      return payment;
    }

    const paymentsWithThisTShirtSize = await this.count({ tShirtSize });
    if (paymentsWithThisTShirtSize >= tShirt.quantity) {
      throw new HttpError(400, ["Camisetas deste tamanho estão esgotadas!"]);
    }

    const newPaymentData: Payment = {
      userId: user.id,
      status: PaymentStatus.PENDING,
      withSocialBenefit,
      socialBenefitFileName,
      tShirtSize,
    };
    const newPayment = await this.create(newPaymentData);

    const paymentResponse = await this.paymentIntegrationService.create(
      price,
      user.email,
      "Semcomp",
      `${this.notificationUrl}/${newPayment.id}`
    );

    newPayment.paymentIntegrationId = paymentResponse.id;
    newPayment.qrCode = paymentResponse.qrCode;
    newPayment.qrCodeBase64 = paymentResponse.qrCodeBase64;

    return await this.update(newPayment);
  }

  public async receive(id: number): Promise<void> {
    const payment = await PaymentModel.findOne({ id });
    const paymentResponse = await this.paymentIntegrationService.find(payment.paymentIntegrationId);

    if (paymentResponse.status === 'approved') {
      payment.status = PaymentStatus.APPROVED;

      await this.update(payment);
    }
  }

  public async getUserPayment(userId: string): Promise<Payment> {
    const entity = await PaymentModel.findOne({ userId });

    return entity && this.mapEntity(entity);
  }

  public async syncUsersPayment(): Promise<void> {
    const users = await this.userService.find();

    for (const user of users) {
      const payment = await PaymentModel.findOne({ userId: user.id });
      if (payment) {
        if (user.paid) {
          payment.status = PaymentStatus.APPROVED;
        } else {
          payment.status = PaymentStatus.PENDING;
        }

        await this.update(payment);
      }
    }
  }

  private mapEntity(entity: Model<Payment> & Payment): Payment {
    return {
      id: entity.id,
      paymentIntegrationId: entity.paymentIntegrationId,
      userId: entity.userId,
      qrCode: entity.qrCode,
      qrCodeBase64: entity.qrCodeBase64,
      withSocialBenefit: entity.withSocialBenefit,
      socialBenefitFileName: entity.socialBenefitFileName,
      tShirtSize: entity.tShirtSize,
      status: entity.status,
      createdAt: entity.createdAt,
      updatedAt: entity.updatedAt,
    };
  }
}
