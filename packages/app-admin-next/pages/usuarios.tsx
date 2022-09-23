import { useEffect, useState } from 'react';

import DataTable from '../components/reusable/DataTable';
import RequireAuth from '../libs/RequireAuth';
import SemcompApi from '../api/semcomp-api';
import { useAppContext } from '../libs/contextLib';
import { PaymentStatus, SemcompApiUser } from '../models/SemcompApiModels';
import DataPage from '../components/DataPage';
import { TShirtSize } from '../components/t-shirt/TShirtForm';
import { PaginationRequest, PaginationResponse } from '../models/Pagination';

type UserData = {
  "ID": string,
  "E-mail": string,
  "Nome": string,
  "Curso": string,
  "Telegram": string,
  "Casa": string,
  "Status do pagamento": string,
  "Tamanho da camiseta": TShirtSize,
  "Permite divulgação?": string,
  "Criado em": string,
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
  const newData: UserData[] = [];
  for (const user of data.getEntities()) {
    let paymentStatus = "";
    if (user.payment.status) {
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
      "Permite divulgação?": user.permission ? "Sim" : "Não",
      "Criado em": new Date(user.createdAt).toISOString(),
    })
  }

  return (<DataTable
    data={new PaginationResponse<UserData>(newData, data.getTotalNumberOfItems())}
    pagination={pagination}
    onRowClick={(index: number) => console.log(index)}
    onRowSelect={onRowSelect}
  ></DataTable>);
}

function Users() {
  const {semcompApi}: {semcompApi: SemcompApi} = useAppContext();

  const [data, setData] = useState(null as PaginationResponse<SemcompApiUser>);
  const [pagination, setPagination] = useState(new PaginationRequest(() => fetchData()));
  const [isLoading, setIsLoading] = useState(true);
  const [selectedIndexes, setSelectedIndexes] = useState([]);

  async function fetchData() {
    try {
      setIsLoading(true);
      const response = await semcompApi.getUsers(pagination);
      setData(response);
    } catch (error) {
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    fetchData();
  }, []);

  async function handleSelectedIndexesChange(updatedSelectedIndexes: number[]) {
    setSelectedIndexes(updatedSelectedIndexes);
  }

  return (<>
    {
      !isLoading && (
        <DataPage
          title="Usuários"
          isLoading={isLoading}
          table={<UsersTable
            data={data}
            pagination={pagination}
            onRowSelect={handleSelectedIndexesChange}
          />}
        ></DataPage>
      )
    }
  </>);
}

export default RequireAuth(Users);
