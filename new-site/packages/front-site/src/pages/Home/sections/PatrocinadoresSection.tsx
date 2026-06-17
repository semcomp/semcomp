import { useRef, useEffect } from "react";
import type { SponsorType } from "@/types/SponsorType";
import logo1 from "@/assets/img/Patrocinadores/logo_patrocinador1.png";
import logo2 from "@/assets/img/Patrocinadores/logo_patrocinador2.png";
import logo3 from "@/assets/img/Patrocinadores/logo_patrocinador3.png";
import { useTheme } from "@/contexts/useTheme";


type PatrocinadoresProps = {
  sponsors: SponsorType[];
  className?: string;
};

const PatrocinadoresSection = ({}: PatrocinadoresProps) => {
  const logoFiles = [logo1, logo2, logo3];
  const logos = [...logoFiles, ...logoFiles, ...logoFiles, ...logoFiles, ...logoFiles, ...logoFiles, ...logoFiles, ...logoFiles, ...logoFiles, ...logoFiles, ...logoFiles];

  const trackRef = useRef<HTMLDivElement>(null);
  const positionRef = useRef(0);
  const speedRef = useRef(1); // px por frame
  const targetSpeedRef = useRef(1);
  const rafRef = useRef<number>(0);
  const isHoveringRef = useRef(false);
  
  const { isDarkMode } = useTheme();
  const backgroundColorFront = isDarkMode ? "semcompMidDarkBlue" : "semcompMidLightBlue";
  const backgroundColorBack = isDarkMode ? "#0F486D" : "#2c6e94";
  const textColor = isDarkMode ? "semcompOffWhite" : "semcompLightBlue";

  const NORMAL_SPEED = 0.5;
  const TRACK_LOOP_WIDTH_FRACTION = 1 / 3;

  useEffect(() => {
    const track = trackRef.current;
    if (!track) return;

    const animate = () => {
      // Suaviza a velocidade em direção ao alvo
      speedRef.current += (targetSpeedRef.current - speedRef.current) * 0.04;

      positionRef.current -= speedRef.current;

      const totalWidth = track.scrollWidth;
      const loopWidth = totalWidth * TRACK_LOOP_WIDTH_FRACTION;

      if (Math.abs(positionRef.current) >= loopWidth) {
        positionRef.current += loopWidth;
      }

      track.style.transform = `translateX(${positionRef.current}px)`;
      rafRef.current = requestAnimationFrame(animate);
    };

    rafRef.current = requestAnimationFrame(animate);

    return () => cancelAnimationFrame(rafRef.current);
  }, []);

  const handleMouseEnter = () => {
    isHoveringRef.current = true;
    targetSpeedRef.current = 0;
  };

  const handleMouseLeave = () => {
    isHoveringRef.current = false;
    targetSpeedRef.current = NORMAL_SPEED;
  };

  return (
    <section
      className="w-full overflow-hidden"
      style={{ backgroundColor: backgroundColorBack }}
    >

      {/* Header */}
      <div
        className={`w-full py-4 px-4 sm:px-8 lg:px-16 bg-${backgroundColorFront}`}
      >
        <h2
          className={`text-center text-3xl sm:text-1xl lg:text-1xl text-${textColor}`}
          style={{ fontFamily: "Poppins, sans-serif"}}
        >
          Nossos Patrocinadores
        </h2>
      </div>

      {/* Scrolling logos */}
      <div
        className="relative w-full overflow-hidden pb-4"
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
      >
        <div
          ref={trackRef}
          className="flex items-center gap-22"
          style={{ width: "max-content", willChange: "transform" }}
        >
          {logos.map((src, index) => (
            <div
              key={index}
              className="flex-shrink-0 flex items-center justify-center"
              style={{ opacity: 0.35 }}
            >
              <img
                src={src}
                alt={`Patrocinador ${(index % logoFiles.length) + 1}`}
                className="h-36 w-auto object-contain"
                style={{ filter: "brightness(0) invert(1)" }}
              />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default PatrocinadoresSection;