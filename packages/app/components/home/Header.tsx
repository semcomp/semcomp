import Link from "next/link";
import React, { useEffect, useState } from 'react';
import { ReactElement } from "react";
import NavBar from "../navbar";
import Image from "next/image";
import pixelButton from "../../assets/27-imgs/pixel_button.png";
import Countdown from "./Countdown";
import Sidebar from "../sidebar";

const HomeHeader = (): ReactElement => {
  const [imageHeight, setimageHeight] = useState(600); // Defina um valor padrão
  const [imageWidth, setimageWidth] = useState(600); // Defina um valor padrão

  const updateimageHeight = () => {
    const screenWidth = window.innerWidth;

    // Verifique os intervalos de largura da tela e defina o valor apropriado
    if (screenWidth >= 1440) {
      setimageHeight(700); // Ajuste para telas grandes
      setimageWidth(3500);
    } else if (screenWidth >= 1000 && screenWidth < 1440) {
      setimageHeight(700); // Ajuste para telas médias
      setimageWidth(3500);

    } else if (screenWidth >= 640 && screenWidth < 1000) {
      setimageHeight(500); // Ajuste para telas pequenas
      setimageWidth(2500);
    } else {
      setimageHeight(50); // Ajuste para telas muito pequenas
      setimageWidth(300);
    }
  };

  // Adiciona e remove event listener para 'resize'
  useEffect(() => {
    updateimageHeight();
    window.addEventListener('resize', updateimageHeight);
    return () => {
      window.removeEventListener('resize', updateimageHeight);
    };
  }, []);

  return (
    <header
      id="header"
      className="h-screen flex flex-col font-primary text-black"
    >
      <div className="w-full z-4">
        <NavBar bg={" text-primary "} />
        <Sidebar />
      </div>

      <div className="text-center ">

        <div>
          <div
            className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[200px] h-[100px] "
          >
            <h1 id="beta" className="

        text-secondary
        font-secondary

        superdesktop:text-[40px]
        desktop:text-[35px]
        tablet:text-[27px]
        medphone:text-[15px]
        phone:text-[15px]

        superdesktop:ml-[605px]
        desktop:ml-[475px]
        tablet:ml-[350px]
        medphone:ml-[265px]
        phone:ml-[240px]

        superdesktop:mt-[30px]
        desktop:mt-[30px]
        tablet:-mt-[40px]
        medphone:-mt-[40px]
        phone:-mt-[52px]
        ">
              BETA
            </h1>
          </div>
          <h1 className="
          text-primary

          superdesktop:text-[200px]
          desktop:text-[150px]
          tablet:text-[100px]
          medphone:text-[65px]
          phone:text-[55px]

          superdesktop:mt-[110px]
          desktop:mt-[150px]
          tablet:mt-[250px]
          medphone:mt-[280px]
          phone:mt-[280px]
   "
          > SEMCOMP 27 </h1>
        </div>



        <h2 className="
        text-primary 

        superdesktop:text-[35px]
        desktop:text-[27px]
        tablet:text-[18px]
        medphone:text-[12px]
        phone:text-[10px]

        superdesktop:-mt-[60px]
        desktop:-mt-[50px]
        tablet:-mt-[35px]
        medphone:-mt-[25px]
        phone:-mt-[20px]

        mb-10 
        font-secondary">
          A maior semana acadêmica de computação do Brasil!
        </h2>



        <div className="flex flex-col items-center relative w-full">
          <div id="inscreva" className="

        superdesktop:mt-[20px]
        desktop:mt-[20px]
        tablet:-mt-[10px]
        medphone:-mt-[25px]
        phone:-mt-[20px]

        flex
        flex-col 
        cursor-pointer 
        items-center 
        justify-center 
        w-60 
        md:w-64 
        relative
        ">
            <Image
              src={pixelButton} // O caminho da imagem
              alt="Descrição da imagem"
              height={imageHeight} // Largura desejada
              width={imageWidth} // Altura desejada
            />
            <Link href="/signup">
              <button className="
            absolute
            text-primary
            rounded-2xl

            superdesktop:text-[20px]
            desktop:text-[20px]
            tablet:text-[18px]
            medphone:text-[15px]
            phone:text-[15px]
            ">
                INSCREVA-SE
              </button>
            </Link>
          </div>
        </div>
      </div>

      {/* <div className="">
        <div
          id="header-content"
          className="flex flex-col relative items-center text-center w-full "
        >
          <h1
            id="title"
            className="text-center text-primary "
          >
            SEMCOMP 27
          </h1>
          <h1 id="beta" className="text-center text-primary font-secondary font-black md:text-3xl xl:text-5xl">
            BETA
          </h1>
        </div>
        <div>
          <h1
            id="subtitle"
            className="text-sm text-primary sm:text-sm md:text-3xl xl:text-4xl w-full text-center mb-16"
          >
            A maior semana acadêmica de computação do Brasil!
          </h1>
        </div>
      </div>

      <div className="flex flex-col items-center relative w-full">
        <div id="inscreva" className="flex flex-col cursor-pointer items-center justify-center w-60 md:w-64 relative">
          <Image src={pixelButton} />
          <Link href="/signup">
            <button className="absolute text-primary text-lg md:text-2xl xl:text-2xl p-4 md:p-5 xl:p-5 rounded-2xl">
              INSCREVA-SE
            </button>
          </Link>
        </div>
      </div> */}

    </header>
  );
};

export default HomeHeader;
