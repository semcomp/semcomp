import { useEffect, useState } from "react";
import { useRouter } from "next/router";

import { toast } from "react-toastify";

import API from "../api";
import ArrowIcon from "@mui/icons-material/ArrowBackIosNewRounded";
import Navbar from "../components/navbar";
import Sidebar from "../components/sidebar";
import Stepper from "../components/stepper/Stepper";
import Step0 from "../components/signup/Step0";
import Step1 from "../components/signup/Step1";
import Routes from "../routes";
import RequireNoAuth from "../libs/RequireNoAuth";
import { useAppContext } from "../libs/contextLib";
import Link from "next/link";
import PrivacyPolicyModal from "../components/signup/PrivacyPolicyModal";
import handler from "../api/handlers";
import SimpleBackground from "../components/home/SimpleBackground";
import { config } from "../config";
import Step2 from "../components/signup/Step2";

const STEPS = {
  BASIC_INFO: 0,
  PERSONAL_INFO: 1,
  CONFIRMATION_CODE: 2,
}

function SignupPage() {
  const router = useRouter();
  const { setUser } = useAppContext();

  //Parameters from url
  const [emailUrl, setEmailUrl] = useState('');
  // Privacy Policy  
  const [isPrivacyPolicyModalOpen, setIsPrivacyPolicyModalOpen] = useState(false);

  // Controls the current step on the form.
  const [step, setStep] = useState(STEPS.BASIC_INFO);


  //Get parameters from URL
  useEffect(() => {
    const urlSearchString = window.location.search;

    const params = new URLSearchParams(urlSearchString);

    setEmailUrl(params.get('email'));
    const newStep = parseInt(params.get('step'));
    if(!Number.isNaN(newStep)){
      setStep(STEPS.CONFIRMATION_CODE);
    }

    
  })

  // This state will hold the whole form value. The `setFormValue` function will
  // be passed to all steps components. Whenver an input in any step changes, they
  // should update the whole state by calling the `setFormValue` function with
  // the input's new value. Therefore, the `formValue` variable will always contain
  // all values given by all steps.
  const [formValue, setFormValue] = useState({
    name: "",
    email: "",
    password: "",
    telegram: "",
    phone: "",
    linkedin: "",
    isStudent: false,
    position: "",
    course: "",
    disabilities: [],
    permission: false,
    admissionYear: "",
    expectedGraduationYear: "",
    expectedGraduationSemester: "",
    institute: "",
    customCourse: "",
    customInstitute: "",
    extensionGroups: [],
  });

  //new form value for the last step of the signup.
  const [verificationFormValue, setVerificationFormValue] = useState({
    verificationCode: ""
  })

  // This is used to display a spinner on step1's submit button
  const [isSigningUp, setIsSigningUp] = useState(false);

  function handleStepClick(newStep) {
    // Don't let the user do anything if it's sending a request.
    if (isSigningUp) return;
    //Don't allow return if step=2;
    if (step == STEPS.CONFIRMATION_CODE) return;

    // Execute validation if the user is trying to go the the next step
    if (step === STEPS.BASIC_INFO && newStep === STEPS.PERSONAL_INFO) handleStep0Submit();

    if (step === STEPS.PERSONAL_INFO && newStep === STEPS.CONFIRMATION_CODE) handleStep1Submit();
    else setStep(newStep);
  }

  function handleGoBack() {
    setStep(STEPS.BASIC_INFO);
  }

  function handleStep0Submit() {
    // Don't let the user do anything if it's sending a request.
    if (isSigningUp) return;

    // Extract values from the formValue state. They should've been set in the steps components.
    const { name, email, password } = formValue;

    // Some validation
    if (!name) return toast.error("Você deve fornecer um nome!");
    else if (name.length < 3)
      return toast.error("O seu nome deve ter pelo menos três caracteres!");
    else if (!email) return toast.error("Você deve fornecer um e-mail!");
    else if (email.indexOf("@") === -1)
      return toast.error("Você deve fornecer e-mail válido!");
    else if (!password) return toast.error("Você deve fornecer uma senha!");
    else if (password.length < 8)
      return toast.error("A sua senha deve ter pelo menos 8 caracteres!");

    setStep(STEPS.PERSONAL_INFO);
  }

  //Extract form Values
  //Adds user to the database
  //Send email with verification code
  async function handleStep1Submit() {
    // Don't let the user do anything if it's sending a request.
    if (isSigningUp) return;

    const {
      telegram,
      course,
      isStudent,
      admissionYear,
      expectedGraduationYear,
      expectedGraduationSemester,
      institute,
      customCourse,
      position,
      phone,
      linkedin,
      customInstitute,
      extensionGroups,
    } = formValue;

    // Some validation
    // TODO - move validation to a different file. Validation logic should be
    // separated from form logic
    if (isStudent && !course)
      return toast.error("Você deve fornecer um curso se for estudante!");

    if (isStudent && !admissionYear)
      return toast.error(
        "Você deve fornecer o ano de ingresso se for estudante!"
      );

    if (isStudent && !expectedGraduationYear)
      return toast.error(
        "Você deve fornecer o ano de formação esperado se for estudante!"
      );

    if (isStudent && !expectedGraduationSemester) {
      return toast.error(
        "Você deve selecionar o semestre de formação esperado!"
      );
    }

    if (isStudent && !institute)
      return toast.error("Você deve selecionar o instituto se for estudante!");

    if (isStudent && admissionYear) {
      const currentYear = new Date().getFullYear();
      const year = parseInt(admissionYear);

      if (year < 1900 || year > currentYear + 1) {
        return toast.error("Por favor, forneça um ano de ingresso válido!");
      }
    }

    if (isStudent && expectedGraduationYear) {
      const currentYear = new Date().getFullYear();
      const year = parseInt(expectedGraduationYear);

      if (year < currentYear || year > currentYear + 10) {
        return toast.error("Por favor, forneça um ano de formação válido!");
      }
    }

    if (isStudent && admissionYear && expectedGraduationYear) {
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

      if (graduation - admission > 10) {
        return toast.error(
          "O período de formação parece muito longo. Verifique os anos novamente!"
        );
      }

      if (isStudent && course === "Outro" && !customCourse) {
        return toast.error("Por favor, especifique o nome do curso!");
      }

      if (isStudent && institute === "Outro" && !customInstitute) {
        return toast.error("Por favor, especifique o nome do instituto!");
      }

      if (isStudent && course === "Outro" && customCourse) {
        if (customCourse.length < 3) {
          return toast.error(
            "O nome do curso deve ter pelo menos 3 caracteres!"
          );
        }
      }

      if (isStudent && institute === "Outro" && customInstitute) {
        if (customInstitute.length < 4) {
          return toast.error(
            "O nome do instituto deve ter pelo menos 4 caracteres!"
          );
        }
      }
    }

    // Extract values from the formValue state. They should've been set in the steps components.
    const { name, email, password, disabilities, permission } = formValue;

    try {
      // Show spinner
      setIsSigningUp(true);

      const finalCourse = course === "Outro" ? customCourse : course;
      const finalInstitute =
        institute === "Outro" ? customInstitute : institute;

      const userInfo = {
        name,
        email,
        password,
        permission,
        telegram,
        course: isStudent ? finalCourse : null,
        disabilities,
        isStudent,
        additionalInfos: {
          position: !isStudent ? position : null,
          phone: isStudent ? phone : null,
          linkedin: isStudent ? linkedin : null,
          admissionYear: isStudent ? admissionYear : null,
          expectedGraduationYear: isStudent ? expectedGraduationYear : null,
          expectedGraduationSemester: isStudent ? expectedGraduationSemester : null,
          institute: isStudent ? finalInstitute : null,
          extensionGroups: isStudent ? extensionGroups : null,
        },
      };

      const { data } = await API.signup(userInfo);
      localStorage.setItem("user", JSON.stringify(data));

      setStep(STEPS.CONFIRMATION_CODE); // If successful, go to next step
    } catch (e) {
      // Note: this catch don't really have to treat the errors because the API
      // already has network error treatment.
      console.error(e);
    } finally {
      // Hide spinner
      setIsSigningUp(false);
    }
  }

  async function handleStep2Submit() {
    // Don't let the user do anything if it's sending a request.
    if (isSigningUp) return;

    const { verificationCode } = verificationFormValue;
    let { email } = formValue;

    if (!verificationCode)
      return toast.error("Você deve fornecer um código de verificação!");

    //VERIFIES IF THE CODE INPUTED IS THE SAME AS THE ONE SENT IN THE EMAIL
    try {
      setIsSigningUp(true); // Sets the state to show the spinner
      
      if (emailUrl != null) email = emailUrl;
      const { data } = await API.confirmVerificationCode(email, verificationCode);
      localStorage.setItem("user", JSON.stringify(data));
      setUser(data);
      router.push(Routes.profile);
    } catch (e) {
      // Note that any networking errors should have benn handled by the API object,
      // and therefore, won't need to be handled here.
      console.error(e);
    } finally {

      setIsSigningUp(false); // Sets the state to hide the spinner

    }
  }

  function updateFormValue(newValue) {
    setFormValue({ ...formValue, ...newValue });
  }

  function updateVerificationFormValue(newValue) {
    setVerificationFormValue({ ...formValue, ...newValue });
  }

  /**
   * This is the component that will be rendered according to the current step.
   */
  const stepComponent = [
    <Step0
      key={STEPS.BASIC_INFO}
      formValue={formValue}
      onSubmit={handleStep0Submit}
      updateFormValue={updateFormValue}
    />,
    <Step1
      key={STEPS.PERSONAL_INFO}
      formValue={formValue}
      onSubmit={handleStep1Submit}
      updateFormValue={updateFormValue}
      // This is sent so the step can display a cool spinner on it's button.
      isSigningUp={isSigningUp}
      openPrivacyPolicyModal={setIsPrivacyPolicyModalOpen}
    />,
    <Step2
      key={STEPS.CONFIRMATION_CODE}
      formValue={verificationFormValue}
      onSubmit={handleStep2Submit}
      updateFormValue={updateVerificationFormValue}
      isSigningUp={isSigningUp}
    />,

  ][step];

  //Get the information from 'config' to check if signup is enabled
  const [openSignup, setOpenSignup] = useState(true);
  async function fetchData() {
    try {
      const config = await handler.config.getConfig().then((res) => res.data);
      setOpenSignup(config.openSignup);
    } catch (error) {
      toast.error("Erro ao buscar dados de configuração");
    }
  }

  useEffect(() => {
    fetchData();
  }, []);

  return (<>
    <div className="flex flex-col min-h-screen md:h-full">
      <Navbar />
      <Sidebar />
      <SimpleBackground />
      <main className={`flex justify-center flex-1 w-full md:h-full md:text-sm tablet:text-xl phone:text-xs md:items-center relative z-10`}>
        {isPrivacyPolicyModalOpen && (
          <PrivacyPolicyModal
            onRequestClose={() => setIsPrivacyPolicyModalOpen(false)}
          />
        )}

        <div className="flex flex-col items-center justify-center md:w-[50%] shadow-md phone:w-full backdrop-brightness-95 backdrop-blur z-20 rounded-lg">
          <div className="h-full items-center justify-center font-secondary phone:mt-16 backdrop-brightness-90 backdrop-blur z-20 md:w-[70%] md:p-9 md:pb-2 tablet:p-20 md:rounded-none tablet:rounded-lg tablet:max-w-[700px] tablet:min-w-[500px] phone:p-9 phone:w-full">
            {step > STEPS.BASIC_INFO && (
              <div className="flex items-center justify-center hover:bg-[#E6E6E6] hover:bg-opacity-50 p-2 rounded-lg h-fit w-fit z-20 cursor-pointer">
                <ArrowIcon
                  onClick={handleGoBack}
                  sx={{ mr: 0.5 }}
                />
              </div>
            )}

            {
              /* What appears on the screen depends on whether signup is enabled */
              openSignup ?
                (
                  <>
                    <h1 className="text-2xl text-center text-white font-secondary tablet:text-3xl">Cadastrar</h1>
                    <div className="flex items-center justify-center w-full">
                      <div className="w-full max-w-xs ">
                        <Stepper
                          numberOfSteps={3}
                          activeStep={step}
                          onStepClick={handleStepClick}
                          activeColor="#2840BD"
                          unactiveColor="#E8E8E8"
                        />
                      </div>
                    </div>
                    <div className="text-white pb-6">
                      {/* Renders the correct form according to the current step */}
                      {stepComponent}
                    </div>
                    {/* <section className="z-20 text-center text-white md:pt-12 tablet:pt-20 phone:pt-8 tablet:text-base"> */}
                    <section className="fixed bottom-0 left-0 md:static md:pt-6 tablet:static tablet:pt-6 w-full text-center text-white">
                      <p>© Semcomp {config.YEAR}. Todos os direitos reservados.</p>
                      <p className="mt-3 mb-6 text-xs cursor-pointer hover:text-secondary">
                        {step < STEPS.PERSONAL_INFO && (<span tabIndex={STEPS.BASIC_INFO} onClick={() => setIsPrivacyPolicyModalOpen(true)}>
                          <u>Política de Privacidade</u>
                        </span>
                        )}
                      </p>
                    </section>
                  </>
                ) :
                (
                  <div className="my-12 text-center text-white">
                    <h1 className="text-4xl">Inscrições Encerradas! </h1>
                    <div className="text-xl">
                      <p>Caso você tenha uma conta, clique
                        <Link href="/login">
                          <a className="text-blue-700 hover:text-blue-500 visited:bg-none">
                            aqui
                          </a>
                        </Link>
                      </p>
                    </div>
                  </div>

                )
            }
          </div>
        </div>
      </main>
      {/* <Footer /> */}
    </div>
  </>
  );
}

export default RequireNoAuth(SignupPage);
