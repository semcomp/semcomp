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
import exportToCsv from "../libs/DownloadCsv";
import { CircularProgress } from "@mui/material";
import EventType from "../libs/constants/event-types-enum";
import Spinner from "../components/reusable/Spinner";

type EventData = {
  ID: string;
  Nome: string;
  // "Descrição": string,
  Ministrante: string;
  // Link: string;
  "Max Inscritos": number;
  "Inicio": string;
  "Fim": string;
  "No cronograma": ReactNode;
  "Na lista de inscrições": ReactNode;
  "Inscritos": number;
  Tipo: string;
};


type AttendedEventsApiData = {
  name: string;
  email: string;
  course: string;
  hours: number;
  percentage: number;
};


const EventsTable = forwardRef(({
  data,
  pagination,
  onRowClick,
  onRowSelect,
  moreInfoContainer,
  onMoreInfoClick,
  deleteEvent,
}: {
  data: PaginationResponse<SemcompApiEvent>;
  pagination: PaginationRequest;
  onRowClick: (selectedIndex: number) => void;
  onRowSelect: (selectedIndexes: number[]) => void;
  moreInfoContainer: ReactNode;
  onMoreInfoClick: (selectedIndex: number) => void;
  deleteEvent: (row) => void;
}, eventTableRef?) => {
  const newData: EventData[] = [];
  for (const event of data.getEntities()) {
    newData.push({
      ID: event.id,
      Nome: event.name,
      // "Descrição": event.description,
      Ministrante: event.speaker,
      // Link: event.link,
      "Max Inscritos": event.maxOfSubscriptions,
      "Inscritos": event.numOfSubscriptions,
      Tipo: event.type,
      "Inicio": util.formatDate(event.startDate),
      "Fim": util.formatDate(event.endDate),
      "No cronograma": <Input value={event.showOnSchedule} type={InputType.Checkbox} disabled={true} />,
      "Na lista de inscrições": <Input value={event.showOnSubscribables} type={InputType.Checkbox} disabled={true} />,
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
      actions={{"delete": deleteEvent}}
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
  const [isMobile, setIsMobile] = useState(false);
  const [selectedData, setSelectedData] = useState(null as SemcompApiEvent);
  const [selectedCoffeeItem, setSelectedCoffeeItem] = useState("");
  const [selectedCoffeeItemId, setSelectedCoffeeItemId] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [downloadAttendances, setDownloadAttendances] = useState(false);
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

  async function fetchDownloadData() {
    try {
      setIsLoading(true);
      setDownloadAttendances(true);
      const response = await semcompApi.getDetailedAttendances({ eventType: EventType.PALESTRA });
      exportToCsv(mapData(response));
    } catch (error) {
      console.error(error);
    } finally {
      setIsLoading(false);
      setDownloadAttendances(false);
    }
  }

  function mapData(data: any[]): any[] {
    const newData: any[] = [];
    for (const response of data) {
      const user: AttendedEventsApiData = response;
      newData.push({
        "Nome": user.name,
        "E-mail": user.email,
        "Curso": user.course,
        "Horas totais": user.hours,
        "Presença[%]": user.percentage,
        ">70%": user.percentage > 70 ? "Sim" : "Não",
      })
    }
  
    return newData;
  }

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 620);
    };

    window.addEventListener("resize", handleResize);
    handleResize();

    return () => window.removeEventListener("resize", handleResize);
  }, []);

  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    getSubs();
  }, [data]);

  function MarkAttendance({eventType}) {
    return (
      <>
        <button
          className="w-full bg-black text-white py-3 px-6"
          type="button"
          onClick={() => { 
              if(eventType !== "Coffee"){
                setIsMarkAttendanceModalOpen(true);
              }else{
                selectedCoffeeItem === "" ? 
                  toast.error("Selecione um item do Coffee") : 
                  setIsMarkAttendanceModalOpen(true)
              }
            }
          }
        >
          Marcar presença
        </button>
      </>
    );
  }

  const MoreInfoContent = ({selectedData}) => {
    const [coffeeOptions, setCoffeeOptions] = useState([]);
    const [isCoffeeLoading, setIsCoffeeLoading] = useState(false);
    const eventType = selectedData?.type;

    async function fetchCoffeeData(){
      try{
        setIsCoffeeLoading(true);
        if(eventType === EventType.COFFEE){
          const response = await semcompApi.getCoffeeOptions();
          setCoffeeOptions(response);
        }
      }catch (error) {
        console.error(error);
      }finally{
        setIsCoffeeLoading(false);
      }
    }
    
    
    //Verifica se o tipo de evento não é "Coffee" e reseta o estado de coffeeItem
    useEffect(() => {
      if (eventType !== "Coffee") {
        setSelectedCoffeeItem("");
        setSelectedCoffeeItemId("");
      }
    }, [eventType]);
      
    useEffect(() => {  
      fetchCoffeeData();
    }, []);
  
    const handleSelectChange = (event) => {
      const selectedName = event.target.value;
      const coffeeId = coffeeOptions.find((coffee) => coffee.name === selectedName)?.id;
      if(coffeeId !== ""){
        setSelectedCoffeeItem(selectedName);
        setSelectedCoffeeItemId(coffeeId);
      } else {
        toast.error("Coffee não encontrado!");
      }
    };
  
    return (
      <div className={`flex justify-between ${isMobile ? "flex-col" : ""}`}>    
          <MarkAttendance 
            eventType={eventType}
          />
          {
            isCoffeeLoading ? 
              <div className={`flex justify-center items-center ${isMobile ? "py-5 w-6/12" : "px-5 w-8/12"}`} style={{height: "55px"}} >
                <CircularProgress size="2rem"/>
              </div>
              :
              (
                eventType === EventType.COFFEE && 
                <div className={`h-9/12 ${isMobile ? "py-5 w-6/12" : "px-5 w-10/12"}`} style={{height: isMobile ? "80px" : "55px"}}>
                  <Input 
                    type={InputType.Select}
                    label="Qual coffee será buscado?"
                    choices={coffeeOptions.map((coffee) => (coffee.name))}
                    onChange={handleSelectChange}
                    value={selectedCoffeeItem}
                  />
                </div>
              )
          }
      </div>
    );
  };

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

  async function deleteEvent(row) {
    if (adminRole.includes('DELETE')) {
      const confirmed = window.confirm("Tem certeza de que deseja excluir '" + row.Nome + "'?");
      if (confirmed) {
        try {
          const deleted = await semcompApi.deleteEvent(row.ID);
          fetchData();
          toast.success(`Evento <${row.Nome}> excluído com sucesso`);
        } catch (e) {
          toast.error(`Erro ao excluir o evento <${row.Nome}>`);
        }
      }
    } else {
      toast.error("Você não tem permissão para excluir eventos!");
    }
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
          //So passa coffeeItemId se selectedCoffeeItem existir, ou seja, evento do tipo coffee
          {...(selectedCoffeeItemId !== ""? { coffeeItemId: selectedCoffeeItemId }: {})}
        />
      )}
      {downloadAttendances && (
        <div className="fixed inset-0 flex items-center justify-center">
          <Spinner size="large"/>
        </div>
      )}
      {!isLoading && !downloadAttendances && (
        <>
          <DataPage
            title="Eventos"
            isLoading={isLoading}
            buttons={(
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
                moreInfoContainer={
                  <MoreInfoContent 
                  selectedData={selectedData}
                  />
                }
                ref={eventTableRef}
                deleteEvent={deleteEvent}
              />
            }
          />
        
          <button
            className="w-full bg-black text-white py-3 px-6"
            type="button"
            style={{ height: '48px' }}
            onClick={fetchDownloadData}
          >
            Baixar Planilha de Presenças
          </button>
        </>
      )}
    </>
  );
}

export default RequireAuth(Events, "EVENTS");
