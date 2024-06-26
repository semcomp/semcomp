import { useEffect, useState } from 'react';
import type { AppProps } from 'next/app'
import Head from 'next/head';

import { ToastContainer, toast } from "react-toastify";

import Http from "../api/http";
import baseURL from "../constants/api-url";
import { AppContext } from "../libs/contextLib";
import SemcompApi from '../api/semcomp-api';

import 'react-toastify/dist/ReactToastify.css';
import '../styles/globals.css'

function MyApp({ Component, pageProps }: AppProps) {
  const [isLoading, setIsLoading] = useState(true);
  const [user, setUser] = useState(null);
  const [semcompApi, setSemcompApi] = useState(null);
  const [adminRole, setAdminRole] = useState(null);

  function logOut(): void {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setUser(null);
  }

  async function fetchAdminRole() {
    try {
      const role = await semcompApi.getAdminRole(user.id);
      setAdminRole(role);  
    } catch (error) {
      console.error(error);
    }
  }

  useEffect(() => {
    const user_string = localStorage.getItem("user");
    if (user_string) {
      setUser(JSON.parse(user_string));
    }

    function callbackOnTokenRefresh(): void {
      localStorage.setItem("token", http.getToken());
    }

    function callbackOnBadToken(): void {
      logOut();
      toast.error("Token expirado!");
    }

    function callbackMessageError(message): void {
      toast.error(message);
    }

    const token = localStorage.getItem("token");
    const http = new Http(
      baseURL,
      token,
      callbackOnTokenRefresh,
      callbackOnBadToken,
      callbackMessageError
    );

    setSemcompApi(new SemcompApi(http));

    setIsLoading(false);
  }, []);

  useEffect(() => {
    if (user !== null) {
      fetchAdminRole();
    }
  }, [user]);

  return (
    <AppContext.Provider value={{
      user,
      setUser,
      logOut,
      semcompApi,
      adminRole,
    }}>
      <Head>
        <link
          href="https://fonts.googleapis.com/css2?family=Roboto:ital,wght@0,100;0,300;0,400;0,500;0,700;0,900;1,100;1,300;1,400;1,500;1,700;1,900&display=swap"
          rel="stylesheet"
        />
        <title>Semcomp</title>
        <meta name="description" content="Generated by create next app" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <ToastContainer hideProgressBar />
      {
        !isLoading && <Component {...pageProps} />
      }
    </AppContext.Provider>
  );
}

export default MyApp
