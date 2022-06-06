import Payment from "../models/payment";

export default interface PaymentService {
  createPayment(userId: string): Promise<Payment>;
  receive(id: number): Promise<void>;
}
