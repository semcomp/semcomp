import NavBar from "../navbar";
import Countdown from './Countdown';

import styles from "./Header.module.css";

const HomeHeader = () => {
  return (
    <header className={styles.homeHeader}>
      <div className="w-full">
        <NavBar />
      </div>
      <div className="flex flex-col items-center text-white">
        <h1 className="text-6xl md:text-9xl">SEMCOMP 25</h1>
        <h1 className="text-3xl md:text-6xl">Em breve</h1>
      </div>
      <div className="flex flex-col items-center text-white">
        <h1 className="text-base md:text-xl">
          A maior semana acadêmica de computação do Brasil!
        </h1>
        <div className="p-2 md:p-4">
          <Countdown/>
        </div>
      </div>
    </header>
  );
};

export default HomeHeader;
