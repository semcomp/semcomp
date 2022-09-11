import { useEffect, useState } from 'react';

import Sidebar from '../components/layout/Sidebar';
import Spinner from '../components/reusable/Spinner';
import DataTable from '../components/reusable/DataTable';
import RequireAuth from '../libs/RequireAuth';
import SemcompApi from '../api/semcomp-api';
import { useAppContext } from '../libs/contextLib';
import { SemcompApiGetHousesResponse, SemcompApiHouse } from '../models/SemcompApiModels';
import CreateHouseModal from '../components/houses/CreateHouseModal';
import { Toolbar } from '@mui/material';
import EditHouseModal from '../components/houses/EditHouseModal';
import { HouseFormData } from '../components/houses/HouseForm';

type HouseData = {
  "ID": string,
  "Nome": string,
  "Descrição": string,
  "Link do Telegram": string,
  "Pontuação": number,
  "Criado em": string,
}

function HousesTable({
  houses,
  onRowClick,
  onRowSelect,
}: {
  houses: SemcompApiHouse[],
  onRowClick: (selectedIndex: number) => void,
  onRowSelect: (selectedIndexes: number[]) => void,
}) {
  const data: HouseData[] = [];
  for (const house of houses) {
    data.push({
      "ID": house.id,
      "Nome": house.name,
      "Descrição": house.description,
      "Link do Telegram": house.telegramLink,
      "Pontuação": house.score,
      "Criado em": new Date(house.createdAt).toISOString(),
    })
  }

  return (
    <div>
      <DataTable
        data={data}
        onRowClick={onRowClick}
        onRowSelect={onRowSelect}
      ></DataTable>
    </div>
  );
}

function Houses() {
  const {semcompApi}: {semcompApi: SemcompApi} = useAppContext();

  const [data, setData] = useState(null as SemcompApiGetHousesResponse);
  const [selectedData, setSelectedData] = useState(null as HouseFormData);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedIndexes, setSelectedIndexes] = useState([]);

  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);

  async function fetchData() {
    try {
      const response = await semcompApi.getHouses();
      setData(response);
    } catch (error) {
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  }

  async function handleRowClick(index: number) {
    console.log(index);
    setSelectedData({
      name: data[0].name,
      description: data[0].description,
      telegramLink: data[0].telegramLink,
    });
    setIsEditModalOpen(true);
  }

  async function handleSelectedIndexesChange(updatedSelectedIndexes: number[]) {
    setSelectedIndexes(updatedSelectedIndexes);
    console.log(updatedSelectedIndexes);
  }

  useEffect(() => {
    fetchData();
  }, []);

  return (
    <div className="min-h-full w-full flex">
      <Sidebar />
      <main className="flex flex-col justify-center items-center w-full h-full p-4 py-16">
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
        <div className='w-full flex justify-between'>
          <Toolbar>
            <h1 className='text-xl'>Casas</h1>
          </Toolbar>
          <button className="bg-black text-white py-3 px-6" type="button" onClick={() => setIsCreateModalOpen(true)}>
            Criar
          </button>
        </div>
        {isLoading ? <Spinner /> : <HousesTable
          houses={data}
          onRowClick={handleRowClick}
          onRowSelect={handleSelectedIndexesChange}
        />}
      </main>
    </div>
  );
}

export default RequireAuth(Houses);
