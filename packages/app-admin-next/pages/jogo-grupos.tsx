import { useEffect, useState } from 'react';

import DataTable from '../components/reusable/DataTable';
import RequireAuth from '../libs/RequireAuth';
import SemcompApi from '../api/semcomp-api';
import { useAppContext } from '../libs/contextLib';
import { SemcompApiGameGroup, SemcompApiGetGameGroupsResponse } from '../models/SemcompApiModels';
import DataPage from '../components/DataPage';
import { PaginationRequest, PaginationResponse } from '../models/Pagination';
import Game from '../libs/constants/game-enum';

type GameGroupData = {
  "ID": string,
  "Jogo": Game;
  "Nome": string;
  "Dicas disponíveis": number;
  "Pulos disponíveis": number;
  "Criado em": string,
};

function mapData(data: SemcompApiGameGroup[]): GameGroupData[] {
  const newData: GameGroupData[] = [];
  for (const gameQuestion of data) {
    newData.push({
      "ID": gameQuestion.id,
      "Jogo": gameQuestion.game,
      "Nome": gameQuestion.name,
      "Dicas disponíveis": gameQuestion.availableClues,
      "Pulos disponíveis": gameQuestion.availableSkips,
      "Criado em": new Date(gameQuestion.createdAt).toISOString(),
    })
  }

  return newData;
}

function GameGroupsTable({
  data,
  pagination,
  onRowClick,
  onRowSelect,
}: {
  data: PaginationResponse<SemcompApiGameGroup>,
  pagination: PaginationRequest,
  onRowClick: (selectedIndex: number) => void,
  onRowSelect: (selectedIndexes: number[]) => void,
}) {
  return (<DataTable
    data={new PaginationResponse<GameGroupData>(mapData(data.getEntities()), data.getTotalNumberOfItems())}
    pagination={pagination}
    onRowClick={onRowClick}
    onRowSelect={onRowSelect}
  ></DataTable>);
}

function GameGroups() {
  const {semcompApi}: {semcompApi: SemcompApi} = useAppContext();

  const [data, setData] = useState(null as SemcompApiGetGameGroupsResponse);
  const [pagination, setPagination] = useState(new PaginationRequest(() => fetchData()));
  const [isLoading, setIsLoading] = useState(true);
  const [selectedIndexes, setSelectedIndexes] = useState([]);

  async function fetchData() {
    try {
      setIsLoading(true);
      const response = await semcompApi.getGameGroups(pagination);
      setData(response);
    } catch (error) {
      console.error(error);
    } finally {
      setIsLoading(false);
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

  return (<>
    {
      !isLoading && (
        <DataPage
          title="Jogo - Grupos"
          isLoading={isLoading}
          table={<GameGroupsTable
            data={data}
            pagination={pagination}
            onRowClick={handleRowClick}
            onRowSelect={handleSelectedIndexesChange}
          />}
        ></DataPage>
      )
    }
  </>);
}

export default RequireAuth(GameGroups);
