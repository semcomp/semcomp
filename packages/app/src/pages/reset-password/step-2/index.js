import React from "react";
import { Link } from "react-router-dom";

import { Routes } from "../../../router";

import "./style.css";

function Step2() {
  return (
    <div className="reset-password-step-2-container">
      <p>
        Sua senha foi mudada com sucesso! Da próxima vez que você for entrar,
        você já terá que usar a nova senha.
      </p>
      <Link to={Routes.home}>Ok</Link>
    </div>
  );
}

export default Step2;
