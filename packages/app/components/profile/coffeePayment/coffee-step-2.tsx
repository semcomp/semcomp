import Input, { InputType } from "../../Input";

export enum TShirtSize {
  PP = "PP",
  P = "P",
  M = "M",
  G = "G",
  GG = "GG",
  XGG1 = "XGG1",
  XGG2 = "XGG2",
}

const TShirtSizes = Object.values(TShirtSize);

export type CoffeePaymentData = {
  withSocialBenefit: boolean;
  socialBenefitNumber: string;
  tShirtSize: TShirtSize;
};

function CoffeeStep2({
  data,
  setData,
}: {
  data: CoffeePaymentData;
  setData: any;
}) {
  function handleWithSocialBenefitChange(
    event: React.ChangeEvent<HTMLInputElement>
  ) {
    const value = event.target.checked;
    setData({ ...data, withSocialBenefit: value });
  }

  function handleSocialBenefitNumberChange(
    event: React.ChangeEvent<HTMLInputElement>
  ) {
    const value = event.target.value;
    setData({ ...data, socialBenefitNumber: value });
  }

  function handleTShirtSizeChange(event: React.ChangeEvent<HTMLInputElement>) {
    const value = event.target.value;
    setData({ ...data, tShirtSize: value });
  }

  return (
    <div className="my-6">
      <Input
        className="my-3"
        label="Entrada social?"
        onChange={handleWithSocialBenefitChange}
        value={data.withSocialBenefit}
        type={InputType.Checkbox}
      />
      {data.withSocialBenefit && (
        // <Input
        //   className="my-3"
        //   label="Número do benefício papfe"
        //   value={data.socialBenefitNumber}
        //   onChange={handleSocialBenefitNumberChange}
        //   type={InputType.Text}
        // />
        <Input
          value={data.socialBenefitNumber}
          onChange={handleSocialBenefitNumberChange}
          type={InputType.File}
        />
      )}
      <Input
        className="my-3"
        label="Tamanho da camiseta"
        value={data.tShirtSize}
        onChange={handleTShirtSizeChange}
        choices={TShirtSizes}
        type={InputType.Select}
      />
    </div>
  );
}

export default CoffeeStep2;
