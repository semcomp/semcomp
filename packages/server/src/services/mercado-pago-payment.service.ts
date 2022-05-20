import mercadopago from "mercadopago";

import PaymentService, { CreatedPayment, Payment } from "./payment.service";

export default class MercadoPagoPaymentService implements PaymentService {
  constructor(accessToken: string) {
    mercadopago.configurations.setAccessToken(accessToken);
  }

  public async create(amount: number, email: string, description: string): Promise<CreatedPayment> {
    const paymentData = {
      transaction_amount: amount,
      description: description,
      payment_method_id: 'pix',
      installments: null,
      payer: {
        email: email,
      }
    };

    const createPaymentResponse = await mercadopago.payment.create(paymentData);

    const response = {
      id: createPaymentResponse.body.id,
      qrCode: createPaymentResponse.body.point_of_interaction.transaction_data.qr_code,
      qrCodeBase64: createPaymentResponse.body.point_of_interaction.transaction_data.qr_code_base64,
    }

    return response;
  }

  public async receive(id: number): Promise<Payment> {
    const payment = await mercadopago.payment.findById(id);

    const response = {
      id: payment.body.id,
      createdAt: new Date(payment.body.date_created).getTime(),
      approvedAt: new Date(payment.body.date_approved).getTime(),
      status: payment.body.status,
      payerEmail: payment.body.payer.email,
      amount: payment.body.transaction_amount,
    };

    return response;
  }
}
