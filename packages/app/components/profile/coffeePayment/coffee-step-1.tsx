import { toast } from "react-toastify";

import { CoffeePaymentData } from "./coffee-modal";
import Input, { InputType } from "../../Input";
import LocalOfferIcon from '@mui/icons-material/LocalOffer';
import { config } from "../../../config";

function CoffeeStep1({
  data,
  setData,
  availableSales,
}: {
  data: CoffeePaymentData;
  setData: any;
  availableSales: any[];
}) {
  const showCoffeeMessage = false;

  function handleSaleOptionChange(event: PointerEvent) {
    const target = event.target as unknown as { value: string[] };    // TODO: Corrigir
    const saleOptions = target?.value as string[];

    const sales = [];
    if (saleOptions.length > 0) {
      saleOptions.forEach((option) => {
        sales.push(availableSales.find((sale) => sale.name === option));
      });
    }

    const salesItems = sales.map((option) => availableSales.find((sale) => sale.name === option.name).items).flat();
    const newSales = new Set(salesItems);
    
    if (salesItems.length !== newSales.size) {
      toast.error("Você selecionou opções duplicadas!");
    }

    setData({ ...data, saleOption: saleOptions, sale: sales });
  }

  return (
    <div className="my-6">
      { availableSales && availableSales.length > 0 ?
        (
        <>
          <p>Opções disponíveis para a Semcomp {config.EDITION}:</p>
          <br />
          <ul>
            { availableSales && availableSales.map((sale) => (
              <li key={sale.id}>
                {sale.allowHalfPayment && <LocalOfferIcon fontSize="small"/>}
                <b> {sale.name}</b>: R${sale.price}
              </li>
            ))}
          </ul>
          
          <br />
            <p>Estudantes com bolsa <b>PAPFE</b> pagam <b>metade</b> do preço em todas as opções 
            exibidas com o ícone <LocalOfferIcon fontSize="small"/>, basta apresentar o documento PAFPE na próxima etapa.</p>
          <br />

          <Input
            className="my-3"
            label="Opções:"
            value={data.saleOption ? data.saleOption : []}
            onChange={handleSaleOptionChange}
            choices={availableSales as object[]}
            valueLabel="name"
            type={InputType.MultiSelect}
          />
        </>
        ) : (
          <p className="h-full w-full text-center py-6"><b>Não há vendas disponíveis no momento...</b></p>
        )
      }
        {/* <br /> */}
        {/* <p>Ambas dão direto ao Coffee + Kit</p> */}
        {/* <br /> */}
        {/* <p>Os pacotes são limitados</p> */}
    </div>
  );
}

export default CoffeeStep1;
