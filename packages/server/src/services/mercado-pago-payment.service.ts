import axios from "axios";

import PaymentIntegrationService, { CreatedPayment, Payment } from "./payment-integration.service";

export default class MercadoPagoPaymentService implements PaymentIntegrationService {
  private accessToken: string;

  constructor(accessToken: string) {
    this.accessToken = accessToken;
  }

  public async create(
    amount: number,
    email: string,
    description: string,
    notificationUrl: string
  ): Promise<CreatedPayment> {
    const paymentData = {
      transaction_amount: amount,
      description: description,
      payment_method_id: 'pix',
      installments: null,
      payer: {
        email: email,
      },
      notification_url: notificationUrl,
    };

    const headers = {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${this.accessToken}`,
    }

    const createPaymentResponse = (await axios.post(
      'https://api.mercadopago.com/v1/payments',
      paymentData, {
      headers: headers
    })).data;

    const response = {
      id: createPaymentResponse.id,
      qrCode: createPaymentResponse.point_of_interaction.transaction_data.qr_code,
      qrCodeBase64: createPaymentResponse.point_of_interaction.transaction_data.qr_code_base64,
    }

    return response;
  }

  public async find(id: number): Promise<Payment> {
    const headers = {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${this.accessToken}`,
    }

    const payment = (await axios.get(
      `https://api.mercadopago.com/v1/payments/${id}`, { headers: headers })).data;


    const response = {
      id: payment.id,
      createdAt: new Date(payment.date_created).getTime(),
      approvedAt: new Date(payment.date_approved).getTime(),
      status: payment.status,
      payerEmail: payment.payer.email,
      amount: payment.transaction_amount,
    };

    return response;
  }

  public async refund(id: number, amount: number): Promise<Payment> {
    const headers = {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${this.accessToken}`,
    }

    try {
      const refund = (await axios.post(
        `https://api.mercadopago.com/v1/payments/${id}/refunds`,
        { amount: amount },
        { headers: headers })).data

      const response = {
        id: refund.id,
        createdAt: new Date(refund.date_created).getTime(),
        approvedAt: new Date(refund.date_approved).getTime(),
        status: refund.status,
        payerEmail: refund.payer.email,
        amount: refund.transaction_amount,
      };

      return response;
    } catch (e) {
      console.error(e);
    }
  }

  public async cancel(id: number): Promise<Payment> {
    const headers = {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${this.accessToken}`,
    }

    try {
      const cancel = (await axios.put(
        `https://api.mercadopago.com/v1/payments/${id}`,
        { status: "cancelled" },
        { headers: headers })).data
  
      const response = {
        id: cancel.id,
        createdAt: new Date(cancel.date_created).getTime(),
        approvedAt: new Date(cancel.date_approved).getTime(),
        status: cancel.status,
        payerEmail: cancel.payer.email,
        amount: cancel.transaction_amount,
      };
  
      return response;
    } catch (e) {
      console.error(e);
    }
  }
}
