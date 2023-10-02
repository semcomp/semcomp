import Input, { InputType } from "../Input";
import React from "react"

export enum TShirtSize {
  PP = "PP",
  P = "P",
  M = "M",
  G = "G",
  GG = "GG",
  XGG1 = "XGG1",
  XGG2 = "XGG2",
}

const TShirtSizes = Object.values(TShirtSize);

export type TShirtFormData = {
  id: string;
  size: string;
  quantity: number;
};

function TShirtForm({
  data,
  setData,
}: {
  data?: TShirtFormData;
  setData: (data: TShirtFormData) => void;
}) {
  function handleSizeChange(event: React.ChangeEvent<HTMLInputElement>) {
    const value = event.target.value;
    setData({...data, size: value});
    }

  function handleQuantityChange(event: React.ChangeEvent<HTMLInputElement>) {
    const value = event.target.value;
    setData({...data, quantity: +value});
  }

  return (
    <>
      <Input
        className="my-3"
        label="Tamanho"
        value={data.size}
        onChange={handleSizeChange}
        choices={TShirtSizes}
        type={InputType.Select}
      />
      <Input
        className="my-3"
        label="Quantidade"
        value={data.quantity}
        onChange={handleQuantityChange}
        type={InputType.Number}
      />
    </>
  );
}

export default TShirtForm;
