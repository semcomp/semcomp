import Link from 'next/link';

import {toast} from 'react-toastify';

import API from "../api";
import Routes from '../routes';
import LoadingButton from '../components/reusable/LoadingButton';
import { useRef, useState } from 'react';
import { useAppContext } from '../libs/contextLib';
import RequireNoAuth from '../libs/RequireNoAuth';

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

/**
 * @return {object}
 */
function Login() {
  /**
   * This state is updated when the user submits the login for. The statee is used
   * to display a spinner on the button while the request is happening
   */
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const { setUser } = useAppContext();

  // React refs used to read the inputs's values.
  const emailRef: any = useRef();
  const passwordRef: any = useRef();


  /**
   * Function called when the user submits the form
   *
   * @param {object} event
   *
   * @return {object}
   */
  async function submit(event) {
    // Prevents the page from reloading.
    event.preventDefault();

    const email = emailRef.current.value.trim().toLowerCase();
    const password = passwordRef.current.value;

    // Error treatment.
    if (!email) return toast.error('Você deve fornecer um e-mail');
    if (!password) return toast.error('Você deve fornecer uma senha');
    if (password.length < 6) return toast.error('Sua senha deve ter no mínimo 6 caracteres');

    try {
      // Show spinner
      setIsLoggingIn(true);
      const { data } = await API.login(email, password);
      localStorage.setItem("user", JSON.stringify(data));
      setUser(data);
    } catch (e) {
      console.error(e);
    } finally {
      // Hide spinner
      setIsLoggingIn(false);
    }
  }

  return (
    <main className={style.main}>
      <div className={style.card}>
        <h1 className={style.title}>Login</h1>
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
          <LoadingButton
            isLoading={isLoggingIn}
            className={style.button}
            type='submit'
          >
            LOGIN
          </LoadingButton>
        </form>
        <hr className={style.hr} />
        <p className={style.createAccountLink}>
          Ainda não tem conta? Crie uma <Link href={Routes.login} className={style.link}>aqui</Link>.
        </p>
      </div>
    </main>
  );
}

export default RequireNoAuth(Login);
