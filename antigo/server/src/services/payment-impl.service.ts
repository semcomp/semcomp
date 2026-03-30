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
import SaleService from "./sale.service";
import FoodOption from "../lib/constants/food-option-enum";
import PaymentStatus from "../lib/constants/payment-status-enum";
import { PaginationRequest, PaginationResponse } from "../lib/pagination";
import Sale from "../models/sales";

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

  public async find(filters?: any): Promise<Payment[]> {
    let payments = null;
    if (filters?.salesOption && Array.isArray(filters.salesOption)) {
      filters = { ...filters, salesOption: { $in: filters.salesOption } };
    }

    if (filters?.status && Array.isArray(filters.status)) {
        filters = {...filters, status: { $in: filters.status } };
    }

    payments = await PaymentModel.find(filters);
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
    let entity = null; 
    if (filters && filters.salesOption) {
      entity = await PaymentModel.countDocuments({
        ...filters,
        salesOption: { $in: filters.salesOption },
      });
    } else {
      entity = await PaymentModel.findOne(filters).sort({ _id: -1 });
    }

    return entity && this.mapEntity(entity);
  }

  public async findByUserId(id: string): Promise<Payment[]> {
    const entity = await PaymentModel.find({ userId: id }).sort({ _id: -1 });

    if (entity && entity.length > 0) {
      return entity.map((payment) => this.mapEntity(payment as Model<Payment> & Payment));
    }

    return null;
  }

  public async count(filters?: Partial<Payment>): Promise<number> {
    let count = 0;
    if (filters && filters.salesOption) {
      count = await PaymentModel.countDocuments({
        ...filters,
        salesOption: { $in: filters.salesOption },
      });
    } else {
      count = await PaymentModel.countDocuments(filters);
    }
    
    return count;
  }

  public async create(payment: Payment): Promise<Payment> {
    payment.id = this.idService.create();
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

  public async getPurchasedCoffee(): Promise<number> { //DEPRECTED
    const getPurchasedCoffee = await PaymentModel.countDocuments({
      status: { $in: ['approved', 'pending'] },
      kitOption: { $in: ['Coffee', 'Kit e Coffee'] }
    });
    return getPurchasedCoffee;
  }

  public async getAvailableTShirts(): Promise<Object> {
    const availableTShirts: Object = {};
    Object.keys(TShirtSize).map((key) => {
      if (key != 'NONE') availableTShirts[key] = 0;
    });

    const approvedPayments = await this.find({ status: PaymentStatus.APPROVED });
    const pendingPayments = await this.find({ status: PaymentStatus.PENDING });

    approvedPayments.map((payment) => { availableTShirts[payment.tShirtSize]-- });
    pendingPayments.map((payment) => { availableTShirts[payment.tShirtSize]-- });

    const allAvailableTShirts = await tShirtService.findMany({});
    allAvailableTShirts.map((tShirt) => { availableTShirts[tShirt.size] += tShirt.quantity; })

    return availableTShirts;
  }

  
  public findItemsInSales(saleOptionItemsIds: string[], purchasedItemsIds: string[]): boolean {
    const hasRepeatedItem = saleOptionItemsIds.some(saleId => 
      purchasedItemsIds.some(itemId => {
        if (saleId === itemId) {
          return true;
        }
        return false;
      })
    );
  
    return hasRepeatedItem;
  }
  
  

  public async createPayment(
    userId: string,
    withSocialBenefit: boolean,
    socialBenefitFileName: string,
    tShirtSize: TShirtSize,
    foodOption: FoodOption,
    saleOption: string[],
  ): Promise<Payment> {
    const config = await ConfigService.getOne();
    if (config === undefined) {
      throw new HttpError(401, ["Erro ao acessar as configurações de ambiente!"]);
    } else if (!(config.openSales)) {
      throw new HttpError(503, ["Vendas encerradas!"]);
    }

    const user = await this.userService.findById(userId);
    if (!user) {
      throw new HttpError(400, ["Usuário não encontrado"]);
    }

    if (saleOption.length === 0) {
      throw new HttpError(400, ["Selecione ao menos uma opção de venda!"]);
    }

    const userPayments = await this.find({ userId, status: [PaymentStatus.APPROVED, PaymentStatus.PENDING] });
    const salesDoc = await SaleService.findWithUsedQuantity({pagination: new PaginationRequest(1, 9999)});
    const salesOptionObjects : Sale[] = [];
    const salesPaymentObject: Sale[] = [];
    const needTshrit = false;

    for (const sale of salesDoc.getEntities()) {
      // Busca todos os objetos de vendas para a compra atual
      if (saleOption.includes(sale.id)) {
        salesOptionObjects.push(sale);
      }

      // Busca todos os objetos de vendas anteriores
      if (userPayments) {
        for (const userPayment of userPayments) {
          if (userPayment.salesOption.includes(sale.id)) {
            salesPaymentObject.push(sale);
          }
        }
      }
    }

    if (salesOptionObjects.length !== saleOption.length) {
      throw new HttpError(400, ["Item não encontrado, atualize a página."]);
    }
    
    if (needTshrit && tShirtSize !== TShirtSize.NONE) {
      const tShirt = await tShirtService.findOne({ size: tShirtSize });

      if (!tShirt) {
        throw new HttpError(400, ['Camisa não encontrada!']);
      }

      let paymentsWithThisTShirtSize = await this.count({ tShirtSize, status: PaymentStatus.APPROVED });
      paymentsWithThisTShirtSize += await this.count({ tShirtSize, status: PaymentStatus.PENDING });
      if (paymentsWithThisTShirtSize >= tShirt.quantity) {
        throw new HttpError(400, ["Camisetas deste tamanho estão esgotadas!"]);
      }
    }

    let price = 0;
    salesOptionObjects.forEach((sale) => {
      price += sale.price;
    })
    price = withSocialBenefit ? price/2 : price;

    // Buscando itens repetidos
    const saleOptionItemsIds = salesOptionObjects.map((sale) => sale.items).flat();
    const duplicates = saleOptionItemsIds.filter((item, index) => saleOptionItemsIds.indexOf(item) !== index);
    const conflictOldPayments = this.findItemsInSales(saleOptionItemsIds, salesPaymentObject.map((sale: Sale) => sale.items).flat());
    if (duplicates.length > 0) {
      throw new HttpError(400, ["Você tem itens repetidos!"]);
    } else if (conflictOldPayments) {
      throw new HttpError(400, ["Pelo menos um dos itens já foi adquirido em compras anteriores!"]);
    }

    // Buscando a disponibilidade dos itens das vendas
    for (const itemId of saleOptionItemsIds) {
      const item = salesDoc.getEntities().find((sale) => sale.id === itemId);

      if (!item || item.quantity <= 0 || item.quantity - item.usedQuantity <= 0) {
        throw new HttpError(400, [`Um dos itens não está mais disponível no momento, tente novamente!`]);
      }
    }

    // const pendingPayment = userPayments.find((userPayment) => userPayment.status === PaymentStatus.PENDING);
    // if (pendingPayment) {
    //   if (
    //     pendingPayment.withSocialBenefit !== withSocialBenefit ||
    //     pendingPayment.socialBenefitFileName !== socialBenefitFileName ||
    //     pendingPayment.tShirtSize !== tShirtSize
    //   ) {
    //     pendingPayment.socialBenefitFileName = socialBenefitFileName;

    //     if (pendingPayment.tShirtSize !== tShirtSize && tShirtSize != TShirtSize.NONE) {
    //       pendingPayment.tShirtSize = tShirtSize;
    //       let paymentsWithThisTShirtSize = await this.count({ tShirtSize, status: PaymentStatus.APPROVED });
    //       paymentsWithThisTShirtSize += await this.count({ tShirtSize, status: PaymentStatus.PENDING });
    //       if (paymentsWithThisTShirtSize >= tShirt.quantity) {
    //         throw new HttpError(400, ["Camisetas deste tamanho estão esgotadas!"]);
    //       }
    //     }

    //     if (pendingPayment.withSocialBenefit !== withSocialBenefit) {
    //       const paymentResponse = await this.paymentIntegrationService.create(
    //         price,
    //         user.email,
    //         "Semcomp",
    //         `${this.notificationUrl}/${pendingPayment.id}`
    //       );

    //       pendingPayment.withSocialBenefit = withSocialBenefit;
    //       pendingPayment.paymentIntegrationId = paymentResponse.id;
    //       pendingPayment.qrCode = paymentResponse.qrCode;
    //       pendingPayment.qrCodeBase64 = paymentResponse.qrCodeBase64;
    //     }

    //     pendingPayment.salesOption = saleOption;
    //     await this.update(pendingPayment);
    //   }

    //   return pendingPayment;
    // }

    const newPaymentData: Payment = {
      userId: user.id,
      status: PaymentStatus.PENDING,
      withSocialBenefit,
      socialBenefitFileName,
      tShirtSize,
      foodOption,
      price,
      salesOption: saleOption,
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
    } catch (error) {
      await this.delete(newPayment);
      console.log('Error creating payment', { error, newPaymentData });
      throw new HttpError(400, ["Erro no servidor! Tente novamente mais tarde."]);
    }

    const timelimit = 2 * 60 * 60 * 1000; // 2 horas
    setTimeout(async () => {
      const expiredPayment = await this.findById(newPayment.id);
      await this.cancelPayment(expiredPayment);
    }, timelimit);

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

  public async getUserPayment(userId: string): Promise<Payment[]> {
    const allPayments = [];
    const userPayments = await PaymentModel.find({ userId });
    const approvedPayment = userPayments.filter((userPayment: Payment) => userPayment.status === PaymentStatus.APPROVED);

    if (approvedPayment.length > 0) {
      approvedPayment.forEach((payment: Payment) => {
        allPayments.push(this.mapEntity(payment));
      });
    }
    const pendingPayment = userPayments.filter((userPayment: Payment) => userPayment.status === PaymentStatus.PENDING);

    if (pendingPayment.length > 0) {
      pendingPayment.forEach((payment: Payment) => {
        allPayments.push(this.mapEntity(payment));
      });
    }

    return allPayments;
  }

  public async cancelPayment(payment: Payment) {
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

  public async getPaymentWithUsers(pagination: PaginationRequest): Promise<PaginationResponse<Payment>> {
    const itemsPerPage = pagination.getItems();
    const page = pagination.getPage();
    const skip = (page - 1) * itemsPerPage;
  
    const aggregationPipeline = [
      {
        $lookup: {
          from: 'user',
          localField: 'userId',
          foreignField: 'id',
          as: 'user'
        }
      },
      { $unwind: "$user" },
      {
        $facet: {
          metadata: [ { $count: "total" } ],
          data: [
            { $skip: skip },
            { $limit: itemsPerPage }
          ]
        }
      }
    ];
  
    const result = await PaymentModel.aggregate(aggregationPipeline);
  
    if (result && result.length > 0 && result[0].data.length > 0) {
      const entities: Payment[] = result[0].data.map((payment) => this.mapEntityWithUser(payment));
      
      const totalItems = result[0].metadata[0]?.total || 0;
  
      const paginatedResponse = new PaginationResponse(entities, totalItems);
      return paginatedResponse;
    }
    
    return new PaginationResponse([], 0);
  }

  private mapEntity(entity: Model<Payment> & Payment | Payment): Payment {
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
      salesOption: entity.salesOption,
      price: entity.price,
      status: entity.status,
      createdAt: entity.createdAt,
      updatedAt: entity.updatedAt,
    };
  }

  private mapEntityWithUser(entity: Payment & {user: {name: string, email: string}}
  ): Payment & {userName: string, userEmail: string} {
    return {
      id: entity.id,
      paymentIntegrationId: entity.paymentIntegrationId,
      userId: entity.userId,
      userName: entity.user.name,
      userEmail: entity.user.email,
      qrCode: '',
      qrCodeBase64: '',
      withSocialBenefit: entity.withSocialBenefit,
      socialBenefitFileName: entity.socialBenefitFileName,
      tShirtSize: entity.tShirtSize,
      foodOption: entity.foodOption,
      salesOption: entity.salesOption,
      price: entity.price,
      status: entity.status,
      createdAt: entity.createdAt,
      updatedAt: entity.updatedAt,
    };
  }
}
