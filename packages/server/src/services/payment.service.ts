import TShirtSize from "../lib/constants/t-shirt-size-enum";
import Payment from "../models/payment";

export default interface PaymentService {
  createPayment(
    userId: string,
    withSocialBenefit: boolean,
    socialBenefitNumber: string,
    tShirtSize: TShirtSize,
  ): Promise<Payment>;
  receive(id: number): Promise<void>;
}
