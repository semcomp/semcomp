import { useState } from "react";

import { TextField } from "@mui/material";

import LoadingButton from "../loading-button";
import Input, { InputType } from "../Input";

function Step0(
  { formValue, updateFormValue, onSubmit, isSendingCode }:
  {
    formValue: any,
    updateFormValue: Function,
    onSubmit: Function,
    isSendingCode: boolean,
  }
) {
  const [email, setEmail] = useState(formValue.email as string);
  function handleEmailChange(event: React.ChangeEvent<HTMLInputElement>) {
    const value = event.target.value;
    setEmail(value);
    updateFormValue({ email: value });
  };

  function handleSubmit(event) {
    event.preventDefault(); // Stops the page from reloading

    // Alerts the parent component that the user want to move to the next step.
    if (onSubmit) onSubmit(event);
  }

  return (
    <form className="w-full" onSubmit={handleSubmit}>
      <Input
        className="my-3"
        label="E-mail da sua conta"
        value={email}
        onChange={handleEmailChange}
        type={InputType.Text}
      />
      <LoadingButton
        type="submit"
        className="bg-primary text-white font-bold w-full py-3 shadow"
        isLoading={isSendingCode}
      >
        Enviar código por e-mail
      </LoadingButton>
    </form>
  );
}

export default Step0;
