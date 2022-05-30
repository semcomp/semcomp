import React, { useState } from "react";
import { IconButton, Input, InputAdornment, TextField } from "@mui/material";
import Visibility from "@mui/icons-material/Visibility";
import VisibilityOff from "@mui/icons-material/VisibilityOff";

import { Link } from "react-router-dom";

import BackendURL from "../../../constants/api-url";

import "./style.css";

/**
 * This is the form of the signup's first step.
 * @param { Object } props
 * @param { Object } props.formValue - This prop will contain all values from the
 * whole form (remember, this component represents only the form's first step).
 * It is used to determine what values should be placed on each input's defaultValue
 * value.
 * @param { (newValues: Object) => void } props.updateFormValue - This function
 * will merge it's given argument with the `formValue` prop's value. It's used to
 * update the `formValue` prop with the latest values given to this component.
 * @param { (event: SubmitEvent) => void } [props.onSubmit] - This function should
 * be called when the form submits, to alert the parent component to check if
 * the user can procceed to the next step.
 */
function Step0({ formValue, updateFormValue, onSubmit }) {
  // These refs will be used later to gather the input's values.
  const nameRef = React.useRef();
  const emailRef = React.useRef();
  const passwordRef = React.useRef();
  const [showPassword, setShowPassword] = useState(false);

  function handleFormUpdate() {
    // Get the input's values from their refs.
    const name = nameRef.current.value;
    const email = emailRef.current.value;
    const password = passwordRef.current.value;

    // Updates the `formValue` prop with the newest values given by the user.
    updateFormValue({ name, email, password });
  }

  function handleSubmit(event) {
    event.preventDefault(); // Stops the page from reloading

    // Alerts the parent component that the user want to move to the next step.
    if (onSubmit) onSubmit(event);
  }

  return (
    <form className="signup-step-0-container" onSubmit={handleSubmit}>
      <label>
        <p>Nome</p>
        <TextField
          variant="standard"
          fullWidth
          onChange={handleFormUpdate}
          inputRef={nameRef}
          type="text"
          defaultValue={formValue.name}
        />
      </label>
      <label>
        <p>E-mail</p>
        <TextField
          variant="standard"
          fullWidth
          onChange={handleFormUpdate}
          inputRef={emailRef}
          type="text"
          defaultValue={formValue.email}
        />
      </label>
      <label>
        <p>Senha</p>
        <Input
          variant="standard"
          fullWidth
          onChange={handleFormUpdate}
          inputRef={passwordRef}
          type={showPassword ? "text" : "password"}
          defaultValue={formValue.password}
          endAdornment={
            <InputAdornment position="end">
              <IconButton onClick={() => setShowPassword(!showPassword)}>
                {showPassword ? <VisibilityOff /> : <Visibility />}
              </IconButton>
            </InputAdornment>
          }
        />
      </label>
      <button type="submit" className="form-button signup">
        Próximo
      </button>
      {/* <a
				href={BackendURL + '/auth'}
				type="submit"
				className="form-button signup-usp"
			>Ou entrar com Login USP</a> */}
      <Link to="/login">
        <p>Ja tem uma conta?</p>
      </Link>
    </form>
  );
}

export default Step0;
