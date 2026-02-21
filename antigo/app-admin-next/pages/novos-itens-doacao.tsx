import { useEffect, useState } from 'react';

import DataTable from '../components/reusable/DataTable';
import RequireAuth from '../libs/RequireAuth';
import SemcompApi from '../api/semcomp-api';
import { useAppContext } from '../libs/contextLib';
import { SemcompApiItem, SemcompApiGetItemsResponse } from '../models/SemcompApiModels';
import CreateItemModal from '../components/items/CreateItemModal';
// import EditItemModal from '../components/items/EditItemModal';
import DataPage from '../components/DataPage';
import { ItemFormData } from '../components/items/ItemForm';
import { PaginationRequest, PaginationResponse } from '../models/Pagination';
import Tier from '../libs/constants/tier-enum';
import util from '../libs/util';

type ItemData = {
    "ID": string,
    "Nome": string,
    "Valor": number,
    "Quantidade Máx.": number,
    "Tier": Tier,
    "Quantidade do Tier": number,
    "Quantidade Total": number,
};

function mapData(data: SemcompApiItem[]): ItemData[] {
  const newData: ItemData[] = [];
  for (const item of data) {
    newData.push({
      "ID": item.id,
      "Nome": item.name,
      "Valor": item.value,
      "Quantidade Máx.": item.maxQuantity,
      "Tier": item.tier,
      "Quantidade do Tier": item.tierQuantity,
      "Quantidade Total": item.totalQuantity,
    })
  }

  return newData;
}

function ItemsTable({
  data,
  pagination,
  onRowClick,
  onRowSelect,
  actions
}: {
  data: PaginationResponse<SemcompApiItem>,
  pagination: PaginationRequest,
  onRowClick: (selectedIndex: number) => void,
  onRowSelect: (selectedIndexes: number[]) => void,
  actions: {}
}) {
  return (<DataTable
    data={new PaginationResponse<ItemData>(mapData(data == null ? [] : data.getEntities()), data == null ? 0 : data.getTotalNumberOfItems())}
    pagination={pagination}
    onRowClick={onRowClick}
    onRowSelect={onRowSelect}
    actions={actions}
  ></DataTable>);
}

function Items() {
  const {semcompApi}: {semcompApi: SemcompApi} = useAppContext();

  const [data, setData] = useState(null as SemcompApiGetItemsResponse);
  const [pagination, setPagination] = useState(new PaginationRequest(() => fetchData()));
  const [selectedData, setSelectedData] = useState(null as ItemFormData);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedIndexes, setSelectedIndexes] = useState([]);

  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);

  async function deleteItem(row) {
    const confirmed = window.confirm("Tem certeza de que deseja excluir " + row.Nome + "?");
      if (confirmed) {
        await semcompApi.deleteItems(row.ID)
        fetchData();
      }
  }

  async function fetchData() {
    try {
      setIsLoading(true);
      const response = await semcompApi.getItems(pagination);
      setData(response);
    } catch (error) {
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  }

  async function handleRowClick(index: number) {
    setSelectedData(data.getEntities()[index]);
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
      <CreateItemModal
        onRequestClose={() => setIsCreateModalOpen(false)}
      />
    )}
    {
      !isLoading && (
        <DataPage
          title="Itens doados"
          isLoading={isLoading}
          buttons={<button
            className="bg-black text-white py-3 px-6"
            type="button"
            onClick={() => setIsCreateModalOpen(true)}
          >
            Criar
          </button>}
          table={<ItemsTable
            data={data}
            pagination={pagination}
            onRowClick={handleRowClick}
            onRowSelect={handleSelectedIndexesChange}
            actions={{"delete_item": deleteItem}}
          />}
        ></DataPage>
      )
    }
  </>);
}

export default RequireAuth(Items, "GAMEQUESTIONS");
