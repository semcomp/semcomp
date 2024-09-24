import { ReactHTMLElement, useEffect, useState } from "react";
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
  P: "P",
  M: "M",
  G: "G",
  GG: "GG",
  XGG1: "XGG1",
});

const foodOptions = Object.values(FoodOption);


function CoffeeStep2({
  data,
  setData,
}: {
  data: CoffeePaymentData;
  setData: any;
}) {
  const [hasTShirt, setHasTshirt] = useState(false);

  useEffect(() => {
    for (const sale of data.sale) {
      if (sale.hasTShirt) {
        setHasTshirt(true);
        break;
      }
    }
  }, []);

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
      { (hasTShirt) && (
        <>
            <Input
            className="my-3"
            label="Tamanho da camiseta"
            value={data.tShirtSize}
            onChange={handleTShirtSizeChange}
            choices={TShirtSizes}
            type={InputType.Select}
          />

          <p>
            <br/>
            Medidas aproximada da modelagem tradicional <br/>
            LARGURA X COMPRIMENTO <br/><br/>
    
            P   - 50x70 cm <br/>
            M   - 52x72 cm <br/>
            G   - 54X74 cm <br/>
            GG  - 57X77 cm <br/>
            XGG - 60X80 cm <br/><br/>

            <b>Na dúvida entre dois tamanhos, opte pelo maior.</b>
          </p>
        </>
      )}
    </div>
  );
}

export default CoffeeStep2;
