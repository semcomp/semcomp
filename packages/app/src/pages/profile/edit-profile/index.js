import React from "react";
import { useSelector, useDispatch } from "react-redux";
import { toast } from "react-toastify";

import Modal from "../../../components/modal";
import LoadingButton from "../../../components/loading-button";
import API from "../../../api";

import { setUser as setUserAction } from "../../../redux/actions/auth";

import "./style.css";

function EditProfile({ onRequestClose }) {
  const [isUpdating, setIsUpdating] = React.useState(false);

  const user = useSelector((state) => state.auth.user);
  const dispatch = useDispatch();

  async function handleSubmit(event) {
    event.preventDefault();
    if (isUpdating) return;

    const formElem = event.currentTarget;
    const name = formElem["name"].value;
    const userTelegram = formElem["userTelegram"].value;

    if (!name) return toast.error("Você deve fornecer um nome");

    const newUser = { ...user, name, userTelegram };
    setIsUpdating(true);
    try {
      const response = await API.updateUserInfo(newUser);
      toast.success("Cadastro editado com sucesso!");
      dispatch(setUserAction({ ...user, ...response.data }));
      onRequestClose();
    } catch (e) {
      console.error(e);
    } finally {
      setIsUpdating(false);
    }
  }

  return (
    <Modal onRequestClose={onRequestClose}>
      <form className="edit-user-data-modal" onSubmit={handleSubmit}>
        <h1>Editar cadastro</h1>
        <label>
          <p>Nome</p>
          <input name="name" type="text" defaultValue={user.name} />
        </label>
        <label>
          <p>Usuário do Telegram</p>
          <input
            name="userTelegram"
            type="text"
            defaultValue={user.userTelegram}
          />
        </label>
        <div className="buttons-container">
          <button className="cancel" type="button" onClick={onRequestClose}>
            Cancelar
          </button>
          <LoadingButton
            className="confirm"
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
