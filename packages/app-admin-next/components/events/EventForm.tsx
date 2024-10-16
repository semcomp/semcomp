import { useState } from "react";

import EventType from "../../libs/constants/event-types-enum";
import Input, { InputType } from "../Input";
import DownloadSubscriptions from "./DownloadSubscriptions";
import DownloadAttendances from "./DownloadAttendances";

export type EventFormData = {
  id: string
  name: string;
  speaker: string;
  description: string;
  maxOfSubscriptions: number;
  startDate: number;
  endDate: number;
  type: EventType;
  location: string;
  link: string;
  isInGroup: boolean;
  showOnSchedule: boolean;
  showStream: boolean;
  showOnSubscribables: boolean;
  needInfoOnSubscription: boolean;
};

const EVENT_TYPES = Object.values(EventType);

function EventForm({
  onDataChange,
  initialData = {
    id: "",
    name: "",
    speaker: "",
    description: "",
    maxOfSubscriptions: 0,
    startDate: Date.now(),
    endDate: Date.now(),
    type: EventType.PALESTRA,
    location: "",
    link: "",
    isInGroup: false,
    showOnSchedule: false,
    showStream: false,
    showOnSubscribables: false,
    needInfoOnSubscription: false,
  },
}: {
  onDataChange: (data: EventFormData) => void;
  initialData?: EventFormData;
}) {
  const [data, setData] = useState(initialData);

  function handleNameChange(event: React.ChangeEvent<HTMLInputElement>) {
    const value = event.target.value;
    setData({...data, name: value});
    onDataChange({...data, name: value});
  }

  function handleSpeakerChange(event: React.ChangeEvent<HTMLInputElement>) {
    const value = event.target.value;
    setData({...data, speaker: value});
    onDataChange({...data, speaker: value});
  }

  function handleDescriptionChange(event: React.ChangeEvent<HTMLInputElement>) {
    const value = event.target.value;
    setData({...data, description: value});
    onDataChange({...data, description: value});
  }

  function handleMaxOfSubscriptionsChange(event: React.ChangeEvent<HTMLInputElement>) {
    const value = event.target.value;
    setData({...data, maxOfSubscriptions: +value});
    onDataChange({...data, maxOfSubscriptions: +value});
  }

  function handleStartDateChange(value: number) {
    setData({...data, startDate: value});
    onDataChange({...data, startDate: value});
  }

  function handleEndDateChange(value: number) {
    setData({...data, endDate: value});
    onDataChange({...data, endDate: value});
  }

  function handleTypeChange(event: React.ChangeEvent<HTMLInputElement>) {
    const value = event.target.value;
    setData({...data, type: value as EventType});
    onDataChange({...data, type: value as EventType});
  }

  function handleLocationChange(event: React.ChangeEvent<HTMLInputElement>) {
    const value = event.target.value;
    setData({...data, location: value});
    onDataChange({...data, location: value});
  }

  function handleLinkChange(event: React.ChangeEvent<HTMLInputElement>) {
    const value = event.target.value;
    setData({...data, link: value});
    onDataChange({...data, link: value});
  }

  function handleIsInGroupChange(
    event: React.ChangeEvent<HTMLInputElement>
  ) {
    const value = event.target.checked;
    setData({ ...data, isInGroup: value });
    onDataChange({...data, isInGroup: value});
  }

  function handleShowOnScheduleChange(
    event: React.ChangeEvent<HTMLInputElement>
  ) {
    const value = event.target.checked;
    setData({ ...data, showOnSchedule: value });
    onDataChange({...data, showOnSchedule: value});
  }

  function handleShowStreamChange(
    event: React.ChangeEvent<HTMLInputElement>
  ) {
    const value = event.target.checked;
    setData({ ...data, showStream: value });
    onDataChange({...data, showStream: value});
  }

  function handleShowOnSubscribablesChange(
    event: React.ChangeEvent<HTMLInputElement>
  ) {
    const value = event.target.checked;
    setData({ ...data, showOnSubscribables: value });
    onDataChange({...data, showOnSubscribables: value});
  }

  function handleNeedInfoOnSubscriptionChange(
    event: React.ChangeEvent<HTMLInputElement>
  ) {
    const value = event.target.checked;
    setData({ ...data, needInfoOnSubscription: value });
    onDataChange({...data, needInfoOnSubscription: value});
  }

  return (
    <>
      <Input
        className="my-3"
        label="Nome"
        value={data.name}
        onChange={handleNameChange}
        type={InputType.Text}
      />
      <Input
        className="my-3"
        label="Ministrante"
        value={data.speaker}
        onChange={handleSpeakerChange}
        type={InputType.Text}
      />
      <Input
        className="my-3"
        label="Descrição"
        value={data.description}
        onChange={handleDescriptionChange}
        type={InputType.TextArea}
      />
      <Input
        className="my-3"
        label="Máximo de Inscritos"
        value={data.maxOfSubscriptions}
        onChange={handleMaxOfSubscriptionsChange}
        type={InputType.Number}
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
        label="Término"
        value={data.endDate}
        onChange={handleEndDateChange}
        type={InputType.Date}
      />
      <Input
        className="my-3"
        label="Tipo"
        value={data.type}
        onChange={handleTypeChange}
        choices={EVENT_TYPES}
        type={InputType.Select}
      />
      <Input
        className="my-3"
        label="Lugar"
        value={data.location}
        onChange={handleLocationChange}
        type={InputType.Text}
      />
      <Input
        className="my-3"
        label="Link"
        value={data.link}
        onChange={handleLinkChange}
        type={InputType.Text}
      />
      <Input
        className="my-3"
        label="Em grupo?"
        onChange={handleIsInGroupChange}
        value={data.isInGroup}
        type={InputType.Checkbox}
      />
      <Input
        className="my-3"
        label="Mostrar no Cronograma"
        onChange={handleShowOnScheduleChange}
        value={data.showOnSchedule}
        type={InputType.Checkbox}
      />
      <Input
        className="my-3"
        label="Mostrar Stream"
        onChange={handleShowStreamChange}
        value={data.showStream}
        type={InputType.Checkbox}
      />
      <Input
        className="my-3"
        label="Mostrar nas Inscrições"
        onChange={handleShowOnSubscribablesChange}
        value={data.showOnSubscribables}
        type={InputType.Checkbox}
      />
      {/* <Input
        className="my-3"
        label="Precisa de informações adicionais para inscrição?"
        onChange={handleNeedInfoOnSubscriptionChange}
        value={data.needInfoOnSubscription}
        type={InputType.Checkbox}
      /> */}
      {data && data.showOnSubscribables && <DownloadSubscriptions eventId={data.id} eventName={data.name}></DownloadSubscriptions>}
      {data && data.showOnSubscribables && <DownloadAttendances eventId={data.id} eventName={data.name}></DownloadAttendances>}
    </>
  );
}

export default EventForm;
