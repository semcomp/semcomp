import TShirtSize from "../lib/constants/t-shirt-size-enum";
import Payment from "../models/payment";
import FoodOption from "../lib/constants/food-option-enum";

export default interface PaymentService {
  createPayment(
    userId: string,
    withSocialBenefit: boolean,
    socialBenefitFileName: string,
    // tShirtSize: TShirtSize,
    foodOption: FoodOption,
  ): Promise<Payment>;
  receive(id: number): Promise<void>;
  getUserPayment(userId: string): Promise<Payment>;
}
