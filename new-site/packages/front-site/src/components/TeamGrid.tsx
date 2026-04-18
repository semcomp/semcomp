import React from "react"
import { FaLinkedin } from "react-icons/fa";
import type { TeamType } from "@/types/TeamType";
import { useTheme } from "@/contexts/useTheme";



export default function TeamGrid({ data }: { data: TeamType }) {
  const { isDarkMode } = useTheme();
  const [currentDepartment, setCurrentDepartment] = React.useState(0);

  const frentes = data.frente.map((item) => [item.nomeDaFrente]);

  function changePictures(index: number) {
    setCurrentDepartment(index);
  }

  const firstRow = frentes.slice(0, 4);
  const secondRow = frentes.slice(4, 9);

  const images = import.meta.glob("@/assets/img/team/*jpg", {
    eager: true,
    import: "default"
  }) as Record<string, string>;

  const getPhoto = (name: string) =>
    images[`/src/assets/img/team/${name}.jpg`];

  const textColor = isDarkMode ? "text-semcompOffWhite/50" : "text-semcompDarkBlue/60";

  return (
    <div className="flex flex-col gap-4 items-center w-full">
      {/* linha de 4 */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 md:gap-6 w-full">
        {firstRow.map(([department], index) => (
          <button
            key={index}
            className={`w-full min-h-14 p-3 sm:p-4 md:p-5 rounded-md flex items-center justify-center text-center text-sm sm:text-base text-semcompOffWhite font-semibold shadow-md transition-transform transform hover:scale-105 ${currentDepartment === index ? "bg-semcompAlmostDarkBlue hover:bg-semcompAlmostDarkBlue" : "bg-semcompMidLightBlue hover:bg-semcompMidDarkBlue"}`}
            onClick={() => changePictures(index)}
          >
            {department}
          </button>
        ))}
      </div>

      {/* linha de 5 */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-3 sm:gap-4 md:gap-6 w-full">
        {secondRow.map(([department], index) => (
          <button
            key={index + 4}
            className={`w-full min-h-14 p-3 sm:p-4 md:p-5 rounded-md flex items-center justify-center text-center text-sm sm:text-base text-semcompOffWhite font-semibold shadow-md transition-transform transform hover:scale-105 ${currentDepartment === index + 4 ? "bg-semcompAlmostDarkBlue hover:bg-semcompAlmostDarkBlue" : "bg-semcompMidLightBlue hover:bg-semcompMidDarkBlue"} `}
            onClick={() => changePictures(index + 4)}
          >
            {department}
          </button>
        ))}
      </div>

      <div
        key={currentDepartment}
        className="flex flex-wrap gap-6 sm:gap-8 justify-center pt-6 sm:pt-10 transition-all duration-500 transform animate-slide w-full"
      >
        {data.frente[currentDepartment].membros.map((member) => (
          <div key={member.nome} className="w-36 sm:w-40 md:w-44 text-center justify-items-center hover:scale-105 transition-transform cursor-pointer">
            <img
              src={getPhoto(member.nome)}
              alt={member.nome}
              loading="lazy"
              decoding="async"
              sizes="(max-width: 640px) 112px, (max-width: 768px) 144px, 160px"
              className="w-28 h-28 sm:w-36 sm:h-36 md:w-40 md:h-40 object-cover justify-center rounded-3xl"
            />
            <div className="mt-2 font-bold">
              {member.nome.split(' ').slice(0, -1).join(' ')}
              <br />
              {member.nome.split(' ').slice(-1)[0]}
            </div>
            <div className={`flex flex-wrap justify-center text-xs sm:text-sm w-full ${textColor} `}>{member.position}</div>
            {member.linkedin && (
              <FaLinkedin
                className="mx-auto mt-2 text-[#0A66C2] hover:text-[#004182] cursor-pointer"
                size={24}
                onClick={() => window.open(member.linkedin, "_blank")}
              />
            )}
          </div>
        ))}
      </div>

    </div>
  );
}