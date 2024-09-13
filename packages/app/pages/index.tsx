import { useEffect, useState } from "react";
import { useAppContext } from "../libs/contextLib";
import { useRouter } from "next/router";
import ObjectFly from "../components/home/ObjectFly";
import cloudy from "../assets/27-imgs/cloudy.png";
import airplane from "../assets/27-imgs/airplane.gif";
import AnimatedBG from "./animatedBG";

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
      <AnimatedBG />
      
      {/* conteúdo que ficará a frente do BG, e por isso precisa de um zindez mais alto */}
      <div className="relative z-20 p-8">
        <h1 className="text-4xl font-bold text-white">Bem-vindo a Pagiana inicial da Semcomp</h1>
        <p className="text-white">oioioioii</p>
        
      </div>
    </main>
  );
};

export default Home;
