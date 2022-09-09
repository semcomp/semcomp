import { useEffect, useState } from 'react';

import Sidebar from '../components/layout/Sidebar';
import Spinner from '../components/reusable/Spinner';
import RenderDate from '../components/reusable/RenderDate';
import DataTable from '../components/reusable/DataTable';
import RequireAuth from '../libs/RequireAuth';
import SemcompApi from '../api/semcomp-api';
import { useAppContext } from '../libs/contextLib';
import { SemcompApiUser } from '../models/SemcompApiModels';

const columns = (users) => [
  {name: 'name', label: 'Nome', options: {filter: false, sort: true}},
  {name: 'nusp', label: 'N° USP', options: {filter: false, sort: true, display: false}},
  {name: 'email', label: 'Email', options: {filter: false, sort: true}},
  {name: 'discord', label: 'Discord', options: {filter: false, sort: false}},
  {name: 'permission', label: 'Permissão', options: {filter: true, sort: false, display: false}},
  {name: 'house', label: 'Casa', options: {filter: true, sort: false}},
  {name: 'course', label: 'Curso', options: {filter: true, sort: false, display: false}},
  {name: 'hasPaid', label: 'Pago', options: {filter: true, sort: true, display: true}},
  {name: 'userTelegram', label: 'Telegram', options: {filter: true, sort: false, display: false}},
  {name: 'paid', label: 'Pagou Coffee', options: {filter: true, sort: false, display: false}},
  {
    name: 'createdAt',
    label: 'Criação',
    options: {
      filter: false,
      sort: true,
      customBodyRenderLite: (dataIndex) => <RenderDate date={users[dataIndex].createdAt} />,
    },
  },
];

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

function UsersTable({ users }: { users: SemcompApiUser[] }) {
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
        rowSelectActionName="Deletar"
        onRowSelectAction={() => {}}
      ></DataTable>
    </div>
  );
}

function Users() {
  const {semcompApi}: {semcompApi: SemcompApi} = useAppContext();

  const [data, setData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  // const [clickedData, setClickedData] = useState(null);

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

  useEffect(() => {
    fetchData();
  }, []);

  return (
    <div className="min-h-full w-full flex">
      <Sidebar />
      <main className="flex justify-center items-center w-full h-full p-4 py-16">
        {isLoading ? <Spinner /> : <UsersTable users={data} />}
      </main>
    </div>
  );
}

export default RequireAuth(Users);
