export type CreatedPayment = {
  id: number,
  qrCode: string,
  qrCodeBase64: string,
}

export type Payment = {
  id: number,
  createdAt: number,
  approvedAt: number,
  status: string,
  payerEmail: string,
  amount: number,
};

export default interface PaymentIntegrationService {
  create(
    amount: number,
    email: string,
    description: string,
    notificationUrl: string
  ): Promise<CreatedPayment>;

  find(id: number): Promise<Payment>;
}
