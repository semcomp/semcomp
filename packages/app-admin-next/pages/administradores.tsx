import { useEffect, useState } from 'react';

import DataTable from '../components/reusable/DataTable';
import RequireAuth from '../libs/RequireAuth';
import SemcompApi from '../api/semcomp-api';
import { useAppContext } from '../libs/contextLib';
import { SemcompApiAdminUser } from '../models/SemcompApiModels';
import AdminRoles from '../libs/constants/admin-roles';
import EditAdminRoleModal from '../components/adminList/EditAdminRoleModal';
import DataPage from '../components/DataPage';
import { PaginationRequest, PaginationResponse } from '../models/Pagination';
import util from '../libs/util';

type AdminData = {
  "ID": string,
  "Email": string,
  "Permissões": string,
  "Criado em": string,
  "Atualizado em": string,
}

function AdminUsersTable({
  data,
  pagination,
  onRowClick,
  onRowSelect,
  actions,
}: {
  data: PaginationResponse<SemcompApiAdminUser>,
  pagination: PaginationRequest,
  onRowClick: (selectedIndex: number) => void,
  onRowSelect: (selectedIndexes: number[]) => void,
  actions: {},
}) {
  const newData: AdminData[] = [];
  for (const admin of data.getEntities()) {
    newData.push({
      "ID": admin.id,
      "Email": admin.email,
      "Permissões": admin.adminRole.map(role => AdminRoles[role.toUpperCase()]).join(', '),
      "Criado em": util.formatDate(admin.createdAt),
      "Atualizado em": util.formatDate(admin.updatedAt),

    })
  }

  return (<DataTable
    data={new PaginationResponse<AdminData>(newData, data.getTotalNumberOfItems())}
    pagination={pagination}
    onRowClick={onRowClick}
    onRowSelect={onRowSelect}
    actions={actions}
  ></DataTable>);
}

function AdminUsers() {
  const {semcompApi}: {semcompApi: SemcompApi} = useAppContext();

  const [data, setData] = useState(null);
  const [pagination, setPagination] = useState(new PaginationRequest(() => fetchData()));
  const [formData, setFormData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedIndexes, setSelectedIndexes] = useState([]);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  let isMounted = true;

  async function fetchData() {
    try {
      setIsLoading(true);
      const response = await semcompApi.getAdminUsers(pagination);
      if (!isMounted) return;
      
      setData(response);
    } catch (error) {
      console.error(error);
    }
  }
  
  async function handleRowClick(index: number) {  
    const admins = data.getEntities(); 

    const nameRoles = admins[index].adminRole;
    const roles = {};
    for(let key of Object.keys(AdminRoles)) {
      if(nameRoles.includes(key)) {
        roles[key] = true;
      } else {
        roles[key] = false;
      }
    }

    setFormData({
      id: admins[index].id,
      email: admins[index].email,
      adminRole: roles,
    });
    setIsEditModalOpen(true);
  }

  async function handleSelectedIndexesChange(updatedSelectedIndexes: number[]) {
    setSelectedIndexes(updatedSelectedIndexes);
  }

  function handleCloseEditModal() {
    setIsEditModalOpen(false);
    fetchData();
  }

  function refresh() {
    fetchData();
  }

  async function deleteAdmin(row) {
    const confirmed = window.confirm("Tem certeza de que deseja excluir " + row.Email + "?");
      if (confirmed) {
        const deleted = await semcompApi.deleteAdminUser(row.ID);
        refresh();
      }
  }

  useEffect(() => {
    if (isMounted) {
      fetchData();
    }

    return () => {
      isMounted = false;
    }
  }, []);

  useEffect(() => {
    if(data != null){
      setIsLoading(false);
    }
  }, [data]);

  return (<>
    {isEditModalOpen && (
      <EditAdminRoleModal
        data={formData}
        setData={setFormData}
        onRequestClose={handleCloseEditModal}
      />
    )}
    {
      !isLoading && (
        <DataPage
          title="Usuários Admins"
          isLoading={isLoading}
          table={<AdminUsersTable
            data={data}
            pagination={pagination}
            onRowClick={handleRowClick}
            onRowSelect={handleSelectedIndexesChange}
            actions={{"delete": deleteAdmin}}
          />}
        ></DataPage>
      )
    }
  </>);
}

export default RequireAuth(AdminUsers, "ADMINUSERS");
