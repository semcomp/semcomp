import { useState } from "react";
import { toast } from "react-toastify";

import Modal from "../Modal";
import SemcompApi from "../../api/semcomp-api";
import LoadingButton from "../reusable/LoadingButton";
import AchievementForm from "./AchievementForm";
import { useAppContext } from "../../libs/contextLib";
import AchievementCategories from "../../libs/constants/achievement-categories-enum";

function EditAchievementModal({ initialValue, onRequestClose }) {
  const { semcompApi }: { semcompApi: SemcompApi } = useAppContext();
  const [data, setData] = useState(initialValue);
  const [isLoading, setIsLoading] = useState(false);

  async function handleSubmit() {
    if (!data?.title) return toast.error('Você deve fornecer um título');
    if (!data?.description) return toast.error('Você deve fornecer uma descrição');
    if (!data?.imageBase64) return toast.error('Você deve fornecer uma imagem');
    if (data?.startDate === data?.endDate) return toast.error('A data de início e de fim não podem ser iguais');
    if (data?.startDate > data?.endDate) return toast.error('A data de início não pode ser maior que a data de fim');
    if (data?.category === AchievementCategories.PRESENCA_EM_EVENTO && !data?.eventId) return toast.error('Você deve fornecer um evento');
    
    try {
      setIsLoading(true);
      await semcompApi.editAchievement(data.id, data);
      toast.success('Conquista editada com sucesso');
      onRequestClose()
    } catch (error) {
      toast.error('Erro ao editar conquista');
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
         Editar Conquista
      </div>
      <div className="max-h-96 overflow-y-scroll p-6 w-full">
        <AchievementForm initialData={initialValue} onDataChange={setData}></AchievementForm>
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

export default EditAchievementModal;
