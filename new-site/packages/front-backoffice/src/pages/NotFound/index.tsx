import { Link } from "react-router-dom";


export default function NotFoundPage() {
  return (
    <section className="relative flex min-h-[calc(100vh-73px)] items-center justify-center overflow-hidden bg-background px-4 py-12">
      <div className="absolute top-0 -left-1/4 h-96 w-96 rounded-full bg-primary/10 blur-[120px]" />
      <div className="absolute bottom-0 -right-1/4 h-96 w-96 rounded-full bg-secondary/10 blur-[120px]" />

      <div className="relative w-[80%] md:w-[60%] xl:w-[30%] rounded-3xl border border-border bg-card/40 p-10 text-center shadow-2xl backdrop-blur-sm animate-in fade-in zoom-in-95 duration-500">
        <p className="font-poppins text-sm font-bold uppercase tracking-[0.2em] text-primary">Erro 404</p>
        <h1 className="mt-3 font-poppins text-2xl xl:text-4xl font-extrabold text-foreground md:text-5xl">
          Página não encontrada
        </h1>
        <p className="mt-4 font-poppins text-sm text-muted-foreground md:text-base">
          O link que você tentou acessar não existe ou foi movido.
        </p>

        <div className="mt-8 flex items-center justify-center gap-3">
          <Link
            to="/"
            className="rounded-xl bg-primary px-5 py-2 font-poppins text-sm font-semibold text-primary-foreground transition hover:opacity-90"
          >
            Voltar para Home
          </Link>
          <button
            onClick={() => window.history.back()}
            className="rounded-xl border border-border px-5 py-2 font-poppins text-sm font-semibold text-foreground transition hover:bg-secondary"
          >
            Página anterior
          </button>
        </div>
      </div>
    </section>
  );
}
