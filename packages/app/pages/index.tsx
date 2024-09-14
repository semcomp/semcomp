import { useEffect, useState } from "react";
import { useAppContext } from "../libs/contextLib";
import { useRouter } from "next/router";
import ObjectFly from "../components/home/ObjectFly";
import cloudy from "../assets/27-imgs/cloudy.png";
import airplane from "../assets/27-imgs/airplane.gif";
import AnimatedBG from "./animatedBG"; 
import HomeHeader from "../components/home/Header";
import TitleHome from "../components/home/TitleHome";

const Home: React.FC = () => {
  const { setUser, setToken } = useAppContext();
  const router = useRouter();

  useEffect(() => {
    const user = localStorage.getItem("user");
    const token = localStorage.getItem("token");
    if (!user || !token) {
      setUser(null);
      setToken(null);
    }

    if (window.location.pathname !== router.pathname) {
      router.push(window.location.pathname);
    }
  }, [router, setUser, setToken]);

  return (
    <main className="relative min-h-screen bg-gray-800">
     <AnimatedBG showDevMode={true} />
      {/* conteúdo que ficará a frente do BG, e por isso precisa de um zindez mais alto */}
      <div className="relative z-20 p-8">
        <TitleHome />
        
        
      </div>
    </main>
  );
};

export default Home;
