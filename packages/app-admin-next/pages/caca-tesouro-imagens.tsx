import { useEffect, useState } from 'react';

import DataTable from '../components/reusable/DataTable';
import RequireAuth from '../libs/RequireAuth';
import SemcompApi from '../api/semcomp-api';
import { useAppContext } from '../libs/contextLib';
import { SemcompApiTreasureHuntImage, SemcompApiGetTreasureHuntImageResponse } from '../models/SemcompApiModels';
import CreateTreasureHuntImageModal from '../components/treasure-hunt-images/CreateTreasureHuntImageModal';
import EditTreasureHuntImageModal from '../components/treasure-hunt-images/EditTreasureHuntImageModal';
import DataPage from '../components/DataPage';
import { TreasureHuntImageFormData } from '../components/treasure-hunt-images/TreasureHuntImageForm';
import { PaginationRequest, PaginationResponse } from '../models/Pagination';
import Status from '../libs/constants/status-treasure-hunt-enum';

type TreasureHuntData = {
  "ID": string,
  "Local": string,
  "Status": Status,
  "Imagem": string,
  "Criado em": string,
};

function mapData(data: SemcompApiTreasureHuntImage[]): TreasureHuntData[] {
  const newData: TreasureHuntData[] = [];
  for (const treasureHunt of data) {
    newData.push({
      "ID": treasureHunt.id,
      "Local": treasureHunt.place,
      "Status": treasureHunt.status,
      "Imagem": treasureHunt.imgUrl,
      "Criado em": new Date(treasureHunt.createdAt).toISOString(),
    })
  }

  return newData;
}

function TreasureHuntImagesTable({
  data,
  pagination,
  onRowClick,
  onRowSelect,
}: {
  data: PaginationResponse<SemcompApiTreasureHuntImage>,
  pagination: PaginationRequest,
  onRowClick: (selectedIndex: number) => void,
  onRowSelect: (selectedIndexes: number[]) => void,
}) {
  return (<DataTable
    data={new PaginationResponse<TreasureHuntData>(mapData(data.getEntities()), data.getTotalNumberOfItems())}
    pagination={pagination}
    onRowClick={onRowClick}
    onRowSelect={onRowSelect}
  ></DataTable>);
}

function TreasureHuntImages() {
  const {semcompApi}: {semcompApi: SemcompApi} = useAppContext();

  const [data, setData] = useState(null as SemcompApiGetTreasureHuntImageResponse);
  const [pagination, setPagination] = useState(new PaginationRequest(() => fetchData()));
  const [selectedData, setSelectedData] = useState(null as TreasureHuntImageFormData);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedIndexes, setSelectedIndexes] = useState([]);

  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);

  async function fetchData() {
    try {
      setIsLoading(true);
      const response = await semcompApi.getTreasureHuntImages(pagination);
      setData(response);
    } catch (error) {
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  }

  async function handleRowClick(index: number) {
    console.log(data.getEntities());
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
      <CreateTreasureHuntImageModal
        onRequestClose={() => setIsCreateModalOpen(false)}
      />
    )}
    {isEditModalOpen && (
      <EditTreasureHuntImageModal
        initialValue={selectedData}
        onRequestClose={() => {
          fetchData();
          setIsEditModalOpen(false);
        }}
      />
    )}
    {
      !isLoading && (
        <DataPage
          title="Caça ao Tesouro - Imagens"
          isLoading={isLoading}
          buttons={<button
            className="bg-black text-white py-3 px-6"
            type="button"
            onClick={() => setIsCreateModalOpen(true)}
          >
            Criar
          </button>}
          table={<TreasureHuntImagesTable
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

export default RequireAuth(TreasureHuntImages, "TREASUREHUNTIMAGES");
