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
        <section className="bg-[url('../assets/27-imgs/bgheadercontinue.png')] bg-repeat h-[857px]">
          <section>
            <div className="relative">
              <section className="hidden lg:block absolute left-[0px] top-0 h-[857px] w-[450px] bg-[url('../assets/27-imgs/leftbgheader.png')] bg-no-repeat bg-cover"></section>
              <section className="hidden lg:block absolute right-[10px] top-0 h-[857px] w-[590px] bg-[url('../assets/27-imgs/rightbgheader.png')] bg-no-repeat bg-cover"></section>

              <section className="lg:hidden absolute left-0 top-0 h-[857px] w-[450px] bg-[url('../assets/27-imgs/placaICMC.png')] bg-no-repeat bg-cover"></section>

              <div className="relative h-[857px]">
                <HomeHeader />
              </div>
            </div>
          </section>
        </section>

        <section className="bg-[url('../assets/27-imgs/terrabg.png')] bg-repeat">
          <About />
          <Schedule />
          <FAQ />
          <br />
          <br />
          <section className="bg-black">
            <Footer />
          </section>
        </section>
      </div>
    </main>
  );
}

export default Home;
