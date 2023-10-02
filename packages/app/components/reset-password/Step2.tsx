import Routes from "../../routes";
import { useRouter } from 'next/router';

function Step2() {

  const router = useRouter();

  return (
    <div className="w-full text-center">
      <p>
        Sua senha foi mudada com sucesso! Da próxima vez que você for entrar,
        você já terá que usar a nova senha.
      </p>
      <button
        className="bg-primary text-white py-3 px-6 w-full hover:bg-secondary mt-10 mb-6 rounded-xl"
        type="button"
        onClick={() => {router.push(Routes.profile)}}
      >
        Ok!
      </button>
    </div>
  );
}

export default Step2;
