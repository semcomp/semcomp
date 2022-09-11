import { useState } from "react";
import { toast } from "react-toastify";

import SemcompApi from "../../api/semcomp-api";
import { useAppContext } from "../../libs/contextLib";
import Modal from "../Modal";
import LoadingButton from "../reusable/LoadingButton";
import HouseForm, { HouseFormData } from "./HouseForm";

function CreateHouseModal({ onRequestClose }) {
  const {
    semcompApi
  }: {
    semcompApi: SemcompApi
  } = useAppContext();

  const [data, setData] = useState(null as HouseFormData);
  const [isLoading, setIsLoading] = useState(false);

  async function handleSubmit() {
    console.log(data);

    if (!data.name) return toast.error('Você deve fornecer um nome');
    if (!data.description) return toast.error('Você deve fornecer uma descrição');
    if (!data.telegramLink) return toast.error('Você deve fornecer um link do telegram');

    try {
      setIsLoading(true);
      const response = await semcompApi.createHouse(data);
      console.log(response);
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
        <HouseForm onDataChange={setData}></HouseForm>
      </div>
      <div className="w-full px-6">
        <LoadingButton
          isLoading={isLoading}
          className="w-full bg-green text-white py-3 px-6"
          onClick={handleSubmit}
        >
          Enviar
        </LoadingButton>
        <button className="w-full bg-orange text-white py-3 px-6 my-6" type="button" onClick={onRequestClose}>
          Fechar
        </button>
      </div>
    </Modal>
  );
}

export default CreateHouseModal;
