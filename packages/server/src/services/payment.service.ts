import TShirtSize from "../lib/constants/t-shirt-size-enum";
import Payment from "../models/payment";
import FoodOption from "../lib/constants/food-option-enum";
import KitOption from "../lib/constants/kit-option";

export default interface PaymentService {
  createPayment(
    userId: string,
    withSocialBenefit: boolean,
    socialBenefitFileName: string,
    tShirtSize: TShirtSize,
    foodOption: FoodOption,
    kitOption: KitOption,
  ): Promise<Payment>;
  receive(id: number): Promise<void>;
  getUserPayment(userId: string): Promise<Payment>;
}
