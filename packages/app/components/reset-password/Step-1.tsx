import { useState } from "react";

import Input, { InputType } from "../Input";
import LoadingButton from "../loading-button";

function Step1(
  { formValue, updateFormValue, onSubmit, isResetingPassword }:
  {
    formValue: any,
    updateFormValue: Function,
    onSubmit: Function,
    isResetingPassword: boolean,
  }
) {
  const [code, setCode] = useState(formValue.code as string);
  function handleCodeChange(event: React.ChangeEvent<HTMLInputElement>) {
    const value = event.target.value;
    setCode(value);
    updateFormValue({ code: value });
  };

  const [newPassword, setNewPassword] = useState(formValue.newPassword as string);
  function handleNewPasswordChange(event: React.ChangeEvent<HTMLInputElement>) {
    const value = event.target.value;
    setNewPassword(value);
    updateFormValue({ newPassword: value });
  };

  function handleSubmit(event) {
    event.preventDefault(); // Stops the page from reloading

    // Alerts the parent component that the user want to move to the next step.
    // (which in this case, since it's the last step, a request to the server will be made).
    if (onSubmit) onSubmit(event);
  }

  return (
    <form className="w-full" onSubmit={handleSubmit}>
      <p>
        Enviamos para o seu e-mail um código de verificação. Por favor, digite o
        código aqui abaixo, e inclua uma nova senha para a sua conta.
      </p>
      <Input
        className="my-3"
        label="Código recebido por e-mail"
        value={code}
        onChange={handleCodeChange}
        type={InputType.Text}
      />
      <Input
        className="my-3"
        label="Nova senha"
        value={newPassword}
        onChange={handleNewPasswordChange}
        type={InputType.Password}
      />
      <LoadingButton
        type="submit"
        className="bg-primary text-white font-bold w-full py-3 shadow"
        isLoading={isResetingPassword}
      >
        Recuperar
      </LoadingButton>
    </form>
  );
}

export default Step1;
