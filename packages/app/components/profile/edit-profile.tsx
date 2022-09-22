import { useState } from "react";
import { toast } from "react-toastify";

import Modal from "../Modal";
import LoadingButton from "../loading-button";
import API from "../../api";
import { useAppContext } from "../../libs/contextLib";
import Input, { InputType } from "../Input";

function EditProfile({ onRequestClose }) {
  const [isUpdating, setIsUpdating] = useState(false);

  const { user, setUser } = useAppContext();

  const [name, setName] = useState(user.name as string);
  function handleNameChange(event: React.ChangeEvent<HTMLInputElement>) {
    const value = event.target.value;
    setName(value);
  }
  const [telegram, setTelegram] = useState(user.telegram as string);
  function handleTelegramChange(event: React.ChangeEvent<HTMLInputElement>) {
    const value = event.target.value;
    setTelegram(value);
  }

  async function handleSubmit(event) {
    event.preventDefault();
    if (isUpdating) return;

    if (!name) return toast.error("Você deve fornecer um nome");

    const newUser = { ...user, name, telegram };
    setIsUpdating(true);
    try {
      const response = await API.updateUserInfo(newUser);
      toast.success("Cadastro editado com sucesso!");
      setUser({ ...user, ...response.data });
      onRequestClose();
    } catch (error) {
      console.error(error);
    } finally {
      setIsUpdating(false);
    }
  }

  return (
    <Modal onRequestClose={onRequestClose}>
      <div className="w-full bg-tertiary text-white text-center text-xl font-bold p-6">
        Editar Cadastro
      </div>
      <div className="max-h-96 overflow-y-scroll p-6">
        <form className="w-full" onSubmit={handleSubmit}>
          <Input
            tooltip={
              <div style={{ fontSize: "14px" }}>
                Esse nome será usado em:
                <br />
                1. Seu(s) certificado(s);
                <br />
                2. Seu crachá.
                <br />
                <strong>
                  Você poderá alterá-lo posteriormente na sua página de perfil.
                </strong>
              </div>
            }
            autofocus={true}
            className="my-3"
            label="Nome "
            value={name}
            onChange={handleNameChange}
            type={InputType.Text}
          />
          <Input
            className="my-3"
            label="Telegram"
            value={telegram}
            onChange={handleTelegramChange}
            type={InputType.Text}
          />
          <LoadingButton
            className="w-full py-2 px-8 rounded-xl text-white bg-green my-0 mx-2"
            type="submit"
            isLoading={isUpdating}
          >
            Confirmar
          </LoadingButton>
        </form>
      </div>
      <button
        className="bg-orange text-white py-3 px-6 m-4 rounded-xl"
        type="button"
        onClick={onRequestClose}
      >
        Fechar
      </button>
    </Modal>
  );
}

export default EditProfile;
