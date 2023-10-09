import { ReactHTMLElement } from "react";
import Input, { InputType } from "../../Input";
import { CoffeePaymentData } from "./coffee-modal";

export enum TShirtSize {
  NONE = "NONE",
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

const TShirtSizes = Object.values({
  PP: "PP",
  P: "P",
  M: "M",
  G: "G",
  GG: "GG",
  XGG1: "XGG1",
  XGG2: "XGG2",
});
const foodOptions = Object.values(FoodOption);


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

  function handleTShirtSizeChange(event: React.ChangeEvent<HTMLInputElement>) {
    const value = event.target.value;
    setData({ ...data, tShirtSize: value });
  }

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
      {}
      { (data.kitOption && (data?.kitOption).includes("Kit")) ? (
              <Input
              className="my-3"
              label="Tamanho da camiseta"
              value={data.tShirtSize}
              onChange={handleTShirtSizeChange}
              choices={TShirtSizes}
              type={InputType.Select}
            />
      ):null }
      { (!data.kitOption) ? ( <b>Nenhuma opção seleciona no step 1.</b> ):null }

    </div>
  );
}

export default CoffeeStep2;
