import Link from "next/link";
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
        <h1 id="title" className="text-6xl md:text-9xl">
          SEMCOMP 25
        </h1>
        <h1 id="subtitle" className="text-3xl text-white">
          A maior semana acadêmica de computação do Brasil!
        </h1>
      </div>
      <div className="flex flex-col items-center">
        <button className="bg-tertiary text-white text-2xl p-5 rounded-2xl hover:bg-secondary hover:text-black">
          <Link href="/signup">Inscreva-se</Link>
        </button>
        <div className="p-2 md:p-4">
          <Countdown />
        </div>
      </div>
    </header>
  );
};

export default HomeHeader;
