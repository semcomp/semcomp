import { useEffect, useState } from 'react';

import Sidebar from '../components/layout/Sidebar';
import Spinner from '../components/reusable/Spinner';
import DataTable from '../components/reusable/DataTable';
import RequireAuth from '../libs/RequireAuth';
import SemcompApi from '../api/semcomp-api';
import { useAppContext } from '../libs/contextLib';
import { SemcompApiTShirt } from '../models/SemcompApiModels';

type TShirtData = {
  "ID": string,
  "Tamanho": string,
  "Quantidade": number,
  "Criado em": string,
}

function TShirtsTable({
  tShirts,
  onRowSelect,
}: {
  tShirts: SemcompApiTShirt[],
  onRowSelect: (selectedIndexes: number[]) => void,
}) {
  const data: TShirtData[] = [];
  for (const tShirt of tShirts) {
    data.push({
      "ID": tShirt.id,
      "Tamanho": tShirt.size,
      "Quantidade": tShirt.quantity,
      "Criado em": new Date(tShirt.createdAt).toISOString(),
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

function TShirts() {
  const {semcompApi}: {semcompApi: SemcompApi} = useAppContext();

  const [data, setData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedIndexes, setSelectedIndexes] = useState([]);

  async function fetchData() {
    try {
      const response = await semcompApi.getTShirts();
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
        {isLoading ? <Spinner /> : <TShirtsTable
          tShirts={data}
          onRowSelect={handleSelectedIndexesChange}
        />}
      </main>
    </div>
  );
}

export default RequireAuth(TShirts);
