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
import SemcompLogo from "../assets/27-imgs/logo.svg";
import Card from "../components/Card";
import Input, { InputType } from "../components/Input";
import NavLink from "../components/navbar/nav-link";
import PrivacyPolicyModal from "../components/signup/PrivacyPolicyModal";

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

  return (
    <div className="flex flex-col min-h-screen md:h-full">
      <Navbar />
      <Sidebar />
      <main className="flex w-full flex-1 md:h-full md:bg-white md:text-sm tablet:text-xl phone:text-xs mobile:bg-[url('../assets/27-imgs/login-bg.png')] mobile:bg-cover">
        <div className="flex flex-col items-center justify-center md:w-[80%] mobile:w-full">
          <div className="items-center justify-center h-fit md:w-[70%] md:p-9 tablet:p-12 phone:p-9 font-secondary bg-white md:rounded-none tablet:rounded-lg phone:w-full">
            <h1 className="text-2xl font-secondary text-center tablet:text-3xl">Entrar</h1>
            <p className="font-secondary text-center my-4">
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
                onChange={handleEmailChange}
                type={InputType.Text}
              />
              <Input
                className="my-3 font-secondary"
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
                className="bg-primary text-white w-full py-3 shadow font-secondary"
                isLoading={isLoggingIn}
                type="submit"
              >
                Entrar
              </LoadingButton> 
              <Link href="/reset-password">
                <div className="text-black text-center w-full my-3 cursor-pointer hover:text-primary underline decoration-solid">
                  Esqueceu sua senha?
                </div>
              </Link>
            </form>
            <div>
              <section className="text-center md:pt-12 tablet:pt-20 phone:pt-8">
                <p>© Semcomp 2024. Todos os direitos reservados.</p>
                <p className="mt-3 mb-6 hover:text-primary text-xs cursor-pointer">
                    <span tabIndex={0} onClick={() => setIsPrivacyPolicyModalOpen(true)}>
                      <u>Política de Privacidade</u>
                    </span>
                </p>
              </section>
            </div>
          </div>
        </div>
          <div id="info-semcomp" className="md:flex flex-col items-center phone:hidden tablet:hidden w-full justify-center bg-[url('../assets/27-imgs/login-bg.png')] bg-cover bg-no-repeat">
            <Card className="max-w-md m-8 px-12 py-20 text-sm font-secondary text-justify bg-white rounded-md">
              <aside className="max-w-base">
              Ficamos muito felizes por se interessar em nosso evento!
              <br />
              <br />A Semcomp é 100% construída e pensada por alunos
              dos cursos de<strong> Ciências de Computação</strong>,
              <strong> Sistemas de Informação</strong> e
              <strong> Ciência de Dados</strong> do campus
              <strong> São Carlos da Universidade de São Paulo</strong>. Todo
              ano realizamos um evento presencial com muitas palestras,
              minicursos, concursos, interação e muita comida! Ah, e por último
              mas não menos importante, o nosso Hackathon! Ficou animado?
              <br />
              <br />
              Esperamos que todos se divirtam bastante e tenham o melhor da
              maior semana de computação do Brasil. Sigam a Semcomp no{" "}
              <a
                className="social-links"
                href="https://instagram.com/semcomp"
                rel="noopnener"
              >
                Instagram (@semcomp)
              </a>{" "}
              e no{" "}
              <a
                className="social-links"
                href="https://t.me/semcomp_avisos"
                rel="noopnener"
              >
                Telegram (https://t.me/semcomp_avisos) 
              </a>
              {" "} para ficarem ligados em tudo!.
              <br />
              <br />
              Com carinho, equipe Semcomp!
              </aside>
            </Card>
          </div>
      </main>
      {/* <Footer /> */}
    </div>
  );
}

export default RequireNoAuth(Login);
