import { ReactNode, useEffect, useState } from 'react';

import DataTable from '../components/reusable/DataTable';
import RequireAuth from '../libs/RequireAuth';
import SemcompApi from '../api/semcomp-api';
import { useAppContext } from '../libs/contextLib';
import { SemcompApiEvent, SemcompApiGetEventsResponse } from '../models/SemcompApiModels';
import CreateEventModal from '../components/events/CreateEventModal';
import EditEventModal from '../components/events/EditEventModal';
import DataPage from '../components/DataPage';
import { PaginationRequest, PaginationResponse } from '../models/Pagination';
import MarkAttendanceModal from '../components/events/MarkAttendanceModal';

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
  data,
  pagination,
  onRowClick,
  onRowSelect,
  moreInfoContainer,
  onMoreInfoClick,
}: {
  data: PaginationResponse<SemcompApiEvent>,
  pagination: PaginationRequest,
  onRowClick: (selectedIndex: number) => void,
  onRowSelect: (selectedIndexes: number[]) => void,
  moreInfoContainer: ReactNode,
  onMoreInfoClick: (selectedIndex: number) => void,
}) {
  const newData: EventData[] = [];
  for (const event of data.getEntities()) {
    newData.push({
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
    data={new PaginationResponse<EventData>(newData, data.getTotalNumberOfItems())}
    pagination={pagination}
    onRowClick={onRowClick}
    onRowSelect={onRowSelect}
    moreInfoContainer={moreInfoContainer}
    onMoreInfoClick={onMoreInfoClick}
  ></DataTable>);
}

function Events() {
  const {semcompApi}: {semcompApi: SemcompApi} = useAppContext();

  const [data, setData] = useState(null as SemcompApiGetEventsResponse);
  const [pagination, setPagination] = useState(new PaginationRequest(() => fetchData()));
  const [selectedData, setSelectedData] = useState(null as SemcompApiEvent);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedIndexes, setSelectedIndexes] = useState([]);

  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isMarkAttendanceModalOpen, setIsMarkAttendanceModalOpen] = useState(false);

  async function fetchData() {
    try {
      setIsLoading(true);
      const response = await semcompApi.getEvents(pagination);
      setData(response);
    } catch (error) {
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  }

  async function handleRowClick(index: number) {
    setSelectedData(data.getEntities()[index]);
    setIsEditModalOpen(true);
  }

  async function handleMoreInfoClick(index: number) {
    setSelectedData(data.getEntities()[index]);
  }

  async function handleSelectedIndexesChange(updatedSelectedIndexes: number[]) {
    setSelectedIndexes(updatedSelectedIndexes);
  }

  useEffect(() => {
    fetchData();
  }, []);

  function MarkAttendance() {
    return <>
      <button
        className="w-full bg-black text-white py-3 px-6"
        type="button"
        onClick={() => setIsMarkAttendanceModalOpen(true)}
      >
        Marcar presença
      </button>
    </>;
  }

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
    {isMarkAttendanceModalOpen && (
      <MarkAttendanceModal
        data={selectedData}
        onRequestClose={() => {
          setIsMarkAttendanceModalOpen(false);
        }}
      />
    )}
    {
      !isLoading && (
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
            data={data}
            pagination={pagination}
            onRowClick={handleRowClick}
            onRowSelect={handleSelectedIndexesChange}
            moreInfoContainer={<MarkAttendance></MarkAttendance>}
            onMoreInfoClick={handleMoreInfoClick}
          />}
        ></DataPage>
      )
    }
  </>);
}

export default RequireAuth(Events);
