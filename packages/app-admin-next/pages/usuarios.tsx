import { useEffect, useState } from 'react';

import DataTable from '../components/reusable/DataTable';
import RequireAuth from '../libs/RequireAuth';
import SemcompApi from '../api/semcomp-api';
import { useAppContext } from '../libs/contextLib';
import { PaymentStatus, SemcompApiUser } from '../models/SemcompApiModels';
import DataPage from '../components/DataPage';
import { TShirtSize } from '../components/t-shirt/TShirtForm';
import { PaginationRequest, PaginationResponse } from '../models/Pagination';
import exportToCsv from '../libs/DownloadCsv';

enum KitOption {
  COMPLETE = "Kit + Coffee", 
  KIT = "Só Kit",
  COFFEE = "Só Coffee",
}

type UserData = {
  "ID": string,
  "E-mail": string,
  "Nome": string,
  "Curso": string,
  "Telegram": string,
  "Casa": string,
  "Status do pagamento": string,
  "Tamanho da camiseta": TShirtSize,
  "Tipo de kit": KitOption
  "Permite divulgação?": string,
  "Criado em": string,
}

function mapData(data: SemcompApiUser[]): UserData[] {
  const newData: UserData[] = [];
  for (const user of data) {
    let paymentStatus = "";
    if (user.payment.status) {
      console.log(user.payment.status);
      paymentStatus = user.payment.status === PaymentStatus.APPROVED ? "Aprovado" : "Pendente";
    }

    newData.push({
      "ID": user.id,
      "E-mail": user.email,
      "Nome": user.name,
      "Curso": user.course,
      "Telegram": user.telegram,
      "Casa": user.house.name,
      "Status do pagamento": paymentStatus,
      "Tamanho da camiseta": user.payment.tShirtSize,
      "Tipo de kit": user.payment.kitOption,
      "Permite divulgação?": user.permission ? "Sim" : "Não",
      "Criado em": new Date(user.createdAt).toISOString(),
    })
  }

  return newData;
}

function UsersTable({
  data,
  pagination,
  onRowSelect,
}: {
  data: PaginationResponse<SemcompApiUser>,
  pagination: PaginationRequest,
  onRowSelect: (selectedIndexes: number[]) => void,
}) {
  return (<>
    <DataTable
      data={new PaginationResponse<UserData>(mapData(data.getEntities()), data.getTotalNumberOfItems())}
      pagination={pagination}
      onRowClick={(index: number) => console.log(index)}
      onRowSelect={onRowSelect}
    ></DataTable>
  </>);
}

function Users() {
  const {semcompApi}: {semcompApi: SemcompApi} = useAppContext();

  const [data, setData] = useState(null as PaginationResponse<SemcompApiUser>);
  const [pagination, setPagination] = useState(new PaginationRequest(() => fetchTableData()));
  const [isLoading, setIsLoading] = useState(true);
  const [selectedIndexes, setSelectedIndexes] = useState([]);

  async function fetchData(pagination: PaginationRequest) {
    return await semcompApi.getUsers(pagination);
  }

  async function fetchTableData() {
    try {
      setIsLoading(true);
      const response = await fetchData(pagination);
      setData(response);
    } catch (error) {
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  }

  async function fetchDownloadData() {
    try {
      setIsLoading(true);
      const response = await semcompApi.getUsers(new PaginationRequest(null, 1, 9999));
      exportToCsv(mapData(response.getEntities()));
    } catch (error) {
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    fetchTableData();
  }, []);

  async function handleSelectedIndexesChange(updatedSelectedIndexes: number[]) {
    setSelectedIndexes(updatedSelectedIndexes);
  }

  return (<>
    {
      !isLoading && (<>
        <DataPage
          title="Usuários"
          isLoading={isLoading}
          table={<UsersTable
            data={data}
            pagination={pagination}
            onRowSelect={handleSelectedIndexesChange}
          />}
        ></DataPage>
        <button
          className="w-full bg-black text-white py-3 px-6"
          type='button'
          onClick={fetchDownloadData}
        >
          Baixar Planilha
        </button>
      </>)
    }
  </>);
}

export default RequireAuth(Users);
