import React from 'react';

import MUIDataTable from 'mui-datatables';
// import {toast} from 'react-toastify';
// import {withStyles} from '@material-ui/core/styles';
// import Button from '@material-ui/core/Button';
// import TextField from '@material-ui/core/TextField';
// import MenuItem from '@material-ui/core/MenuItem';

import API from '../../api';
import Sidebar from '../../components/layout/sidebar';
import Spinner from '../../components/reusable/spinner';
import useFecthData from '../../libs/hooks/fetch-data';
import useFormDeleteData from '../../libs/hooks/delete-confirmation-modal';
import UpdateUserModal from './update-user-modal';
import RenderDate from '../../components/reusable/render-date';
import TableExpandedRow from '../../components/layout/table-expanded-row';
import VerticalTableRow from '../../components/layout/vertical-table-row';

/** Tailwind styles. */
const styles = {
  root: 'min-h-full w-full flex',
  main: 'flex flex-col justify-center items-center w-full h-full p-4',
  title: 'text-4xl pb-4 text-center',
  paragraph: 'max-w-xl text-center',
};

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

/**
 * @return {object}
 */
function Users() {
  const {
    isFetching: isFetchingUsers,
    data: fetchResponse,
    setData: setFetchResponse,
  } = useFecthData(API.getAllUsers);

  const users = fetchResponse && fetchResponse.users.map((user) => {
    return {...user, house: user.house?.name, hasPaid: user.paid ? 'Sim' : 'Não'};
  });

  const setUsers = (newUsers) => setFetchResponse({users: newUsers});

  const {
    deleteConfirmationModalElement,
    handleTableDeleteEvent,
  } = useFormDeleteData({
    data: users,
    setData: setUsers,
    idExtractor: (user) => user.id,
    nameExtractor: (user) => user.email,
    deleteDataFunction: API.deleteUser,
  });

  const [updatingUser, setUpdatingUser] = React.useState();
  // const [isLoading, setIsLoading] = React.useState(null);
  // const [achievements, setAchievements] = React.useState([]);

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

  // React.useEffect(() => {
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

  /**
   * @return {object}
   */
  function displayUpdatingModal() {
    if (!updatingUser) return null;

    /**
     * @param {object} newUser
     */
    function updateUserData(newUser) {
      const newUsers = users.map((user) => {
        if (user.id === updatingUser.id) return newUser;
        else return user;
      });
      setUsers(newUsers);
      setUpdatingUser(false);
    }

    return (
      <UpdateUserModal
        onRequestClose={() => setUpdatingUser(false)}
        onSuccess={updateUserData}
        user={updatingUser}
      />
    );
  }

  /**
   * @return {object}
   */
  function displayUsersTable() {
    if (isFetchingUsers) return <Spinner />;
    else {
      return (
        <MUIDataTable
          columns={columns(users)}
          title='Usuários'
          data={users}
          options={{
            rowsPerPage: 10,
            onRowsDelete: handleTableDeleteEvent,
            onRowClick: (_, {dataIndex}) => setUpdatingUser(users[dataIndex]),
            expandableRows: true,
            renderExpandableRow: (_, {dataIndex}) => {
              const user = users[dataIndex];
              return <TableExpandedRow>
                {/* <VerticalTableRow name='Adicionar Conquista' value={<>
                  <form className="flex flex-col" onSubmit={(e) => handleSubmit(e, users[dataIndex])}>
                    <Input
                      label="Conquista"
                      name="achievementId"
                      select
                    >
                      { achievements.map((achievement, index) => {
                        return achievement.type === 'Individual' ? (<MenuItem key={index} value={achievement.id}>{achievement.title}</MenuItem>) : null;
                      }) }
                    </Input>
                    <Button variant="contained" type="submit">
                      Adicionar
                      { isLoading && <Spinner /> }
                    </Button>
                  </form>
                </>} /> */}
                {
                  user.disabilities && (
                    <VerticalTableRow name='PCD' value={<>
                      {user.disabilities.map((disability, index) => (
                        <div key={index}>
                          <p>{disability}</p>
                        </div>
                      ))}
                    </>} />
                  )
                }
                {/* {
                  user.achievements && (
                    <VerticalTableRow name='Conquistas' value={<>
                      {user.achievements.map((achievement, index) => (
                        <div key={index}>
                          <p>{achievement.title}</p>
                        </div>
                      ))}
                    </>} />
                  )
                } */}
              </TableExpandedRow>;
            },
          }}
        />
      );
    }
  }

  return (
    <div className={styles.root}>
      { deleteConfirmationModalElement }
      { displayUpdatingModal() }
      <Sidebar />
      <main className={styles.main}>
        { displayUsersTable() }
      </main>
    </div>
  );
}

export default Users;
