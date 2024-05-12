import Link from "next/link";
import React, { useEffect, useState } from 'react';
import { ReactElement } from "react";
import NavBar from "../navbar";
import Image from "next/image";
import pixelButton from "../../assets/27-imgs/pixel_button.png";
import Countdown from "./Countdown";
import Sidebar from "../sidebar";

const HomeHeader = (): ReactElement => {
  const [imageHeight, setimageHeight] = useState<number>(0)
  const [imageWidth, setimageWidth] = useState<number>(0)
  const [noAbsoluteMarginTop, setNoAbsoluteMarginTop] = useState<number>(0)
  const [betaMarginTop, setBetaMarginTop] = useState<number>(0)

  const updateimageHeight = () => {
      const screenWidth = window.innerWidth;

      if (screenWidth >= 1440) {
          setimageHeight(700);
          setimageWidth(3500);
          setNoAbsoluteMarginTop(110);
      } else if (screenWidth >= 1000 && screenWidth < 1440) {
          setimageHeight(700);
          setimageWidth(3500);
          setNoAbsoluteMarginTop(150);
      } else if (screenWidth >= 640 && screenWidth < 1000) {
          setimageHeight(500);
          setimageWidth(2500);
          setNoAbsoluteMarginTop(250);
      } else {
          setimageHeight(50);
          setimageWidth(300);
          setNoAbsoluteMarginTop(280);
      }
  };

  useEffect(() => {
    // Atualiza betaMarginTop toda vez que noAbsoluteMarginTop mudar
    if (noAbsoluteMarginTop !== undefined) {
      if (window.innerWidth >= 1440) {
        setBetaMarginTop(noAbsoluteMarginTop - 80);
      } else if (window.innerWidth >= 1000) {
        setBetaMarginTop(noAbsoluteMarginTop - 120);
      } else if (window.innerWidth >= 640) {
        setBetaMarginTop(noAbsoluteMarginTop - 290);

      } else if (window.innerWidth >= 430) {
        setBetaMarginTop(noAbsoluteMarginTop - 320);
      }
        else {
        setBetaMarginTop(noAbsoluteMarginTop - 331);
      }
    }
  }, [noAbsoluteMarginTop]);

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

      <div className="text-center " style={{marginTop:`${noAbsoluteMarginTop}px`}}>

        <div>
          <div
            className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[200px] h-[100px] "
          style={{marginTop:`${betaMarginTop}px`}}
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

      <div className="mt-[50px]">
        <Countdown />
      </div>



    </header>
  );
};

export default HomeHeader;
