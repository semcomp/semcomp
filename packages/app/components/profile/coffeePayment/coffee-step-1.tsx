import { CoffeePaymentData } from "./coffee-modal";
import Input, { InputType } from "../../Input";

export enum KitOption {
  COMPLETE = "Kit + Coffee", 
  KIT = "Só Kit",
  COFFEE = "Só Coffee",
}

const kitOption = Object.values(KitOption);

function CoffeeStep1({
  data,
  setData,
}: {
  data: CoffeePaymentData;
  setData: any;
}) {

  function handleKitOptionChange(event: React.ChangeEvent<HTMLInputElement>) {
    const value = event.target.value;
    setData({ ...data, kitOption: value });
  }

  return (
    <div className="my-6">
      <p>Opções disponíveis para a Semcomp 26:</p>
      <br />
      <ul>
        <li><b>Kit + Coffee</b>: R$75.00</li>
        <li><b>Kit</b>: R$65.00</li>
        <li><b>Coffee</b>: R$20.00</li>
      </ul>
      
      <br />
        <p>Estudantes com bolsa <b>PAPFE</b> pagam <b>metade</b> do preço em todas as opções acima, basta apresentar o documento PAFPE na próxima etapa.</p>
      <br />
      <Input
        className="my-3"
        label="Opções:"
        value={data.kitOption}
        onChange={handleKitOptionChange}
        choices={kitOption}
        type={InputType.Select}
      />
      {/* <br /> */}
      {/* <p>Ambas dão direto ao Coffee + Kit</p> */}
      {/* <br /> */}
      {/* <p>Os pacotes são limitados</p> */}
    </div>
  );
}

export default CoffeeStep1;
