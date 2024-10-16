import React from "react"
import { toast } from "react-toastify";

import ProductsItems from "../../libs/constants/products-items-enum";

import { SaleType } from "../../models/SemcompApiModels";

import Input, { InputType } from "../Input";

export type SaleFormData = {
  id: string;
  name: string;
  type: string;
  quantity: number;
  hasTShirt: boolean;
  hasKit: boolean;
  hasCoffee: boolean;
  items: string[];
  price: number;
};

function SaleForm({
  data,
  setData,
  saleItems,
}: {
  data?: SaleFormData;
  setData: (data: SaleFormData) => void;
  saleItems: object[];
}) {
  function handleTypeChange(event: React.ChangeEvent<HTMLInputElement>) {
    const value = event.target.value;
    setData({...data, type: value});
  }

  function handleNameChange(event: React.ChangeEvent<HTMLInputElement>) {
    const value = event.target.value;
    setData({...data, name: value});
  }

  function handleQuantityChange(event: React.ChangeEvent<HTMLInputElement>) {
    const value = event.target.value;
    setData({...data, quantity: +value});
  }

  function handlePriceChange(event: React.ChangeEvent<HTMLInputElement>) {
    const value = event.target.value;
    setData({...data, price: +value});
  }
  function handleItemsChange(value: string[]) {
      setData({...data, items: value});
  }
  
  function handleHasTShirtChange(event: React.ChangeEvent<HTMLInputElement>) {
    const value = event.target.checked;
    setData({...data, hasTShirt: value});
  }

  function handleHasKitChange(event: React.ChangeEvent<HTMLInputElement>) {
    const value = event.target.checked;
    setData({...data, hasKit: value});
  }

  function handleHasCoffeeChange(event: React.ChangeEvent<HTMLInputElement>) {
    const value = event.target.checked;
    setData({...data, hasCoffee: value});
  }

  return (
    <>
      <Input
        className="my-3"
        label="Nome"
        value={data.name}
        onChange={handleNameChange}
        type={InputType.Text}
      />
      <Input
        className="my-3"
        label="Tipo"
        value={data.type}
        onChange={handleTypeChange}
        choices={Object.values(SaleType)}
        type={InputType.Select}
      />
      { data.type === SaleType.SALE && (
        <>
          <Input
            className="my-3"
            label="Itens"
            value={data.items as string[]}
            onChange={handleItemsChange}
            choices={saleItems}
            labelKey="name"
            type={InputType.MultipleSelect}
          />

          <Input
            className="my-3"
            label="Preço"
            value={data.price}
            onChange={handlePriceChange}
            type={InputType.Number}
          />
        </>
      )}
      { data.type === SaleType.ITEM && (
        <>
          <Input
            className="my-3"
            label="Tem camiseta no item?"
            value={data.hasTShirt}
            onChange={handleHasTShirtChange}
            type={InputType.Checkbox}
          />

          <Input
            className="my-3"
            label="O item é um kit?"
            value={data.hasKit}
            onChange={handleHasKitChange}
            type={InputType.Checkbox}
          />

          <Input
            className="my-3"
            label="O item é um coffee?"
            value={data.hasCoffee}
            onChange={handleHasCoffeeChange}
            type={InputType.Checkbox}
          />

          <Input
            className="my-3"
            label="Quantidade"
            value={data.quantity}
            onChange={handleQuantityChange}
            type={InputType.Number}
          />
        </>
      )}
    </>
  );
}

export default SaleForm;
