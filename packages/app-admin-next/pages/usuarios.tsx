import { useEffect, useState } from 'react';

// import MUIDataTable from 'mui-datatables';
// import {toast} from 'react-toastify';
// import {withStyles} from '@material-ui/core/styles';
// import Button from '@material-ui/core/Button';
// import TextField from '@material-ui/core/TextField';
// import MenuItem from '@material-ui/core/MenuItem';

import Sidebar from '../components/layout/Sidebar';
import Spinner from '../components/reusable/Spinner';
import RenderDate from '../components/reusable/RenderDate';
import DataTable from '../components/reusable/DataTable';
// import TableExpandedRow from '../components/layout/TableExpandedRow';
// import VerticalTableRow from '../components/layout/VerticalTableRow';
import useFecthData from '../libs/hooks/fetch-data';
// import useFormDeleteData from '../libs/hooks/delete-confirmation-modal';
// import UpdateUserModal from '../components/users/UpdateUserModal';
import RequireAuth from '../libs/RequireAuth';
import SemcompApi from '../api/semcomp-api';
import { useAppContext } from '../libs/contextLib';
import { SemcompApiUser } from '../models/SemcompApiModels';

// const styles = {
//   title: 'text-4xl pb-4 text-center',
//   paragraph: 'max-w-xl text-center',
// };

// const Input = withStyles((theme) => ({
//   root: {
//     margin: `${theme.spacing(1)}px 0`,
//   },
// }))(TextField);

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
    // <MUIDataTable
    //   columns={columns(users)}
    //   title='Usuários'
    //   data={users}
    //   options={{
    //     rowsPerPage: 10,
    //     onRowsDelete: handleTableDeleteEvent,
    //     onRowClick: (_, {dataIndex}) => setUpdatingUser(users[dataIndex]),
    //     expandableRows: true,
    //     renderExpandableRow: (_, {dataIndex}) => {
    //       const user = users[dataIndex];
    //       return <TableExpandedRow>
    //         {/* <VerticalTableRow name='Adicionar Conquista' value={<>
    //           <form className="flex flex-col" onSubmit={(e) => handleSubmit(e, users[dataIndex])}>
    //             <Input
    //               label="Conquista"
    //               name="achievementId"
    //               select
    //             >
    //               { achievements.map((achievement, index) => {
    //                 return achievement.type === 'Individual' ? (<MenuItem key={index} value={achievement.id}>{achievement.title}</MenuItem>) : null;
    //               }) }
    //             </Input>
    //             <Button variant="contained" type="submit">
    //               Adicionar
    //               { isLoading && <Spinner /> }
    //             </Button>
    //           </form>
    //         </>} /> */}
    //         {
    //           user.disabilities && (
    //             <VerticalTableRow name='PCD' value={<>
    //               {user.disabilities.map((disability, index) => (
    //                 <div key={index}>
    //                   <p>{disability}</p>
    //                 </div>
    //               ))}
    //             </>} />
    //           )
    //         }
    //         {/* {
    //           user.achievements && (
    //             <VerticalTableRow name='Conquistas' value={<>
    //               {user.achievements.map((achievement, index) => (
    //                 <div key={index}>
    //                   <p>{achievement.title}</p>
    //                 </div>
    //               ))}
    //             </>} />
    //           )
    //         } */}
    //       </TableExpandedRow>;
    //     },
    //   }}
    // />
    <div>
      <DataTable title="Usuários" data={data}></DataTable>
    </div>
  );
}

function Users() {
  const {semcompApi}: {semcompApi: SemcompApi} = useAppContext();

  const [data, setData] = useState(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    async function fetchData() {
      try {
        const response = await semcompApi.getUsers();
        setData(response.users);
      } catch (error) {
        console.error(error);
      } finally {
        setIsLoading(false);
      }
    }

    fetchData();
  }, [])

  // const {
  //   deleteConfirmationModalElement,
  //   handleTableDeleteEvent,
  // } = useFormDeleteData({
  //   data: users,
  //   setData: setUsers,
  //   idExtractor: (user) => user.id,
  //   nameExtractor: (user) => user.email,
  //   deleteDataFunction: API.deleteUser,
  // });

  // const [updatingUser, setUpdatingUser] = useState(null);
  // const [isLoading, setIsLoading] = useState(null);
  // const [achievements, setAchievements] = useState([]);

  // /**
  //  *
  //  * @return {void}
  //  */
  // async function fetchAchievements() {
  //   try {
  //     const response = await API.getAllAchievements();
  //     setAchievements(response.data);
  //   } catch (e) {
  //     console.error(e);
  //     return [];
  //   }
  // }

  // useEffect(() => {
  //   fetchAchievements();
  // }, []);

  // /**
  //  * @param {object} event
  //  * @param {object} user
  //  *
  //  * @return {object}
  //  */
  // async function handleSubmit(event, user) {
  //   event.preventDefault();
  //   if (isLoading) return;

  //   const formElem = event.currentTarget;
  //   const achievementId = formElem['achievementId'].value;

  //   if (!achievementId) return toast.error('Nenhuma conquista selecionada');

  //   setIsLoading(true);
  //   try {
  //     await API.addUserAchievement(user.id, achievementId);
  //     toast.success(`Conquista adicionada`);
  //   } catch (error) {
  //     console.error(error);
  //   } finally {
  //     setIsLoading(false);
  //   }
  // }

  // function displayUpdatingModal() {
  //   if (!updatingUser) return null;

  //   /**
  //    * @param {object} newUser
  //    */
  //   function updateUserData(newUser) {
  //     const newUsers = users.map((user) => {
  //       if (user.id === updatingUser.id) return newUser;
  //       else return user;
  //     });
  //     setUsers(newUsers);
  //     setUpdatingUser(null);
  //   }

  //   return (
  //     <UpdateUserModal
  //       onRequestClose={() => setUpdatingUser(null)}
  //       onSuccess={updateUserData}
  //       user={updatingUser}
  //     />
  //   );
  // }

  return (
    <div className="min-h-full w-full flex">
      {/* { deleteConfirmationModalElement } */}
      {/* { displayUpdatingModal() } */}
      <Sidebar />
      <main className="flex justify-center items-center w-full h-full p-4 py-16">
        {isLoading ? <Spinner /> : <UsersTable users={data} />}
      </main>
    </div>
  );
}

export default RequireAuth(Users);
