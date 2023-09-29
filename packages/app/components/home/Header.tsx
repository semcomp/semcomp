import Link from "next/link";
import { ReactElement, useEffect, useState } from "react";
import NavBar from "../navbar";
import Countdown from "./Countdown";
import Record from "./Record";

const HomeHeader = (): ReactElement => {

  const [isMobile, setIsMobile] = useState(false);
  const [isPhone, setIsPhone] = useState(false);
 
  //choose the screen size 
  const handleResize = () => {
    if (window.innerWidth < 1100) {
      setIsMobile(true);
    } else{
      setIsMobile(false);
    }

    if(window.innerWidth < 748)
      setIsPhone(true);
    else
      setIsPhone(false);
  }
  
  // create an event listener
  useEffect(() => {
    window.addEventListener("resize", handleResize);
  })

  useEffect(() => {
    handleResize();
  }, [])

  

  return (
    <header
      id="header"
      className="h-screen flex flex-col justify-between font-primary text-black"
    >
      <div className="w-full">
        <NavBar bg={" "} />
      </div>

      { !isMobile ? (<div className="flex flex-wrap items-center justify-center">
          <div
            id="header-content"
            className="flex flex-col items-center px-2 text-center justify-between flex-auto"
          >
            <h1 id="title">
              SEMCOMP 26
            </h1>
            <h1 id="subtitle" className="text-sm md:text-3xl text-black w-full text-left">
              A maior semana acadêmica de computação do Brasil!
            </h1>
          </div>

          <Record
          className="flex-auto"
          isPhone={isPhone}/>

        </div>) : (
          <div className="flex flex-wrap items-center justify-center">
            <Record 
              className="flex items-center justify-center flex-auto w-full"
              isPhone={isPhone}
            />
          <div
            id="header-content"
            className="flex flex-col items-center px-2 text-center justify-between flex-auto"
          >
            <h1 id="title">
              SEMCOMP 26
            </h1>
            <h1 id="subtitle" className="text-sm md:text-3xl text-black w-full text-left">
              A maior semana acadêmica de computação do Brasil!
            </h1>
          </div>
        </div>
        )}
      <div className="flex flex-col items-center">
          <Link href="/signup">
            <button className="bg-primary text-white text-lg md:text-2xl m-2 p-2 md:p-5 rounded-2xl hover:bg-secondary hover:border-solid hover:border-2 hover:text-black mb-10">
              Inscreva-se
            </button>
          </Link>

        {/* COUNTDOWN */}
        {/* <div className="p-2 md:p-4">
          <Countdown />
        </div> */}
      </div>
    </header>
  );
};

export default HomeHeader;
