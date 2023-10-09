import Link from "next/link";
import { ReactElement, useEffect, useState } from "react";
import NavBar from "../navbar";
import Record from "./Record";

const HomeHeader = (): ReactElement => {

  const [isMobile, setIsMobile] = useState(false);
  const [isPhone, setIsPhone] = useState(false);
 
  //choose the screen size 
  const handleResize = () => {
    console.log(window.screen);
    if (window.innerWidth < 1350) {
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
      <div className="w-full z-40">
        <NavBar bg={" "} />
      </div>

      { !isMobile ? (<div className="z-30 flex flex-wrap items-center justify-center h-[1000px] ">
          <div
            id="header-content"
            className="w-[58%] flex flex-col items-center px-2 text-center justify-between text-right mr-[50px]"
          >
            <h1 id="title" className="w-full text-right">
              SEMCOMP 26
            </h1>
            <h1 id="subtitle" className="text-sm md:text-3xl text-black w-full text-right mr-[150px]">
              A maior semana acadêmica de computação do Brasil!
            </h1>
          </div>

          <Record
          className="relative w-[30%] flex flex-col items-left"
          isPhone={isPhone}
          isMobile={isMobile}/>

        </div>) : (
          <div className="flex flex-wrap items-center justify-center">
            <Record 
              className="flex items-center justify-center flex-auto w-full"
              isPhone={isPhone}
              isMobile={isMobile}
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
      <div className="flex flex-col items-center h-[50px]d">
          <Link href="/signup" className="">
            <button className="bg-primary text-white text-lg md:text-2xl m-2 p-2 md:p-5 rounded-2xl hover:bg-secondary hover:border-solid hover:border-2 hover:text-black mb-10">
              Inscreva-se
            </button>
          </Link>
      </div>

        {/* COUNTDOWN */}
        {/* <div className="p-2 md:p-4">
          <Countdown />
        </div> */}
    </header>
  );
};

export default HomeHeader;
