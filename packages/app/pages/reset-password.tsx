import React from "react";

import { toast } from "react-toastify";

import API from "../api";
import Sidebar from '../components/sidebar';
import Stepper from "../components/stepper/Stepper";
import Step0 from "../components/reset-password/Step0";
import Step1 from "../components/reset-password/Step1";
import Step2 from "../components/reset-password/Step2";
import { useAppContext } from "../libs/contextLib";
import Navbar from "../components/navbar";
import SimpleBackground from "../components/home/SimpleBackground";

function ResetPassword() {
  // Controls the current step on the form.
  const [step, setStep] = React.useState(0);

  const { setUser } = useAppContext();

  // This state will hold the whole form value. The `setFormValue` function will
  // be passed to all steps components. Whenver an input in any step changes, they
  // should update the whole state by calling the `setFormValue` function with
  // the input's new value. Therefore, the `formValue` variable will always contain
  // all values given by all steps.
  const [formValue, setFormValue] = React.useState({} as any);

  // This is used to display a spinner on step's submit button
  const [isSendingCode, setIsSendingCode] = React.useState(false);
  const [isResetingPassword, setIsResetingPassword] = React.useState(false);

  /**
   * Function called whenever a step ball is clicked by the user
   */
  function handleStepClick(newStep) {
    // Don't let the user do anything if it's sending a request.
    if (isSendingCode || isResetingPassword) return;

    // Execute validation if the user is trying to go the the next step
    if (step === 0 && newStep > 0) handleStep0Submit();
    else if (step === 1 && newStep > 1) handleStep1Submit();
    else setStep(newStep);
  }

  async function handleStep0Submit() {
    // Don't let the user do anything if it's sending a request.
    if (isSendingCode || isResetingPassword) return;

    // Extract values from the formValue state. They should've been set in the steps components.
    const { email } = formValue;

    // Some validation
    // TODO - move validation to a different file. Validation logic should be
    // separated from form logic
    if (!email) return toast.error("Você deve fornecer um e-mail!");
    else if (email.indexOf("@") === -1)
      return toast.error("Você deve fornecer e-mail válido!");

    try {
      setIsSendingCode(true); // Sets the state to show the spinner
      await API.forgotPassword(email);
      setStep(1); // If successful, go to next step
    } catch (e) {
      // Note that any networking errors should have benn handled by the API object,
      // and therefore, won't need to be handled here.
      console.error(e);
      toast.error("O serviço de e-mail está indisponível no momento. Tente novamente mais tarde");
    } finally {
      setIsSendingCode(false); // Sets the state to hide the spinner
    }
  }

  async function handleStep1Submit() {
    // Don't let the user do anything if it's sending a request.
    if (isSendingCode || isResetingPassword) return;

    const { email, code, newPassword } = formValue;

    // Some validation
    // TODO - move validation to a different file. Validation logic should be
    // separated from form logic
    if (!code)
      return toast.error("Você deve fornecer um código de verificação!");
    else if (!newPassword) return toast.error("Você deve fornecer uma senha!");
    else if (newPassword.length < 8)
      return toast.error("Sua senha deve ter no mínimo 8 caracteres!");

    // TODO - make a request to reset the password
    try {
      setIsResetingPassword(true); // Sets the state to show the spinner
      const { data } = await API.resetPassword(email, code, newPassword);
      setUser(data);
      localStorage.setItem("user", JSON.stringify(data));
      setStep(2); // If successful, go to next step
    } catch (e) {
      // Note that any networking errors should have benn handled by the API object,
      // and therefore, won't need to be handled here.
      console.error(e);
    } finally {
      setIsResetingPassword(false); // Sets the state to hide the spinner
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
      // This is sent so the step can display a cool spinner on it's button.
      isSendingCode={isSendingCode}
    />,
    <Step1
      key={1}
      formValue={formValue}
      onSubmit={handleStep1Submit}
      updateFormValue={updateFormValue}
      isResetingPassword={isResetingPassword}
    />,
    <Step2 key={2} />,
  ][step];

  return (
    <div className="flex flex-col min-h-screen md:h-full">
      <Navbar />
      <Sidebar />
      <SimpleBackground />
      <main className="flex justify-center flex-1 w-full md:h-full md:text-sm tablet:text-xl phone:text-xs md:items-center relative z-10">
        <div className="flex flex-col items-center justify-center md:w-[50%] mobile:w-full backdrop-brightness-95 backdrop-blur z-20 rounded-lg">
          <div className="items-center justify-center h-fit md:w-[70%] md:p-9 tablet:p-12 phone:p-9 font-secondary tablet:rounded-lg phone:w-full backdrop-brightness-90 backdrop-blur z-20">
            <h1 className="text-2xl text-center text-white font-secondary tablet:text-3xl">Recuperar senha</h1>
            <div className="w-full flex justify-center">
            <div className="w-full max-w-xs">
              <Stepper
                numberOfSteps={3}
                activeStep={step}
                onStepClick={handleStepClick}
                  activeColor="#2840BD"
                  unactiveColor="#E8E8E8"
              />
              </div>
            </div>
            {/* Renders the correct form according to the current step */}
            <div className="text-white">
            {stepComponent}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

export default ResetPassword;
