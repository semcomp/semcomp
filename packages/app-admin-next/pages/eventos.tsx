import { ReactNode, useEffect, useState } from "react";

import DataTable from "../components/reusable/DataTable";
import RequireAuth from "../libs/RequireAuth";
import SemcompApi from "../api/semcomp-api";
import { useAppContext } from "../libs/contextLib";
import {
  SemcompApiEvent,
  SemcompApiGetEventsResponse,
} from "../models/SemcompApiModels";
import CreateEventModal from "../components/events/CreateEventModal";
import EditEventModal from "../components/events/EditEventModal";
import DataPage from "../components/DataPage";
import { PaginationRequest, PaginationResponse } from "../models/Pagination";
import MarkAttendanceModal from "../components/events/MarkAttendanceModal";
import Input, { InputType } from "../components/Input";
import util from "../libs/util";

type EventData = {
  // ID: string;
  Nome: string;
  // "Descrição": string,
  Ministrante: string;
  // Link: string;
  "Max Inscritos": number;
  "No cronograma": ReactNode;
  "Na lista de inscrições": ReactNode;
  "Inscritos": number;
  Tipo: string;
  "Criado em": string;
};

function EventsTable({
  data,
  pagination,
  onRowClick,
  onRowSelect,
  moreInfoContainer,
  onMoreInfoClick,
}: {
  data: PaginationResponse<SemcompApiEvent>;
  pagination: PaginationRequest;
  onRowClick: (selectedIndex: number) => void;
  onRowSelect: (selectedIndexes: number[]) => void;
  moreInfoContainer: ReactNode;
  onMoreInfoClick: (selectedIndex: number) => void;
}) {
  const newData: EventData[] = [];
  for (const event of data.getEntities()) {
    newData.push({
      // ID: event.id,
      Nome: event.name,
      // "Descrição": event.description,
      Ministrante: event.speaker,
      // Link: event.link,
      "Max Inscritos": event.maxOfSubscriptions,
      "Inscritos": event.numOfSubscriptions,
      Tipo: event.type,
      "No cronograma": <Input value={event.showOnSchedule} type={InputType.Checkbox} />,
      "Na lista de inscrições": <Input value={event.showOnSubscribables} type={InputType.Checkbox} />,
      "Criado em": util.formatDate(event.createdAt),
    });
  }

  return (
    <DataTable
      data={
        new PaginationResponse<EventData>(newData, data.getTotalNumberOfItems())
      }
      pagination={pagination}
      onRowClick={onRowClick}
      onRowSelect={onRowSelect}
      moreInfoContainer={moreInfoContainer}
      onMoreInfoClick={onMoreInfoClick}
    ></DataTable>
  );
}

function Events() {
  const { semcompApi }: { semcompApi: SemcompApi } = useAppContext();
  const { adminRole } = useAppContext();
  const [data, setData] = useState(null as SemcompApiGetEventsResponse);
  const [pagination, setPagination] = useState(
    new PaginationRequest(() => fetchData())
  );
  const [selectedData, setSelectedData] = useState(null as SemcompApiEvent);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedIndexes, setSelectedIndexes] = useState([]);

  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isMarkAttendanceModalOpen, setIsMarkAttendanceModalOpen] =
    useState(false);

  async function fetchData() {
    try {
      setIsLoading(true);
      const response = await semcompApi.getEvents(pagination);
      setData(response);
    } catch (error) {
      console.error(error);
    }
  }

  async function getSubs() {
    if(data != null){
      for (const event of data.getEntities()) {
        if(event.showOnSubscribables){
          const nsubs = await semcompApi.getSubscriptions(event.id);
          event.numOfSubscriptions = nsubs;
        }
      }

      setIsLoading(false);
    }
  }


  async function handleRowClick(index: number) {
    if (adminRole.includes('EDITEVENTS')) {
      setSelectedData(data.getEntities()[index]);
      setIsEditModalOpen(true);
    }
    
    return null;
  }

  async function handleMoreInfoClick(index: number) {
    setSelectedData(data.getEntities()[index]);
  }

  async function handleSelectedIndexesChange(updatedSelectedIndexes: number[]) {
    setSelectedIndexes(updatedSelectedIndexes);
  }

  // function mapData(data: String[]): UserData[] {
  //   const newData: UserData[] = [];
  //   for (const user of data) {
  //     let paymentStatus = "";
  //     if (user.payment.status) {
  //       paymentStatus = user.payment.status === PaymentStatus.APPROVED ? "Aprovado" : "Pendente";
  //     }
  
  //     newData.push({
  //       "ID": user.id,
  //       "E-mail": user.email,
  //       "Nome": user.name,
  //       "Curso": user.course,
  //       "Telegram": user.telegram,
  //       "Casa": user.house.name,
  //       "Status do pagamento": paymentStatus,
  //       "Tamanho da camiseta": user.payment.tShirtSize,
  //       "Permite divulgação?": user.permission ? "Sim" : "Não",
  //       "Criado em": new Date(user.createdAt).toLocaleString("pt-br", 
  //       {
  //         day: 'numeric',
  //         month: 'numeric',
  //         year: 'numeric',
  //         hour: 'numeric',
  //         minute: 'numeric',
  //       }),
  //     })
  //   }
  
  //   return newData;
  // }

  

  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    getSubs();
  }, [data]);

  function MarkAttendance() {
    return (
      <>
        <button
          className="w-full bg-black text-white py-3 px-6"
          type="button"
          onClick={() => setIsMarkAttendanceModalOpen(true)}
        >
          Marcar presença
        </button>
      </>
    );
  }

  function moreInfoContent(selectedData) {
    return (
      <>
        <MarkAttendance></MarkAttendance>
      </>
    );
  }

  return (
    <>
      {isCreateModalOpen && (
        <CreateEventModal onRequestClose={() => setIsCreateModalOpen(false)} />
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
      {!isLoading && (
        <DataPage
          title="Eventos"
          isLoading={isLoading}
          buttons={
              (
              <button
                className="bg-black text-white py-3 px-6"
                type="button"
                onClick={() => setIsCreateModalOpen(true)}
              >
                Criar
              </button>

            )
          }
          table={
            <EventsTable
              data={data}
              pagination={pagination}
              onRowClick={handleRowClick}
              onRowSelect={handleSelectedIndexesChange}
              onMoreInfoClick={handleMoreInfoClick}
              moreInfoContainer={moreInfoContent(selectedData)}
            />
          }
        ></DataPage>
      )}
    </>
  );
}

export default RequireAuth(Events, "EVENTS");
