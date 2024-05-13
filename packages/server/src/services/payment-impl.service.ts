import { Model } from "mongoose";
import QRCode from 'qrcode';

import HttpError from "../lib/http-error";
import Payment, { PaymentModel } from "../models/payment";
import IdService from "./id.service";
import { UserService } from "./user.service";
import PaymentIntegrationService from "./payment-integration.service";
import tShirtService from "./t-shirt.service";
import PaymentService from "./payment.service";
import ConfigService from "./config.service";
import TShirtSize from "../lib/constants/t-shirt-size-enum";
import KitOption from "../lib/constants/kit-option";
import FoodOption from "../lib/constants/food-option-enum";
import PaymentStatus from "../lib/constants/payment-status-enum";
import { PaginationRequest } from "../lib/pagination";

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

  public async findByUserId(id: string): Promise<Payment> {
    const entity = await PaymentModel.findOne({ userId: id });
    return this.mapEntity(entity);
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

  public async getPurchasedCoffee(): Promise<number> {
    const getPurchasedCoffee = await PaymentModel.countDocuments({
      status: { $in: ['approved', 'pending'] },
      kitOption: { $in: ['Coffee', 'Kit e Coffee'] }
    });
    return getPurchasedCoffee;
  }
  
  public async createPayment(
    userId: string,
    withSocialBenefit: boolean,
    socialBenefitFileName: string,
    tShirtSize: TShirtSize,
    foodOption: FoodOption,
    kitOption: KitOption,
  ): Promise<Payment> {
    const config = await ConfigService.getOne(); 
    if(config === undefined){
      throw new HttpError(401, ["Erro ao acessar as Configs(auth.service.ts)"]);
    } else if(!(config.openSales)){
      throw new HttpError(503, ["Vendas encerradas!"]);
    }

    const user = await this.userService.findById(userId);
    if (!user) {
      throw new HttpError(400, ["Usuário não encontrado"]);
    }

    const tShirt = await tShirtService.findOne({ size: tShirtSize });
    if (!tShirt) {
      throw new HttpError(400, ['Camisa não encontrada!']);
    }

    let price;

    if (kitOption.includes("Coffee")) {
      const purchasedCoffee = await this.getPurchasedCoffee();
      if(config.coffeeTotal - purchasedCoffee <= 0){
        throw new HttpError(400, ["Coffees esgotados!"]);
      }
    }
    
    if(kitOption.includes("Kit") && kitOption.includes("Coffee")) {
      price = 75;
    } else if (kitOption.includes("Kit")){
      price = 65;
    } else {
      price = 0.01;
    } 

    price = withSocialBenefit ? price/2 : price;

    const userPayments = await this.find({ userId });
    const approvedPayment = userPayments.find((userPayment) => userPayment.status === PaymentStatus.APPROVED);
    if (approvedPayment) {
      throw new HttpError(400, ["Camiseta já comprada!"]);
    }

    const pendingPayment = userPayments.find((userPayment) => userPayment.status === PaymentStatus.PENDING);
    if (pendingPayment) {
      if (
        pendingPayment.withSocialBenefit !== withSocialBenefit ||
        pendingPayment.socialBenefitFileName !== socialBenefitFileName ||
        pendingPayment.tShirtSize !== tShirtSize ||
        pendingPayment.kitOption !== kitOption
      ) {

        
        pendingPayment.socialBenefitFileName = socialBenefitFileName;

        if (pendingPayment.tShirtSize !== tShirtSize && tShirtSize != TShirtSize.NONE) {
          pendingPayment.tShirtSize = tShirtSize;
          let paymentsWithThisTShirtSize = await this.count({ tShirtSize, status: PaymentStatus.APPROVED });
          paymentsWithThisTShirtSize += await this.count({ tShirtSize, status: PaymentStatus.PENDING });
          if (paymentsWithThisTShirtSize >= tShirt.quantity) {
            throw new HttpError(400, ["Camisetas deste tamanho estão esgotadas!"]);
          }
        }

        if (pendingPayment.withSocialBenefit !== withSocialBenefit || 
              pendingPayment.kitOption !== kitOption) {

          const paymentResponse = await this.paymentIntegrationService.create(
            price,
            user.email,
            "Semcomp",
            `${this.notificationUrl}/${pendingPayment.id}`
          );

          // if(kitOption === KitOption.COFFEE){
          //   pendingPayment.tShirtSize = TShirtSize.NONE;
          // }

          pendingPayment.withSocialBenefit = withSocialBenefit;
          pendingPayment.paymentIntegrationId = paymentResponse.id;
          pendingPayment.qrCode = paymentResponse.qrCode;
          pendingPayment.qrCodeBase64 = paymentResponse.qrCodeBase64;
        }

        pendingPayment.kitOption = kitOption;
        await this.update(pendingPayment);
      }

      return pendingPayment;
    }

    if(tShirtSize != TShirtSize.NONE){
      let paymentsWithThisTShirtSize = await this.count({ tShirtSize, status: PaymentStatus.APPROVED });
      paymentsWithThisTShirtSize += await this.count({ tShirtSize, status: PaymentStatus.PENDING });
      if (paymentsWithThisTShirtSize >= tShirt.quantity) {
        throw new HttpError(400, ["Camisetas deste tamanho estão esgotadas!"]);
      }

    }

    const newPaymentData: Payment = {
      userId: user.id,
      status: PaymentStatus.PENDING,
      withSocialBenefit,
      socialBenefitFileName,
      tShirtSize,
      foodOption,
      kitOption,
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
    const userPayments = await PaymentModel.find({ userId });
    const approvedPayment = userPayments.find((userPayment) => userPayment.status === PaymentStatus.APPROVED);
    if (approvedPayment) {
      return this.mapEntity(approvedPayment);
    }
    const pendingPayment = userPayments.find((userPayment) => userPayment.status === PaymentStatus.PENDING);

    return pendingPayment && this.mapEntity(pendingPayment);
  }

  public async cancelOldPendingPayments(): Promise<void> {
    const maxDate = new Date();
    maxDate.setDate(maxDate.getDate() - 1);
    maxDate.setHours(0, 0, 0, 0);

    const pendingPayments = await PaymentModel.find({ status: PaymentStatus.PENDING });

    for (const payment of pendingPayments) {
      if (payment.updatedAt < new Date(maxDate).getTime()) {
        payment.status = PaymentStatus.CANCELED;
        payment.tShirtSize = null;
        await this.update(payment);
      }
    }
  }

  async generateQrCodes(): Promise<void> {
    const users = await this.userService.find({ pagination: new PaginationRequest(1, 9999) });
    const payments = await this.find({ status: PaymentStatus.APPROVED });

    for (const user of users.getEntities()) {
    //   if (payments.find((payment) => user.id === payment.userId)) {
    //     await QRCode.toFile(`./qrcode/${user.email} - ${user.name}.png`, user.id, {
    //       color: {
    //         dark: '#000000',
    //         light: '#0000',
    //       },
    //       errorCorrectionLevel: 'H',
    //       type: "png",
    //     });
    //   } else {
    //     await QRCode.toFile(`./qrcode/${user.email} - ${user.name}.png`, user.id, {
    //       color: {
    //         dark: '#000000',
    //         light: '#0000',
    //       },
    //       errorCorrectionLevel: 'H',
    //       type: "png",
    //     });
    //   }
    // }
    await QRCode.toFile(`./qr-code/${user.email} - ${user.name}.png`, user.id, {
      color: {
        dark: '#000000',
        light: '#ffffff',
      },
      errorCorrectionLevel: 'H',
      type: "png",
    });
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
      foodOption: entity.foodOption,
      kitOption: entity.kitOption,
      status: entity.status,
      createdAt: entity.createdAt,
      updatedAt: entity.updatedAt,
    };
  }
}
