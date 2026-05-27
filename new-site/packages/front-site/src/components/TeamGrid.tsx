import React from "react"
import { FaLinkedin } from "react-icons/fa";
import type { TeamType } from "@/types/TeamType";
import { useTheme } from "@/contexts/useTheme";
import { Button, buttonVariants } from "@/components/ui/Button";


export default function TeamGrid({ data }: { data: TeamType }) {
  const { isDarkMode } = useTheme();

  const [currentDepartment, setCurrentDepartment] = React.useState(0);
  const [showAll, setShowAll] = React.useState(false);

  const currentMembers = data.frente[currentDepartment].membros;

  const visibleMembers = showAll
    ? currentMembers
    : currentMembers.slice(0, 10);


  function changeDepartment(index: number) {
    setCurrentDepartment(index);

    setShowAll(false);
  }

  const images = import.meta.glob("@/assets/img/team/*.webp", {
    eager: true,
    import: "default"
  }) as Record<string, string>;

  const getPhoto = (name: string) =>
    images[`/src/assets/img/team/${name}.webp`];

  const textColor = isDarkMode ? "text-semcompOffWhite/50" : "text-semcompDarkBlue/60";

  return (
    <div className="flex flex-col gap-4 items-center w-full">

      {/* Filtragem de Membros */}
      <div className="flex justify-between w-full">
        <div className="flex gap-3">
          <Button className={`${buttonVariants({ variant: "outline", size: "lg" })} cursor-pointer bg-green`}>Todos</Button>
          <Button className={`${buttonVariants({ variant: "outline", size: "lg" })} cursor-pointer bg-green`}>Coordenador(es)</Button>
          <Button className={`${buttonVariants({ variant: "outline", size: "lg" })} cursor-pointer bg-green`}>Membros</Button>
        </div>

        <div className="flex">
          <p className="flex items-center">Escolha a frente:</p>
          <select
            className="ml-3 rounded-md px-3 py-2 bg-[#003050] text-white"
            value={currentDepartment}
            onChange={(e) => changeDepartment(Number(e.target.value))}
          >
            {data.frente.map((frente, index) => (
              <option key={index} value={index}>
                {frente.nomeDaFrente}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Os Membros */}
      <div className="bg-[#00000033] w-full rounded-xl p-10 pb-15">

        <div
          className="
            flex flex-wrap justify-center gap-8 gap-y-6 w-full pr-4
          "
        >
          {visibleMembers.map((member, index) => (
            <div
              key={index}
              className=" bg-[#003050] rounded-xl p-5 flex flex-col items-center text-center w-full max-w-[260px] shadow-[16px_16px_0px_0px_#0B2639]"
            >
              <img
                src={getPhoto(member.nome) || "/fallback.webp"}
                alt={member.nome}
                className="w-32 h-32 object-cover rounded-full"
              />

              <p className="mt-4 font-bold text-lg">
                {member.nome}
              </p>

              <span className={`text-xs sm:text-sm ${textColor}`}>
                {member.position}
              </span>

              {member.linkedin && (
                <a
                  href={member.linkedin}
                  target="_blank"
                  rel="noreferrer"
                  className="mt-4"
                >
                  <FaLinkedin size={24} />
                </a>
              )}
            </div>
          ))}
        </div>

        {currentMembers.length > 10 && (
          <div className="flex justify-center">
            <Button
              className="mt-8 cursor-pointer"
              onClick={() => setShowAll(!showAll)}
            >
              {showAll ? "Ver menos" : "Ver mais"}
            </Button>
          </div>
        )}
      </div>

    </div>
  );
}