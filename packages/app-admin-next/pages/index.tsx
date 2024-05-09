import type { NextPage } from 'next'

import Sidebar from '../components/layout/Sidebar';
import RequireAuth from "../libs/RequireAuth";

/** Tailwind styles. */
const styles = {
  root: 'h-full w-full flex',
  main: 'flex flex-col justify-center items-center w-full h-full p-4 mt-14',
  title: 'text-4xl pb-4 text-center',
  paragraph: 'max-w-xl text-center',
};

const Home: NextPage = () => {
  return (
    <div className={styles.root}>
      <Sidebar />
      <main className={styles.main}>
        <h1 className={styles.title}>Bem Vinde!</h1>
        <p className={styles.paragraph}>
          Essa é a interface de administrador do site da Semcomp. Aqui voce pode criar, visualizar,
          atualizar e deletar praticamente tudo do banco de dados. Aqui existem dados sensiveis dos
          participantes e organizadores, <strong>tenha cuidado</strong> com sua ações.
        </p>
      </main>
    </div>
  )
}

export default RequireAuth(Home);
