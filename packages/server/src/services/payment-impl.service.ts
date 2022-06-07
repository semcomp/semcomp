import { Model } from "mongoose";
import HttpError from "../lib/http-error";

import Payment, { PaymentModel } from "../models/payment";
import IdService from "./id.service";
import { UserService } from "./user.service";
import PaymentIntegrationService from "./payment-integration.service";
import PaymentService from "./payment.service";

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
    const entity = await PaymentModel.create(payment);

    return this.findById(entity.id);
  }

  public async update(payment: Payment): Promise<Payment> {
    const entity = await PaymentModel.findOneAndUpdate({ id: payment.id }, payment);

    return this.findById(entity.id);
  }

  public async delete(payment: Payment): Promise<Payment> {
    const entity = await PaymentModel.findOneAndDelete({ id: payment.id });

    return entity && this.mapEntity(entity);
  }

  public async createPayment(userId: string): Promise<Payment> {
    const user = await this.userService.findById(userId);
    if (!user) {
      throw new HttpError(400, []);
    }

    const payment = await this.findOne({ userId });
    if (payment) {
      return payment;
    }

    const newPaymentData: Payment = {
      userId: user.id,
    };
    const newPayment = await this.create(newPaymentData);

    const paymentResponse = await this.paymentIntegrationService.create(
      15.00,
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
    const paymentResponse = await this.paymentIntegrationService.receive(payment.paymentIntegrationId);

    if (paymentResponse.status === 'approved') {
      await this.userService.pay(payment.userId);
    }
  }

  private mapEntity(entity: Model<Payment> & Payment): Payment {
    return {
      id: entity.id,
      paymentIntegrationId: entity.paymentIntegrationId,
      userId: entity.userId,
      qrCode: entity.qrCode,
      qrCodeBase64: entity.qrCodeBase64,
      createdAt: entity.createdAt,
      updatedAt: entity.updatedAt,
    };
  }
}
