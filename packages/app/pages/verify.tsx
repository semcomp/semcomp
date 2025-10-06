import { useEffect, useState } from "react";
import { useRouter } from "next/router";

import { toast } from "react-toastify";

import Navbar from "../components/navbar";
import Sidebar from "../components/sidebar";
import SimpleBackground from "../components/home/SimpleBackground";
import Step2 from "../components/signup/Step2";
import Routes from "../routes";
import { useAppContext } from "../libs/contextLib";
import API from "../api";

function VerifyPage() {
  const router = useRouter();
  const { setUser } = useAppContext();

  const [isSigningUp, setIsSigningUp] = useState(false);
  const [formValue, setFormValue] = useState({
    email: "",
    verificationCode: "",
  });

  // Prefill email via query
  useEffect(() => {
    if (!router.isReady) return;
    try {
      const url = new URL(router.asPath, window.location.origin);
      const email = url.searchParams.get("email") ?? "";

      if (email) {
        setFormValue((v) => ({ ...v, email }));
      }
    } catch {
        console.log('Não foi possível recuperar os dados a partir da URL');
    }
  }, [router.isReady, router.asPath]);

  function updateFormValue(newValue) {
    setFormValue({ ...formValue, ...newValue });
  }

  async function handleSubmit() {
    if (isSigningUp) return;
    const { email, verificationCode } = formValue;

    if (!email) return toast.error("Informe seu e-mail para confirmar o código.");
    if (!verificationCode) return toast.error("Você deve fornecer um código de verificação!");

    try {
      setIsSigningUp(true);
      const { data } = await API.confirmVerificationCode(email, verificationCode);
      localStorage.setItem("user", JSON.stringify(data));
      setUser(data);
      router.push(Routes.profile);
    } catch (e) {
      console.error(e);
    } finally {
      setIsSigningUp(false);
    }
  }

  return (
    <div className="flex flex-col min-h-screen md:h-full">
      <Navbar />
      <Sidebar />
      <SimpleBackground />
      <main className={`flex justify-center flex-1 w-full md:h-full md:text-sm tablet:text-xl phone:text-xs md:items-center relative z-10`}>
        <div className="flex flex-col items-center justify-center md:w-[50%] shadow-md phone:w-full backdrop-brightness-95 backdrop-blur z-20 rounded-lg">
          <div className="h-full items-center justify-center font-secondary phone:mt-16 backdrop-brightness-90 backdrop-blur z-20 md:w-[70%] md:p-9 md:pb-2 tablet:p-20 md:rounded-none tablet:rounded-lg tablet:max-w-[700px] tablet:min-w-[500px] phone:p-9 phone:w-full">
            <h1 className="text-2xl text-center text-white font-secondary tablet:text-3xl">Confirmar e-mail</h1>
            <div className="text-white pb-6">
              <Step2
                formValue={formValue}
                updateFormValue={updateFormValue}
                onSubmit={handleSubmit}
                isSigningUp={isSigningUp}
              />
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

export default VerifyPage;


