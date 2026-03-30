import { useState } from "react";

import Game from "../../libs/constants/game-enum";
import Input, { InputType } from "../Input";

export type GameQuestionFormData = {
  game: Game;
  index: number;
  title: string;
  question: string;
  imgUrl: string;
  clue: string;
  answer: string;
  isLegendary: boolean;
};

const GAMES = Object.values(Game);

function GameQuestionForm({
  onDataChange,
  initialData = {
    game: Game.RIDDLE,
    index: 0,
    title: "",
    question: "",
    imgUrl: "",
    clue: "",
    answer: "",
    isLegendary: false,
  },
}: {
  onDataChange: (data: GameQuestionFormData) => void;
  initialData?: GameQuestionFormData;
}) {
  const [data, setData] = useState(initialData);

  function handleGameChange(event: React.ChangeEvent<HTMLInputElement>) {
    const value = event.target.value;
    setData({...data, game: value as Game});
    onDataChange({...data, game: value as Game});
  }

  function handleIndexChange(event: React.ChangeEvent<HTMLInputElement>) {
    const value = event.target.value;
    setData({...data, index: +value});
    onDataChange({...data, index: +value});
  }

  function handleIsLegendaryChange(
    event: React.ChangeEvent<HTMLInputElement>
  ) {
    const value = event.target.checked;
    setData({ ...data, isLegendary: value });
    onDataChange({...data, isLegendary: value});
  }

  function handleTitleChange(event: React.ChangeEvent<HTMLInputElement>) {
    const value = event.target.value;
    setData({...data, title: value});
    onDataChange({...data, title: value});
  }

  function handleQuestionChange(event: React.ChangeEvent<HTMLInputElement>) {
    const value = event.target.value;
    setData({...data, question: value});
    onDataChange({...data, question: value});
  }

  function handleImgUrlChange(event: React.ChangeEvent<HTMLInputElement>) {
    const value = event.target.value;
    setData({...data, imgUrl: value});
    onDataChange({...data, imgUrl: value});
  }

  function handleClueChange(event: React.ChangeEvent<HTMLInputElement>) {
    const value = event.target.value;
    setData({...data, clue: value});
    onDataChange({...data, clue: value});
  }

  function handleAnswerChange(event: React.ChangeEvent<HTMLInputElement>) {
    const value = event.target.value;
    setData({...data, answer: value});
    onDataChange({...data, answer: value});
  }

  return (
    <>
      <Input
        className="my-3"
        label="Jogo"
        value={data.game}
        onChange={handleGameChange}
        choices={GAMES}
        type={InputType.Select}
      />
      <Input
        className="my-3"
        label="Indice"
        value={data.index}
        onChange={handleIndexChange}
        type={InputType.Number}
      />
      <Input
        className="my-3"
        label="Título"
        value={data.title}
        onChange={handleTitleChange}
        type={InputType.Text}
      />
      <Input
        className="my-3"
        label="Pergunta"
        value={data.question}
        onChange={handleQuestionChange}
        type={InputType.Text}
      />
      <Input
        className="my-3"
        label="URL da Imagem"
        value={data.imgUrl}
        onChange={handleImgUrlChange}
        type={InputType.Text}
      />
      <Input
        className="my-3"
        label="Dica"
        value={data.clue}
        onChange={handleClueChange}
        type={InputType.Text}
      />
      <Input
        className="my-3"
        label="Resposta"
        value={data.answer}
        onChange={handleAnswerChange}
        type={InputType.Text}
      />
      <Input
        className="my-3"
        label="Lendária?"
        onChange={handleIsLegendaryChange}
        value={data.isLegendary}
        type={InputType.Checkbox}
      />
    </>
  );
}

export default GameQuestionForm;
