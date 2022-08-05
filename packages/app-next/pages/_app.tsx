import type { AppProps } from 'next/app'
import Head from 'next/head';

import { ToastContainer, toast } from "react-toastify";
import { Provider } from "react-redux";
import { PersistGate } from "redux-persist/integration/react";

import { store, persistor } from "../redux/store";
import { initializeAPI } from "../api/base-api";
import baseURL from "../constants/api-url";
import { setToken, logout } from "../redux/actions/auth";

import "react-toastify/dist/ReactToastify.css";
import '../styles/globals.css';

initializeAPI({
  baseURL,
  onError: toast.error,
  tokenSelector: () => store.getState().auth.token,
  tokenDispatcher: (token) => store.dispatch(setToken(token)),
  onBadToken: () => {
    store.dispatch(logout());
  },
});

function MyApp({ Component, pageProps }: AppProps) {
  return (
    <Provider store={store}>
      <PersistGate loading={null} persistor={persistor}>
          <Head>
            <meta charSet="utf-8" />
            <link
              href="https://fonts.googleapis.com/css2?family=Roboto:ital,wght@0,100;0,300;0,400;0,500;0,700;0,900;1,100;1,300;1,400;1,500;1,700;1,900&display=swap"
              rel="stylesheet"
            />
            <meta
              name="viewport"
              content="width=device-width, initial-scale=1, shrink-to-fit=no"
            />
            <meta httpEquiv="x-ua-compatible" content="ie=edge" />
            <meta name="theme-color" content="#000000" />
            <meta name="description" content="Semcomp site" />
            <link
              href="https://fonts.googleapis.com/css2?family=Archivo:wght@400;700&family=Poppins&display=swap"
              rel="stylesheet"
            />
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
            <link
              href="https://unpkg.com/tailwindcss@^1.0/dist/tailwind.min.css"
              rel="stylesheet"
            />
            <title>Semcomp</title>
          </Head>
          <ToastContainer hideProgressBar />
          <Component {...pageProps} />
      </PersistGate>
    </Provider>
  );
}

export default MyApp
