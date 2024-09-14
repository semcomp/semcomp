import Link from "next/link";
import React, { useEffect, useState } from "react";
import { ReactElement } from "react";

const TitleHome = (): ReactElement => {
  const [noAbsoluteMarginTop, setNoAbsoluteMarginTop] = useState<number | undefined>();
  const [betaMarginTop, setBetaMarginTop] = useState<number | undefined>();
  const [showAccessorys, setShowAccessorys] = useState<boolean>(true);

  return (
    <header id="header" className="text-black font-primary">
      <div className="w-full z-4"></div>
      <div style={{ display: showAccessorys ? 'block' : 'none' }}></div>
      <div className="text-center" style={{ marginTop: `${noAbsoluteMarginTop}px` }}>
        <div>
          <div
            className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[200px] h-[100px]"
            style={{ marginTop: `${betaMarginTop}px` }}
          ></div>
          <h1
            className="text-primary"
            style={{
              fontSize: '13vw', // tamanho do título principal, adaptado para diferentes tamanhos de tela
              lineHeight: '1', 
            }}
          >
            SEMCOMP 27
          </h1>
        </div>

        <h2
          className=" text-primary"
          style={{
            fontSize: '3vw', //subtítulo adaptado para diferentes tamanhos de tela
          }}
        >
          A maior semana acadêmica de computação do Brasil!
        </h2>
      </div>
    </header>
  );
};

export default TitleHome;
