import React from "react";
import { toast } from "react-toastify";

import LoadingButton from "../../../components/loading-button";
import PrivacyPolicyModal from "./privacy-policy-modal";

import "./style.css";

/**
 * This is the form of the signup's first step.
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
 * @param { boolean } props.isSigningUp - This flag will tell if the application
 * is currently in the middle of a signup request to the server. This flag is user
 * to show a cool spinner to the user, indicating that something is happening, and
 * that the user should wait.
 */
function Step1({ formValue, updateFormValue, onSubmit, isSigningUp }) {
  // These refs will be used later to gather the input's values.
  const userTelegramRef = React.useRef();
  const isStudentRef = React.useRef();
  const courseRef = React.useRef();
  // const discordRef = React.useRef();
  const disabilitiesRef = React.useRef({});
  const canShareDataRef = React.useRef();
  const [termsOfUse, setTermsOfUse] = React.useState(false);

  function getDisabilitiesArray(current) {
    const disabilitiesArray = [];

    if (current["visual"].checked) {
      disabilitiesArray.push("Visual");
    }

    if (current["motor"].checked) {
      disabilitiesArray.push("Motora");
    }

    if (current["hearing"].checked) {
      disabilitiesArray.push("Auditiva");
    }

    if (current["other"].checked) {
      disabilitiesArray.push("Outra");
    }

    return disabilitiesArray;
  }

  function handleFormUpdate() {
    // Get the input's values from their refs.
    const userTelegram = userTelegramRef.current.value;
    const isStudent = isStudentRef.current.checked;
    const course = courseRef.current.value;
    // const discord = discordRef.current.value;
    const disabilities = getDisabilitiesArray(disabilitiesRef.current);
    const canShareData = canShareDataRef.current.checked;

    // Updates the `formValue` prop with the newest values given by the user.
    updateFormValue({
      userTelegram,
      isStudent,
      course,
      // discord,
      disabilities,
      canShareData,
    });
  }

  function handleSubmit(event) {
    event.preventDefault(); // Stops the page from reloading

    if (!termsOfUse) {
      return toast.error(
        "Você deve aceitar os termos de uso para realizar o cadastro!"
      );
    }

    handleFormUpdate();

    // Alerts the parent component that the user want to move to the next step.
    // (which in this case, since it's the last step, a request to the server will be made).
    if (onSubmit) onSubmit(event);
  }

  const needsCourse = formValue.isStudent;
  const [isPrivacyPolicyModalOpen, setIsPrivacyPolicyModalOpen] =
    React.useState(false);

  return (
    <form className="signup-step-1-container" onSubmit={handleSubmit}>
      {isPrivacyPolicyModalOpen && (
        <PrivacyPolicyModal
          onRequestClose={() => setIsPrivacyPolicyModalOpen(false)}
        />
      )}
      <label>
        <p>Usuário do Telegram (opcional)</p>
        <input
          type="text"
          ref={userTelegramRef}
          onChange={handleFormUpdate}
          defaultValue={formValue.userTelegram}
        />
      </label>
      <label className="inline">
        <input
          type="checkbox"
          ref={isStudentRef}
          onChange={handleFormUpdate}
          defaultChecked={needsCourse}
        />
        <p>Você é estudante da Universidade de São Paulo?</p>
      </label>
      <label
        className={needsCourse ? "" : "disabled"}
        title={needsCourse ? "" : "Apenas estudantes podem fornecer um curso"}
      >
        <p>Curso</p>
        <input
          type="text"
          ref={courseRef}
          onChange={handleFormUpdate}
          defaultValue={formValue.course}
          disabled={!needsCourse}
        />
      </label>
      {/* <label>
        <p>Discord (opcional)</p>
        <input
          type="text"
          ref={discordRef}
          onChange={handleFormUpdate}
          defaultValue={formValue.discord}
        />
      </label> */}
      <div>
        <p>
          Você é PCD? Se sim, em qual categoria sua deficiência se enquadra?
        </p>
        <div className="disabilities-options">
          <label className="inline">
            <input
              type="checkbox"
              ref={(val) => (disabilitiesRef.current["visual"] = val)}
              onChange={handleFormUpdate}
            />
            <p>Visual</p>
          </label>
          <label className="inline">
            <input
              type="checkbox"
              ref={(val) => (disabilitiesRef.current["motor"] = val)}
              onChange={handleFormUpdate}
            />
            <p>Motora</p>
          </label>
          <label className="inline">
            <input
              type="checkbox"
              ref={(val) => (disabilitiesRef.current["hearing"] = val)}
              onChange={handleFormUpdate}
            />
            <p>Auditiva</p>
          </label>
          <label className="inline">
            <input
              type="checkbox"
              ref={(val) => (disabilitiesRef.current["other"] = val)}
              onChange={handleFormUpdate}
            />
            <p>Outra</p>
          </label>
        </div>
      </div>
      <label className="inline">
        <input
          type="checkbox"
          ref={canShareDataRef}
          onChange={handleFormUpdate}
          defaultChecked={
            formValue.canShareData === undefined
              ? false
              : formValue.canShareData
          }
        />
        <p>
          Você autoriza a Semcomp a divulgar seus dados para seus parceiros,
          como empresas patrocinadoras?
        </p>
      </label>
      <label className="inline">
        <input
          type="checkbox"
          onChange={() => setTermsOfUse(!termsOfUse)}
          value={termsOfUse}
        />
        <p>
          Ao aceitar, você concorda com a nossa{" "}
          <span tabIndex="0" onClick={() => setIsPrivacyPolicyModalOpen(true)}>
            <u>política de privacidade</u>
          </span>
          .
        </p>
      </label>
      <LoadingButton
        type="submit"
        className="form-button signup"
        // Show a cool spinner if a request is already being made
        isLoading={isSigningUp}
      >
        Finalizar cadastro
      </LoadingButton>
    </form>
  );
}

export default Step1;
