import { useEffect, useState } from 'react';

import DataTable from '../components/reusable/DataTable';
import RequireAuth from '../libs/RequireAuth';
import SemcompApi from '../api/semcomp-api';
import { useAppContext } from '../libs/contextLib';
import { SemcompApiGetHousesResponse, SemcompApiHouse } from '../models/SemcompApiModels';
import CreateHouseModal from '../components/houses/CreateHouseModal';
import EditHouseModal from '../components/houses/EditHouseModal';
import { HouseFormData } from '../components/houses/HouseForm';
import DataPage from '../components/DataPage';
import { PaginationRequest, PaginationResponse } from '../models/Pagination';

type HouseData = {
  "ID": string,
  "Nome": string,
  "Descrição": string,
  "Link do Telegram": string,
  "Pontuação": number,
  "Criado em": string,
}

function HousesTable({
  data,
  pagination,
  onRowClick,
  onRowSelect,
}: {
  data: PaginationResponse<SemcompApiHouse>,
  pagination: PaginationRequest,
  onRowClick: (selectedIndex: number) => void,
  onRowSelect: (selectedIndexes: number[]) => void,
}) {
  const newData: HouseData[] = [];
  for (const house of data.getEntities()) {
    newData.push({
      "ID": house.id,
      "Nome": house.name,
      "Descrição": house.description,
      "Link do Telegram": house.telegramLink,
      "Pontuação": house.score,
      "Criado em": new Date(house.createdAt).toISOString(),
    })
  }

  return (<DataTable
    data={new PaginationResponse<HouseData>(newData, data.getTotalNumberOfItems())}
    pagination={pagination}
    onRowClick={onRowClick}
    onRowSelect={onRowSelect}
  ></DataTable>);
}

function Houses() {
  const {semcompApi}: {semcompApi: SemcompApi} = useAppContext();

  const [data, setData] = useState(null as SemcompApiGetHousesResponse);
  const [pagination, setPagination] = useState(new PaginationRequest(() => fetchData()));
  const [selectedData, setSelectedData] = useState(null as HouseFormData);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedIndexes, setSelectedIndexes] = useState([]);

  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);

  async function fetchData() {
    try {
      setIsLoading(true);
      const response = await semcompApi.getHouses(pagination);
      setData(response);
    } catch (error) {
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  }

  async function handleRowClick(index: number) {
    setSelectedData({
      name: data[0].name,
      description: data[0].description,
      telegramLink: data[0].telegramLink,
    });
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
      <CreateHouseModal
        onRequestClose={() => setIsCreateModalOpen(false)}
      />
    )}
    {isEditModalOpen && (
      <EditHouseModal
        initialValue={selectedData}
        onRequestClose={() => setIsEditModalOpen(false)}
      />
    )}
    {
      !isLoading && (
        <DataPage
          title="Casas"
          isLoading={isLoading}
          buttons={<button
            className="bg-black text-white py-3 px-6"
            type="button"
            onClick={() => setIsCreateModalOpen(true)}
          >
            Criar
          </button>}
          table={<HousesTable
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

export default RequireAuth(Houses);
