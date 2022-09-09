import { useEffect, useState } from 'react';

import Sidebar from '../components/layout/Sidebar';
import Spinner from '../components/reusable/Spinner';
import RenderDate from '../components/reusable/RenderDate';
import DataTable from '../components/reusable/DataTable';
import RequireAuth from '../libs/RequireAuth';
import SemcompApi from '../api/semcomp-api';
import { useAppContext } from '../libs/contextLib';
import { SemcompApiUser } from '../models/SemcompApiModels';

type UserData = {
  "ID": string,
  "E-mail": string,
  "Nome": string,
  "Curso": string,
  "Telegram": string,
  "Casa": string,
  "Pagou?": string,
  "Permite divulgação?": string,
  "Criado em": string,
}

function UsersTable({
  users,
  onRowSelect,
}: {
  users: SemcompApiUser[],
  onRowSelect: (selectedIndexes: number[]) => void,
}) {
  const data: UserData[] = [];
  for (const user of users) {
    data.push({
      "ID": user.id,
      "E-mail": user.email,
      "Nome": user.name,
      "Curso": user.course,
      "Telegram": user.telegram,
      "Casa": user.house.name,
      "Pagou?": user.paid ? "Sim" : "Não",
      "Permite divulgação?": user.permission ? "Sim" : "Não",
      "Criado em": new Date(user.createdAt).toISOString(),
    })
  }

  return (
    <div>
      <DataTable
        title="Usuários"
        data={data}
        onRowClick={(index: number) => console.log(index)}
        onRowSelect={onRowSelect}
      ></DataTable>
    </div>
  );
}

function Users() {
  const {semcompApi}: {semcompApi: SemcompApi} = useAppContext();

  const [data, setData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedIndexes, setSelectedIndexes] = useState([]);

  async function fetchData() {
    try {
      const response = await semcompApi.getUsers();
      setData(response.users);
      console.log(response.users);
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
        {isLoading ? <Spinner /> : <UsersTable
          users={data}
          onRowSelect={handleSelectedIndexesChange}
        />}
      </main>
    </div>
  );
}

export default RequireAuth(Users);
