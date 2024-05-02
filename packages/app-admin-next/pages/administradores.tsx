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
}: {
  data: PaginationResponse<SemcompApiAdminUser>,
  pagination: PaginationRequest,
  onRowClick: (selectedIndex: number) => void,
  onRowSelect: (selectedIndexes: number[]) => void,
}) {
  const newData: AdminData[] = [];
  for (const admin of data.getEntities()) {
    newData.push({
      "ID": admin.id,
      "Email": admin.email,
      "Permissões": admin.adminRole.map(role => AdminRoles[role]).join(', '),
      "Criado em": new Date(admin.createdAt).toISOString(),
      "Atualizado em": new Date(admin.updatedAt).toISOString(),
    })
  }

  return (<DataTable
    data={new PaginationResponse<AdminData>(newData, data.getTotalNumberOfItems())}
    pagination={pagination}
    onRowClick={onRowClick}
    onRowSelect={onRowSelect}
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

  async function fetchData() {
    try {
      setIsLoading(true);
      const response = await semcompApi.getAdminUsers(pagination);
      setData(response);
    } catch (error) {
      console.error(error);
    }
  }

  function formatAdminRoles(roles: string[]) {
    
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

  useEffect(() => {
    fetchData();
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
          title="Administradores"
          isLoading={isLoading}
          table={<AdminUsersTable
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

export default RequireAuth(AdminUsers);
