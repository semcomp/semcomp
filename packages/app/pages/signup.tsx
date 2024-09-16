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
import Routes from "../routes";
import RequireNoAuth from "../libs/RequireNoAuth";
import { useAppContext } from "../libs/contextLib";
import Link from "next/link";
import PrivacyPolicyModal from "../components/signup/PrivacyPolicyModal";
import handler from '../api/handlers';
import AnimatedBG from "./animatedBG";

// Array com os intervalos de horas e seus respectivos índices de imagens
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

function SignupPage() {
  const router = useRouter();
  const { setUser } = useAppContext();
  
  // State to manage image index based on time
  const [imageIndex, setImageIndex] = useState<number>(10);

  // State to control background visibility
  const [bgVisible, setBgVisible] = useState(true);

  // Privacy Policy  
  const [isPrivacyPolicyModalOpen, setIsPrivacyPolicyModalOpen] = useState(false);

  // Controls the current step on the form.
  const [step, setStep] = useState(0);

  // State to hold form values
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

  // State for displaying a spinner on step1's submit button
  const [isSigningUp, setIsSigningUp] = useState(false);

  // Fetch open signup status from config
  const [openSignup, setOpenSignup] = useState(true);

  async function fetchData() {
    try {
      const config = await handler.config.getConfig().then((res) => res.data);
      setOpenSignup(config.openSignup); 
    } catch (error) {
      toast.error('Erro ao buscar dados de configuração');
    }
  }

  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    // Calculate image index based on current time
    const currentHour = new Date().getHours();
    const matchedImage = timeToImage.find(({ start, end }) => currentHour >= start && currentHour < end);
    setImageIndex(matchedImage?.imgIndex ?? 10);
  }, []);

  // Handle window resize to hide background if width is less than 640px
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 640) {
        setBgVisible(false);
      } else {
        setBgVisible(true);
      }
    };

    // Add resize event listener
    window.addEventListener("resize", handleResize);

    // Check initial window width
    handleResize();

    // Cleanup event listener on unmount
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  function handleStepClick(newStep) {
    if (isSigningUp) return;

    if (step === 0 && newStep === 1) handleStep0Submit();
    else setStep(newStep);
  }

  function handleGoBack() {
    setStep(0);
  }

  function handleStep0Submit() {
    if (isSigningUp) return;

    const { name, email, password } = formValue;

    if (!name) return toast.error("Você deve fornecer um nome!");
    else if (name.length < 3) return toast.error("O seu nome deve ter pelo menos três caracteres!");
    else if (!email) return toast.error("Você deve fornecer um e-mail!");
    else if (email.indexOf("@") === -1) return toast.error("Você deve fornecer e-mail válido!");
    else if (!password) return toast.error("Você deve fornecer uma senha!");
    else if (password.length < 8) return toast.error("A sua senha deve ter pelo menos 8 caracteres!");

    setStep(1);
  }

  async function handleStep1Submit() {
    if (isSigningUp) return;

    const { telegram, course, isStudent } = formValue;

    if (isStudent && !course) return toast.error("Você deve fornecer um curso se for estudante!");

    const { name, email, password, disabilities, permission } = formValue;

    try {
      setIsSigningUp(true);

      const userInfo = {
        name, email, password, permission, telegram, course, disabilities, isStudent,
      };

      const { data } = await API.signup(userInfo);
      localStorage.setItem("user", JSON.stringify(data));
      setUser(data);
      router.push(Routes.profile);
    } catch (e) {
      console.error(e);
    } finally {
      setIsSigningUp(false);
    }
  }

  function updateFormValue(newValue) {
    setFormValue({ ...formValue, ...newValue });
  }

  const stepComponent = [
    <Step0 key={0} formValue={formValue} onSubmit={handleStep0Submit} updateFormValue={updateFormValue} />,
    <Step1 key={1} formValue={formValue} onSubmit={handleStep1Submit} updateFormValue={updateFormValue} isSigningUp={isSigningUp} />,
  ][step];

  return (
    <div className="flex flex-col justify-between min-h-screen">
      <Navbar />
      <Sidebar />
      <main className="flex flex-1 w-full md:h-full">
        {/* Conditionally render the AnimatedBG component based on bgVisible */}
        {bgVisible && <AnimatedBG imageIndex={imageIndex} />}
        <div className="z-40 flex flex-col items-center justify-center w-full min-h-screen">
          <div className="items-center justify-center font-secondary bg-white h-fit phone:mt-12 md:w-[70%] md:p-9 tablet:p-12 rounded-lg tablet:max-w-[700px] tablet:min-w-[500px] phone:p-9 phone:w-full">
            {step > 0 && (
              <div className="flex items-center justify-center hover:bg-[#E6E6E6] p-2 rounded-lg h-fit w-fit ">
                <ArrowIcon onClick={handleGoBack} sx={{ mr: 0.5 }} />
              </div>
            )}
            {isPrivacyPolicyModalOpen && (
              <PrivacyPolicyModal onRequestClose={() => setIsPrivacyPolicyModalOpen(false)} />
            )}

            {openSignup ? (
              <>
                <h1 className="text-2xl text-center font-secondary tablet:text-3xl">Cadastrar</h1>
                <div className="flex items-center justify-center w-full">
                  <div className="w-full max-w-xs">
                    <Stepper numberOfSteps={2} activeStep={step} onStepClick={handleStepClick} />
                  </div>
                </div>

                {stepComponent}
                <section className="text-center md:pt-12 tablet:pt-20 phone:pt-8 tablet:text-base">
                  <p>© Semcomp 2024. Todos os direitos reservados.</p>
                  <p className="mt-3 mb-6 text-xs cursor-pointer hover:text-primary">
                    {step < 1 && (
                      <span tabIndex={0} onClick={() => setIsPrivacyPolicyModalOpen(true)}>
                        <u>Política de Privacidade</u>
                      </span>
                    )}
                  </p>
                </section>
              </>
            ) : (
              <>
                <h1 className="text-xl">Inscrições Encerradas!</h1>
                <p>
                  Caso você tenha uma conta, clique{" "}
                  <Link href="/login">
                    <a className="text-blue-700 hover:text-blue-500 visited:bg-none">aqui</a>
                  </Link>
                </p>
              </>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}

export default RequireNoAuth(SignupPage);