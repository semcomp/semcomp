import React from "react";
import ReactDOM from "react-dom/client";

import { ToastContainer, toast } from "react-toastify";
import { BrowserRouter } from "react-router-dom";
import { Provider } from "react-redux";
import { PersistGate } from "redux-persist/integration/react";

import Content from "./router";
import { store, persistor } from "./redux/store";
import { initializeAPI } from "./api/base-api";

import baseURL from "./constants/api-url";
import { setToken, logout } from "./redux/actions/auth";

import "react-toastify/dist/ReactToastify.css";
import "./styles.css";

initializeAPI({
  baseURL,
  onError: toast.error,
  tokenSelector: () => store.getState().auth.token,
  tokenDispatcher: (token) => store.dispatch(setToken(token)),
  onBadToken: () => {
    store.dispatch(logout());
  },
});

function App() {
  return (
    <Provider store={store}>
      <PersistGate loading={null} persistor={persistor}>
        <BrowserRouter>
          <ToastContainer hideProgressBar />
          <Content />
        </BrowserRouter>
      </PersistGate>
    </Provider>
  );
}

const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
