import { useState } from "react";
import { toast } from "react-toastify";

import SemcompApi from "../../api/semcomp-api";
import { useAppContext } from "../../libs/contextLib";
import Modal from "../Modal";
import LoadingButton from "../reusable/LoadingButton";
import TShirtForm, { TShirtFormData } from "./TShirtForm";

function EditTShirtModal({
  data,
  setData,
  onRequestClose,
}: {
  data?: TShirtFormData;
  setData: (data: TShirtFormData) => void;
  onRequestClose: any;
}) {
  const {
    semcompApi
  }: {
    semcompApi: SemcompApi
  } = useAppContext();

  const [isLoading, setIsLoading] = useState(false);

  async function handleSubmit() {
    console.log(data);

    if (!data.size) return toast.error('Você deve fornecer um tamanho');
    if (data.quantity < 0) return toast.error('Você deve fornecer uma quantidade');

    try {
      setIsLoading(true);
      const response = await semcompApi.editTShirt(data.id, data);
      console.log(response);
    } catch (error) {
      console.error(error);
      toast.error('Erro no servidor');
    } finally {
      setIsLoading(false);
      onRequestClose();
    }
  }

  return (
    <Modal onRequestClose={onRequestClose}>
      <div
        className="w-full bg-black text-white text-center text-xl font-bold p-6"
      >
        Editar Tamanho de Camiseta
      </div>
      <div className="max-h-96 overflow-y-scroll p-6 w-full">
        <TShirtForm
          data={data}
          setData={setData}
        ></TShirtForm>
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

export default EditTShirtModal;
