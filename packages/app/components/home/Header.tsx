import Link from "next/link";
import { ReactElement, useEffect, useState } from "react";
import NavBar from "../navbar";
import Image from "next/image";
import pixeButton from "../../assets/27-imgs/pixel_button.png";

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
      <div className="w-full z-4">
        <NavBar bg={" "} />
      </div>

      { !isMobile ? (<div className="z-3 flex flex-wrap items-center justify-center">
          <div
            id="header-content"
            className="flex flex-col relative items-center text-center w-full h-[150px] mt-[50px]"
          >
            <h1 id="title" className="z-1 absolute w-full text-center text-primary leading-[200px]">
              SEMCOMP 27
            </h1>
            <h1 id="beta" className="z-2 w-full absolute text-center text-primary font-secondary font-black text-3xl top-[110px] left-[450px]">
              BETA
            </h1>
          </div> 
            <div>
              <h1 id="subtitle" className="text-sm text-primary md:text-3xl w-full text-center mb-16">
                A maior semana acadêmica de computação do Brasil!
              </h1>
          </div>
          

        </div>) : (
          <div className="flex flex-wrap items-center justify-center mt-[20%] mb-20">
          <div
            id="header-content"
            className="flex flex-col items-center px-2 text-center justify-between flex-auto"
          >
            <h1 id="title" className="leading-[100px]">
              SEMCOMP <br></br> 27
            </h1>
          </div>
        </div>
        )}
      <div className="flex flex-col items-center relative w-full">
        <div id="inscreva" className="flex flex-col items-center justify-center w-60 relative">
            <Image src={pixeButton}/>
            <Link href="/signup" >
              <button className="absolute text-primary text-lg md:text-2xl p-4 md:p-5 rounded-2xl">
                INSCREVA-SE
              </button>
            </Link>
        </div>
      </div>

        {/* COUNTDOWN */}
        {/* <div className="p-2 md:p-4">
          <Countdown />
        </div> */}
    </header>
  );
};

export default HomeHeader;
