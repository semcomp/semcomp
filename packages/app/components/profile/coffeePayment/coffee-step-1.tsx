import { CoffeePaymentData } from "./coffee-modal";
import Input, { InputType } from "../../Input";
import handler from '../../../api/handlers';
import { useEffect, useState } from "react";
import { toast } from "react-toastify";

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

  function handleSaleOptionChange(saleOptions: string[]) {
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
          <p>Opções disponíveis para a Semcomp 27 Beta:</p>
          <br />
          <ul>
            { availableSales && availableSales.map((sale) => (
              <li key={sale.id}>
                <b>{sale.name}</b>: R${sale.price}
              </li>
            ))}
          </ul>
          
          <br />
            <p>Estudantes com bolsa <b>PAPFE</b> pagam <b>metade</b> do preço em todas as opções acima, basta apresentar o documento PAFPE na próxima etapa.</p>
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

          <br/><h1><strong>Vai comprar o coffee e possui alguma restrição alimentar?</strong><br/>Procure a coordenação e indique quais são suas restrições.</h1>
        </>
        ) : (
          <p><b>Não há vendas disponíveis no momento...</b></p>
        )
      }
        {/* <br /> */}
        {/* <p>Ambas dão direto ao Coffee + Kit</p> */}
        {/* <br /> */}
        {/* <p>Os pacotes são limitados</p> */}
    {/* <Input
      className="my-3"
      label="Possui alguma restrição alimentar?"
      value={data.foodOption}
      onChange={handlefoodOptionChange}
      choices={foodOptions}
      type={InputType.Select}
    /> */}
    </div>
  );
}

export default CoffeeStep1;
