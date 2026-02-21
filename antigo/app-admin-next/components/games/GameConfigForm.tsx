import React from "react"

import Input, { InputType } from "../Input";
import Game from "../../libs/constants/game-enum";
import GameTitle from "../../libs/constants/game-title-enum";

export type GameConfigFormData = {
    id?: string;
    game: string;
    title: string;  
    description: string;
    rules: string;
    eventPrefix: string;
    startDate: number;
    endDate: number;
    hasGroups: boolean;
    maximumNumberOfMembersInGroup: number;
};

function GameConfigForm({
  data,
  setData,
}: {
  data?: GameConfigFormData;
  setData: (data: GameConfigFormData) => void;
}) {
  function handleGameChange(event: React.ChangeEvent<HTMLInputElement>) {
    const selectedGame = event.target.value;

    // Obtendo o título correspondente ao jogo selecionado
    const newTitle = GameTitle[selectedGame.replaceAll("-", "_").toUpperCase() as keyof typeof GameTitle] || "";

    setData({
      ...data,
      game: selectedGame,
      title: newTitle,  
    });
  }

  function handleGameTitleChange(event: React.ChangeEvent<HTMLInputElement>) {
    const value = event.target.value;
    setData({...data, title: value});
  }

  function handleDescriptionChange(event: React.ChangeEvent<HTMLInputElement>) {
    const value = event.target.value;
    setData({...data, description: value});
  }

  function handleRulesChange(event: React.ChangeEvent<HTMLInputElement>) {
    const value = event.target.value;
    setData({...data, rules: value});
  }

  function handleStartDateChange(value: number) {
    setData({...data, startDate: value});
  }

  function handleEndDateChange(value: number) {
    setData({...data, endDate: value});
  }

  function handleMaximumNumberOfMembersInGroupChange(event: React.ChangeEvent<HTMLInputElement>) {
    const value = event.target.value;
    setData({...data, maximumNumberOfMembersInGroup: Number(value)});
  }

  function handleHasGroupsChange(event: React.ChangeEvent<HTMLInputElement>) {
    const value = event.target.checked;
    setData({...data, hasGroups: value});
  }

  return (
    <>
      <Input
        className="my-3"
        label="Jogo"
        value={data.game}
        onChange={handleGameChange}
        choices={Object.values(Game)}
        type={InputType.Select}
      />
       <Input
        className="my-3"
        value={data.title}
        onChange={handleGameTitleChange}
        type={InputType.Text}
        disabled
      />
      <Input
        className="my-3"
        label="Data de início"
        value={data.startDate}
        onChange={handleStartDateChange}
        type={InputType.Date}
      />
      <Input
        className="my-3"
        label="Data de fim"
        value={data.endDate}
        onChange={handleEndDateChange}
        type={InputType.Date}
      />
      <Input
        className="my-3"
        label="Possui grupos?"
        value={data.hasGroups}
        onChange={handleHasGroupsChange}
        type={InputType.Checkbox}
      />
      { data.hasGroups && (
        <Input
          className="my-3"
          label="Quantidade máxima de membros"
          value={data.maximumNumberOfMembersInGroup}
          onChange={handleMaximumNumberOfMembersInGroupChange}
          type={InputType.Number}
        />
      )}
      <Input
        className="my-3"
        label="Descrição"
        value={data.description}
        onChange={handleDescriptionChange}
        type={InputType.TextArea}
      />
      <Input
        className="my-3"
        label="Regras"
        value={data.rules}
        onChange={handleRulesChange}
        type={InputType.TextArea}
      />
    </>
  );
}

export default GameConfigForm;