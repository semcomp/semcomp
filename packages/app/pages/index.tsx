import { useEffect, useState } from "react";
import About from "../components/home/About";
import Footer from "../components/Footer";
import HomeHeader from "../components/home/Header";
import Schedule from "../components/home/Schedule";
import FAQ from "../components/home/Faq";
import Sponsors from "../components/home/Sponsors";
import Stats from "../components/home/Stats";
import { useAppContext } from "../libs/contextLib";
import { useRouter } from "next/router";

function Home() {
  const { setUser, setToken } = useAppContext();
  const router = useRouter();
  const [sectionHeight, setSectionHeight] = useState(840);

  useEffect(() => {
    const user = JSON.parse(localStorage.getItem("user"));
    const token = localStorage.getItem("token");
    if (!user || !token) {
      setUser(null);
      setToken(null);
    }

    if (window.location.pathname != router.pathname) {
      router.push(`${window.location.pathname}`);
    }

    // Captura a altura da tela do usuário e ajusta a altura da seção
    const updateSectionHeight = () => {
      const screenHeight = window.innerHeight;
      if (screenHeight < 1000) {
        setSectionHeight(screenHeight - 150);
      } else if (screenHeight < 884) {
        setSectionHeight(screenHeight - 100);
      } else {
        setSectionHeight(840);
      }
    };

    // Chama a função na montagem e ao redimensionar a janela
    updateSectionHeight();
    window.addEventListener("resize", updateSectionHeight);

    // Remove o listener ao desmontar o componente
    return () => window.removeEventListener("resize", updateSectionHeight);
  }, []);

  return (
    <main className="home bg-gray-800 min-h-screen">
      <div>
        <section className="
        superdesktop:bg-[url('../assets/27-imgs/bgClouds.png')] 
        desktop:bg-[url('../assets/27-imgs/bgClouds.png')] 
        tablet:bg-[url('../assets/27-imgs/littebgClouds.png')] 
        medphone:bg-[url('../assets/27-imgs/littebgClouds.png')] 
        phone:bg-[url('../assets/27-imgs/littebgClouds.png')] 
        bg-repeat">
          <section>
              <div className="relative">
                <div style={{height: `${sectionHeight}px`}} className="relative ">
                  <HomeHeader />
                </div>
              </div>
            </section>
          </section>

          <section className="bg-[url('../assets/27-imgs/bgGround.png')] 
                tablet:bg-[url('../assets/27-imgs/littebgGround.png')] 
                medphone:bg-[url('../assets/27-imgs/littebgGround.png')] 
                phone:bg-[url('../assets/27-imgs/littebgGround.png')] 
                bg-repeat 
               ">
            <section className="md:bg-[url('../assets/27-imgs/mediumbgFossils.png')] xl:bg-[url('../assets/27-imgs/bgFossils.png')] bg-no-repeat">
              <section className="md:bg-[url('../assets/27-imgs/mediumbgRock.png')] xl:bg-[url('../assets/27-imgs/bgRock.png')] bg-no-repeat bg-right">
                <br/>
                <br/>
                <div className="pr-[80px] pl-[80px]">
                <About />
                <Schedule />
                <FAQ />
                </div>

                <br />
                <br />
                <section className="pt-[20px] bg-black/50">
                  <Footer />
                </section>
              </section>
            </section>
          </section>
        </div>
      </main>
    );
  }

  export default Home;
