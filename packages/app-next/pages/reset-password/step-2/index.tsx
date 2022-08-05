import Link from 'next/link'

import Routes from "../../../routes";

import "./style.css";

function Step2() {
  return (
    <div className="reset-password-step-2-container">
      <p>
        Sua senha foi mudada com sucesso! Da próxima vez que você for entrar,
        você já terá que usar a nova senha.
      </p>
      <Link href={Routes.home}>Ok</Link>
    </div>
  );
}

export default Step2;
