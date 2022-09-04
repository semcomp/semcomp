import Link from 'next/link'

import Routes from "../../routes";

function Step2() {
  return (
    <div className="w-full">
      <p>
        Sua senha foi mudada com sucesso! Da próxima vez que você for entrar,
        você já terá que usar a nova senha.
      </p>
      <Link
        href={Routes.home}
        className="bg-primary text-white font-bold w-full py-3 shadow"
      >Ok</Link>
    </div>
  );
}

export default Step2;
