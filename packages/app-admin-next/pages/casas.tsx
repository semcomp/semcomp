import { useEffect, useState } from 'react';

import Sidebar from '../components/layout/Sidebar';
import Spinner from '../components/reusable/Spinner';
import DataTable from '../components/reusable/DataTable';
import RequireAuth from '../libs/RequireAuth';
import SemcompApi from '../api/semcomp-api';
import { useAppContext } from '../libs/contextLib';
import { SemcompApiHouse } from '../models/SemcompApiModels';

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
  onRowSelect,
}: {
  houses: SemcompApiHouse[],
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
        title="Casas"
        data={data}
        onRowClick={(index: number) => console.log(index)}
        onRowSelect={onRowSelect}
      ></DataTable>
    </div>
  );
}

function Houses() {
  const {semcompApi}: {semcompApi: SemcompApi} = useAppContext();

  const [data, setData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedIndexes, setSelectedIndexes] = useState([]);

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
      <main className="flex justify-center items-center w-full h-full p-4 py-16">
        {isLoading ? <Spinner /> : <HousesTable
          houses={data}
          onRowSelect={handleSelectedIndexesChange}
        />}
      </main>
    </div>
  );
}

export default RequireAuth(Houses);
