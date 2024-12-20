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
  const [email, setEmail] = useState(user.email as string);
  function handleEmailChange(event: React.ChangeEvent<HTMLInputElement>) {
    const value = event.target.value;
    setEmail(value);
  }

  async function handleSubmit(event) {
    event.preventDefault();
    if (isUpdating) return;

    if (!name) return toast.error("Você deve fornecer um nome");
    if (!email) return toast.error("Você deve fornecer um email");

    const newUser = { ...user, name, email, telegram };
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
      <div className={`w-full bg-${user.house.name} text-white text-center text-xl p-6`}>
        Editar Cadastro
      </div>
      <div className="max-h-96 p-6">
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
          {/* <Input
            tooltip={
              <div style={{ fontSize: "14px" }}>
                Por favor, cadastre um e-mail que você tem acesso e que seja válido.
              </div>
            }
            className="my-3"
            label="E-mail"
            value={email}
            onChange={handleEmailChange}
            type={InputType.Text}
          /> */}
          <LoadingButton
            className={`w-full py-4 px-8 rounded-xl text-white bg-${user.house.name} hover:bg-[#aeaeae] mb-2`}
            type="submit"
            isLoading={isUpdating}
          >
            Confirmar
          </LoadingButton>
        </form>
      </div>
      <button
        className="bg-[#F24444] hover:bg-[#aeaeae] text-white p-3 px-6 mt-8 mb-6 rounded-xl"
        type="button"
        onClick={onRequestClose}
      >
        Fechar
      </button>
    </Modal>
  );
}

export default EditProfile;
