import { useState } from "react";
import { toast } from "react-toastify";

import SemcompApi from "../../api/semcomp-api";
import { useAppContext } from "../../libs/contextLib";
import Modal from "../Modal";
import LoadingButton from "../reusable/LoadingButton";
import EventForm from "./EventForm";

function EditEventModal({ initialValue, onRequestClose }) {
  const {
    semcompApi
  }: {
    semcompApi: SemcompApi
  } = useAppContext();

  const [data, setData] = useState(initialValue);
  const [isLoading, setIsLoading] = useState(false);

  async function handleSubmit() {
    try {
      setIsLoading(true);
      await semcompApi.editEvent(data.id, data);
      toast.success('Evento editado com sucesso');
      onRequestClose()
    } catch (error) {
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <Modal onRequestClose={onRequestClose}>
      <div
        className="w-full bg-black text-white text-center text-xl font-bold p-6"
      >
         Editar Evento
      </div>
      <div className="max-h-96 overflow-y-scroll p-6 w-full">
        <EventForm initialData={initialValue} onDataChange={setData}></EventForm>
      </div>
      <div className="w-full px-6">
        <LoadingButton
          isLoading={isLoading}
          className="w-full text-white py-3 px-6"
          onClick={handleSubmit}
        >
          Enviar
        </LoadingButton>
        <button className="w-full bg-red-500 text-white py-3 px-6 my-6" type="button" onClick={onRequestClose}>
          Fechar
        </button>
      </div>
    </Modal>
  );
}

export default EditEventModal;
