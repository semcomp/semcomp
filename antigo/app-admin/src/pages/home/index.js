import React from 'react';

import Sidebar from '../../components/layout/sidebar';

/** Tailwind styles. */
const styles = {
  root: 'h-full w-full flex',
  main: 'flex flex-col justify-center items-center w-full h-full p-4',
  title: 'text-4xl pb-4 text-center',
  paragraph: 'max-w-xl text-center',
};

/**
 * The Home page, the first page a logged-in user will see.
 *
 * @return {object}
 */
function Home() {
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
  );
}

export default Home;
