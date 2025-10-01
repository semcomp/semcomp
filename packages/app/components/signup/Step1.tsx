import { Dispatch, SetStateAction, useRef, useState } from "react";
import { toast } from "react-toastify";
import {
  Divider,
  InputAdornment,
  SelectChangeEvent,
} from "@mui/material";

import LoadingButton from "../loading-button";
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

const USPInstitutes = [
  "Escola de Engenharia de São Carlos (EESC)",
  "Instituto de Arquitetura e Urbanismo (IAU)",
  "Instituto de Ciências Matemáticas e de Computação (ICMC)",
  "Instituto de Física de São Carlos (IFSC)",
  "Instituto Química de São Carlos (IQSC)",
  "Outro",
];

const ExtensionGroups = [
  "ADA",
  "Campanha USP do Agasalho",
  "Corvus AI",
  "DATA",
  "Delphos",
  "Esperançar",
  "GANESH",
  "GELOS",
  "GRACE",
  "GEMA",
  "ICMC Júnior",
  "Liga de empreendedorismo de São Carlos",
  "Matemática na Medida Certa",
  "NEMO",
  "Principia",
  "Projeto Aprender",
  "PET",
  "Raia",
  "Sanca Social",
  "SEnC",
  "Semcomp",
  "FoG",
  "USPCodeLab",
  "Warthog Robotics",
  "Code.laces",
];

const SemesterOptions = ["1º Semestre", "2º Semestre"];

const CURRENT_YEAR = new Date().getFullYear();
const ADMISSION_YEARS = Array.from({ length: 15 }, (_, i) => CURRENT_YEAR - i);
const GRADUATION_YEARS = Array.from({ length: 10 }, (_, i) => CURRENT_YEAR + i);

enum Disabilities {
  Visual = "Visual",
  Motora = "Motora",
  Auditiva = "Auditiva",
  Outra = "Outra",
}

function Step1({
  formValue,
  updateFormValue,
  onSubmit,
  isSigningUp,
  openPrivacyPolicyModal
}: {
  formValue: {
    name: string;
    email: string;
    password: string;
    telegram: string;
    phone: string;
    linkedin: string;
    isStudent: boolean;
    course: string;
    disabilities: string[];
    permission: boolean;
    admissionYear: string;
    expectedGraduationYear: string;
    expectedGraduationSemester: string;
    institute: string;
    customCourse: string;
    customInstitute: string;
    extensionGroups: string[];
  };
  updateFormValue: Function;
  onSubmit: Function;
  isSigningUp: boolean;
  openPrivacyPolicyModal: Dispatch<SetStateAction<boolean>>;
}) {
  const [telegram, setTelegram] = useState(formValue.telegram);
  function handleTelegramChange(event: React.ChangeEvent<HTMLInputElement>) {
    const value = event.target.value;
    setTelegram(value);
    updateFormValue({ telegram: value });
  }

  const [phone, setPhone] = useState(formValue.phone);
  function handlePhoneChange(event: React.ChangeEvent<HTMLInputElement>) {
    let value = event.target.value.replace(/\D/g, "");
  
    if (value.length > 11) value = value.substring(0, 11);
  
    if (value.length > 6) {
      value = value.replace(/^(\d{2})(\d{5})(\d{0,4})$/, "($1) $2-$3");
    } else if (value.length > 2) {
      value = value.replace(/^(\d{2})(\d{0,5})$/, "($1) $2");
    } else if (value.length > 0) {
      value = value.replace(/^(\d*)$/, "($1");
    }

    if (value.endsWith("-")) {
      value = value.slice(0, -1);
    }
  
    setPhone(value);
    updateFormValue({ phone: value });
  }

  const [linkedin, setLinkedin] = useState(formValue.linkedin);
  const handleLinkedinChange = useDebouncedLinkedin(setLinkedin, updateFormValue);
  function useDebouncedLinkedin(setLinkedin: Function, updateFormValue: Function) {
    const timeoutRef = useRef<NodeJS.Timeout | null>(null);

    return (event: React.ChangeEvent<HTMLInputElement>) => {
        const value = event.target.value.trim();
        setLinkedin(value);

        if (timeoutRef.current) {
            clearTimeout(timeoutRef.current);
        }

        timeoutRef.current = setTimeout(() => {
            const linkedinRegex = /^https?:\/\/(www\.)?linkedin\.com\/.*$/i;

            if (value && !linkedinRegex.test(value)) {
                toast.error(
                    'Insira um link válido do LinkedIn, começando com https://www.linkedin.com/'
                );
                return;
            }

            updateFormValue({ linkedin: value });
        }, 2000); // 2s de debounce
    };
}

  
  const [isStudent, setIsStudent] = useState(formValue.isStudent);
  function handleIsStudentChange(event: React.ChangeEvent<HTMLInputElement>) {
    const value = event.target.checked;
    setIsStudent(value);
    updateFormValue({ isStudent: value });
  }
  
  const [course, setCourse] = useState(formValue.course);
  const isICMCCourse = (courseName: string) => {
    return ICMCCourses.includes(courseName) && courseName !== "Outro";
  };
  function handleCourseChange(event: React.ChangeEvent<HTMLInputElement>) {
    const value = event.target.value;
    setCourse(value);

    const updates: any = { course: value };

    // Se selecionou um curso do ICMC, define automaticamente o instituto
    if (isICMCCourse(value)) {
      updates.institute =
        "Instituto de Ciências Matemáticas e de Computação (ICMC)";
      setInstitute("Instituto de Ciências Matemáticas e de Computação (ICMC)");
    } else if (value === "Outro") {
      // Se selecionou o curso como "Outro", permite escolher o instituto
      updates.institute = "";
      setInstitute("");
    }

    updateFormValue(updates);
  }

  const [customCourse, setCustomCourse] = useState(formValue.customCourse);
  function handleCustomCourseChange(
    event: React.ChangeEvent<HTMLInputElement>
  ) {
    const value = event.target.value;
    setCustomCourse(value);
    updateFormValue({ customCourse: value });
  }

  const [admissionYear, setAdmissionYear] = useState(formValue.admissionYear);
  function handleAdmissionYearChange(
    event: React.ChangeEvent<HTMLInputElement>
  ) {
    const value = event.target.value;
    setAdmissionYear(value);
    updateFormValue({ admissionYear: value });
  }

  const [expectedGraduationYear, setExpectedGraduationYear] = useState(
    formValue.expectedGraduationYear
  );
  function handleExpectedGraduationYearChange(
    event: React.ChangeEvent<HTMLInputElement>
  ) {
    const value = event.target.value;
    setExpectedGraduationYear(value);
    updateFormValue({ expectedGraduationYear: value });
  }

  const [expectedGraduationSemester, setExpectedGraduationSemester] = useState(
    formValue.expectedGraduationSemester
  );
  function handleExpectedGraduationSemesterChange(
    event: React.ChangeEvent<HTMLInputElement>
  ) {
    const value = event.target.value;
    setExpectedGraduationSemester(value);
    updateFormValue({ expectedGraduationSemester: value });
  }

  const [institute, setInstitute] = useState(formValue.institute);
  function handleInstituteChange(event: React.ChangeEvent<HTMLInputElement>) {
    if (isICMCCourse(course)) {
      return;
    }

    const value = event.target.value;
    setInstitute(value);
    updateFormValue({ institute: value });
  }

  const [customInstitute, setCustomInstitute] = useState(
    formValue.customInstitute
  );
  function handleCustomInstituteChange(
    event: React.ChangeEvent<HTMLInputElement>
  ) {
    const value = event.target.value;
    setCustomInstitute(value);
    updateFormValue({ customInstitute: value });
  }

  const [extensionGroups, setExtensionGroups] = useState(
    formValue.extensionGroups
  );
  function handleExtensionGroupsChange(event: SelectChangeEvent<string[]>) {
    const {
      target: { value },
    } = event;

    const selectedGroups = typeof value === "string" ? value.split(",") : value;

    setExtensionGroups(selectedGroups);
    updateFormValue({ extensionGroups: selectedGroups });
  }

  const [disabilities, setDisabilities] = useState(formValue.disabilities);
  function handleDisabilitiesChange(
    event: React.ChangeEvent<HTMLInputElement>,
    disability: Disabilities
  ) {
    const value = event.target.checked;

    let updatedDisabilities = disabilities;
    if (value) {
      updatedDisabilities.push(disability);
    } else {
      updatedDisabilities = updatedDisabilities.filter(
        (item) => item !== disability
      );
    }

    setDisabilities(updatedDisabilities);
    updateFormValue({ disabilities: updatedDisabilities });
  }

  const [permission, setPermission] = useState(formValue.permission);
  function handlePermissionChange(event: React.ChangeEvent<HTMLInputElement>) {
    const value = event.target.checked;
    setPermission(value);
    updateFormValue({ permission: value });
  }

  const [termsOfUse, setTermsOfUse] = useState(false);
  function handleTermsOfUseChange(event: React.ChangeEvent<HTMLInputElement>) {
    const value = event.target.checked;
    setTermsOfUse(value);
  }

  const [isPrivacyPolicyModalOpen, setIsPrivacyPolicyModalOpen] =
    useState(false);

  const [isButtonDisabled, setIsButtonDisabled] = useState(false);
  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault(); // Stops the page from reloading

    // Validação de estudante USP
    if (formValue.isStudent && !institute) {
      return toast.error(
        "Você deve selecionar o instituto/faculdade se for estudante!"
      );
    }

    if (
      formValue.isStudent &&
      institute === "Outro" &&
      !formValue.customInstitute
    ) {
      return toast.error(
        "Por favor, especifique o nome do instituto/faculdade!"
      );
    }

    // Validação de curso
    if (formValue.isStudent && !course) {
      return toast.error("Você deve fornecer um curso se for estudante!");
    }

    if (formValue.isStudent && course === "Outro" && !formValue.customCourse) {
      return toast.error("Por favor, especifique o nome do curso!");
    }

    // Validação de anos
    if (formValue.isStudent && !admissionYear) {
      return toast.error(
        "Você deve fornecer o ano de ingresso se for estudante!"
      );
    }

    if (formValue.isStudent && !expectedGraduationYear) {
      return toast.error(
        "Você deve fornecer o ano de formação esperado se for estudante!"
      );
    }

    if (formValue.isStudent && !expectedGraduationSemester) {
      return toast.error(
        "Você deve selecionar o semestre de formação esperado!"
      );
    }

    // Validação de consistência entre anos
    if (formValue.isStudent && admissionYear && expectedGraduationYear) {
      const admission = parseInt(admissionYear);
      const graduation = parseInt(expectedGraduationYear);

      if (graduation < admission) {
        return toast.error(
          "O ano de formação não pode ser anterior ao ano de ingresso!"
        );
      }

      if (graduation - admission < 2) {
        return toast.error(
          "O período de formação deve ser de pelo menos 2 anos!"
        );
      }
    }

    if (!termsOfUse) {
      return toast.error(
        "Você deve aceitar os termos de uso para realizar o cadastro!"
      );
    }

    setIsButtonDisabled(true);
    setTimeout(() => {
      setIsButtonDisabled(false);
    }, 10000);

    // Alerts the parent component that the user want to move to the next step.
    // (which in this case, since it's the last step, a request to the server will be made).
    if (onSubmit) onSubmit(event);
  };

  return (
    <form className="w-full phone:pb-16 tablet:pb-4" onSubmit={handleSubmit}>
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
        label="Telefone (opcional)"
        value={phone}
        onChange={handlePhoneChange}
        type={InputType.Text}
        placeholder="(99) 99999-9999"
      />

      <Input
        className="my-3"
        label="LinkedIn (opcional)"
        value={linkedin}
        onChange={handleLinkedinChange}
        type={InputType.Text}
        placeholder="Cole o link do seu perfil"
      />
      <Input
        className="my-3"
        label="Você é estudante?"
        onChange={handleIsStudentChange}
        type={InputType.Checkbox}
      />
      {formValue.isStudent && (
        <>
          <Input
            className="my-3"
            label="Curso*"
            value={course}
            onChange={handleCourseChange}
            choices={ICMCCourses}
            type={InputType.Select}
            placeholder="Selecione o curso"
          />
          {course === "Outro" && (
            <Input
              className="my-3"
              label="Nome do Curso*"
              value={customCourse}
              onChange={handleCustomCourseChange}
              type={InputType.Text}
              placeholder="Digite o nome do curso"
            />
          )}
          <Input
            className="my-3"
            label="Instituto*"
            value={institute}
            onChange={handleInstituteChange}
            choices={USPInstitutes}
            type={InputType.Select}
            placeholder="Selecione o instituto"
            disabled={isICMCCourse(course)}
          />
          {institute === "Outro" && (
            <Input
              className="my-3"
              label="Nome do Instituto*"
              value={customInstitute}
              onChange={handleCustomInstituteChange}
              type={InputType.Text}
              placeholder="Selecione o instituto"
            />
          )}
          <div className="flex mobile:flex-col">
            <Input
              className="my-3 mr-1 w-1/2 mobile:w-full"
              label="Ano de Ingresso*"
              value={admissionYear}
              onChange={handleAdmissionYearChange}
              choices={ADMISSION_YEARS.map((year) => year.toString())}
              type={InputType.Select}
              placeholder="Selecione o ano"
            />
            <Input
              className="my-3 w-1/2 mobile:w-full"
              label="Ano de Formação*"
              value={expectedGraduationYear}
              onChange={handleExpectedGraduationYearChange}
              choices={GRADUATION_YEARS.map((year) => year.toString())}
              type={InputType.Select}
              placeholder="Ano de expectativa"
            />
          </div>
          <Input
            className="my-3"
            label="Semestre de Formação (esperado)*"
            value={expectedGraduationSemester}
            onChange={handleExpectedGraduationSemesterChange}
            choices={SemesterOptions}
            type={InputType.Select}
            placeholder="Selecione o semestre"
          />
          <Input
            className="my-6"
            label="Grupos de Extensão que você participa ou já participou (opcional)"
            value={extensionGroups}
            onChange={handleExtensionGroupsChange}
            choices={ExtensionGroups}
            type={InputType.MultiSelect}
          />
        </>
      )}
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
        onChange={handlePermissionChange}
        type={InputType.Checkbox}
      />
      <Input
        className="mt-3 mb-6"
        label={
          <>
            Ao aceitar, você concorda com a nossa{" "}
            <span
              tabIndex={0}
              onClick={() => openPrivacyPolicyModal(true)}
            >
              <u>política de privacidade</u>
            </span>
            .
          </>
        }
        onChange={handleTermsOfUseChange}
        type={InputType.Checkbox}
      />
      <LoadingButton
        type="submit"
        className="bg-primary disabled:bg-black disabled:opacity-50 transition-all text-white font-bold w-full py-3 shadow rounded-lg hover:scale-105"
        disabled={!termsOfUse || isButtonDisabled}
        // Show a cool spinner if a request is already being made
        isLoading={isSigningUp}
      >
        Finalizar cadastro
      </LoadingButton>
    </form>
  );
}

export default Step1;
