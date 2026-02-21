import { useEffect, useState } from "react";
import { toast } from "react-toastify";

import { useAppContext } from "../../libs/contextLib";
import { PaginationRequest } from "../../models/Pagination";
import { SemcompApiGetEventsResponse } from "../../models/SemcompApiModels";
import AchievementTypes from "../../libs/constants/achievement-types-enum";
import AchievementCategories from "../../libs/constants/achievement-categories-enum";
import { generateAndDownloadQRCode } from "../../libs/dowloadSvg";
import EventType from "../../libs/constants/event-types-enum";
import Input, { InputType } from "../Input";
import SemcompApi from "../../api/semcomp-api";

export type AchievementFormData = {
    id: string;
    title: string;
    description: string;
    startDate: number;
    endDate: number;
    type: AchievementTypes | string;
    minPercentage: number;
    category: AchievementCategories | string;
    eventId: string;
    eventType: EventType | string;
    numberOfPresences: number;
    numberOfAchievements: number;
    image: File;
    imageBase64: string;
};

const EVENT_TYPES = Object.values(EventType);
const ACHIEVEMENTS_TYPES = Object.values(AchievementTypes);
const ACHIEVEMENTS_CATEGORIES = Object.values(AchievementCategories);

function AchievementForm({
  onDataChange,
  initialData = {
    id: "",
    title: "",
    description: "",
    startDate: Date.now(),
    endDate: Date.now(),
    type: "",
    minPercentage: null,
    category: "",
    eventId: "",
    eventType: "",
    numberOfPresences: null,
    numberOfAchievements: null,
    image: new File([], ""),
    imageBase64: "",
  },
}: {
  onDataChange: (data: AchievementFormData) => void;
  initialData?: AchievementFormData;
}) {
  const [data, setData] = useState(initialData);
  const [events, setEvents] = useState(null as SemcompApiGetEventsResponse);
  const { semcompApi }: { semcompApi: SemcompApi} = useAppContext();
  const [pagination, setPagination] = useState(new PaginationRequest(() => fetchEvents()));

  async function fetchEvents() {
    try {
      const response = await semcompApi.getEvents(pagination);
      setEvents(response);
    } catch (error) {
      toast.error("Erro ao buscar eventos");
    }
  }

  useEffect(() => {
    fetchEvents();
  }, []);

  function handleTitleChange(event: React.ChangeEvent<HTMLInputElement>) {
    const value = event.target.value;
    setData({...data, title: value});
    onDataChange({...data, title: value});
  }

  function handleDescriptionChange(event: React.ChangeEvent<HTMLInputElement>) {
    const value = event.target.value;
    setData({...data, description: value});
    onDataChange({...data, description: value});
  }

  function handleStartDateChange(value: number) {
    setData({...data, startDate: value});
    onDataChange({...data, startDate: value});
  }

  function handleEndDateChange(value: number) {
    if (value < data.startDate) {
      toast.error("A data de fim não pode ser anterior à data de início");
      return;
    }
    setData({...data, endDate: value});
    onDataChange({...data, endDate: value});
  }

  function handleTypeChange(event: React.ChangeEvent<HTMLInputElement>) {
    const value = event.target.value;
    setData({...data, type: value as AchievementTypes});
    onDataChange({...data, type: value as AchievementTypes});
  }

  function handleMinPercentageChange(event: React.ChangeEvent<HTMLInputElement>) {
    const value = Number(event.target.value);
    if (value < 0 || value > 100) {
      toast.error("A porcentagem mínima deve estar entre 1 e 100");
      return;
    }

    setData({...data, minPercentage: value});
    onDataChange({...data, minPercentage: value});
  }

  function handleCategoryChange(event: React.ChangeEvent<HTMLInputElement>) {
    const value = event.target.value;
    setData({...data, category: value as AchievementCategories});
    onDataChange({...data, category: value as AchievementCategories});
  }

  function handleEventIdChange(eventId: string) {
    setData({...data, eventId: eventId});
    onDataChange({...data, eventId: eventId});
  }

  function handleEventTypeChange(event: React.ChangeEvent<HTMLInputElement>) {
    const value = event.target.value;
    setData({...data, eventType: value as EventType});
    onDataChange({...data, eventType: value as EventType});
  }

  function handleNumberOfPresencesChange(event: React.ChangeEvent<HTMLInputElement>) {
    const value = Number(event.target.value);
    if (value < 0) {
      toast.error("O número de presenças deve ser positivo");
      return;
    }

    setData({...data, numberOfPresences: value});
    onDataChange({...data, numberOfPresences: value});
  }

  function handleNumberOfAchievementsChange(event: React.ChangeEvent<HTMLInputElement>) {
    const value = Number(event.target.value);
    if (value < 0) {
      toast.error("O número de conquistas deve ser positivo");
      return;
    }

    setData({...data, numberOfAchievements: value});
    onDataChange({...data, numberOfAchievements: value});
  }
  
  function handleImageChange(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files[0];
  
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => {
      const base64 = reader.result as string;
      setData({...data, image: file, imageBase64: base64});
      onDataChange({...data, imageBase64: base64});
    };
  }

  function showImage() {
    if (data.imageBase64) {
      return (
        <>
          <h4 className="mt-8">Imagem atual</h4>
          <div className="flex justify-center mt-8">
            <img
              src={data.imageBase64}
              alt="Imagem da conquista"
              className="w-1/2 h-1/2"
            />
          </div>
        </>
      );
    }
  }

  return (
    <>
      <Input
        className="my-3"
        label="Título"
        value={data.title}
        onChange={handleTitleChange}
        type={InputType.Text}
      />
      <Input
        className="my-3"
        label="Descrição"
        value={data.description}
        onChange={handleDescriptionChange}
        type={InputType.Text}
      />
      <Input
        className="my-3"
        label="Início"
        value={data.startDate}
        onChange={handleStartDateChange}
        type={InputType.Date}
      />
      <Input
        className="my-3"
        label="Fim"
        value={data.endDate}
        onChange={handleEndDateChange}
        type={InputType.Date}
      />
      <Input
        className="my-3"
        label="Tipo"
        value={data.type}
        onChange={handleTypeChange}
        choices={ACHIEVEMENTS_TYPES}
        type={InputType.Select}
      />
      <Input
        className="my-3"
        label="Categoria"
        value={data.category}
        onChange={handleCategoryChange}
        choices={ACHIEVEMENTS_CATEGORIES}
        type={InputType.Select}
      />
      { data.category === AchievementCategories.PRESENCA_EM_EVENTO &&
        (
          <Input
            className="my-3"
            label="Evento"
            valueKey="id"
            labelKey="name"
            value={data.eventId}
            onChange={handleEventIdChange}
            choices={events?.getEntities()}
            type={InputType.Autocomplete}
          />
        )
      }
      { data.category === AchievementCategories.PRESENCA_EM_TIPO_DE_EVENTO &&
        (
          <Input
          className="my-3"
          label="Tipo do evento"
          value={data.eventType}
          onChange={handleEventTypeChange}
          choices={EVENT_TYPES}
          type={InputType.Select}
        />
        )
      }
      { data.type === AchievementTypes.CASA 
        && (data.category === AchievementCategories.PRESENCA_EM_EVENTO 
            || data.category === AchievementCategories.PRESENCA_EM_TIPO_DE_EVENTO ) &&
        ( 
          <Input
            className="my-3"
            label="Porcentagem mínima"
            value={data.minPercentage}
            onChange={handleMinPercentageChange}
            type={InputType.Number}
          />
        )
      }
      { data.type === AchievementTypes.INDIVIDUAL && data.category === AchievementCategories.PRESENCA_EM_TIPO_DE_EVENTO &&
        (
          <Input
            className="my-3"
            label="Número de presenças"
            onChange={handleNumberOfPresencesChange}
            value={data.numberOfPresences}
            type={InputType.Number}
          />
        )
      }
      { data.category === AchievementCategories.NUMERO_DE_CONQUISTAS &&
        (
          <Input
            className="my-3"
            label="Número de conquistas"
            onChange={handleNumberOfAchievementsChange}
            value={data.numberOfAchievements}
            type={InputType.Number}
          />
        )
      }
      { data.id && data.category === AchievementCategories.QR_CODE && (
        <div className="w-full">
          <button
            className="w-full mt-2 bg-black hover:bg-gray-700 text-white font-bold py-2 px-4 rounded"
            onClick={() => generateAndDownloadQRCode(data.title+'-'+data.type, data.id)}
          >
            Gerar QR Code
          </button>
        </div>
      )}
      <Input
        className="my-3"
        label="Imagem da conquista"
        onChange={handleImageChange}
        type={InputType.Image}
      />
      {showImage()}
    </>
  );
}

export default AchievementForm;
