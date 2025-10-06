import { useEffect, useState } from 'react';

import DataTable from '../components/reusable/DataTable';
import RequireAuth from '../libs/RequireAuth';
import SemcompApi from '../api/semcomp-api';
import { useAppContext } from '../libs/contextLib';
import { SemcompApiDonation, SemcompApiGetDonationsResponse } from '../models/SemcompApiModels';
import CreateDonationModal from '../components/donations/CreateDonationModal';
// import EditItemModal from '../components/items/EditItemModal';
import DataPage from '../components/DataPage';
import { DonationFormData } from '../components/donations/DonationForm';
import { PaginationRequest, PaginationResponse } from '../models/Pagination';
import Item from '../libs/constants/item-type';
import util from '../libs/util';

type DonationData = {
    "ID": string,
    "HouseId": string,
    "Item": Item,
    "Quantidade": number,
    "Pontos": number,
};

function mapData(data: SemcompApiDonation[]): DonationData[] {
  const newData: DonationData[] = [];
  for (const donation of data) {
    newData.push({
      "ID": donation.id,
      "HouseId": donation.houseId,
      "Item": donation.item,
      "Quantidade": donation.quantity,
      "Pontos": donation.points,
    })
  }

  return newData;
}

function DonationsTable({
  data,
  pagination,
  onRowClick,
  onRowSelect,
}: {
  data: PaginationResponse<SemcompApiDonation>,
  pagination: PaginationRequest,
  onRowClick: (selectedIndex: number) => void,
  onRowSelect: (selectedIndexes: number[]) => void,
}) {
  return (<DataTable
    data={new PaginationResponse<DonationData>(mapData(data.getEntities()), data.getTotalNumberOfItems())}
    pagination={pagination}
    onRowClick={onRowClick}
    onRowSelect={onRowSelect}
  ></DataTable>);
}

function Donations() {
  const {semcompApi}: {semcompApi: SemcompApi} = useAppContext();

  const [data, setData] = useState(null as SemcompApiGetDonationsResponse);
  const [pagination, setPagination] = useState(new PaginationRequest(() => fetchData()));
  const [selectedData, setSelectedData] = useState(null as DonationFormData);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedIndexes, setSelectedIndexes] = useState([]);

  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);

  async function fetchData() {
    try {
      setIsLoading(true);
      const response = await semcompApi.getDonations(pagination);
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
      <CreateDonationModal
        onRequestClose={() => setIsCreateModalOpen(false)}
      />
    )}
    {/* {isEditModalOpen && (
      <EditItemModal
        initialValue={selectedData}
        onRequestClose={() => {
          fetchData();
          setIsEditModalOpen(false);
        }}
      />
    )} */}
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
          table={<DonationsTable
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

export default RequireAuth(Donations, "GAMEQUESTIONS");
