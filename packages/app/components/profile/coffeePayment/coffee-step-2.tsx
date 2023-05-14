import { ReactHTMLElement } from "react";
import Input, { InputType } from "../../Input";
import CoffeePayment from "./coffee-modal";

export enum TShirtSize {
  PP = "PP",
  P = "P",
  M = "M",
  G = "G",
  GG = "GG",
  XGG1 = "XGG1",
  XGG2 = "XGG2",
}


export enum FoodOption {
  NONE = "Nenhuma", 
  VEGAN = "Vegano",
  VEGETARIAN = "Vegetariano",
}

// const TShirtSizes = Object.values(TShirtSize);
const foodOptions = Object.values(FoodOption);

export type CoffeePaymentData = {
  withSocialBenefit: boolean;
  socialBenefitFile: File;
  // tShirtSize: TShirtSize;
  foodOption: FoodOption;
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

  function handleSocialBenefitFileChange(
    event: React.ChangeEvent<HTMLInputElement>
  ) {
    const value = event.target.files[0];
    setData({ ...data, socialBenefitFile: value });
  }

  // function handleTShirtSizeChange(event: React.ChangeEvent<HTMLInputElement>) {
  //   const value = event.target.value;
  //   setData({ ...data, tShirtSize: value });
  // }

  function handlefoodOptionChange(event: React.ChangeEvent<HTMLInputElement>) {
    const value = event.target.value;
    setData({...data, foodOption: value});
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
          onChange={handleSocialBenefitFileChange}
          type={InputType.File}
        />
      )}
      {/* <Input
        className="my-3"
        label="Tamanho da camiseta"
        value={data.tShirtSize}
        onChange={handleTShirtSizeChange}
        choices={TShirtSizes}
        type={InputType.Select}
      /> */}
      <Input
        className="my-3"
        label="Possui alguma restrição alimentar?"
        value={data.foodOption}
        onChange={handlefoodOptionChange}
        choices={foodOptions}
        type={InputType.Select}
      />
    </div>
  );
}

export default CoffeeStep2;
