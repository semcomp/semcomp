import { Link } from "react-router-dom";
import { useTheme } from "@/contexts/useTheme";

export default function NotFoundPage() {
  const { isDarkMode } = useTheme();

  const container = isDarkMode
    ? "bg-semcompDarkBlue text-semcompOffWhite"
    : "bg-semcompOffWhite text-semcompDarkBlue";

  const card = isDarkMode
    ? "border-semcompMidLightBlue/30 bg-semcompAlmostDarkBlue/50"
    : "border-semcompMidLightBlue/30 bg-white";

  const subtitle = isDarkMode ? "text-semcompLightBlue" : "text-semcompMidDarkBlue";

  return (
    <section className={`flex h-screen w-full items-center justify-center px-4 py-10 ${container}`}>
      <div className={`w-full max-w-xl rounded-3xl border p-8 text-center shadow-lg ${card} -translate-y-20`}>
        <p className="font-poppins text-sm font-bold uppercase tracking-[0.2em] text-semcompMidLightBlue">Erro 404</p>
        <h1 className="mt-3 font-poppins text-4xl font-extrabold md:text-5xl">Página não encontrada</h1>
        <p className={`mt-4 font-poppins text-sm md:text-base ${subtitle}`}>
          O link que você tentou acessar não existe ou foi movido.
        </p>

        <div className="mt-8 flex items-center justify-center gap-3">
          <Link
            to="/"
            className="rounded-xl bg-semcompMidDarkBlue px-5 py-2 font-poppins text-sm font-semibold text-semcompOffWhite transition hover:bg-semcompAlmostDarkBlue"
          >
            Voltar para Home
          </Link>
          <button
            onClick={() => window.history.back()}
            className="rounded-xl border border-semcompMidLightBlue/40 px-5 py-2 font-poppins text-sm font-semibold transition hover:bg-semcompMidLightBlue/10"
          >
            Página anterior
          </button>
        </div>
      </div>
    </section>
  );
}
