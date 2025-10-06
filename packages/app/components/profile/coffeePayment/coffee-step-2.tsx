import { ReactHTMLElement, useEffect, useState } from "react";
import Input, { InputType } from "../../Input";
import { CoffeePaymentData } from "./coffee-modal";
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
  showHandleSocialBenefit,
  showTshirtChoices,
}: {
  data: CoffeePaymentData;
  setData: any;
  showHandleSocialBenefit: boolean;
  showTshirtChoices: boolean;
}) {
  const [tShirtChoices, setTShirtChoices] = useState<string[]>([]);
  const [hasCoffee, setHasCoffee] = useState<boolean>(false);

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
        if (availableTShirts[tshirt] > 0) {
          if (availableTShirts[tshirt] != 1)
            choices.push(`${tshirt} (${availableTShirts[tshirt]} disponíveis)`);
          else
            choices.push(`${tshirt} (${availableTShirts[tshirt]} disponível)`);
        }
      })

      setTShirtChoices(choices);
    }

    getAvailableTShirts();
    setHasCoffee(data.sale?.some(sale => sale.hasCoffee));
  }, [])

  return (
    <div className="my-6">
      {showHandleSocialBenefit &&
        <Input
          className="my-3"
          label="Entrada social? Pode ser solicitado caso possua acesso ao programa de bolsas da PAPFE"
          onChange={handleWithSocialBenefitChange}
          value={data.withSocialBenefit}
          type={InputType.Checkbox}
        />
      }
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

      {hasCoffee &&
        <>
          <Input
            className="pt-3 my-3"
            label={<strong>Possui alguma restrição alimentar?</strong>}
            value={data.foodOption}
            onChange={handlefoodOptionChange}
            choices={foodOptions}
            type={InputType.Select}
          />
        
          <div className="text-sm text-gray-700 mt-2">
            <p>
              <strong>Vai comprar o coffee e possui alguma outra restrição alimentar?</strong><br />
              Procure a coordenação e indique quais são suas restrições.
            </p>
          </div>
        </>
      
      }

      {showTshirtChoices && (
        <>
          <br/>
          <Input
            className="my-3  font-secondary"
            label={<b>Tamanho da camiseta</b>}
            value={data.tShirtSize}
            onChange={handleTShirtSizeChange}
            choices={tShirtChoices}
            type={InputType.Select}
          />

          <p>
            Medidas aproximada da modelagem tradicional <br/>
            LARGURA X COMPRIMENTO <br/><br/>
    
            P   - 51x70 cm <br/>
            M   - 54X72 cm <br/>
            G   - 56X74 cm <br/>
            GG  - 58X76 cm <br/>
            EXG - 64x76 cm <br/><br/>

            <b>Na dúvida entre dois tamanhos, opte pelo maior.</b>
          </p>
        </>
      )}
    </div>
  );
}

export default CoffeeStep2;
