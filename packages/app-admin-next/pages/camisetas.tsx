import { useEffect, useState } from 'react';

import DataTable from '../components/reusable/DataTable';
import RequireRootAuth from '../libs/RequireAuth';
import SemcompApi from '../api/semcomp-api';
import { useAppContext } from '../libs/contextLib';
import { SemcompApiTShirt } from '../models/SemcompApiModels';
import CreateTShirtModal from '../components/t-shirt/CreateTShirtModal';
import EditTShirtModal from '../components/t-shirt/EditTShirtModal';
import { TShirtFormData, TShirtSize } from '../components/t-shirt/TShirtForm';
import DataPage from '../components/DataPage';
import { PaginationRequest, PaginationResponse } from '../models/Pagination';

type TShirtData = {
  "ID": string,
  "Tamanho": string,
  "Quantidade": number,
  "Quantidade Utilizada": number,
  "Criado em": string,
}

function TShirtsTable({
  data,
  pagination,
  onRowClick,
  onRowSelect,
}: {
  data: PaginationResponse<SemcompApiTShirt>,
  pagination: PaginationRequest,
  onRowClick: (selectedIndex: number) => void,
  onRowSelect: (selectedIndexes: number[]) => void,
}) {
  const newData: TShirtData[] = [];
  console.log('data: ', data);
  for (const tShirt of data.getEntities()) {
    newData.push({
      "ID": tShirt.id,
      "Tamanho": tShirt.size,
      "Quantidade": tShirt.quantity,
      "Quantidade Utilizada": tShirt.usedQuantity,
      "Criado em": new Date(tShirt.createdAt).toISOString(),
    })
  }

  return (<DataTable
    data={new PaginationResponse<TShirtData>(newData, data.getTotalNumberOfItems())}
    pagination={pagination}
    onRowClick={onRowClick}
    onRowSelect={onRowSelect}
  ></DataTable>);
}

function TShirts() {
  const {semcompApi}: {semcompApi: SemcompApi} = useAppContext();

  const [data, setData] = useState(null);
  const [pagination, setPagination] = useState(new PaginationRequest(() => fetchData()));
  const [formData, setFormData] = useState({
    id: null,
    size: TShirtSize.M,
    quantity: 0,
  } as TShirtFormData);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedIndexes, setSelectedIndexes] = useState([]);

  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);

  async function fetchData() {
    try {
      setIsLoading(true);
      const response = await semcompApi.getTShirts(pagination);
      setData(response);
    } catch (error) {
      console.error(error);
    }
  }

  async function handleRowClick(index: number) {
    
    const tshirts = data.getEntities(); 

    setFormData({
      id: tshirts[index].id,
      size: tshirts[index].size,
      quantity: tshirts[index].quantity,
    });
    setIsEditModalOpen(true);
  }

  async function handleSelectedIndexesChange(updatedSelectedIndexes: number[]) {
    setSelectedIndexes(updatedSelectedIndexes);
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

  useEffect(() => {
    if(data != null){
      setIsLoading(false);
    }
  }, [data]);

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
    {
      !isLoading && (
        <DataPage
          title="Camisetas"
          isLoading={isLoading}
          buttons={<button
            className="bg-black text-white py-3 px-6"
            type="button"
            onClick={() => setIsCreateModalOpen(true)}
          >Criar</button>}
          table={<TShirtsTable
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

export default RequireRootAuth(TShirts, "CAMISETAS");
