import React from "react"
import FotoSemcompMain from "../assets/img/semcomp/Semcomp28.jpg";
import { FaLinkedin } from "react-icons/fa";
import type { TeamType } from "@/types/TeamType";



export default function TeamGrid({ data }: { data: TeamType }) {

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


  return (
    <div className="flex flex-col gap-4 items-center">
      {/* linha de 4 */}
      <div className="flex gap-8 justify-center">
        {firstRow.map(([department], index) => (
          <button
            key={index}
            className={`p-5 bg-semcompMidLightBlue rounded-md flex items-center justify-center text-white font-semibold shadow-md transition-transform transform hover:scale-105 hover:bg-semcompAlmostDarkBlue ${currentDepartment === index ? "bg-sky-400 hover:bg-sky-500" : "bg-semcompMidLightBlue hover:bg-semcompAlmostDarkBlue"}`}
            onClick={() => changePictures(index)}
          >
            {department}
          </button>
        ))}
      </div>

      {/* linha de 5 */}
      <div className="flex gap-8 w-[60%] justify-center">
        {secondRow.map(([department], index) => (
          <button
            key={index + 4}
            className={`p-5 rounded-md flex items-center justify-center text-white font-semibold shadow-md transition-transform transform hover:scale-105 ${currentDepartment === index + 4 ? "bg-sky-400 hover:bg-sky-500" : "bg-semcompMidLightBlue hover:bg-semcompAlmostDarkBlue"} `}
            onClick={() => changePictures(index + 4)}
          >
            {department}
          </button>
        ))}
      </div>

      <div
        key={currentDepartment}
        className="flex flex-wrap gap-8 justify-center pt-10 transition-all duration-500 transform animate-slide"
      >
        {data.frente[currentDepartment].membros.map((member) => (
          <div>
          <div key={member.nome} className="text-center justify-items-center hover:scale-120 transition-transform cursor-pointer">
            <img
              src={getPhoto(member.nome)}
              alt={member.nome}
              className="w-40 h-40 object-cover justify-center rounded-3xl"
            />
            <div className="mt-2 font-bold">{member.nome}</div>
            <div className="flex flex-wrap text-sm w-[80%] text-gray-600">{member.position}</div>
            {member.linkedin && (
              <FaLinkedin
                className="mx-auto mt-2 text-[#0A66C2] hover:text-[#004182] cursor-pointer"
                size={24}
                onClick={() => window.open(member.linkedin, "_blank")}
              />
            )}
          </div>
        </div>
        ))}
      </div>

      <div>
        
      </div>
    </div>
  );
}