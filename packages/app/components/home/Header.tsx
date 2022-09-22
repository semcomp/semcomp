import Link from "next/link";
import { ReactElement } from "react";
import NavBar from "../navbar";
import Countdown from "./Countdown";

const HomeHeader = (): ReactElement => {
  return (
    <header id="header" className="h-screen flex flex-col justify-between font-primary text-secondary">
      <div className="w-full">
        <NavBar bg={" "} />
      </div>
      <div id="header-content" className="flex flex-col items-center px-14 text-center justify-between h-72">
        <h1 id="title" className="text-5xl md:text-9xl">
          SEMCOMP 25
        </h1>
        <h1 id="subtitle" className="text-sm md:text-3xl text-white">
          A maior semana acadêmica de computação do Brasil!
        </h1>
      </div>
      <div className="flex flex-col items-center">
        {/* <button className="bg-tertiary text-white text-lg md:text-2xl m-2 p-2 md:p-5 rounded-2xl hover:bg-secondary hover:text-black">
          <Link href="/signup">Inscreva-se</Link>
        </button> */}
        <div className="p-2 md:p-4">
          <Countdown />
        </div>
      </div>
    </header>
  );
};

export default HomeHeader;
