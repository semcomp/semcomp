export default interface PaymentService {
  create(userId: string): Promise<any>;
  receive(id: number): Promise<void>;
}
