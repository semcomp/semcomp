import { useEffect } from "react";
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
  }, []);

  return (
    <main className="home  bg-black min-h-screen">
      <div>
        <section className="bg-[url('../assets/27-imgs/littebgClouds.png')] md:bg-[url('../assets/27-imgs/mediumbgClouds.png')] xl:bg-[url('../assets/27-imgs/bgClouds.png')] bg-repeat h-[840px]">
          <section>
            <div className="relative">
              <section
                className="
              bg-[url('../assets/27-imgs/litteICMCPlate.png')] xl:bg-[url('../assets/27-imgs/ICMCPlate.png')]    bg-no-repeat  
              absolute left-[0px] top-0 h-[840px] w-[450px] 
              "
              ></section>

              <section
                className="
              bg-[url('../assets/27-imgs/litteChair.png')] md:bg-[url('../assets/27-imgs/mediumChair.png')] xl:bg-[url('../assets/27-imgs/chair.png')]   bg-no-repeat 
              absolute right-[10px] top-0 h-[840px] w-[590px] 
              "
              ></section>
              <div className="relative h-[850px]">
                <HomeHeader />
              </div>
            </div>
          </section>
        </section>

        <section className="bg-[url('../assets/27-imgs/littebgGround.png')] xl:bg-[url('../assets/27-imgs/bgGround.png')] bg-repeat">
          <section className="md:bg-[url('../assets/27-imgs/mediumbgFossils.png')] xl:bg-[url('../assets/27-imgs/bgFossils.png')] bg-no-repeat">
            <section className="md:bg-[url('../assets/27-imgs/mediumbgRock.png')] xl:bg-[url('../assets/27-imgs/bgRock.png')] bg-no-repeat bg-right">
              <About />
              <Schedule />
              <FAQ />
              <br />
              <br />
              <section className="pt-[20px] bg-black/40">
                <Footer className={"text-white"}/>
              </section>
            </section>
          </section>
        </section>
      </div>
    </main>
  );
}

export default Home;
