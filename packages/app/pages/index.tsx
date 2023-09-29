import { useEffect } from "react";

import About from "../components/home/About";
import Footer from "../components/Footer";
import HomeHeader from "../components/home/Header";
import Schedule from "../components/home/Schedule";
import FAQ from "../components/home/Faq";
// import LiveNow from "../components/home/live-now";
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
      router.push(`${window.location.pathname}`)
    }
  }, []);

  return (
    <main className="home">
      <div>
        {/* <LiveNow /> */}
        <HomeHeader />
        {/*<Stats />*/}
        <About />
        <Schedule />
        <Sponsors />
        <FAQ />
        <Footer />
      </div>
    </main>
  );
}
export default Home;
