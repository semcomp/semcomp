import { useState } from "react";
import Link from 'next/link';

import { IconButton, InputAdornment } from "@mui/material";
import Visibility from "@mui/icons-material/Visibility";
import VisibilityOff from "@mui/icons-material/VisibilityOff";

import Input, {InputType} from "../Input";

function Step0(
  { formValue, updateFormValue, onSubmit }:
  {
    formValue: any,
    updateFormValue: Function,
    onSubmit: Function,
  }
) {
  const [name, setName] = useState(formValue.name as string);
  function handleNameChange(event: React.ChangeEvent<HTMLInputElement>) {
    const value = event.target.value;
    setName(value);
    updateFormValue({ name: value });
  };
  const [email, setEmail] = useState(formValue.email as string);
  function handleEmailChange(event: React.ChangeEvent<HTMLInputElement>) {
    const value = event.target.value;
    setEmail(value);
    updateFormValue({ email: value });
  };
  const [password, setPassword] = useState(formValue.password as string);
  function handlePasswordChange(event: React.ChangeEvent<HTMLInputElement>) {
    const value = event.target.value;
    setPassword(value);
    updateFormValue({ password: value });
  };
  const [showPassword, setShowPassword] = useState(false);

  function handleSubmit(event) {
    event.preventDefault(); // Stops the page from reloading

    // Alerts the parent component that the user want to move to the next step.
    if (onSubmit) onSubmit(event);
  }

  return (
    <form className="w-full" onSubmit={handleSubmit}>
      <Input
        className="my-3"
        label="Nome"
        value={name}
        onChange={handleNameChange}
        type={InputType.Text}
      />
      <Input
        className="my-3"
        label="E-mail"
        value={email}
        onChange={handleEmailChange}
        type={InputType.Text}
      />
      <Input
        className="my-3"
        label="Senha"
        value={password}
        onChange={handlePasswordChange}
        type={showPassword ? InputType.Text : InputType.Password}
        end={
              <InputAdornment position="end">
                <IconButton onClick={() => setShowPassword(!showPassword)}>
                  {showPassword ? <VisibilityOff /> : <Visibility />}
                </IconButton>
              </InputAdornment>
            }
      />
      <button
        type="submit"
        className="bg-primary text-white font-bold w-full py-3 shadow"
      >
        Próximo
      </button>
      <div className="mt-3">
        <Link href="/login">
          <p>Ja tem uma conta?</p>
        </Link>
      </div>
    </form>
  );
}

export default Step0;
