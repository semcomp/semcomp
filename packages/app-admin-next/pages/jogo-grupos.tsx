import { useEffect, useState } from "react";

import DataTable from "../components/reusable/DataTable";
import RequireAuth from "../libs/RequireAuth";
import SemcompApi from "../api/semcomp-api";
import { useAppContext } from "../libs/contextLib";
import {
  SemcompApiGameGroup,
  SemcompApiGetGameGroupsResponse,
  SemcompApiGetGameWinnersResponse,
} from "../models/SemcompApiModels";
import DataPage from "../components/DataPage";
import { PaginationRequest, PaginationResponse } from "../models/Pagination";
import Game from "../libs/constants/game-enum";
import VerticalTableRow from "../components/layout/VerticalTableRow";


type GameGroupData = {
  ID: string;
  Jogo: Game;
  Nome: string;
  "Questao atual": any;
  // "Dicas disponíveis": number;
  // "Pulos disponíveis": number;
  "Data e hora da última questão": string;
};

function getMaxQuestion(completedQuestions) {
  let max;
  for(const question of completedQuestions){
    if(question.index == completedQuestions.length){
      return question;
    }
  }
  return;
}

function mapData(data: SemcompApiGameGroup[]): GameGroupData[] {
  const newData: GameGroupData[] = [];
  const options = {
    day: 'numeric',
    month: 'numeric',
    hour: 'numeric',
    minute: 'numeric',
  }
  for (const gameQuestion of data) {
    // console.log(" || \n");
    if(gameQuestion.completedQuestions.length >= 1){
      
      gameQuestion.createdAt = getMaxQuestion(gameQuestion.completedQuestions)?.createdAt;
    }
     

    newData.push({
      ID: gameQuestion.id,
      Jogo: gameQuestion.game,
      Nome: gameQuestion.name,
      "Questao atual": gameQuestion.completedQuestions.length,
      // "Dicas disponíveis": gameQuestion.availableClues,
      // "Pulos disponíveis": gameQuestion.availableSkips,
      "Data e hora da última questão": 
        new Date(gameQuestion.createdAt)
        .toLocaleString("pt-br", 
        {
          day: 'numeric',
          month: 'numeric',
          hour: 'numeric',
          minute: 'numeric',
        }),
    });
  }

  return newData;
}

function GameGroupsTable({
  data,
  pagination,
  onRowClick,
  onRowSelect,
}: {
  data: PaginationResponse<SemcompApiGameGroup>;
  pagination: PaginationRequest;
  onRowClick: (selectedIndex: number) => void;
  onRowSelect: (selectedIndexes: number[]) => void;
}) {
  return (
    <DataTable
      data={
        new PaginationResponse<GameGroupData>(
          mapData(data.getEntities()),
          data.getTotalNumberOfItems()
        )
      }
      pagination={pagination}
      onRowClick={onRowClick}
      onRowSelect={onRowSelect}
    ></DataTable>
  );
}

function ShowWinner({dataWinner} : {dataWinner: SemcompApiGetGameWinnersResponse}){
  return (
    <div className="w-2/4 flex flex-col items-center mb-4">
      <h3 className="mt-8 text-3xl font-bold text-gray-700">Vencedores: </h3>
      {
        
        Object.keys(dataWinner).map((key) => (
          <div key={key}>
            <strong>{key}:</strong> {String(dataWinner[key].name)}
          </div>
        ))
      
      }
    </div>
  );
}

function GameGroups() {
  const { semcompApi }: { semcompApi: SemcompApi } = useAppContext();

  const [data, setData] = useState(null as SemcompApiGetGameGroupsResponse);
  const [dataWinner, setDataWinner] = useState(null as SemcompApiGetGameWinnersResponse);
  const [pagination, setPagination] = useState(
    new PaginationRequest(() => fetchData())
  );
  const [isLoading, setIsLoading] = useState(true);
  const [selectedIndexes, setSelectedIndexes] = useState([]);

  async function fetchData() {
    try {
      setIsLoading(true);
      const response = await semcompApi.getGameGroups(pagination);
      const winner = await semcompApi.getGameWinner();
      setData(response);
      setDataWinner(winner);
    } catch (error) {
      console.error(error);
    } finally {
    }
  }

  async function handleRowClick(index: number) {
    console.log(data.getEntities()[index]);
  }

  async function handleSelectedIndexesChange(updatedSelectedIndexes: number[]) {
    setSelectedIndexes(updatedSelectedIndexes);
  }

  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    if(data && dataWinner){
      setIsLoading(false);
    }
  }, [data, dataWinner]);

  return (
    <>
      {!isLoading && (
        <> 
          <DataPage
            title="Jogo - Grupos"
            isLoading={isLoading}
            buttons={
              <ShowWinner 
                dataWinner={dataWinner}
              />
            }
            table={
              <GameGroupsTable
                data={data}
                pagination={pagination}
                onRowClick={handleRowClick}
                onRowSelect={handleSelectedIndexesChange}
              />
            }
          ></DataPage>
        </>
      )}
    </>
  );
}

export default RequireAuth(GameGroups, "GAMEGROUPS");
