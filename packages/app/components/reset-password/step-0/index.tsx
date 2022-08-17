import { useRef } from "react";

import LoadingButton from "../../loading-button";

/**
 * This is the form of the password reset's first step.
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
 * @param { boolean } isSendingCode - This boolean indicates whether the request
 * for the server code is happening or not. It's main purpose is to display a cool
 * spinner for the user as feedback.
 */
function Step0({ formValue, updateFormValue, onSubmit, isSendingCode }) {
  // This ref will be used later to gather the input's values.
  const emailRef: any = useRef();

  function handleFormUpdate() {
    // Get the input's values from the ref.
    const email = emailRef.current.value;

    // Updates the `formValue` prop with the newest values given by the user.
    updateFormValue({ email });
  }

  function handleSubmit(event) {
    event.preventDefault(); // Stops the page from reloading

    // Alerts the parent component that the user want to move to the next step.
    if (onSubmit) onSubmit(event);
  }

  return (
    <form className="reset-password-step-0-container" onSubmit={handleSubmit}>
      <label>
        <p>E-mail da sua conta</p>
        <input
          onChange={handleFormUpdate}
          ref={emailRef}
          type="text"
          // The `defaultValue` prop will make the input start with a given text.
          // If `formValue.email` is empty or undefined, the input will start empty.
          // If it has a value in it (because the user already filled this input,
          // and already moved to the next step, but went back to change it),
          // the input will containt that value. This applies for all the
          // other inputs.
          defaultValue={formValue.email}
        />
      </label>
      <LoadingButton
        type="submit"
        className="form-button"
        // Show a cool spinner if a request is already being made
        isLoading={isSendingCode}
      >
        Enviar código por e-mail
      </LoadingButton>
    </form>
  );
}

export default Step0;
