import { useEffect, useState } from "react";
import type { AppProps } from "next/app";
import Head from "next/head";

import { ToastContainer, toast } from "react-toastify";

import { initializeAPI } from "../api/base-api";
import baseURL from "../constants/api-url";
import { AppContext } from "../libs/contextLib";

import "react-toastify/dist/ReactToastify.css";
import "../styles/globals.css";

function MyApp({ Component, pageProps }: AppProps) {
  const [isLoading, setIsLoading] = useState(true);
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);

  initializeAPI({
    baseURL,
    onError: toast.error,
    token,
    setToken,
    onBadToken: () => {
      setToken(null);
      setUser(null);
    },
  });

  useEffect(() => {
    const user = JSON.parse(localStorage.getItem("user"));
    const token = localStorage.getItem("token");
    if (user && token) {
      setUser(user);
      setToken(token);
    }
    setIsLoading(false);
  }, []);

  return (
    <AppContext.Provider
      value={{
        user,
        setUser,
        token,
        setToken,
      }}
    >
      <Head>
        <meta charSet="utf-8" />
        <meta
          name="viewport"
          content="width=device-width, initial-scale=1, shrink-to-fit=no"
        />
        <meta httpEquiv="x-ua-compatible" content="ie=edge" />
        <meta name="theme-color" content="#000000" />
        <meta name="description" content="Semcomp site" />
        <link
          rel="apple-touch-icon"
          sizes="180x180"
          href="/favicon/apple-touch-icon.png"
        />
        <link
          rel="icon"
          type="image/png"
          sizes="32x32"
          href="/favicon/favicon-32x32.png"
        />
        <link
          rel="icon"
          type="image/png"
          sizes="16x16"
          href="/favicon/favicon-16x16.png"
        />
        <link rel="manifest" href="/favicon/site.webmanifest" />
        <title>Semcomp</title>
      </Head>
      <ToastContainer hideProgressBar />
      {
        !isLoading && <Component {...pageProps} />
      }
    </AppContext.Provider>
  );
}

export default MyApp;
