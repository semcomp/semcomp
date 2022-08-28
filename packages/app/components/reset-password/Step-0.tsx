import { useRef } from "react";

import LoadingButton from "../loading-button";

function Step0(
  { formValue, updateFormValue, onSubmit, isSendingCode }:
  {
    formValue: any,
    updateFormValue: Function,
    onSubmit: Function,
    isSendingCode: boolean,
  }
) {
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
    <form className="w-full" onSubmit={handleSubmit}>
      <label>
        E-mail da sua conta
        <input
          onChange={handleFormUpdate}
          ref={emailRef}
          type="text"
          defaultValue={formValue.email}
          className="shadow h-8 px-2 py-3 my-3"
        />
      </label>
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
