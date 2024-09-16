import { useState } from "react";
import Input, { InputType } from "../Input";

export type HouseFormData = {
  id: string,
  name: string;
  description: string;
  telegramLink: string;
  image: File;
  imageBase64: string;
};

function HouseForm({
  onDataChange,
  initialData = {
    id: "",
    name: "",
    description: "",
    telegramLink: "",
    image: new File([], ""),
    imageBase64: "",
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

  function handleImageChange(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files[0];
  
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => {
      const base64 = reader.result as string;
      setData({...data, image: file, imageBase64: base64});
      onDataChange({...data, imageBase64: base64});
    };
  }

  function showImage() {
    if (data.imageBase64) {
      return (
        <>
          <h4 className="mt-8">Imagem atual</h4>
          <div className="flex justify-center mt-8">
            <img
              src={data.imageBase64}
              alt="Imagem da conquista"
              className="w-1/2 h-1/2"
            />
          </div>
        </>
      );
    }
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
      <Input
        className="my-3"
        label="Imagem da conquista"
        onChange={handleImageChange}
        type={InputType.Image}
      />
      {showImage()}
    </>
  );
}

export default HouseForm;
