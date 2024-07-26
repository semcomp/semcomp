import { ReactHTMLElement, useEffect, useState } from "react";
import Input, { InputType } from "../../Input";
import { CoffeePaymentData } from "./coffee-modal";
import { KitOption } from "./coffee-step-1";
import API from "../../../api";

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
  const [tShirtChoices, setTShirtChoices] = useState<string[]>([]);
  
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

  useEffect(() => {
    const getAvailableTShirts = async () => {
      const availableTShirts : Object = await API.coffee.getAvailableTShirts().then((res) => res.data);
      
      const choices: string[] = [];
      Object.keys(availableTShirts).map((tshirt) => {
        if (tshirt !== "NONE" && availableTShirts[tshirt] != 0) {
          choices.push(`${tshirt} (${availableTShirts[tshirt]} disponíveis)`);
        }
      })

      setTShirtChoices(choices);
    }

    getAvailableTShirts();
  }, [])

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
      { (data.kitOption && (data?.kitOption).includes("Kit")) && (
              <Input
              className="my-3 font-secondary"
              label="Tamanho da camiseta"
              value={data.tShirtSize}
              onChange={handleTShirtSizeChange}
              choices={tShirtChoices}
              type={InputType.Select}
            />
      )}
      
      { (data.kitOption && (data?.kitOption).includes("Kit")) &&
          (
            <p>
            <br/>
            Medidas aproximada da modelagem tradicional <br/>
            LARGURA X COMPRIMENTO <br/><br/>
    
            PP- 51x66 cm <br/>
            P - 53x70 cm <br/>
            M - 56X75 cm <br/>
            G - 58X77 cm <br/>
            GG - 64X80 cm <br/>

            </p>
          )
        }
        
      { (!data.kitOption) ? ( <b>Nenhuma opção seleciona no step 1.</b> ):null }

    </div>
  );
}

export default CoffeeStep2;
