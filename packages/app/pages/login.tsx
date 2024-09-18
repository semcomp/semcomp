import { useEffect, useState } from "react";
import Link from "next/link";

import { IconButton, InputAdornment } from "@mui/material";
import { Visibility, VisibilityOff } from "@mui/icons-material";
import { toast } from "react-toastify";

import API from "../api";
import LoadingButton from "../components/loading-button";
import Footer from "../components/Footer";
import RequireNoAuth from "../libs/RequireNoAuth";
import { useAppContext } from "../libs/contextLib";
import Navbar from "../components/navbar";
import Sidebar from '../components/sidebar';
import SemcompLogo from "../assets/27-imgs/logo.png";
import Card from "../components/Card";
import Input, { InputType } from "../components/Input";
import NavLink from "../components/navbar/nav-link";
import PrivacyPolicyModal from "../components/signup/PrivacyPolicyModal";
import AnimatedBG from "./animatedBG";

function Login() {
  const [email, setEmail] = useState("");
  function handleEmailChange(event: React.ChangeEvent<HTMLInputElement>) {
    const value = event.target.value;
    setEmail(value);
  }
  const [password, setPassword] = useState("");
  function handlePasswordChange(event: React.ChangeEvent<HTMLInputElement>) {
    const value = event.target.value;
    setPassword(value);
  }
  const [showPassword, setShowPassword] = useState(false);

  // This state is used to indicate to the user when the login is happening though a Spinner.
  // See the `LoadingButton` component below in the return statement.
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const { setUser } = useAppContext();
  const [isPrivacyPolicyModalOpen, setIsPrivacyPolicyModalOpen] = useState(false);

  async function handleSubmit(event) {
    event.preventDefault();

    // Validation
    if (!email) return toast.error("Você deve fornecer um e-mail");
    if (!password) return toast.error("Você deve fornecer uma senha");
    if (password.length < 8)
      return toast.error("Sua senha deve ter no mínimo 8 caracteres");

    try {
      setIsLoggingIn(true); // Activates Spinner
      const { data } = await API.login(email, password);
      localStorage.setItem("user", JSON.stringify(data));
      setUser(data);
    } catch (e) {
      // `catch` won't do anything because the API should handle network-related errors.
      console.error(e);
    } finally {
      setIsLoggingIn(false); // Deactivates Spinner
    }
  }

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
      // 2
      matchedImage?.imgIndex ?? 10,
    );
  }, []);

  return (
    <div className="flex flex-col min-h-screen md:h-full">
      <Navbar />
      <Sidebar />
      <AnimatedBG imageIndex={imageIndex} />
      <main className="flex justify-center flex-1 w-full md:h-full md:bg-white md:text-sm tablet:text-xl phone:text-xs md:items-center">
        { imageIndex != null &&
        <div className="flex flex-col items-center justify-center md:w-[50%] mobile:w-full backdrop-brightness-95 backdrop-blur z-20">
          <div className="items-center justify-center h-fit md:w-[70%] md:p-9 md:pb-2 tablet:p-12 phone:p-9 font-secondary md:rounded-none tablet:rounded-lg phone:w-full backdrop-brightness-90 backdrop-blur z-20">
            <h1 className={`text-2xl text-center text-${getTextColor(imageIndex)} font-secondary tablet:text-3xl`}>Entrar</h1>
            <p className={`my-4 text-center text-${getTextColor(imageIndex)} font-secondary`}>
                Não tem conta?{" "}
                <Link href="/signup">
                  <a className={`text-${getTextColor(imageIndex)} underline cursor-pointer hover:text-${getBgColor(imageIndex)} hover:text-blue-500 visited:bg-none`}>
                    {" "}
                    Crie uma agora!
                  </a>
                </Link>
              </p>
            <form className="w-full font-secondary" onSubmit={handleSubmit}>
              {isPrivacyPolicyModalOpen && (
                <PrivacyPolicyModal
                  onRequestClose={() => setIsPrivacyPolicyModalOpen(false)}
                />
              )}
              <Input
                tooltip={
                  <div style={{ fontSize: "14px" }}>
                    <p>
                      Atenção: Se você já realizou o cadastro na Semcomp anterior, por
                      favor, cadastre-se novamente.
                    </p>
                  </div>
                }
                autofocus={true}
                className={`my-3 font-secondary text-${getTextColor(imageIndex)}`}
                label="E-mail"
                value={email}
                onChange={handleEmailChange}
                type={InputType.Text}
              />
              <Input
                className={`my-3 font-secondary text-${getTextColor(imageIndex)}`}
                label="Senha"
                value={password}
                onChange={handlePasswordChange}
                type={showPassword ? InputType.Text : InputType.Password}
                end={
                  <InputAdornment position="end">
                    <IconButton onClick={() => setShowPassword(!showPassword)}>
                      {showPassword ? <VisibilityOff /> : <Visibility />}
                    </IconButton>
                  </InputAdornment>
                }
              />
              <LoadingButton
                className={`w-full py-3 text-${getBgTextColor(imageIndex)} rounded-lg shadow bg-${getBgColor(imageIndex)} font-secondary hover:scale-105`}
                isLoading={isLoggingIn}
                type="submit"
              >
                Entrar
              </LoadingButton> 
              <Link href="/reset-password">
                <div className={`w-full my-3 text-center text-${getTextColor(imageIndex)} underline cursor-pointer hover:text-${getBgColor(imageIndex)} decoration-solid`}>
                  Esqueceu sua senha?
                </div>
              </Link>
            </form>
            <div>
              <section className={`text-center text-${getTextColor(imageIndex)} md:pt-12 tablet:pt-20 phone:pt-8`}>
                <p>© Semcomp 2024. Todos os direitos reservados.</p>
                <p className={`mt-3 mb-6 text-xs text-${getTextColor(imageIndex)} cursor-pointer hover:text-${getBgColor(imageIndex)}`}>
                    <span tabIndex={0} onClick={() => setIsPrivacyPolicyModalOpen(true)}>
                      <u>Política de Privacidade</u>
                    </span>
                </p>
              </section>
            </div>
          </div>
        </div>
        }
      </main>
      {/* <Footer /> */}
    </div>
  );
}

export default RequireNoAuth(Login);