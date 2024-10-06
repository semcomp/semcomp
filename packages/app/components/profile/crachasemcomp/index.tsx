import React, { useEffect, useState } from "react";
import Modal from "../../Modal";
import Handlers from "../../../api/handlers";

function ConfirmarCracha({ onRequestClose, user }) {
  const [open, setOpen] = useState(false);
  const [querCracha, setQuerCracha] = useState(null);
  const [isUpdating, setIsUpdating] = useState(false);

  useEffect(() => {
    // Verifica se já respondeu
    const status = localStorage.getItem("querCracha");
    if (!status) {
      setOpen(true); // Se não respondeu, abre o modal
    }
  }, []);

  if (!open) return null;

  const handleConfirmar = async (resposta) => {
    setQuerCracha(resposta);
    localStorage.setItem("querCracha", resposta ? "true" : "false");

    const updatedUser = {
      ...user,
      crachaResposta: resposta ? "sim" : "não",
    };

    try {
      setIsUpdating(true);
      const response = await Handlers.updateUserInfo(updatedUser);
      console.log("Resposta do crachá atualizada com sucesso:", response);
    } catch (error) {
      console.error("Erro ao atualizar a resposta do crachá:", error);
    } finally {
      setIsUpdating(false);
      setOpen(false);
    }
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
            disabled={isUpdating}
          >
            Sim, quero o crachá
          </button>
          <button
            className="bg-red-500 text-white px-4 py-2 rounded-lg"
            onClick={() => handleConfirmar(false)}
            disabled={isUpdating}
          >
            Não, obrigado
          </button>
        </div>
        <button
          className="bg-gray-500 text-white p-4 m-2 rounded-xl"
          type="button"
          onClick={onRequestClose}
          disabled={isUpdating}
        >
          Fechar
        </button>
      </div>
    </Modal>
  );
}

export default ConfirmarCracha;
