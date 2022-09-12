import { useEffect, useState } from 'react';

import DataTable from '../components/reusable/DataTable';
import RequireAuth from '../libs/RequireAuth';
import SemcompApi from '../api/semcomp-api';
import { useAppContext } from '../libs/contextLib';
import { SemcompApiTShirt } from '../models/SemcompApiModels';
import CreateTShirtModal from '../components/t-shirt/CreateTShirtModal';
import EditTShirtModal from '../components/t-shirt/EditTShirtModal';
import { TShirtFormData, TShirtSize } from '../components/t-shirt/TShirtForm';
import DataPage from '../components/DataPage';

type TShirtData = {
  "ID": string,
  "Tamanho": string,
  "Quantidade": number,
  "Quantidade Utilizada": number,
  "Criado em": string,
}

function TShirtsTable({
  tShirts,
  onRowClick,
  onRowSelect,
}: {
  tShirts: SemcompApiTShirt[],
  onRowClick: (selectedIndex: number) => void,
  onRowSelect: (selectedIndexes: number[]) => void,
}) {
  const data: TShirtData[] = [];
  for (const tShirt of tShirts) {
    data.push({
      "ID": tShirt.id,
      "Tamanho": tShirt.size,
      "Quantidade": tShirt.quantity,
      "Quantidade Utilizada": tShirt.usedQuantity,
      "Criado em": new Date(tShirt.createdAt).toISOString(),
    })
  }

  return (<DataTable
    data={data}
    onRowClick={onRowClick}
    onRowSelect={onRowSelect}
  ></DataTable>);
}

function TShirts() {
  const {semcompApi}: {semcompApi: SemcompApi} = useAppContext();

  const [data, setData] = useState(null);
  const [formData, setFormData] = useState({
    id: null,
    size: TShirtSize.PP,
    quantity: 0,
  } as TShirtFormData);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedIndexes, setSelectedIndexes] = useState([]);

  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);

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

  async function handleRowClick(index: number) {
    setFormData({
      id: data[index].id,
      size: data[index].size,
      quantity: data[index].quantity,
    });
    setIsEditModalOpen(true);
  }

  async function handleSelectedIndexesChange(updatedSelectedIndexes: number[]) {
    setSelectedIndexes(updatedSelectedIndexes);
    console.log(updatedSelectedIndexes);
  }

  function handleCloseCreateModal() {
    setIsCreateModalOpen(false);
    fetchData();
  }

  function handleCloseEditModal() {
    setIsEditModalOpen(false);
    fetchData();
  }

  useEffect(() => {
    fetchData();
  }, []);

  return (<>
    {isCreateModalOpen && (
      <CreateTShirtModal
        data={formData}
        setData={setFormData}
        onRequestClose={handleCloseCreateModal}
      />
    )}
    {isEditModalOpen && (
      <EditTShirtModal
        data={formData}
        setData={setFormData}
        onRequestClose={handleCloseEditModal}
      />
    )}
    <DataPage
      title="Camisetas"
      isLoading={isLoading}
      buttons={<button
        className="bg-black text-white py-3 px-6"
        type="button"
        onClick={() => setIsCreateModalOpen(true)}
      >Criar</button>}
      table={<TShirtsTable
        tShirts={data}
        onRowClick={handleRowClick}
        onRowSelect={handleSelectedIndexesChange}
      />}
    ></DataPage>
  </>);
}

export default RequireAuth(TShirts);
