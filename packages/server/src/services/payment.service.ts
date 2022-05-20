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

export default interface PaymentService {
  create(amount: number, email: string, description: string): Promise<CreatedPayment>;
  receive(id: number): Promise<Payment>;
}
