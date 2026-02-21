import React from 'react';

import MUIDataTable from 'mui-datatables';

import API from '../../api';
import Sidebar from '../../components/layout/sidebar';
import Spinner from '../../components/reusable/spinner';
import useFecthData from '../../libs/hooks/fetch-data';
import useFormDeleteData from '../../libs/hooks/delete-confirmation-modal';
import UpdateUserModal from './update-admin-modal';
import CreateUserModal from './create-admin-modal';
import NewButton from '../../components/reusable/new-button';
import RenderDate from '../../components/reusable/render-date';

/** Tailwind styles. */
const styles = {
  root: 'min-h-full w-full flex',
  main: 'flex flex-col justify-center items-center w-full h-full p-4',
  title: 'text-4xl pb-4 text-center',
  paragraph: 'max-w-xl text-center',
};

const columns = (users) => [
  {name: 'email', label: 'Email', options: {filter: false, sort: true}},
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
function Admins() {
  const {
    isFetching: isFetchingUsers,
    data: fetchResponse,
    setData: setFetchResponse,
  } = useFecthData(API.getAllAdmins);

  const adminUsers = fetchResponse && fetchResponse.adminUsers;

  const setAdmins = (newUsers) => setFetchResponse({adminUsers: newUsers});

  const {
    deleteConfirmationModalElement,
    handleTableDeleteEvent,
  } = useFormDeleteData({
    data: adminUsers,
    setData: setAdmins,
    idExtractor: (user) => user.id,
    nameExtractor: (user) => user.email,
    deleteDataFunction: API.deleteAdmin,
  });

  const [isCreating, setIsCreating] = React.useState();
  const [updatingUser, setUpdatingUser] = React.useState();

  /**
   * @return {object}
   */
  function displayCreatingModal() {
    if (!isCreating) return null;

    /**
     * @param {object} newUser
     */
    function createUserData(newUser) {
      console.log(newUser);
      setAdmins([...adminUsers, newUser]);
      setIsCreating(false);
    }

    return (
      <CreateUserModal
        onRequestClose={() => setIsCreating(false)}
        onSuccess={createUserData}
      />
    );
  }

  /**
   * @return {object}
   */
  function displayUpdatingModal() {
    if (!updatingUser) return null;

    /**
     * @param {object} newUser
     */
    function updateUserData(newUser) {
      const newUsers = adminUsers.map((user) => {
        if (user.id === updatingUser.id) return newUser;
        else return user;
      });
      setAdmins(newUsers);
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
          columns={columns(adminUsers)}
          title='Administradores'
          data={adminUsers}
          options={{
            rowsPerPage: 10,
            onRowsDelete: handleTableDeleteEvent,
            onRowClick: (_, {dataIndex}) => setUpdatingUser(adminUsers[dataIndex]),
            customToolbar: () => <NewButton onClick={() => setIsCreating(true)} />,
          }}
        />
      );
    }
  }

  return (
    <div className={styles.root}>
      { deleteConfirmationModalElement }
      { displayCreatingModal() }
      { displayUpdatingModal() }
      <Sidebar />
      <main className={styles.main}>
        { displayUsersTable() }
      </main>
    </div>
  );
}

export default Admins;
