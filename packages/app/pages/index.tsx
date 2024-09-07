import { useEffect, useState } from "react";
import { useAppContext } from "../libs/contextLib";
import { useRouter } from "next/router";
import image1 from "../assets/27-imgs/bgs/1.jpg";
import image2 from "../assets/27-imgs/bgs/2.jpg";
import image3 from "../assets/27-imgs/bgs/3.jpg";
import image4 from "../assets/27-imgs/bgs/4.jpg";
import image5 from "../assets/27-imgs/bgs/5.jpg";
import image6 from "../assets/27-imgs/bgs/6.jpg";
import image7 from "../assets/27-imgs/bgs/7.jpg";
import image8 from "../assets/27-imgs/bgs/8.jpg";
import image9 from "../assets/27-imgs/bgs/9.jpg";
import image10 from "../assets/27-imgs/bgs/10.jpg";
import image11 from "../assets/27-imgs/bgs/11.jpg";

// as imagens são importadas para que o webpack possa otimizá-las
const images = [
  image1, image2, image3, image4, image5, image6, 
  image7, image8, image9, image10, image11
];

const timeToImage = [
  { start: 5, end: 7, img: images[0] },
  { start: 7, end: 8, img: images[1] },
  { start: 8, end: 10, img: images[2] },
  { start: 10, end: 12, img: images[3] },
  { start: 12, end: 14, img: images[4] },
  { start: 14, end: 16, img: images[5] },
  { start: 16, end: 17, img: images[6] },
  { start: 17, end: 18, img: images[7] },
  { start: 18, end: 19, img: images[8] },
  { start: 19, end: 22, img: images[9] },
  { start: 0, end: 5, img: images[10] },
];

function Home() {
  const { setUser, setToken } = useAppContext();
  const router = useRouter();
  const [backgroundImage, setBackgroundImage] = useState(images[0]);

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

    const updateBackgroundImage = () => {
      const currentHour = new Date().getHours();
      const matchedImage = timeToImage.find(({ start, end }) => currentHour >= start && currentHour < end);
      setBackgroundImage(matchedImage?.img || images[10]);
    };

    updateBackgroundImage();
    const intervalId = setInterval(updateBackgroundImage, 3600000); // atualiza a cada hora
    return () => clearInterval(intervalId);
  }, [router, setUser, setToken]);

  return (
    <main
      className="min-h-screen bg-gray-800 home"
      style={{
        backgroundImage: `url(${backgroundImage.src})`,
        backgroundPosition: "center bottom",
        backgroundSize: "cover",
        backgroundRepeat: "no-repeat",
      }}
    />
  );
}

export default Home;
