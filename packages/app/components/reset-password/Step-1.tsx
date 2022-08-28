import { useRef } from "react";

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
  // These refs will be used later to gather the input's values.
  const codeRef: any = useRef();
  const newPasswordRef: any = useRef();

  function handleFormUpdate() {
    // Get the input's values from their refs.
    const code = codeRef.current.value;
    const newPassword = newPasswordRef.current.value;

    // Updates the `formValue` prop with the newest values given by the user.
    updateFormValue({ code, newPassword });
  }

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
      <label>
        Código recebido por e-mail
        <input
          type="text"
          ref={codeRef}
          onChange={handleFormUpdate}
          defaultValue={formValue.code}
          className="shadow h-8 px-2 py-3 my-3"
        />
      </label>
      <label>
        Nova senha
        <input
          type="password"
          ref={newPasswordRef}
          onChange={handleFormUpdate}
          defaultValue={formValue.newPassword}
          className="shadow h-8 px-2 py-3 my-3"
        />
      </label>
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
