import Input, { InputType } from "../Input";
import adminRoles from "../../libs/constants/admin-roles";
import React from "react"

export enum adminRole {
  User = "Users", 
  TShirt = "TShirts", 
  House = "Houses", 
  GameQuestion = "GameQuestions", 
  GameGroup = "GameGroups", 
  Event = "Events",
  TreasureHuntImage = "TreasureHuntImages"
}

// const adminRoles = Object.values(adminRole);

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
  function handleSizeChange(event: React.ChangeEvent<HTMLInputElement>, key: string) {
    data.adminRole[key] = event.target.checked;
    setData({...data, adminRole: data.adminRole});
}

  // function handleQuantityChange(event: React.ChangeEvent<HTMLInputElement>) {
  //   const value = event.target.value;
  //   setData({...data, quantity: +value});
  // }

  return (
    <>
      {
        Object.keys(data.adminRole).map((key) => (
          <Input
            className="my-3"
            label={adminRoles[key]}
            value={data.adminRole[key]}
            onChange={(e) => handleSizeChange(e, key)}
            type={InputType.Checkbox}
          />
        ))
      }
    </>
  );
}

export default AdminForm;
