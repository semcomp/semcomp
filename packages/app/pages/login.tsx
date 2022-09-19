import { useState } from "react";
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
import Card from "../components/Card";
import Input, { InputType } from "../components/Input";
import NavLink from "../components/navbar/nav-link";

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
    <div className="flex flex-col justify-between min-h-screen">
      <Navbar />
      <main className="flex flex-col md:flex-row justify-center items-center flex-1">
        <Card className="flex flex-col items-center p-9 w-full max-w-lg m-3">
          <h1 className="text-xl">Entrar</h1>
          <form className="w-full" onSubmit={handleSubmit}>
            <Input
              tooltip={
                <div style={{ fontSize: "14px" }}>
                  <p>
                    Atenção: Se você já realizou o cadastro na Semcomp Beta, por
                    favor, cadastre-se novamente.
                  </p>
                </div>
              }
              autofocus={true}
              className="my-3"
              label="E-mail "
              value={email}
              onChange={handleEmailChange}
              type={InputType.Text}
            />
            <Input
              className="my-3"
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
              className="bg-primary text-white font-bold w-full py-3 shadow"
              isLoading={isLoggingIn}
              type="submit"
            >
              Entrar
            </LoadingButton>
            <Link href="/reset-password">
              <div className="bg-white text-black text-center font-bold w-full py-3 my-3 shadow cursor-pointer">
                Esqueci minha senha
              </div>
            </Link>
            <p>
              Não tem conta?{" "}
              <Link href="/signup">
                <a className="text-blue-700 hover:text-blue-500 visited:bg-none">
                  {" "}
                  Crie uma agora!
                </a>
              </Link>
            </p>
          </form>
        </Card>
        <div id="info-semcomp">
          <Card className="w-full max-w-lg m-3 p-9">
            <aside>
              Obrigado por se interessar no nosso evento! <br /> <br />A Semcomp é
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
      <Footer />
    </div>
  );
}

export default RequireNoAuth(Login);
