import { ReactElement } from "react";
import NavBar from "../navbar";
import Countdown from "./Countdown";

const HomeHeader = (): ReactElement => {
  return (
    <header className="h-screen bg-primary flex flex-col justify-between font-primary text-secondary">
      <div className="w-full">
        <NavBar />
      </div>
      <div className="flex flex-col items-center">
        <h1 id="title" className="text-6xl md:text-9xl">SEMCOMP 25</h1>
        <h1 id="subtitle" className="text-3xl md:text-6xl text-white">Em breve</h1>
      </div>
      <div className="flex flex-col items-center">
        <h1 className="text-base md:text-xl">
          A maior semana acadêmica de computação do Brasil!
        </h1>
        <div className="p-2 md:p-4">
          <Countdown />
        </div>
      </div>
    </header>
  );
};

export default HomeHeader;
