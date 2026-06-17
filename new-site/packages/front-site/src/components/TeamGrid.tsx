import React, { useRef } from "react"
import { FaLinkedin } from "react-icons/fa";
import type { TeamType } from "@/types/TeamType";
import { useTheme } from "@/contexts/useTheme";
import { Button, buttonVariants } from "@/components/ui/Button";
import useWindowDimensions from "@/hooks/useWindowDimensions";
import { ChevronDown } from "lucide-react";


export default function TeamGrid({ data }: { data: TeamType }) {
  const { isDarkMode } = useTheme();
  const { width } = useWindowDimensions();

  const membersSectionRef = useRef<HTMLDivElement>(null);
  const [currentDepartment, setCurrentDepartment] = React.useState(0);
  const [showAll, setShowAll] = React.useState(false);

  const currentMembers = data.frente[currentDepartment].membros;

  const membersPerPage =
    width < 850 ? 1 :      // celular
    width < 1190 ? 2 :     // celular
    width < 1600 ? 3 :     // notebook
    width < 1920 ? 4 :     
    5;                    // desktop full screen [1920px]

  const [memberFilter, setMemberFilter] = React.useState<"todos" | "coordenador" | "membro">("todos");
  const selectedButton = "bg-white text-semcompDarkBlue border-white";
  const isPresidencia = data.frente[currentDepartment].nomeDaFrente === "Presidência";

  const filteredMembers = currentMembers.filter((member) => {
    const isCoordinator =
      member.position.includes("Coordenador");

    switch (memberFilter) {
      case "coordenador":
        return isCoordinator;

      case "membro":
        return !isCoordinator;

      default:
        return true;
    }
  });
  
  const visibleMembers = showAll
    ? filteredMembers
    : filteredMembers.slice(0, membersPerPage*2);

  function changeDepartment(index: number) {
    setCurrentDepartment(index);

    setShowAll(false);
    setMemberFilter("todos");

    setTimeout(() => {
      membersSectionRef.current?.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
    }, 50);
  }

  const images = import.meta.glob("@/assets/img/team/*.webp", {
    eager: true,
    import: "default"
  }) as Record<string, string>;

  const DEFAULT_PHOTO = images["/src/assets/img/team/membro_default.webp"];

  const getPhoto = (name: string) => {
    const photo = images[`/src/assets/img/team/${name}.webp`];

    return photo ?? DEFAULT_PHOTO;
    };

  const textColor = isDarkMode ? "text-semcompOffWhite/50" : "text-semcompDarkBlue/60";

  return (
    <div
      ref={membersSectionRef}
      className="flex flex-col gap-4 items-center w-full scroll-mt-80"
    >

      {/* Filtragem de Membros */}
      <div className="flex justify-between w-full">
        <div className="flex gap-3">
          <Button 
            className={`
              ${buttonVariants({ variant: "outline", size: "lg" })}
              cursor-pointer bg-[#003050]
              ${memberFilter === "todos" ? selectedButton : ""}
            `}
            onClick={() => {
              setMemberFilter("todos");
              setShowAll(false);
            }}
          >
            Todos
          </Button>
        
        {!isPresidencia && (
          <>
            <Button 
              className={`
                ${buttonVariants({ variant: "outline", size: "lg" })}
                cursor-pointer bg-[#003050]
                ${memberFilter === "coordenador" ? selectedButton : ""}
              `}
              onClick={() => {
                setMemberFilter("coordenador");
                setShowAll(false);
              }}
            >
              Coordenador(es)
            </Button>

            <Button 
              className={`
                ${buttonVariants({ variant: "outline", size: "lg" })}
                cursor-pointer bg-[#003050]
                ${memberFilter === "membro" ? selectedButton : ""}
              `}
              onClick={() => {
                setMemberFilter("membro");
                setShowAll(false);
              }}
            >
              Membros
            </Button>
          </>
        )}
        </div>

        <div className="flex relative items-center">
          <p className="flex items-center">Escolha a frente:</p>

          <select
            className="appearance-none z-10 ml-3 rounded-md p-2 pr-10 bg-[#003050] text-white border border-white"
            value={currentDepartment}
            onChange={(e) => changeDepartment(Number(e.target.value))}
          >
            {data.frente.map((frente, index) => (
              <option key={index} value={index}>
                {frente.nomeDaFrente}
              </option>
            ))}
          </select>

          <ChevronDown
            size={20}
            className="absolute right-2 top-1/2 -translate-y-1/2 text-white pointer-events-none z-50"
          />
        </div>
      </div>

      {/* Os Membros */}
      <div 
      className={`
        ${(showAll === false && filteredMembers.length > membersPerPage) ? "h-125" : ""}
        bg-[#091e2e] w-full rounded-xl p-10 pb-15 relative overflow-hidden transition-all duration-700 ease-in-out
        `}
      > 
        {/* Gradiente escondendo + membros */}
        <div 
          className={`
            ${(showAll === true) ? "hidden" : "absolute"}
            left-0 bottom-0 w-[100%] h-[25%] rounded-xl bg-gradient-to-t from-[#091e2e] via-[#091e2e] via-30% to-transparent`}
          >
        </div>

        <div className="flex flex-wrap justify-center gap-8 gap-y-6 w-full pb-8">
          {visibleMembers.length > 0 ? (
            visibleMembers.map((member, index) => (
              <div
                key={index}
                className="bg-[#003050] rounded-xl p-5 flex flex-col items-center text-center w-full max-w-[260px] shadow-[16px_16px_0px_0px_#0B2639]"
              >
                <img
                  src={getPhoto(member.nome)}
                  alt={member.nome}
                  className="bg-[#34729c7f] border-solid border-2 border-[#50aae632] w-32 h-32 object-cover rounded-full"
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
            ))
          ) : (
            <div className="w-full py-10 text-center">
              <p className={`text-lg font-medium ${textColor}`}>
                Nenhum membro encontrado.
              </p>
            </div>
          )}
          
        </div>

        {filteredMembers.length > membersPerPage && (
          <div className="left-1/2 -translate-x-1/2 bottom-5 absolute">
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