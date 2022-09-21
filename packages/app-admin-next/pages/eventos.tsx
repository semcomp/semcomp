import { useEffect, useState } from 'react';

import DataTable from '../components/reusable/DataTable';
import RequireAuth from '../libs/RequireAuth';
import SemcompApi from '../api/semcomp-api';
import { useAppContext } from '../libs/contextLib';
import { SemcompApiEvent, SemcompApiGetEventsResponse } from '../models/SemcompApiModels';
import CreateEventModal from '../components/events/CreateEventModal';
import EditEventModal from '../components/events/EditEventModal';
import DataPage from '../components/DataPage';
import { EventFormData } from '../components/events/EventForm';

type EventData = {
  "ID": string,
  "Nome": string,
  "Descrição": string,
  "Facilitador": string,
  "Link": string,
  "Máximo de Inscritos": number,
  "Tipo": string,
  "Criado em": string,
}

function EventsTable({
  events,
  onRowClick,
  onRowSelect,
}: {
  events: SemcompApiEvent[],
  onRowClick: (selectedIndex: number) => void,
  onRowSelect: (selectedIndexes: number[]) => void,
}) {
  const data: EventData[] = [];
  for (const event of events) {
    data.push({
      "ID": event.id,
      "Nome": event.name,
      "Descrição": event.description,
      "Facilitador": event.speaker,
      "Link": event.link,
      "Máximo de Inscritos": event.maxOfSubscriptions,
      "Tipo": event.type,
      "Criado em": new Date(event.createdAt).toISOString(),
    })
  }

  return (<DataTable
    data={data}
    onRowClick={onRowClick}
    onRowSelect={onRowSelect}
  ></DataTable>);
}

function Events() {
  const {semcompApi}: {semcompApi: SemcompApi} = useAppContext();

  const [data, setData] = useState(null as SemcompApiGetEventsResponse);
  const [selectedData, setSelectedData] = useState(null as EventFormData);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedIndexes, setSelectedIndexes] = useState([]);

  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);

  async function fetchData() {
    try {
      setIsLoading(true);
      const response = await semcompApi.getEvents();
      setData(response);
    } catch (error) {
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  }

  async function handleRowClick(index: number) {
    setSelectedData(data[index]);
    setIsEditModalOpen(true);
  }

  async function handleSelectedIndexesChange(updatedSelectedIndexes: number[]) {
    setSelectedIndexes(updatedSelectedIndexes);
  }

  useEffect(() => {
    fetchData();
  }, []);

  return (<>
    {isCreateModalOpen && (
      <CreateEventModal
        onRequestClose={() => setIsCreateModalOpen(false)}
      />
    )}
    {isEditModalOpen && (
      <EditEventModal
        initialValue={selectedData}
        onRequestClose={() => {
          fetchData();
          setIsEditModalOpen(false);
        }}
      />
    )}
    <DataPage
      title="Eventos"
      isLoading={isLoading}
      buttons={<button
        className="bg-black text-white py-3 px-6"
        type="button"
        onClick={() => setIsCreateModalOpen(true)}
      >
        Criar
      </button>}
      table={<EventsTable
        events={data}
        onRowClick={handleRowClick}
        onRowSelect={handleSelectedIndexesChange}
      />}
    ></DataPage>
  </>);
}

export default RequireAuth(Events);
