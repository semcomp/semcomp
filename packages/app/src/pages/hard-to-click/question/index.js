import React from "react";
import { Button } from "@material-ui/core";
import { useHistory } from "react-router-dom";
import { HardToClickRoutes } from "..";

export default function HardToClickQuestion() {
  const history = useHistory();

  function handleSubmit(event) {
    event.preventDefault();
    history.push(HardToClickRoutes.end);
  }

  return (
    <div className="HardToClick-page__card-content">
      <img
        src={"http://placehold.it/960x540"}
        alt="imagem"
        className="HardToClick-page__image"
      />
      <form onSubmit={handleSubmit}>
        <input
          placeholder="Resposta"
          name="answer"
          className="HardToClick-page__input"
        />
        <Button
          onClick={handleSubmit}
          style={{
            backgroundColor: "#045079",
            color: "white",
            margin: "16px 8px",
            padding: "8px 32px",
          }}
          className="HardToClick-page__button"
          type="submit"
        >
          Enviar
        </Button>
      </form>
    </div>
  );
}
