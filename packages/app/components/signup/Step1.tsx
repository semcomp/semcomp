import { useState } from "react";

import { toast } from "react-toastify";
import {
  Divider,
  InputAdornment,
} from "@mui/material";

import LoadingButton from "../loading-button";
import PrivacyPolicyModal from "./PrivacyPolicyModal";
import Input, { InputType } from "../Input";

const ICMCCourses = [
  "Ciência de Dados",
  "Ciências de Computação",
  "Ciências Exatas",
  "Engenharia de Computação",
  "Estatística e Ciência de Dados",
  "Matemática Aplicada e Computação Científica",
  "Matemática (Bacharelado)",
  "Matemática (Licenciatura)",
  "Sistemas de Informação",
  "Outro",
];

enum Disabilities {
  Visual="Visual",
  Motora="Motora",
  Auditiva="Auditiva",
  Outra="Outra",
}

function Step1(
  { formValue, updateFormValue, onSubmit, isSigningUp }:
  {
    formValue: any,
    updateFormValue: Function,
    onSubmit: Function,
    isSigningUp: boolean,
  }
) {
  const [telegram, setTelegram] = useState(formValue.telegram as string);
  function handleTelegramChange(event: React.ChangeEvent<HTMLInputElement>) {
    const value = event.target.value;
    setTelegram(value);
    updateFormValue({ telegram: value });
  };
  const [isStudent, setIsStudent] = useState(formValue.isStudent as boolean);
  function handleIsStudentChange(event: React.ChangeEvent<HTMLInputElement>) {
    const value = event.target.checked;
    setIsStudent(value);
    updateFormValue({ isStudent: value });
  };
  const [course, setCourse] = useState(formValue.course as string);
  function handleCourseChange(event: React.ChangeEvent<HTMLInputElement>) {
    const value = event.target.value;
    setCourse(value);
    updateFormValue({ course: value });
  };
  const [disabilities, setDisabilities] = useState([]);
  function handleDisabilitiesChange(event: React.ChangeEvent<HTMLInputElement>, disability: Disabilities) {
    const value = event.target.checked;

    let updatedDisabilities = disabilities;
    if (value) {
      updatedDisabilities.push(disability);
    } else {
      updatedDisabilities = updatedDisabilities.filter((item) => item !== disability);
    }

    setDisabilities(updatedDisabilities);
    updateFormValue({ disabilities: updatedDisabilities });
  };
  const [canShare, setCanShare] = useState(formValue.canShare as boolean);
  function handleCanShareChange(event: React.ChangeEvent<HTMLInputElement>) {
    const value = event.target.checked;
    setCanShare(value);
    updateFormValue({ canShare: value });
  };
  const [termsOfUse, setTermsOfUse] = useState(false);
  function handleTermsOfUseChange(event: React.ChangeEvent<HTMLInputElement>) {
    const value = event.target.checked;
    setTermsOfUse(value);
    updateFormValue({ canShare: value });
  };
  const [isPrivacyPolicyModalOpen, setIsPrivacyPolicyModalOpen] =
    useState(false);

  function handleSubmit(event) {
    event.preventDefault(); // Stops the page from reloading

    if (!termsOfUse) {
      return toast.error(
        "Você deve aceitar os termos de uso para realizar o cadastro!"
      );
    }

    // Alerts the parent component that the user want to move to the next step.
    // (which in this case, since it's the last step, a request to the server will be made).
    if (onSubmit) onSubmit(event);
  }

  return (
    <form className="w-full" onSubmit={handleSubmit}>
      {isPrivacyPolicyModalOpen && (
        <PrivacyPolicyModal
          onRequestClose={() => setIsPrivacyPolicyModalOpen(false)}
        />
      )}
      <Input
        className="my-3"
        label="Usuário do Telegram (opcional)"
        value={telegram}
        onChange={handleTelegramChange}
        type={InputType.Text}
        start={<InputAdornment position="start">@</InputAdornment>}
      />
      <Input
        className="my-3"
        label="Você é estudante da Universidade de São Paulo?"
        onChange={handleIsStudentChange}
        type={InputType.Checkbox}
      />
      {
        formValue.isStudent && (
          <Input
            className="my-3"
            label="Curso"
            value={course}
            onChange={handleCourseChange}
            choices={ICMCCourses}
            type={InputType.Select}
          />
        )
      }
      <Divider />
      <div className="pt-4">
        <p>
          Você é PCD? Se sim, em qual categoria sua deficiência se enquadra?
        </p>
        <div className="disabilities-options">
          <Input
            className="my-3"
            label={Disabilities.Visual}
            onChange={(e) => handleDisabilitiesChange(e, Disabilities.Visual)}
            type={InputType.Checkbox}
          />
          <Input
            className="my-3"
            label={Disabilities.Motora}
            onChange={(e) => handleDisabilitiesChange(e, Disabilities.Motora)}
            type={InputType.Checkbox}
          />
          <Input
            className="my-3"
            label={Disabilities.Auditiva}
            onChange={(e) => handleDisabilitiesChange(e, Disabilities.Auditiva)}
            type={InputType.Checkbox}
          />
          <Input
            className="my-3"
            label={Disabilities.Outra}
            onChange={(e) => handleDisabilitiesChange(e, Disabilities.Outra)}
            type={InputType.Checkbox}
          />
        </div>
      </div>
      <Divider />
      <Input
        className="my-3"
        label="Você autoriza a Semcomp a divulgar seus dados para seus parceiros, como empresas patrocinadoras?"
        onChange={handleCanShareChange}
        type={InputType.Checkbox}
      />
      <Input
        className="mt-3 mb-6"
        label={<>
          Ao aceitar, você concorda com a nossa{" "}
          <span tabIndex={0} onClick={() => setIsPrivacyPolicyModalOpen(true)}>
            <u>política de privacidade</u>
          </span>.
        </>}
        onChange={handleTermsOfUseChange}
        type={InputType.Checkbox}
      />
      <LoadingButton
        type="submit"
        className="bg-primary text-white font-bold w-full py-3 shadow"
        // Show a cool spinner if a request is already being made
        isLoading={isSigningUp}
      >
        Finalizar cadastro
      </LoadingButton>
    </form>
  );
}

export default Step1;
