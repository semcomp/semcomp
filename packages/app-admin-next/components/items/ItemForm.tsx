import React, { useState } from "react";

import Tier from "../../libs/constants/tier-enum";
import Input, { InputType } from "../Input";

export type ItemFormData = {
  name: string;
  value: number;
  maxQuantity: number;
  tier: Tier;
  tierQuantity?: number;
  totalQuantity?: number;
};

const TIERS = Object.values(Tier);

function ItemForm({
  onDataChange,
  initialData = {
    name: "",
    value: 0,
    maxQuantity: 0,
    tier: Tier.TIER1,
    tierQuantity: 0,
    totalQuantity: 0,
  },
}: {
  onDataChange: (data: ItemFormData) => void;
  initialData?: ItemFormData;
}) {
  const [data, setData] = useState(initialData);

  function handleMaxQttChange(event: React.ChangeEvent<HTMLInputElement>) {
    const value = event.target.value;
    setData({...data, maxQuantity: Number(value)});
    onDataChange({...data, maxQuantity: Number(value)});
  }
  
  function handleValueChange(event: React.ChangeEvent<HTMLInputElement>) {
    const val = event.target.value;
    setData({...data, value: Number(val)});
    onDataChange({...data, value: Number(val)});
  }

  function handleNameChange(event: React.ChangeEvent<HTMLInputElement>) {
    const val = event.target.value;
    setData({...data, name: val});
    onDataChange({...data, name: val});
  }

  function handleTierChange(event: React.ChangeEvent<HTMLSelectElement>) {
    const val = event.target.value;
    setData({...data, tier: val as Tier});
    onDataChange({...data, tier: val as Tier});
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
        label="Valor"
        value={data.value}
        onChange={handleValueChange}
        type={InputType.Number}
      />
      <Input
        className="my-3"
        label="Quantidade Máxima"
        value={data.maxQuantity}
        onChange={handleMaxQttChange}
        type={InputType.Number}
      />
      <Input
        className="my-3"
        label="Tier"
        value={data.tier}
        onChange={handleTierChange}
        choices={TIERS}
        type={InputType.Select}
      />
    </>
  );
}

export default ItemForm;
