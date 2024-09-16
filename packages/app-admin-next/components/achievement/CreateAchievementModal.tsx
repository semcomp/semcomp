import { useState } from "react";
import { toast } from "react-toastify";

import Modal from "../Modal";
import { SemcompApiCreateAchievementRequest } from "../../models/SemcompApiModels";
import SemcompApi from "../../api/semcomp-api";
import LoadingButton from "../reusable/LoadingButton";
import { useAppContext } from "../../libs/contextLib";
import AchievementCategories from "../../libs/constants/achievement-categories-enum";
import AchievementForm, { AchievementFormData } from "./AchievementForm";
import AchievementTypes from "../../libs/constants/achievement-types-enum";

function CreateAchievementModal({ onRequestClose }) {
  const { semcompApi }: { semcompApi: SemcompApi } = useAppContext();

  const [data, setData] = useState(null as AchievementFormData);
  const [isLoading, setIsLoading] = useState(false);

  async function handleSubmit() {
    if (!data?.title) return toast.error('Você deve fornecer um título');
    if (!data?.description) return toast.error('Você deve fornecer uma descrição');
    if (!data?.imageBase64) return toast.error('Você deve fornecer uma imagem');
    if (data?.startDate > data?.endDate) return toast.error('A data de início não pode ser maior que a data de fim');
    if (data?.startDate === data?.endDate) return toast.error('A data de início e de fim não podem ser iguais');
    if (data?.category === AchievementCategories.PRESENCA_EM_EVENTO && !data?.eventId) return toast.error('Você deve fornecer um evento');
    
    try {
      setIsLoading(true);
      await semcompApi.createAchievement(mapDataToCreateRequest(data));
      toast.success('Conquista criada com sucesso');
      onRequestClose();
    } catch (error) {
      toast.error('Erro ao criar conquista');
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  }

  function mapDataToCreateRequest(data: AchievementFormData) {
    if (data.category === AchievementCategories.NUMERO_DE_CONQUISTAS) {
      data.numberOfPresences = null;
      data.eventId = null;
      data.minPercentage = null;
      data.eventType = null;
    } else if (data.category === AchievementCategories.PRESENCA_EM_EVENTO) {
      data.numberOfAchievements = null;
      data.eventType = null;

      if (data.type === AchievementTypes.INDIVIDUAL) {
        data.minPercentage = null;
      } else if (data.type === AchievementTypes.CASA) {
        data.numberOfPresences = null;
      }
    } else if (data.category === AchievementCategories.PRESENCA_EM_TIPO_DE_EVENTO) {
      data.numberOfAchievements = null;
      data.eventId = null;

      if (data.type === AchievementTypes.INDIVIDUAL) {
        data.minPercentage = null;
      } else if (data.type === AchievementTypes.CASA) {
        data.numberOfPresences = null;
      }
    } else if (data.category === AchievementCategories.MANUAL || data.category === AchievementCategories.QR_CODE) {
      data.numberOfPresences = null;
      data.eventId = null;
      data.minPercentage = null;
      data.eventType = null;
      data.numberOfAchievements = null;
    }

    return {
        title: data.title,
        description: data.description,
        startDate: data.startDate,
        endDate: data.endDate,
        type: data.type,
        minPercentage: data.minPercentage,
        category: data.category,
        eventId: data.eventId,
        eventType: data.eventType,
        numberOfPresences: data.numberOfPresences,
        numberOfAchievements: data.numberOfAchievements,
        imageBase64: data.imageBase64,
      } as SemcompApiCreateAchievementRequest;
  }

  return (
    <Modal onRequestClose={onRequestClose}>
      <div
        className="w-full bg-black text-white text-center text-xl font-bold p-6"
      >
         Criar Conquista
      </div>
      <div className="max-h-96 overflow-y-scroll p-6 w-full">
        <AchievementForm onDataChange={setData}></AchievementForm>
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

export default CreateAchievementModal;
