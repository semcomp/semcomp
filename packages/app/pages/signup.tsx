import { useState } from "react";
import { useRouter } from "next/router";

import { toast } from "react-toastify";

import API from "../api";
import ArrowIcon from "@mui/icons-material/ArrowBackIosNewRounded";
import Footer from "../components/Footer";
import Navbar from "../components/navbar";
import Sidebar from '../components/sidebar';
import Stepper from "../components/stepper/Stepper";
import Step0 from "../components/signup/Step0";
import Step1 from "../components/signup/Step1";
import Card from "../components/Card";
import Routes from "../routes";
import RequireNoAuth from "../libs/RequireNoAuth";
import { useAppContext } from "../libs/contextLib";
import Link from "next/link";
import PrivacyPolicyModal from "../components/signup/PrivacyPolicyModal";

function SignupPage() {
  const router = useRouter();
  const { setUser } = useAppContext();
  
  // Privacy Policy  
  const [isPrivacyPolicyModalOpen, setIsPrivacyPolicyModalOpen] = useState(false);

  // Controls the current step on the form.
  const [step, setStep] = useState(0);

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
    isStudent: false,
    course: "",
    disabilities: [],
    permission: false
  });

  // This is used to display a spinner on step1's submit button
  const [isSigningUp, setIsSigningUp] = useState(false);

  function handleStepClick(newStep) {
    // Don't let the user do anything if it's sending a request.
    if (isSigningUp) return;

    // Execute validation if the user is trying to go the the next step
    if (step === 0 && newStep === 1) handleStep0Submit();
    else setStep(newStep);
  }

  function handleGoBack() {
    setStep(0);
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

    setStep(1);
  }

  async function handleStep1Submit() {
    // Don't let the user do anything if it's sending a request.
    if (isSigningUp) return;

    const { telegram, course, isStudent } = formValue;

    // Some validation
    // TODO - move validation to a different file. Validation logic should be
    // separated from form logic
    if (isStudent && !course)
      return toast.error("Você deve fornecer um curso se for estudante!");

    // Extract values from the formValue state. They should've been set in the steps components.
    const { name, email, password, disabilities, permission } = formValue;

    try {
      // Show spinner
      setIsSigningUp(true);

      const userInfo = {
        name,
        email,
        password,
        permission,
        telegram,
        course,
        disabilities,
        isStudent,
      };

      const { data } = await API.signup(userInfo);
      localStorage.setItem("user", JSON.stringify(data));
      setUser(data);
      router.push(Routes.profile);
    } catch (e) {
      // Note: this catch don't really have to treat the errors because the API
      // already has network error treatment.
      console.error(e);
    } finally {
      // Hide spinner
      setIsSigningUp(false);
    }
  }

  function updateFormValue(newValue) {
    setFormValue({ ...formValue, ...newValue });
  }

  /**
   * This is the component that will be rendered according to the current step.
   */
  const stepComponent = [
    <Step0
      key={0}
      formValue={formValue}
      onSubmit={handleStep0Submit}
      updateFormValue={updateFormValue}
    />,
    <Step1
      key={1}
      formValue={formValue}
      onSubmit={handleStep1Submit}
      updateFormValue={updateFormValue}
      // This is sent so the step can display a cool spinner on it's button.
      isSigningUp={isSigningUp}
    />,
  ][step];

  return (
    <div className="flex flex-col justify-between min-h-screen">
      <Navbar />
      <Sidebar />
      <main className="flex w-full flex-1 md:h-full md:bg-white md:text-sm tablet:text-xl phone:text-xs mobile:bg-[url('../assets/27-imgs/login-bg.png')] mobile:bg-cover">
        <div className="flex flex-col items-center justify-center md:w-[80%] mobile:w-full">
          <div className="items-center justify-center font-secondary bg-white h-fit md:w-[70%] md:p-9 tablet:p-12 md:rounded-none tablet:rounded-lg tablet:max-w-[700px] tablet:min-w-[500px] phone:p-9 phone:w-full">
            { step > 0 && (
              <div className="flex items-center justify-center hover:bg-[#E6E6E6] p-2 rounded-lg h-fit w-fit">
                <ArrowIcon 
                  onClick={handleGoBack}
                  sx={{ mr: 0.5 }} 
                />
              </div>
            )}
            {isPrivacyPolicyModalOpen && (
                <PrivacyPolicyModal
                  onRequestClose={() => setIsPrivacyPolicyModalOpen(false)}
                />
              )}
            {/* <h1 className="text-xl">Inscrições Encerradas! </h1>
            <p>Caso você tenha uma conta, clique
            <Link href="/login">
              <a className="text-blue-700 hover:text-blue-500 visited:bg-none">
                 aqui
              </a>
            </Link>
            </p> */}
            
            <h1 className="text-2xl font-secondary text-center tablet:text-3xl">Cadastrar</h1>
              <div className="flex items-center justify-center w-full">
                <div className="w-full max-w-xs ">
                  <Stepper
                    numberOfSteps={2}
                    activeStep={step}
                    onStepClick={handleStepClick}
                  />
                </div>
              </div>

              {/* Renders the correct form according to the current step */}
              {stepComponent}
              <section className="text-center md:pt-12 tablet:pt-20 phone:pt-8">
                <p>© Semcomp 2024. Todos os direitos reservados.</p>
                <p className="mt-3 mb-6 hover:text-primary text-xs cursor-pointer">
                    { step < 1 && (<span tabIndex={0} onClick={() => setIsPrivacyPolicyModalOpen(true)}>
                      <u>Política de Privacidade</u>
                    </span>
                  )}
                </p>
              </section>
          </div>
        </div>
        <div id="info-semcomp" className="md:flex flex-col items-center phone:hidden tablet:hidden w-full justify-center bg-[url('../assets/27-imgs/login-bg.png')] bg-cover bg-no-repeat">
          <Card className="max-w-md m-8 px-12 py-20 text-sm font-secondary text-justify bg-white rounded-md">
          <aside className="max-w-base">
                <p className="text-xl text-center m-0 p-4">Obrigado por se interessar no nosso evento!</p> 
                <br />A Semcomp é
                100% construída e pensada por alunos da{" "}
                <strong>Universidade de São Paulo, do campus São Carlos</strong>,
                dos cursos de{" "}
                <strong>Sistemas de informação e Ciências da Computação</strong>.
                Ela ocorre todo ano no
                <strong>
                  {" "}
                  ICMC - Instituto de Ciências Matemáticas e Computação
                </strong>
                , um evento presencial cheio de palestras, minicursos, aprendizado e
                muita comida.
                <br />
                <br />
                Esperamos que todos vocês gostem e aguardem para mais informações.{" "}
                <br />
                <br />
                Com carinho, Equipe Semcomp!
              </aside>
          </Card>
        </div>
      </main>
      {/* <Footer /> */}
    </div>
  );
}

export default RequireNoAuth(SignupPage);
