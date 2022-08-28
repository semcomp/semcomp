import { useState } from "react";
import { useRouter } from 'next/router';

import { toast } from "react-toastify";

import API from "../api";
import Footer from "../components/Footer";
import Header from "../components/header/index";
import Stepper from "../components/stepper/Stepper";
import Step0 from "../components/signup/step-0";
import Step1 from "../components/signup/step-1";
import Routes from "../routes";
import RequireNoAuth from "../libs/RequireNoAuth";
import { useAppContext } from "../libs/contextLib";
import BlockPage from "../libs/BlockPage";

function SignupPage() {
  const router = useRouter();
  const { setUser } = useAppContext();

  // Controls the current step on the form.
  const [step, setStep] = useState(0);

  // This state will hold the whole form value. The `setFormValue` function will
  // be passed to all steps components. Whenver an input in any step changes, they
  // should update the whole state by calling the `setFormValue` function with
  // the input's new value. Therefore, the `formValue` variable will always contain
  // all values given by all steps.
  const [formValue, setFormValue] = useState({} as any);

  // This is used to display a spinner on step1's submit button
  const [isSigningUp, setIsSigningUp] = useState(false);

  /**
   * Function called whenever a step ball is clicked by the user
   */
  function handleStepClick(newStep) {
    // Don't let the user do anything if it's sending a request.
    if (isSigningUp) return;

    // Execute validation if the user is trying to go the the next step
    if (step === 0 && newStep === 1) handleStep0Submit();
    else setStep(newStep);
  }

  function handleStep0Submit() {
    // Don't let the user do anything if it's sending a request.
    if (isSigningUp) return;

    // Extract values from the formValue state. They should've been set in the steps components.
    const { name, email, password } = formValue;

    // Some validation
    // TODO - move validation to a different file. Validation logic should be
    // separated from form logic
    if (!name) return toast.error("Você deve fornecer um nome!");
    else if (name.length < 3)
      return toast.error("O seu nome deve ter pelo menos três caracteres!");
    else if (!email) return toast.error("Você deve fornecer um e-mail!");
    else if (email.indexOf("@") === -1)
      return toast.error("Você deve fornecer e-mail válido!");
    else if (!password) return toast.error("Você deve fornecer uma senha!");
    else if (password.length < 8)
      return toast.error("A sua senha deve ter pelo menos 8 caracteres!");

    // Wooho! next step!
    setStep(1);
  }

  async function handleStep1Submit() {
    // Don't let the user do anything if it's sending a request.
    if (isSigningUp) return;

    const { telegram, course, discord, isStudent } = formValue;

    // Some validation
    // TODO - move validation to a different file. Validation logic should be
    // separated from form logic
    if (isStudent && !course)
      return toast.error("Você deve fornecer um curso se for estudante!");
    // A Discord tag always appears as username#discriminator, where a discriminator has 4 digits.
    if (
      discord &&
      (discord.indexOf("#") === -1 ||
        discord.substr(discord.indexOf("#") + 1).length !== 4 ||
        isNaN(discord.substr(discord.indexOf("#") + 1)))
    )
      return toast.error("Você deve fornecer uma tag do Discord válida!");

    // Extract values from the formValue state. They should've been set in the steps components.
    const { name, email, password, canShareData, disabilities } = formValue;

    try {
      // Show spinner
      setIsSigningUp(true);

      const userInfo = {
        name,
        email,
        password,
        permission: canShareData,
        telegram,
        course,
        discord,
        disabilities,
        isStudent,
      };

      const { data } = await API.signup(userInfo);
      setUser(data);
      router.push(Routes.home);
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
    <div className="signup-page-container">
      <Header />
      <main className="main-container">
        <div className="card">
          <h1>Cadastrar</h1>
          <div className="stepper-container">
            <Stepper
              numberOfSteps={2}
              activeStep={step}
              onStepClick={handleStepClick}
            />
          </div>

          {/* Renders the correct form according to the current step */}
          {stepComponent}
        </div>
        <aside>
          Ficamos muito felizes por se interessar em nosso evento!
          <br /> <br />A Semcomp é 100% construída e pensada por alunos dos cursos de<strong> Ciências de Computação</strong> e de<strong> Sistemas de Informação</strong> do campus <strong>São Carlos da Universidade de São Paulo</strong>. Todo ano realizamos um evento presencial cheio de palestras, minicursos, concursos, diversão e muita comida!
          <br />
          <br />
          Por conta da pandemia, a Semcomp ocorreu no formato remoto durante os dois últimos anos, porém agora teremos nosso grande retorno presencial! Esperamos que todos se divirtam bastante! Para mais informações, basta seguir a Semcomp no Instagram <a className="social-links" href="https://instagram.com/semcomp" rel="noopnener">(@semcomp)</a> e no <a className="social-links" href="https://t.me/semcomp_avisos" rel="noopnener" >Telegram</a> (https://t.me/semcomp_avisos). <br />
          <br />
          Com carinho, Equipe Semcomp!
        </aside>
      </main>
      <Footer />
    </div>
  );
}

export default BlockPage(RequireNoAuth(SignupPage));
