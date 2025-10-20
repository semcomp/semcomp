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
import util from "../libs/util";


type GameGroupData = {
  Jogo: string;
  Nome: string;
  Membros: string;
  "Questao atual": any;
  // "Dicas disponíveis": number;
  // "Pulos disponíveis": number;
  "Data e hora da última questão": string;
};

function mapData(data: SemcompApiGameGroup[]): GameGroupData[] {
  const newData: GameGroupData[] = [];
  const options = {
    day: 'numeric',
    month: 'numeric',
    hour: 'numeric',
    minute: 'numeric',
  }
  for (const gameQuestion of data) {
    const game = Object.keys(Game).find((key) => Game[key] === gameQuestion.game);
    newData.push({
      Jogo: game,
      Nome: gameQuestion.groupName,
      Membros: gameQuestion?.members?.join(','),
      "Questao atual": gameQuestion.questionIndex,
      // "Dicas disponíveis": gameQuestion.availableClues,
      // "Pulos disponíveis": gameQuestion.availableSkips,
      "Data e hora da última questão": util.formatDate(gameQuestion.createdAt)
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
    <div className="flex flex-col items-center mb-4 mr-8">
      <h3 className="mt-8 text-3xl font-bold text-gray-700">Vencedores: </h3>
      {
        Object.keys(dataWinner).map((key) => (
          <div className="flex flex-col items-start justify-start w-full text-primary" key={key}>
            <strong className="w-full">{key.toUpperCase()}:</strong> {String(dataWinner[key][0].groupName) }
            <strong className="w-full">Questão atual:</strong> {String(dataWinner[key][0].questionIndex) }
          </div>
        ))
      }
    </div>
  );
}

function GameGroups() {
  const { semcompApi }: { semcompApi: SemcompApi } = useAppContext();

  const [data, setData] = useState(null as SemcompApiGetGameGroupsResponse);
  const [dataWinner, setDataWinner] = useState(null);
  const [pagination, setPagination] = useState(
    new PaginationRequest(() => fetchData(), 1, 10)
  );
  const [paginationWinner,  ] = useState(
    new PaginationRequest(() => fetchData(), 1, 10)
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
