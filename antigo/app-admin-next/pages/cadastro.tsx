import Link from 'next/link';

import {toast} from 'react-toastify';

import Routes from '../routes';
import LoadingButton from '../components/reusable/LoadingButton';
import { useRef, useState } from 'react';
import { useAppContext } from '../libs/contextLib';
import RequireNoAuth from '../libs/RequireNoAuth';
import SemcompApi from '../api/semcomp-api';

/** Tailwind styles. */
const style = {
  main: 'h-full flex justify-center items-center p-4',
  card: 'rounded-lg p-4 bg-white shadow-lg w-full max-w-md flex flex-col items-center',
  title: 'text-2xl font-bold',
  form: 'w-full flex flex-col justify-center items-center',
  input: 'my-2 py-2 px-4 border rounded-lg w-full',
  button: 'bg-gray-600 text-white px-4 py-2 mt-2 mb-4 rounded-lg w-full',
  hr: 'w-full border-b',
  createAccountLink: 'text-sm mt-2',
  link: 'text-blue-500',
};

function Cadastro() {
  const [isLoading, setIsLoading] = useState(false);
  const {
    setUser, semcompApi
  }: {
    setUser: any, semcompApi: SemcompApi
  } = useAppContext();

  const emailRef: any = useRef();
  const passwordRef: any = useRef();
  const passwordCheckRef: any = useRef();

  async function submit(event) {
    event.preventDefault();

    const email = emailRef.current.value.trim().toLowerCase();
    const password = passwordRef.current.value;
    const passwordCheck = passwordCheckRef.current.value;

    if (!email) return toast.error('Você deve fornecer um e-mail');
    if (!password) return toast.error('Você deve fornecer uma senha');
    if (passwordCheck !== password) return toast.error('As senhas devem ser iguais');

    try {
      setIsLoading(true);
      const response = await semcompApi.signup(email, password);
      localStorage.setItem("user", JSON.stringify(response));
      setUser(response);
    } catch (e) {
      console.error(e);
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <main className={style.main}>
      <div className={style.card}>
        <h1 className={style.title}>Cadastro</h1>
        <form className={style.form} onSubmit={submit}>
          <input
            className={style.input}
            ref={emailRef}
            type='email'
            placeholder='E-mail'
            autoComplete='email'
          />
          <input
            className={style.input}
            ref={passwordRef}
            type='password'
            placeholder='Senha'
            autoComplete='current-password'
          />
          <input
            className={style.input}
            ref={passwordCheckRef}
            type='password'
            placeholder='Confirmar senha'
            autoComplete='current-password'
          />
          <LoadingButton
            isLoading={isLoading}
            className={style.button}
            type='submit'
          >
            CADASTRAR
          </LoadingButton>
        </form>
        <hr className={style.hr} />
        <p className={style.createAccountLink}>
          Já possui uma conta? Faça login <Link href={Routes.login}><a className={style.link}>aqui</a></Link>.
        </p>
      </div>
    </main>
  );
}

export default RequireNoAuth(Cadastro);
