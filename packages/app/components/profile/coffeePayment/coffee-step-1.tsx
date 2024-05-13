import { CoffeePaymentData } from "./coffee-modal";
import Input, { InputType } from "../../Input";
import handler from '../../../api/handlers';
import { useEffect, useState } from "react";

export enum KitOption {
  COMPLETE = "Kit e Coffee", 
  KIT = "Kit",
  COFFEE = "Coffee",
  NONE = "Nenhum",
}

function CoffeeStep1({
  data,
  setData,
}: {
  data: CoffeePaymentData;
  setData: any;
}) {
  const [kitOption, setKitOption] = useState(null);

  async function fetchKitOption () {
    const config = await handler.config.getConfig().then((res) => res.data);
    const purchased = await handler.coffee.getPurchasedCoffees().then((res) => res.data);
    const remainingCoffees = config['coffeeTotal'] - purchased;  
    if(config['kitOption'] === "COMPLETE" && remainingCoffees > 0) {
      setKitOption( ["Kit e Coffee", "Kit", "Coffee"] );
    } else if (config['kitOption'] === "KIT" || (config['kitOption'] === "COMPLETE" && remainingCoffees <= 0)) {
      setKitOption(["Kit"]);
    } else if (remainingCoffees > 0) {
      setKitOption( ["Coffee"] );
    }
  };
  
  useEffect(() => {
    fetchKitOption();
  }, []);

  function handleKitOptionChange(event: React.ChangeEvent<HTMLInputElement>) {
    const value = event.target.value;
    setData({ ...data, kitOption: value });
  }

  return (
    <div className="my-6">
      <p>Opções disponíveis para a Semcomp 26:</p>
      <br />
      <ul>
        {/* <li><b>Kit e Coffee</b>: R$75.00</li> */}
        <li><b>Kit</b>: R$65.00</li>
        {/* <li><b>Coffee</b>: R$35.00</li> */}
      </ul>
      
      <br />
        <p>Estudantes com bolsa <b>PAPFE</b> pagam <b>metade</b> do preço em todas as opções acima, basta apresentar o documento PAFPE na próxima etapa.</p>
      <br />
      { kitOption && 
        <Input
          className="my-3"
          label="Opções:"
          value={data.kitOption}
          onChange={handleKitOptionChange}
          choices={kitOption}
          type={InputType.Select}
        />
      } {/* <br /> */}
        {/* <p>Ambas dão direto ao Coffee + Kit</p> */}
        {/* <br /> */}
        {/* <p>Os pacotes são limitados</p> */}
    { (data.kitOption && (data?.kitOption).includes("Coffee")) ? (
      <>
            <br/><h1><strong>Possui alguma restrição alimentar?</strong><br/>Procure a coordenação e indique quais são suas restrições.</h1>
            </>
            //   <Input
            //   className="my-3"
            //   label="Possui alguma restrição alimentar?"
            //   value={data.foodOption}
            //   onChange={handlefoodOptionChange}
            //   choices={foodOptions}
            //   type={InputType.Select}
            // />
            ):null }
      </div>
  );
}

export default CoffeeStep1;
