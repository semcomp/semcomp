import { useState } from "react";
import { toast } from "react-toastify";

import Modal from "../../Modal";
import LoadingButton from "../../loading-button";
import API from "../../../api";
import { useAppContext } from "../../../libs/contextLib";

function EditProfile({ onRequestClose }) {
  const [isUpdating, setIsUpdating] = useState(false);

  const { user, setUser } = useAppContext();

  async function handleSubmit(event) {
    event.preventDefault();
    if (isUpdating) return;

    const formElem = event.currentTarget;
    const name = formElem["name"].value;
    const telegram = formElem["telegram"].value;

    if (!name) return toast.error("Você deve fornecer um nome");

    const newUser = { ...user, name, telegram };
    setIsUpdating(true);
    try {
      const response = await API.updateUserInfo(newUser);
      toast.success("Cadastro editado com sucesso!");
      setUser({ ...user, ...response.data });
      onRequestClose();
    } catch (e) {
      console.error(e);
    } finally {
      setIsUpdating(false);
    }
  }

  return (
    <Modal onRequestClose={onRequestClose}>
      <form className="flex flex-col items-center w-full p-4" onSubmit={handleSubmit}>
        <h1 className="text-center text-black">Editar cadastro</h1>
        <label className="w-full my-2 mx-0">
          <p className="w-100 m-0">Nome</p>
          <input name="name" type="text" defaultValue={user.name} className="w-full border-solid border rounded-lg text-black border-black py-1 px-2" />
        </label>
        <label className="w-full my-2 mx-0">
          <p className="w-100 m-0">Usuário do Telegram</p>
          <input
            name="telegram"
            type="text"
            defaultValue={user.telegram}
            className="w-full border-solid border rounded-lg text-black border-black py-1 px-2"
          />
        </label>
        <div className="flex w-full justify-end items-center mt-4">
          <button className="py-2 px-8 rounded-xl text-white bg-orange my-0 mx-2" type="button" onClick={onRequestClose}>
            Cancelar
          </button>
          <LoadingButton
            className="py-2 px-8 rounded-xl text-white bg-green my-0 mx-2"
            type="submit"
            isLoading={isUpdating}
          >
            Confirmar
          </LoadingButton>
        </div>
      </form>
    </Modal>
  );
}

export default EditProfile;
