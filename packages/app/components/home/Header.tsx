import Link from "next/link";
import React, { useEffect, useState } from "react";
import { ReactElement } from "react";
import NavBar from "../navbar";
import Image from "next/image";
import pixelButton from "../../assets/27-imgs/pixel_button.png";
import Countdown from "./Countdown";
import Sidebar from "../sidebar";

const HomeHeader = (): ReactElement => {
  const [imageHeight, setImageHeight] = useState<number | undefined>();
  const [imageWidth, setImageWidth] = useState<number | undefined>();
  const [noAbsoluteMarginTop, setNoAbsoluteMarginTop] = useState<number | undefined>();
  const [betaMarginTop, setBetaMarginTop] = useState<number | undefined>();
  const [showBeta, setShowBeta] = useState<boolean>(true);
  const [showAccessorys, setShowAccessorys] = useState<boolean>(true); 
  
  const [showCounter, setShowCounter] = useState<boolean>(true);


  const updateImageDimensionsAndMargins = () => {
    const screenWidth = window.innerWidth;
    const screenHeight = window.innerHeight;
    let tempImageWidth: number, tempImageHeight: number, tempNoAbsoluteMarginTop: number, tempBetaMarginTop: number;

    // para ajustar a altura dos elementos na pagina ajuste o valor de tempNoAbsoluteMarginTop

    // grandão
    if (screenWidth >= 1600) {
      tempImageWidth = 672;
      tempImageHeight = 150;
      tempNoAbsoluteMarginTop = -15;
      tempBetaMarginTop = tempNoAbsoluteMarginTop - 85;
      setShowBeta(screenHeight >= 817);
      setShowCounter(screenHeight >= 817);
    
    } 
    // normal
    else if (screenWidth >= 1000 && screenWidth < 1600) {
      tempImageWidth = 642;
      tempImageHeight = 135;
      tempNoAbsoluteMarginTop = 50;
      tempBetaMarginTop = tempNoAbsoluteMarginTop - 123;
      setShowBeta(screenHeight >= 830);
      setShowCounter(screenHeight >= 830);
    } 
    
    // tablet
    else if (screenWidth >= 640 && screenWidth < 1000) {
      tempImageWidth = 321;
      tempImageHeight = 65;
      tempNoAbsoluteMarginTop = 250;
      tempBetaMarginTop = tempNoAbsoluteMarginTop - 280;
      setShowBeta(screenHeight >= 885);
      setShowCounter(screenHeight >= 722);
    } 
    // outros
    else if (screenWidth >= 430 && screenWidth < 640) {
      tempImageWidth = 160.5;
      tempImageHeight = 39.38;
      tempNoAbsoluteMarginTop = 250;
      tempBetaMarginTop = tempNoAbsoluteMarginTop - 290;
      setShowBeta(screenHeight >= 890);
      setShowCounter(screenHeight >= 622);
    } 
    else if (screenWidth < 430){
      tempImageWidth = 160.5;
      tempImageHeight = 39.38;
      tempNoAbsoluteMarginTop = 280;
      tempBetaMarginTop = tempNoAbsoluteMarginTop - 290;
      setShowBeta(screenHeight >= 890);
      setShowCounter(screenHeight >= 697);
    }

    // dando mais suporte a monitores anões

    if(screenHeight < 885 && screenWidth >= 1000 && screenWidth < 1600){
      tempNoAbsoluteMarginTop = -30;
      tempBetaMarginTop = -1 * (screenHeight - 640) / 2;

    }
    if(screenHeight < 885 && screenWidth >= 640 && screenWidth < 1000){
      tempNoAbsoluteMarginTop = 100;
      tempBetaMarginTop = -1 * (screenHeight - 590) / 2;
    }

    if(screenHeight < 890 && screenWidth < 640){
      tempNoAbsoluteMarginTop = 140;
      tempBetaMarginTop = -1 * (screenHeight - 640) / 2;
    }

    if(screenHeight < 890 && screenWidth < 430){
      tempNoAbsoluteMarginTop = 120;
      tempBetaMarginTop = -1 * (screenHeight - 590) / 2;
    }

    if(screenHeight < 890 && screenWidth >= 1400){
      tempNoAbsoluteMarginTop = -40;
      tempBetaMarginTop = -1 * (screenHeight - 660) / 2;
    }

    if(screenHeight < 620){
      // deixar showAceessorys = false
      setShowAccessorys(false);
    }  else { 
      setShowAccessorys(true);
    }

    // estados com os valores calculados
    setImageHeight(tempImageHeight);
    setImageWidth(tempImageWidth);
    setNoAbsoluteMarginTop(tempNoAbsoluteMarginTop);

    console.log(tempNoAbsoluteMarginTop);
    setBetaMarginTop(tempBetaMarginTop);
  };

  // adiciona e remove event listener para 'resize'
  useEffect(() => {
    updateImageDimensionsAndMargins();
    window.addEventListener("resize", updateImageDimensionsAndMargins);
    return () => {
      window.removeEventListener("resize", updateImageDimensionsAndMargins);
    };
  }, []);

  return (
    <header id="header" className="h-screen flex flex-col font-primary text-black">
      <div className="w-full z-4">
        <NavBar bg={" text-primary "} />
        <Sidebar id={ "home-sidebar" } />
      </div>
      <div style={{display: showAccessorys ? 'block' : 'none' }}>
      <section className="
              superdesktop:bg-[url('../assets/27-imgs/ICMCPlate.png')]
              desktop:bg-[url('../assets/27-imgs/ICMCPlate.png')]
              tablet:bg-[url('../assets/27-imgs/litteICMCPlate.png')] 
              medphone:bg-[url('../assets/27-imgs/litteICMCPlate.png')]
              phone:bg-[url('../assets/27-imgs/litteICMCPlate.png')]

              bg-no-repeat  
              absolute left-[0px] bottom-0 h-[140px] w-[639px] 
              "
              ></section>

      <section
                className="
                superdesktop:bg-[url('../assets/27-imgs/chair.png')]
                desktop:bg-[url('../assets/27-imgs/chair.png')]
                tablet:bg-[url('../assets/27-imgs/mediumChair.png')] 
                medphone:bg-[url('../assets/27-imgs/litteChair.png')]
                phone:bg-[url('../assets/27-imgs/litteChair.png')]
                
                bg-no-repeat 
                absolute right-[0px] bottom-0 h-[145px] w-[639px] 
              "
       ></section>
  </div>
      <div className="text-center" style={{ marginTop: `${noAbsoluteMarginTop}px` }}>
        <div>
        <div
            className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[200px] h-[100px]"
            style={{ marginTop: `${betaMarginTop}px` }}
          >

            <h1
              id="beta"
              className="
                select-none
                text-secondary
                font-secondary
                superdesktop:text-[40px]
                desktop:text-[30px]
                tablet:text-[27px]
                medphone:text-[15px]
                phone:text-[15px]
                superdesktop:ml-[605px]
                desktop:ml-[475px]
                tablet:ml-[350px]
                medphone:ml-[265px]
                phone:ml-[240px]
                
                superdesktop:text-[40px]
                desktop:text-[35px]
                tablet:text-[27px]
                medphone:text-[15px]
                phone:text-[15px]
                "

                

            >
              BETA
            </h1>
          </div>
          <h1
            className="
            select-none
            text-primary
            superdesktop:text-[200px]
            desktop:text-[150px]
            tablet:text-[100px]
            medphone:text-[65px]
            phone:text-[55px]"
          >
            SEMCOMP 27
          </h1>
        </div>

        <h2
          className="
            select-none
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
            font-secondary"
        >
          A maior semana acadêmica de computação do Brasil!
        </h2>

        <div className="flex flex-col items-center relative w-full">
          <div
            id="inscreva"
            className="
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
            relative"
          >
          <Image
            src={pixelButton}
            alt="Descrição da imagem"
            height={imageHeight}
            width={imageWidth}
          />
            <Link href="/signup">
              <button style={{ outline: "none" }}
                className="
                  absolute
                  text-primary
                  rounded-2xl
                  superdesktop:text-[20px]
                  desktop:text-[20px]
                  tablet:text-[18px]
                  medphone:text-[15px]
                  phone:text-[15px]"
              >
                INSCREVA-SE
              </button>
            </Link>
          </div>
        </div>
      </div>

      <div style={{ display: showCounter ? 'block' : 'none' }} className="mt-[50px]">
        <Countdown />
      </div>
    </header>
  );
};

export default HomeHeader;