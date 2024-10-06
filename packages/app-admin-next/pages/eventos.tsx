import { forwardRef, ReactNode, useEffect, useImperativeHandle, useRef, useState } from "react";

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
import { toast } from "react-toastify";
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

const EventsTable = forwardRef(({
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
}, eventTableRef?) => {
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
      "No cronograma": <Input value={event.showOnSchedule} type={InputType.Checkbox} disabled={true} />,
      "Na lista de inscrições": <Input value={event.showOnSubscribables} type={InputType.Checkbox} disabled={true} />,
      "Criado em": util.formatDate(event.createdAt),
    });
  }
  const dataTableRef = useRef(null);

  function unsetSelectAll() {
    dataTableRef.current.handleSelectAll(false);
  }

  useImperativeHandle(eventTableRef, () => ({
    unsetSelectAll,
  }));

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
      ref={dataTableRef}
    ></DataTable>
  );
});

EventsTable.displayName = "EventsTable";

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
  const [isMarkAttendanceModalOpen, setIsMarkAttendanceModalOpen] = useState(false);
  const eventTableRef = useRef(null);

  const btnHeight = "50px";
  
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

  async function updateEvent(status: boolean, option: string) {
    if(selectedIndexes && selectedIndexes.length > 0){
      for (const index of selectedIndexes) {
        const event = data.getEntities()[index];
        try {
          if (option === "schedule") {
            event.showOnSchedule = status;

            let response = await semcompApi.editEvent(event.id, event);
            if (response){
              toast.success(`Evento <${event.name}> ${status ? "adicionado no" : "removido do"} cronograma`);
            } else {
              toast.error(`Erro ao tentar ${status ? "adicionar" : "remover"}  o evento <${event.name}> do cronograma`);
            }
          } else {
            event.showOnSubscribables = status;
            let response = await semcompApi.editEvent(event.id, event);

            if (response){
              toast.success(`Evento <${event.name}> ${status ? "adicionado na" : "removido da"} lista de inscrições`);
            } else {
              toast.error(`Erro ao tentar ${status ? "adicionar" : "remover"}  o evento <${event.name}> da lista de inscrições`);
            }
          }
        } catch (error) {
          toast.error(`Erro ao executar a operação`);
        }
      }
    }

    eventTableRef.current.unsetSelectAll();
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
              <>
              { selectedIndexes && selectedIndexes.length > 0 &&
                  ( <>
                    <button
                      className="bg-black text-white py-3 px-6 mx-2"
                      style={{ height: btnHeight }}
                      type="button"
                      onClick={() => updateEvent(true, "schedule")}
                    >
                      Exibir no cronograma
                    </button>
                    <button
                      className="bg-black text-white py-3 px-6 mx-2"
                      style={{ height: btnHeight }}
                      type="button"
                      onClick={() => updateEvent(false, "schedule")}
                    >
                      Remover do cronograma
                    </button> 
                    <button
                      className="bg-black text-white py-3 px-6 mx-2"
                      style={{ height: btnHeight }}
                      type="button"
                      onClick={() => updateEvent(true, "subscribables")}
                    >
                      Exibir na lista de inscrições
                    </button>
                   <button
                      className="bg-black text-white py-3 px-6 mx-2"
                      style={{ height: btnHeight }}
                      type="button"
                      onClick={() => updateEvent(false, "subscribables")}
                    >
                      Remover da lista de inscrições
                    </button>
                  </> )
                }
                <button
                  className="bg-black text-white py-3 px-6 mx-2"
                  style={{ height: btnHeight }}
                  type="button"
                  onClick={() => setIsCreateModalOpen(true)}
                >
                  Criar
                </button>
              </>
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
              ref={eventTableRef}
            />
          }
        ></DataPage>
      )}
    </>
  );
}

export default RequireAuth(Events, "EVENTS");
