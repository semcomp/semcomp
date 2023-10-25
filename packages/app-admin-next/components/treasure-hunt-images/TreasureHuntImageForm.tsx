import { useState } from "react";

import Input, { InputType } from "../Input";
import Status from "../../libs/constants/status-treasure-hunt-enum";

export type TreasureHuntImageFormData = {
    place: string;
    status: Status;
    imgUrl: string;
};

const STATUS = Object.values(Status);

function TreasureHuntImageForm({
  onDataChange,
  initialData = {
    place: "",
    status: Status.BLOCKED,
    imgUrl: "",
  },
}: {
  onDataChange: (data: TreasureHuntImageFormData) => void;
  initialData?: TreasureHuntImageFormData;
}) {
  const [data, setData] = useState(initialData);

  function handleStatusChange(event: React.ChangeEvent<HTMLInputElement>) {
    const value = event.target.value;
    setData({...data, status: value as Status});
    onDataChange({...data, status: value as Status});
  }

  function handleImgUrlChange(event: React.ChangeEvent<HTMLInputElement>) {
    const value = event.target.value;
    setData({...data, imgUrl: value});
    onDataChange({...data, imgUrl: value});
  }

  function handlePlaceChange(event: React.ChangeEvent<HTMLInputElement>) {
    const value = event.target.value;
    setData({...data, place: value});
    onDataChange({...data, place: value});
  }

  return (
    <>
      <Input
        className="my-3"
        label="Jogo"
        value={data.status}
        onChange={handleStatusChange}
        choices={STATUS}
        type={InputType.Select}
      />
      <Input
        className="my-3"
        label="Local da Dica"
        value={data.place}
        onChange={handlePlaceChange}
        type={InputType.Text}
      />
      <Input
        className="my-3"
        label="URL da Imagem"
        value={data.imgUrl}
        onChange={handleImgUrlChange}
        type={InputType.Text}
      />
    </>
  );
}

export default TreasureHuntImageForm;
