import { useState } from "react";
import { toast } from "react-toastify";

import SemcompApi from "../../api/semcomp-api";
import { useAppContext } from "../../libs/contextLib";
import Modal from "../Modal";
import LoadingButton from "../reusable/LoadingButton";
import AdminForm, { AdminFormData } from "./AdminForm";

function EditAdminRoleModal({
  data,
  setData,
  onRequestClose,
}: {
  data?: AdminFormData;
  setData: (data: AdminFormData) => void;
  onRequestClose: any;
}) {
  const { semcompApi }: { semcompApi: SemcompApi } = useAppContext();

  const [isLoading, setIsLoading] = useState(false);

  async function handleSubmit() {
    const roles = Object.keys(data.adminRole).filter((key) => data.adminRole[key] === true);
    console.log(roles);
    const newData = {...data, adminRole: roles};
    console.log(newData);
    
    try {
      setIsLoading(true);
      console.log(data); 
      const response = await semcompApi.editAdminRole(newData.id, newData);
    } catch (error) {
      console.error(error);
      toast.error('Erro no servidor');
    } finally {
      setIsLoading(false);
      onRequestClose();
    }
  }

  return (
    <Modal onRequestClose={onRequestClose}>
      <div
        className="w-full bg-black text-white text-center text-xl font-bold p-6"
      >
        Editar permissões do usuário
      </div>
      <div className="max-h-96 overflow-y-scroll p-6 w-full">
        <AdminForm
          data={data}
          setData={setData}
        ></AdminForm>
      </div>
      <div className="w-full px-6">
        <LoadingButton
          isLoading={isLoading}
          className="w-full text-white py-3 px-6"
          onClick={handleSubmit}
        >
          Enviar
        </LoadingButton>
        <button className="w-full bg-red-500 text-white py-3 px-6 my-6" type="button" onClick={onRequestClose}>
          Fechar
        </button>
      </div>
    </Modal>
  );
}

export default EditAdminRoleModal;
