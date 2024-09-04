import { ReactNode, useEffect, useState } from "react";
import { toast } from "react-toastify";

import DataTable from "../components/reusable/DataTable";
import SemcompApi from "../api/semcomp-api";
import RequireAuth from "../libs/RequireAuth";
import { useAppContext } from "../libs/contextLib";
import {
  SemcompApiAchievement,
  SemcompApiGetAchievementsResponse,
  SemcompApiGetEventsResponse
} from "../models/SemcompApiModels";
import { PaginationRequest, PaginationResponse } from "../models/Pagination";
import DataPage from "../components/DataPage";
import SetAchievement from "../components/achievement/SetAchievement";
import EditAchievementModal from "../components/achievement/EditAchievementModal";
import CreateAchievementModal from "../components/achievement/CreateAchievementModal";
import utils from "../libs/util";
import AchievementCategories from "../libs/constants/achievement-categories-enum";

type AchievementData = {
  ID: string,
  Título: string,
  Descrição: string,
  "Data de início": string,
  "Data de fim": string,
  Tipo: string,
  "Porcentagem (min)": number,
  "Categoria": string,
  "Evento": string,
  "Tipo de evento": string,
};

function AchievementTable({
  data,
  pagination,
  onRowClick,
  onRowSelect,
  onDeleteAchievement,
  onMoreInfoClick,
  moreInfoContainer,
}: {
  data: PaginationResponse<SemcompApiAchievement>;
  pagination: PaginationRequest;
  onRowClick: (selectedIndex: number) => void;
  onRowSelect: (selectedIndexes: number[]) => void; 
  onDeleteAchievement: (row: SemcompApiAchievement) => void; 
  onMoreInfoClick: (selectedIndex: number) => void;
  moreInfoContainer: ReactNode;
}) {
  const { semcompApi }: { semcompApi: SemcompApi } = useAppContext();
  const newData: AchievementData[] = [];
  const [events, setEvents] = useState(null as SemcompApiGetEventsResponse);

  async function fetchEvents() {
    try {
      const response = await semcompApi.getEvents(pagination);
      setEvents(response);
    } catch (error) {
      toast.error("Erro ao buscar eventos");
      return null;
    }
  }

  useEffect(() => {
    fetchEvents();
  }, []);

  for (const achievement of data.getEntities()) {
    newData.push({
      ID: achievement.id,
      Título: achievement.title,
      Descrição: achievement.description,
      "Data de início": utils.formatDate(achievement.startDate),
      "Data de fim": utils.formatDate(achievement.endDate),
      Tipo: achievement.type,
      "Porcentagem (min)": achievement.minPercentage,
      Categoria: achievement.category,
      Evento: events?.getEntities().find((event) => event.id === achievement.eventId)?.name || "Nenhum",
      "Tipo de evento": achievement.eventType,
    });
  }
  return (
    <DataTable
      data={
        new PaginationResponse<AchievementData>(newData, data.getTotalNumberOfItems())
      }
      pagination={pagination}
      onRowClick={onRowClick}
      onRowSelect={onRowSelect}
      actions={{"delete": onDeleteAchievement}}
      onMoreInfoClick={onMoreInfoClick}
      moreInfoContainer={moreInfoContainer}
    ></DataTable>
  );
}

function Achievements() {
  const { semcompApi }: { semcompApi: SemcompApi } = useAppContext();
  const [data, setData] = useState(null as SemcompApiGetAchievementsResponse);
  const [pagination, _] = useState(new PaginationRequest(() => fetchData()));
  const [selectedData, setSelectedData] = useState(null as SemcompApiAchievement);
  const [selectedIndexes, setSelectedIndexes] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isAssignAchievementModalOpen, setAssignAchievementModalOpen] = useState(false);

  async function fetchData() {
    try {
      setIsLoading(true);
      const response = await semcompApi.getAchievement(pagination);
      setData(response);
    } catch (error) {
      toast.error("Erro ao buscar conquistas");
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  }

  async function handleRowClick(index: number) {
    setSelectedData(data.getEntities()[index]);
    setIsEditModalOpen(true);

    return null;
  }

  async function handleSelectedIndexesChange(updatedSelectedIndexes: number[]) {
    setSelectedIndexes(updatedSelectedIndexes);
  }

  async function handleMoreInfoClick(index: number) {
    setSelectedData(data.getEntities()[index]);
  }

  function AssignAchievement() {
    if (!selectedData || (selectedData.category !== AchievementCategories.MANUAL)) {
      return (
        <>
        <div className="w-full py-3 px-6">
          <b>Esta conquista não possui atribuição manual</b>
        </div>
      </>
      );
    }

    return (
      <>
        <button
          className="w-full bg-black text-white py-3 px-6"
          type="button"
          onClick={() => setAssignAchievementModalOpen(true)}
        >
          Atribuir conquista
        </button>
      </>
    );
  }

  function moreInfoContent(selectedData) {
    return (
      <>
        <AssignAchievement></AssignAchievement>
      </>
    );
  }
  async function deleteAchievement(row) {
    const confirmed = window.confirm("Tem certeza de que deseja excluir " + row.Título + "?");
      if (confirmed) {
        try {
          setIsLoading(true);
          const deleted = await semcompApi.deleteAchievement(row.ID);
          toast.success("Conquista excluída com sucesso");
          fetchData();
        } catch (error) {
          toast.error("Erro ao excluir conquista");
          console.error(error);
        } finally {
          setIsLoading(false);
        }
      }
  }

  useEffect(() => {
    fetchData();
  }, []);

  return (
    <>
      {isCreateModalOpen && (
        <CreateAchievementModal onRequestClose={() => {
            fetchData();
            setIsCreateModalOpen(false);
          }} 
        />
      )}
      {isEditModalOpen && (
        <EditAchievementModal
          initialValue={selectedData}
          onRequestClose={() => {
            fetchData();
            setIsEditModalOpen(false);
          }}
        />
      )}
      {isAssignAchievementModalOpen && (
        <SetAchievement
          achievement={selectedData}
          onRequestClose={() => {
            setAssignAchievementModalOpen(false);
          }}
        />  
      )}
      {!isLoading && (
        <DataPage
          title="Conquistas"
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
            <AchievementTable
              data={data}
              pagination={pagination}
              onRowClick={handleRowClick}
              onRowSelect={handleSelectedIndexesChange}
              onDeleteAchievement={deleteAchievement}
              onMoreInfoClick={handleMoreInfoClick}
              moreInfoContainer={moreInfoContent(selectedData)}
            />
          }
        ></DataPage>
      )}
    </>
  );
}

export default RequireAuth(Achievements, "ACHIEVEMENTS");
