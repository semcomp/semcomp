import React, { useEffect, useState } from "react";
import Modal from "../../Modal";
import Handlers from "../../../api/handlers";
import { toast } from "react-toastify";

function ConfirmarCracha({ onRequestClose, user }) {
  const [open, setOpen] = useState(false);
  const [querCracha, setQuerCracha] = useState(null);
  const [isUpdating, setIsUpdating] = useState(false);

  useEffect(() => {
    // Verifica se já respondeu
    let status = user.wantNameTag;

    if (status == null) {
      setOpen(true); // Se não respondeu, abre o modal
    }
  }, []);

  if (!open) return null;

  const handleConfirmar = async (resposta) => {
    setQuerCracha(resposta);
    
    let localUser = JSON.parse(localStorage.getItem("user"))

    if (!localUser) {
      localUser = {};
    }

    localUser.wantNameTag = resposta;
    localStorage.setItem("user", JSON.stringify(localUser));
    
    try {
      setIsUpdating(true);
      const updatedUser = {
        ...user,
        wantNameTag: resposta,
      };

      const response = await Handlers.updateUserInfo(updatedUser);
      toast.success("Resposta salva com sucesso!")
    } catch (error) {
      console.error("Erro ao atualizar a resposta do crachá:", error);
      toast.error("Erro ao salvar resposta")
    } finally {
      setIsUpdating(false);
      setOpen(false);
    }
  };

  return (
    <Modal onRequestClose={onRequestClose}>
      <div className="flex flex-col items-center p-10 text-primary">
        <h1 className="text-center text-lg pb-2 font-bold">Confirmação de Crachá Físico</h1>
        <p className="text-sm xxs:text-base">
        Durante os últimos anos, diversos participantes não retiraram seus
          crachás, resultando em desperdício de material.
          <br />
          <br />
          Sabemos que você não quer isso, certo? Por isso, gostaríamos de confirmar se você deseja seu crachá físico impresso ou utilizará o QR Code online disponibilizado neste site durante o evento.
          O QR Code presente no site ou crachás são utilizados para contabilização de presença.
          <br />
          <br />
          Atenção: uma vez feita essa escolha, ela não poderá ser
          alterada.
          <br />
          <br />
          <span className="font-bold underline w-full text-center block">
             Responder até dia 14/10.
          </span>
          <br />
        </p>
        <div className="flex items-center justify-center space-x-4 mt-4">
          <button
            className="bg-green-500 text-white p-4 rounded-lg"
            onClick={() => handleConfirmar(true)}
            disabled={isUpdating}
          >
            Sim, eu quero o crachá!
          </button>
          <button
            className="bg-red-500 text-white p-4 rounded-lg"
            onClick={() => handleConfirmar(false)}
            disabled={isUpdating}
          >
            Não, eu não quero o crachá
          </button>
        </div>
        <button
          className="bg-gray text-white px-4 py-2 m-2 rounded-xl"
          type="button"
          onClick={onRequestClose}
          disabled={isUpdating}
        >
          Responder depois
        </button>
      </div>
    </Modal>
  );
}

export default ConfirmarCracha;
