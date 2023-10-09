import { useState } from "react";
import { toast } from "react-toastify";

import SemcompApi from "../../api/semcomp-api";
import { useAppContext } from "../../libs/contextLib";
import Modal from "../Modal";
import LoadingButton from "../reusable/LoadingButton";
import HouseForm, { HouseFormData } from "./HouseForm";

function EditHouseModal({ initialValue, onRequestClose }) {
  const {
    semcompApi
  }: {
    semcompApi: SemcompApi
  } = useAppContext();

  const [data, setData] = useState(initialValue);
  const [isLoading, setIsLoading] = useState(false);

  async function handleSubmit() {
    if (!data.name) return toast.error('Você deve fornecer um nome');
    if (!data.description) return toast.error('Você deve fornecer uma descrição');
    if (!data.telegramLink) return toast.error('Você deve fornecer um link do telegram');

    try {
      setIsLoading(true);
      const response = await semcompApi.editHouse(data.id, data);
      toast.success('Casa editada com sucesso');
      onRequestClose();
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
         Criar Casa
      </div>
      <div className="max-h-96 overflow-y-scroll p-6 w-full">
        <HouseForm initialData={initialValue} onDataChange={setData}></HouseForm>
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

export default EditHouseModal;
