import React, { useEffect, useState } from "react";
import Modal from "../../Modal"; 

function ModalKitSemcomp({ user, onRequestClose }) {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    // Verifica se o usuário já viu o modal e se ele comprou o kit
    const modalVisto = localStorage.getItem("kitModalVisto");
    if (!modalVisto && user.paid && !user.gotKit) {
      setOpen(true); // Abre o modal se ele pagou e ainda não pegou o kit
    }
  }, [user]);

  const handleEntendido = () => {
    // Marca o modal como visto no localStorage
    localStorage.setItem("kitModalVisto", "true");
    setOpen(false); // Fecha o modal
  };

  if (!open) return null; // Não renderiza o modal se não for necessário

  return (
    <Modal onRequestClose={onRequestClose}>
      <div className="flex flex-col items-center p-10 text-primary">
        <h1 className="text-center text-lg pb-2 font-bold">Lembrete Importante!</h1>
        <p className="text-sm xxs:text-base text-center">
          Você tem até 6 meses após o início da SEMCOMP para buscar seu kit.
          <br />
          Não se esqueça de retirá-lo dentro do prazo!
        </p>
        <button
          className="bg-blue-500 text-white px-4 py-2 mt-6 rounded-lg"
          onClick={handleEntendido}
        >
          Entendido!
        </button>
      </div>
    </Modal>
  );
}

export default ModalKitSemcomp;
