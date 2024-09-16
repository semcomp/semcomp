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
import PrivacyPolicyModal from "../components/signup/PrivacyPolicyModal";
import Input, { InputType } from "../components/Input";
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

function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const { setUser } = useAppContext();
  const [isPrivacyPolicyModalOpen, setIsPrivacyPolicyModalOpen] = useState(false);
  const [imageIndex, setImageIndex] = useState<number>(10); // State para gerenciar o índice da imagem

  // State to control background visibility
  const [bgVisible, setBgVisible] = useState(true);

  useEffect(() => {
    // Cálculo do índice da imagem baseado no horário atual
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

  async function handleSubmit(event) {
    event.preventDefault();

    // Validação
    if (!email) return toast.error("Você deve fornecer um e-mail");
    if (!password) return toast.error("Você deve fornecer uma senha");
    if (password.length < 8)
      return toast.error("Sua senha deve ter no mínimo 8 caracteres");

    try {
      setIsLoggingIn(true); // Ativa o Spinner
      const { data } = await API.login(email, password);
      localStorage.setItem("user", JSON.stringify(data));
      setUser(data);
    } catch (e) {
      console.error(e);
    } finally {
      setIsLoggingIn(false); // Desativa o Spinner
    }
  }

  return (
    <div className="flex flex-col min-h-screen md:h-full">
      <Navbar />
      <Sidebar />
      <main className="relative flex flex-1 w-full">
        {/* Passando o índice da imagem para o componente de background animado, condicionalmente renderizado */}
        {bgVisible && <AnimatedBG imageIndex={imageIndex} />}
        <div className="z-40 flex flex-col items-center justify-center w-full min-h-screen">
          <div className="items-center justify-center h-fit md:w-[70%] md:p-9 tablet:p-12 phone:p-9 font-secondary bg-white tablet:rounded-lg phone:w-full">
            <h1 className="text-2xl text-center font-secondary tablet:text-3xl">Entrar</h1>
            <p className="my-4 text-center font-secondary">
                Não tem conta?{" "}
                <Link href="/signup">
                  <a className="text-blue-700 hover:text-blue-500 visited:bg-none">
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
                className="my-3 font-secondary"
                label="E-mail"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                type={InputType.Text}
              />
              <Input
                className="my-3 font-secondary"
                label="Senha"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
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
                className="w-full py-3 text-white shadow bg-primary font-secondary"
                isLoading={isLoggingIn}
                type="submit"
              >
                Entrar
              </LoadingButton> 
              <Link href="/reset-password">
                <div className="w-full my-3 text-center text-black underline cursor-pointer hover:text-primary decoration-solid">
                  Esqueceu sua senha?
                </div>
              </Link>
            </form>
            <div>
              <section className="text-center md:pt-12 tablet:pt-20 phone:pt-8">
                <p>© Semcomp 2024. Todos os direitos reservados.</p>
                <p className="mt-3 mb-6 text-xs cursor-pointer hover:text-primary">
                    <span tabIndex={0} onClick={() => setIsPrivacyPolicyModalOpen(true)}>
                      <u>Política de Privacidade</u>
                    </span>
                </p>
              </section>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

export default RequireNoAuth(Login);