import Input, { InputType } from "../Input";
import adminRoles from "../../libs/constants/admin-roles";
import React from "react"

export type AdminFormData = {
  id: string;
  adminRole: Object;
};

function AdminForm({
  data,
  setData,
}: {
  data?: AdminFormData;
  setData: (data: AdminFormData) => void;
}) {
  function handleRolesChange(event: React.ChangeEvent<HTMLInputElement>, key: string) {
    data.adminRole[key] = event.target.checked;
    setData({...data, adminRole: data.adminRole});
}
  return (
    <>
      {
        Object.keys(adminRoles).map((key, index) => (
          <Input
            key={index}
            className="my-3"
            label={adminRoles[key]}
            value={data.adminRole[key]}
            onChange={(e) => handleRolesChange(e, key)}
            type={InputType.Checkbox}
          />
        ))
      }
    </>
  );
}

export default AdminForm;
