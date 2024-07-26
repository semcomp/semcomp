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
    const entity = await PaymentModel.findOne(filters).sort({ _id: -1 });

    return entity && this.mapEntity(entity);
  }

  public async findByUserId(id: string): Promise<Payment> {
    const entity = await PaymentModel.findOne({ userId: id }).sort({ _id: -1 });

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

  public async getAvailableTShirts(): Promise<Object> {
    const availableTShirts: Object = {};
    Object.keys(TShirtSize).map((key) => { availableTShirts[key] = 0 });

    const allTShirtSize = Object.values(TShirtSize);

    const approvedPayments = await this.find({ status: PaymentStatus.APPROVED });
    const pendingPayments = await this.find({ status: PaymentStatus.PENDING });

    approvedPayments.map((payment) => { availableTShirts[payment.tShirtSize]-- });
    pendingPayments.map((payment) => { availableTShirts[payment.tShirtSize]-- });

    const promises = allTShirtSize.map(async (shirtSize) => {
      if (shirtSize === 'NONE') return;
      const tShirt = await tShirtService.findOne({ size: shirtSize });
      const tShirtCount = tShirt.quantity;
      availableTShirts[shirtSize] += tShirtCount;
    })

    await Promise.all(promises);

    return availableTShirts;
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
    if (config === undefined) {
      throw new HttpError(401, ["Erro ao acessar as Configs(auth.service.ts)"]);
    } else if (!(config.openSales)) {
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

    if (kitOption.includes("Coffee")) {
      const purchasedCoffee = await this.getPurchasedCoffee();
      if (config.coffeeTotal - purchasedCoffee <= 0) {
        throw new HttpError(400, ["Coffees esgotados!"]);
      }
    }

    let price;

    if (kitOption.includes("Kit") && kitOption.includes("Coffee")) {
      price = 75;
    } else if (kitOption.includes("Kit")) {
      price = 65;
    } else {
      price = 18;
    }

    price = withSocialBenefit ? price / 2 : price;

    const userPayment = await this.findOne({ userId });

    if (userPayment) {
      if (userPayment.status === PaymentStatus.APPROVED) {
        throw new HttpError(400, ["Camiseta já comprada!"]);
      } else if (userPayment.status === PaymentStatus.PENDING) {
        if (
          userPayment.withSocialBenefit !== withSocialBenefit ||
          userPayment.socialBenefitFileName !== socialBenefitFileName ||
          userPayment.tShirtSize !== tShirtSize ||
          userPayment.kitOption !== kitOption
        ) {
          userPayment.socialBenefitFileName = socialBenefitFileName;

          if (userPayment.tShirtSize !== tShirtSize && tShirtSize != TShirtSize.NONE) {
            userPayment.tShirtSize = tShirtSize;
            let paymentsWithThisTShirtSize = await this.count({ tShirtSize, status: PaymentStatus.APPROVED });
            paymentsWithThisTShirtSize += await this.count({ tShirtSize, status: PaymentStatus.PENDING });
            if (paymentsWithThisTShirtSize >= tShirt.quantity) {
              throw new HttpError(400, ["Camisetas deste tamanho estão esgotadas!"]);
            }
          }

          if (userPayment.withSocialBenefit !== withSocialBenefit ||
            userPayment.kitOption !== kitOption) {

            await this.paymentIntegrationService.cancel(userPayment.paymentIntegrationId);

            const paymentResponse = await this.paymentIntegrationService.create(
              price,
              user.email,
              "Semcomp",
              `${this.notificationUrl}/${userPayment.id}`
            );

            // if(kitOption === KitOption.COFFEE){
            //   userPayment.tShirtSize = TShirtSize.NONE;
            // }

            userPayment.withSocialBenefit = withSocialBenefit;
            userPayment.paymentIntegrationId = paymentResponse.id;
            userPayment.qrCode = paymentResponse.qrCode;
            userPayment.qrCodeBase64 = paymentResponse.qrCodeBase64;
          }

          userPayment.kitOption = kitOption;
          await this.update(userPayment);
        }

        return userPayment;
      }
    }

    if (tShirtSize != TShirtSize.NONE) {
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

    try {
      const paymentResponse = await this.paymentIntegrationService.create(
        price,
        user.email,
        "Semcomp",
        `${this.notificationUrl}/${newPayment.id}`
      );
      newPayment.paymentIntegrationId = paymentResponse.id;
      newPayment.qrCode = paymentResponse.qrCode;
      newPayment.qrCodeBase64 = paymentResponse.qrCodeBase64;
    } catch {
      await this.delete(newPayment);
      throw new HttpError(400, ["Erro no servidor! Tente novamente mais tarde."]);
    }

    const timelimit = 2 * 60 * 60 * 1000; // 2 horas
    setTimeout(async () => {
      const expiredPayment = await this.findById(newPayment.id);
      await this.cancelPayment(expiredPayment);
    }, timelimit);

    console.log("Created the qrcodes and started the timer for 2 hours!");

    return await this.update(newPayment);
  }

  public async receive(id: number): Promise<void> {
    const payment = await PaymentModel.findOne({ id });
    const paymentResponse = await this.paymentIntegrationService.find(payment.paymentIntegrationId);

    if (payment.status === PaymentStatus.CANCELED) {
      // caso o pagamento esteja cancelado no banco de dados, então é preciso checar se o pagamento
      // acabou sendo efetuado posteriormente ao cancelamento. Se sim, devemos fazer um reembolso
      if (paymentResponse.status === 'approved') {
        const response = await this.paymentIntegrationService.refund(payment.paymentIntegrationId, payment.amount);
        if (response) await this.delete(payment);
      } else {
        const response = await this.paymentIntegrationService.cancel(payment.paymentIntegrationId);
        if (response) await this.delete(payment);
      }
    } else if (paymentResponse.status === 'approved') {
      // caso o pagamento não esteja cancelado, e esteja aprovado no mercadopago, então atualizar no
      // banco de dados
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

  public async cancelPayment(payment: Payment) {
    console.log("canceled on the database!");
    if (payment.status === PaymentStatus.PENDING) {
      payment.status = PaymentStatus.CANCELED;
      payment.tShirtSize = null;
      await this.update(payment);
    }
  }

  public async cancelOldPendingPayments(): Promise<void> {
    const maxDate = new Date();
    maxDate.setDate(maxDate.getDate() - 1);
    maxDate.setHours(0, 0, 0, 0);

    const pendingPayments = await PaymentModel.find({ status: PaymentStatus.PENDING });

    for (const payment of pendingPayments) {
      if (payment.updatedAt < new Date(maxDate).getTime()) {
        await this.cancelPayment(payment);
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
