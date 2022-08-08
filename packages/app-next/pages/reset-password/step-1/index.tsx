import { useRef } from "react";

import LoadingButton from "../../../components/loading-button";

import "./style.css";

/**
 * This is the form of the password reset's second step.
 * @param { Object } props
 * @param { Object } props.formValue - This prop will contain all values from the
 * whole form (remember, this component represents only the form's last step).
 * It is used to determine what values should be placed on each input's defaultValue
 * value.
 * @param { (newValues: Object) => void } props.updateFormValue - This function
 * will merge it's given argument with the `formValue` prop's value. It's used to
 * update the `formValue` prop with the latest values given to this component.
 * @param { (event: SubmitEvent) => void } [props.onSubmit] - This function should
 * be called when the form submits, to alert the parent component to check if
 * the user can procceed to the next step.
 * @param { boolean } props.isResetingPassword - This flag will tell if the application
 * is currently in the middle of a reset password request to the server. This flag is user
 * to show a cool spinner to the user, indicating that something is happening, and
 * that the user should wait.
 */
function Step1({ formValue, updateFormValue, onSubmit, isResetingPassword }) {
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
    <form className="reset-password-step-1-container" onSubmit={handleSubmit}>
      <p>
        Enviamos para o seu e-mail um código de verificação. Por favor, digite o
        código aqui abaixo, e inclua uma nova senha para a sua conta.
      </p>
      <label>
        <p>Código recebido por e-mail</p>
        <input
          type="text"
          ref={codeRef}
          onChange={handleFormUpdate}
          // The `defaultValue` prop will make the input start with a given text.
          // If `formValue.code` is empty or undefined, the input will start empty.
          // If it has a value in it (because the user already filled this input,
          // and already moved to the next step, but went back to change it),
          // the input will containt that value. This applies for all the
          // other inputs.
          defaultValue={formValue.code}
        />
      </label>
      <label>
        <p>Nova senha</p>
        <input
          type="password"
          ref={newPasswordRef}
          onChange={handleFormUpdate}
          defaultValue={formValue.newPassword}
        />
      </label>
      <LoadingButton
        type="submit"
        className="form-button"
        // Show a cool spinner if a request is already being made
        isLoading={isResetingPassword}
      >
        Recuperar
      </LoadingButton>
    </form>
  );
}

export default Step1;
