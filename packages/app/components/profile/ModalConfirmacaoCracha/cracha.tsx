import React, { useEffect, useState } from "react";
import Modal from "../../Modal";
import Input, { InputType } from "../../Input";

function ConfirmarCracha({ onRequestClose }) {
  const [open, setOpen] = useState(false);
  const [querCracha, setQuerCracha] = useState(null); // null: não respondeu, true: quer, false: não quer

  useEffect(() => {
    // ve se respondeu
    const status = localStorage.getItem("querCracha");
    if (!status) {
      setOpen(true); // Abriu e ainda não respondeu
    }
  }, []);

  if (!open) return null;

  const handleConfirmar = (resposta) => {
    setQuerCracha(resposta);
    localStorage.setItem("querCracha", resposta ? "true" : "false");
    setOpen(false);
  };

  return (
    <Modal onRequestClose={onRequestClose}>
      <div className="flex flex-col items-center p-4">
        <h1 className="text-center pb-2">Confirmação de Crachá</h1>
        <p className="text-sm xxs:text-base">
          Durante os últimos anos, muitas pessoas não retiraram seus crachás,
          resultando em desperdício de material.
          <br />
          Sabemos que você não quer isso, certo? Por isso, queremos saber se
          você vai querer seu crachá físico ou utilizará o online durante o
          evento.
          <br />
          Atenção: depois de feita essa escolha, ela não poderá ser alterada.
          <br />
          Responder até dia 12/10.
          <br />
        </p>
        <div className="flex items-center justify-center space-x-4 mt-4">
          <button
            className="bg-green-500 text-white px-4 py-2 rounded-lg"
            onClick={() => handleConfirmar(true)}
          >
            Sim, quero o crachá
          </button>
          <button
            className="bg-red-500 text-white px-4 py-2 rounded-lg"
            onClick={() => handleConfirmar(false)}
          >
            Não, obrigado
          </button>
        </div>
        <button
          className="bg-gray-500 text-white p-4 m-2 rounded-xl"
          type="button"
          onClick={onRequestClose}
        >
          Fechar
        </button>
      </div>
    </Modal>
  );
}

export default ConfirmarCracha;
