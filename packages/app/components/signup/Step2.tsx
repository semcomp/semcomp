import { useEffect, useState } from "react";

import Input, { InputType } from "../Input";
import LoadingButton from "../loading-button";

function Step2(
  { formValue, updateFormValue, onSubmit, isSigningUp }:
  {
    formValue: any,
    updateFormValue: Function,
    onSubmit: Function,
    isSigningUp: boolean,
  }
) {
  const [verificationCode, setVerificationCode] = useState(formValue.verificationCode as string);
  const [emailInput, setEmailInput] = useState(formValue.email || "");
  function handleVerificationCode(event: React.ChangeEvent<HTMLInputElement>) {
    const value = event.target.value;
    setVerificationCode(value);
    updateFormValue({ verificationCode: value });
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
        código aqui abaixo e confirme o seu email. Você tem 30 minutos para realizar essa verificação.
         Não feche essa página.
      </p>
      {!emailInput && (
        <Input
          className="my-3"
          label="E-mail"
          value={emailInput}
          onChange={(e) => { setEmailInput(e.target.value); updateFormValue({ email: e.target.value }); }}
          type={InputType.Text}
        />
      )}
      <Input
        className="my-3"
        label="Código recebido por e-mail"
        value={verificationCode}
        onChange={handleVerificationCode}
        type={InputType.Text}
      />
      <LoadingButton
        type="submit"
        className="bg-primary text-white font-bold w-full py-3 shadow"
        isLoading={isSigningUp}
      >
        Confirmar
      </LoadingButton>
    </form>
  );
}

export default Step2;
