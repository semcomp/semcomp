import { useState } from "react";

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

  function handleInputChange(event: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) {
    const { name, value } = event.target;
    let updatedValue: string | number | Tier = value;

    if (name === 'value' || name === 'maxQuantity')
      updatedValue = parseFloat(value) || 0;
    else if (name === 'tier')
      updatedValue = value as Tier;
    else
      updatedValue = value as string;

    const updatedData = { ...data, [name]: updatedValue } as ItemFormData;

    setData(updatedData);
    onDataChange(updatedData);
  }

  return (
    <>
      <Input
        className="my-3"
        label="name"
        value={data.name}
        onChange={handleInputChange}
        type={InputType.Text}
      />
      <Input
        className="my-3"
        label="value"
        value={data.value}
        onChange={handleInputChange}
        type={InputType.Number}
      />
      <Input
        className="my-3"
        label="Quantidade Máxima"
        value={data.maxQuantity}
        onChange={handleInputChange}
        type={InputType.Number}
      />
      <Input
        className="my-3"
        label="Tier"
        value={data.tier}
        onChange={handleInputChange}
        choices={TIERS}
        type={InputType.Select}
      />
    </>
  );
}

export default ItemForm;
