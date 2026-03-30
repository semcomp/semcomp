import { useState } from "react";
import Input, { InputType } from "../Input";

export type HouseFormData = {
  name: string;
  description: string;
  telegramLink: string;
};

function HouseForm({
  onDataChange,
  initialData = {
    name: "",
    description: "",
    telegramLink: "",
  },
}: {
  onDataChange: (data: HouseFormData) => void;
  initialData?: HouseFormData;
}) {
  const [data, setData] = useState(initialData);

  function handleNameChange(event: React.ChangeEvent<HTMLInputElement>) {
    const value = event.target.value;
    setData({...data, name: value});
    onDataChange({...data, name: value});
  }

  function handleDescriptionChange(event: React.ChangeEvent<HTMLInputElement>) {
    const value = event.target.value;
    setData({...data, description: value});
    onDataChange({...data, description: value});
  }

  function handleTelegramLinkChange(event: React.ChangeEvent<HTMLInputElement>) {
    const value = event.target.value;
    setData({...data, telegramLink: value});
    onDataChange({...data, telegramLink: value});
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
        label="Descrição"
        value={data.description}
        onChange={handleDescriptionChange}
        type={InputType.Text}
      />
      <Input
        className="my-3"
        label="Link do Telegram"
        value={data.telegramLink}
        onChange={handleTelegramLinkChange}
        type={InputType.Text}
      />
    </>
  );
}

export default HouseForm;
