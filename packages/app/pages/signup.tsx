import { useEffect, useState } from "react";
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
import handler from '../api/handlers';
import AnimatedBG from "./animatedBG";

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
    permission: false,
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

  const [imageIndex, setImageIndex] = useState<number>(10);

  const timeToImage = [
    { start: 5, end: 7, imgIndex: 0 },
    { start: 7, end: 8, imgIndex: 1 },
    { start: 8, end: 10, imgIndex: 2 },
    { start: 10, end: 12, imgIndex: 3 },
    { start: 12, end: 14, imgIndex: 4 },
    { start: 14, end: 16, imgIndex: 5 },
    { start: 16, end: 17, imgIndex: 6 },
    { start: 17, end: 18, imgIndex: 7 },
    { start: 18, end: 19, imgIndex: 8 },
    { start: 19, end: 22, imgIndex: 9 },
    { start: 0, end: 5, imgIndex: 10 },
  ];

  const getTextColor = (timeIndex: number): string => {
    if (timeIndex > 7) return "yellow";
    if (timeIndex === 7) return "white";
    if (timeIndex > 2) return "blue";
    if (timeIndex === 2) return "primary";
    if (timeIndex === 1) return "white";
    if (timeIndex === 0) return "white";
  };

  const getBgColor = (timeIndex: number): string => {
    if (timeIndex > 7) return "yellow";
    if (timeIndex >= 0) return "primary";
  };

  const getBgTextColor = (timeIndex: number): string => {
    if (timeIndex > 7) return "primary";
    if (timeIndex >= 0) return "white";
  };


  useEffect(() => {
    const currentHour = new Date().getHours();
    const matchedImage = timeToImage.find(({ start, end }) => currentHour >= start && currentHour < end);
    setImageIndex(
      // 9
      matchedImage?.imgIndex ?? 10,
    );
  }, []);

  //Get the information from 'config' to check if signup is enabled
  const [openSignup, setOpenSignup] = useState(true);
  async function fetchData() {
    try {
      const config = await handler.config.getConfig().then((res) => res.data);
      //console.log(config);
      setOpenSignup(config.openSignup); 
    } catch (error) {
        toast.error('Erro ao buscar dados de configuração');
    }
  }

  useEffect(() => {
      fetchData();
  }, []);

  return (<>
    <div className="flex flex-col min-h-screen md:h-full">
      <Navbar />
      <Sidebar />
      <AnimatedBG imageIndex={imageIndex} />
      <main className={`flex justify-center flex-1 w-full md:h-full md:bg-white md:text-sm tablet:text-xl phone:text-xs md:items-center`}>
        <div className="flex flex-col items-center justify-center md:w-[50%] shadow-md phone:w-full backdrop-brightness-95 backdrop-blur z-20 rounded-lg">
          <div className="h-full items-center justify-center font-secondary phone:mt-12 backdrop-brightness-90 backdrop-blur z-20 md:w-[70%] md:p-9 md:pb-2 tablet:p-12 md:rounded-none tablet:rounded-lg tablet:max-w-[700px] tablet:min-w-[500px] phone:p-9 phone:w-full">
            { step > 0 && (
              <div className="flex items-center justify-center hover:bg-[#E6E6E6] hover:bg-opacity-50 p-2 rounded-lg h-fit w-fit z-20 cursor-pointer">
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
            
            {
              /* What appears on the screen depends on whether signup is enabled */
              openSignup?
              (
                <>
                  <h1 className={`text-2xl text-center text-${getTextColor(imageIndex)} font-secondary tablet:text-3xl `}>Cadastrar</h1>
                  <div className="flex items-center justify-center w-full">
                    <div className="w-full max-w-xs ">
                      <Stepper
                        numberOfSteps={2}
                        activeStep={step}
                        onStepClick={handleStepClick}
                        activeColor={getBgColor(imageIndex)}
                        unactiveColor={getBgTextColor(imageIndex)}
                      />
                    </div>
                  </div>
                  <div className={`text-${getTextColor(imageIndex)}`}>
                    {/* Renders the correct form according to the current step */}
                    {stepComponent}
                  </div>
                  <section className={`z-20 text-center text-${getTextColor(imageIndex)} md:pt-12 tablet:pt-20 phone:pt-8 tablet:text-base`}>
                    <p>© Semcomp 2024. Todos os direitos reservados.</p>
                    <p className={`mt-3 mb-6 text-xs cursor-pointer hover:text-${getBgColor(imageIndex)}`}>
                        { step < 1 && (<span tabIndex={0} onClick={() => setIsPrivacyPolicyModalOpen(true)}>
                          <u>Política de Privacidade</u>
                        </span>
                      )}
                    </p>
                  </section>
                </>
              ):
              (
                <>
                  <h1 className="text-xl">Inscrições Encerradas! </h1>
                  <p>Caso você tenha uma conta, clique
                  <Link href="/login">
                    <a className="text-blue-700 hover:text-blue-500 visited:bg-none">
                       aqui
                    </a>
                  </Link>
                  </p>
                </>
                
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