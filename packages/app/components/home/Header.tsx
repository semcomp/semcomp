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
      className="h-screen flex flex-col font-primary text-black"
    >
      <div className="w-full z-40">
        <NavBar bg={" "} />
      </div>

      { !isMobile ? (<div className="z-30 flex flex-wrap items-center justify-center">
          <div
            id="header-content"
            className="flex flex-col items-center text-center mt-[9%] mb-20"
          >
            <h1 id="title" className="w-full text-center leading-[200px]">
              SEMCOMP 27
            </h1>
            <h1 id="subtitle" className="text-sm md:text-3xl w-full text-center">
              A maior semana acadêmica de computação do Brasil!
            </h1>
          </div>

        </div>) : (
          <div className="flex flex-wrap items-center justify-center mt-[50%] mb-20">
          <div
            id="header-content"
            className="flex flex-col items-center px-2 text-center justify-between flex-auto"
          >
            <h1 id="title" className="leading-[50px]">
              SEMCOMP <br></br> 27
            </h1>
          </div>
        </div>
        )}
      <div className="flex flex-col items-center">
          <Link href="/signup" >
            <button className="bg-primary text-white text-lg md:text-2xl p-4 md:p-5 rounded-2xl hover:bg-secondary hover:border-solid hover:border-2 hover:text-black">
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
