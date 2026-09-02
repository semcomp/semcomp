import React, { useRef, useEffect } from "react"
import { Linkedin } from "lucide-react";
import type { TeamType } from "@/types/TeamType";
import { Button, buttonVariants } from "@/components/ui/Button";
import useWindowDimensions from "@/hooks/useWindowDimensions";
import { ChevronDown } from "lucide-react";
import { gsap } from "@/lib/gsap";


export default function TeamGrid({ data }: { data: TeamType }) {
  const { width } = useWindowDimensions();

  const membersSectionRef = useRef<HTMLDivElement>(null);
  const cardsRef = useRef<HTMLDivElement>(null);
  const [currentDepartment, setCurrentDepartment] = React.useState(0);
  const [showAll, setShowAll] = React.useState(false);

  const currentMembers = data.frente[currentDepartment].membros;

  const membersPerPage =
    width < 850 ? 1 :
    width < 1190 ? 2 :
    width < 1600 ? 3 :
    width < 1920 ? 4 :
    5;

  const [memberFilter, setMemberFilter] = React.useState<"todos" | "coordenador" | "membro">("todos");
  const isPresidencia = data.frente[currentDepartment].nomeDaFrente === "Presidência";

  const filteredMembers = currentMembers.filter((member) => {
    const isCoordinator = member.position.includes("Coordenador");
    switch (memberFilter) {
      case "coordenador": return isCoordinator;
      case "membro": return !isCoordinator;
      default: return true;
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
      membersSectionRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
    }, 50);
  }

  const DEFAULT_PHOTO = "/img/team/membro_default.webp";
  const getPhoto = (name: string) => `/img/team/${name}.webp`;

  const getSmallPhoto = (name: string) => `/img/team/mobile/${name}.webp`;

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.from('.team-card', {
        opacity: 0,
        y: 36,
        scale: 0.94,
        duration: 0.5,
        stagger: { amount: 0.45, from: 'start' },
        ease: 'power3.out',
        clearProps: 'all',
      });
    }, cardsRef);
    return () => ctx.revert();
  }, [currentDepartment, memberFilter, visibleMembers.length]);

  const selectedButton = "bg-semcompMidDarkBlue hover:bg-semcompMidDarkBlue/90 text-semcompOffWhite/90 hover:text-semcompOffWhite border-semcompMidDarkBlue dark:bg-semcompOffWhite dark:text-semcompDarkBlue dark:border-semcompOffWhite dark:hover:bg-semcompOffWhite/90 dark:hover:text-semcompDarkBlue";
  const filterBtnBg = "bg-white border-semcompMidLightBlue/30 dark:bg-semcompAlmostDarkBlue dark:border-transparent dark:hover:border-semcompOffWhite/40 hover:bg-semcompMidLightBlue/10 dark:hover:bg-semcompOffWhite/10 dark:hover:text-semcompOffWhite/90 dark:text-semcompOffWhite/70";

  return (
    <div
      ref={membersSectionRef}
      className="flex flex-col gap-4 items-center w-full scroll-mt-80"
    >

      {/* Filtragem de Membros */}
      <div className="flex flex-col sm:flex-row sm:justify-between w-full gap-3">
        <div className="flex gap-2 flex-wrap">
          <Button
            className={`text-semcompDarkBlue ${buttonVariants({ variant: "outline", size: "lg" })} cursor-pointer ${filterBtnBg} ${memberFilter === "todos" ? selectedButton : ""}`}
            onClick={() => { setMemberFilter("todos"); setShowAll(false); }}
          >
            Todos
          </Button>

          {!isPresidencia && (
            <>
              <Button
                className={`text-semcompDarkBlue ${buttonVariants({ variant: "outline", size: "lg" })} cursor-pointer ${filterBtnBg} ${memberFilter === "coordenador" ? selectedButton : ""}`}
                onClick={() => { setMemberFilter("coordenador"); setShowAll(false); }}
              >
                Coordenador(es)
              </Button>

              <Button
                className={`text-semcompDarkBlue ${buttonVariants({ variant: "outline", size: "lg" })} cursor-pointer ${filterBtnBg} ${memberFilter === "membro" ? selectedButton : ""}`}
                onClick={() => { setMemberFilter("membro"); setShowAll(false); }}
              >
                Membros
              </Button>
            </>
          )}
        </div>

        <div className="flex relative items-center sm:ml-auto w-full sm:w-auto">
          <p className="flex items-center whitespace-nowrap text-semcompDarkBlue/80 dark:text-semcompOffWhite/80">Escolha a frente:</p>

          <select
            className="appearance-none z-10 ml-3 flex-1 min-w-0 rounded-md p-2 pr-10 bg-white text-semcompDarkBlue border border-semcompMidLightBlue/50 dark:bg-semcompAlmostDarkBlue dark:text-semcompOffWhite dark:border-semcompOffWhite/40"
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
            className="absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none z-50 text-semcompDarkBlue dark:text-semcompOffWhite"
          />
        </div>
      </div>

      {/* Os Membros */}
      <div
        className={`
          ${(showAll === false && filteredMembers.length > membersPerPage) ? "h-125" : ""}
          bg-semcompMidLightBlue/8 dark:bg-[#091e2e] w-full rounded-xl p-5 sm:p-10 pb-10 sm:pb-15 relative overflow-hidden transition-all duration-700 ease-in-out
        `}
      >
        {/* Gradiente escondendo + membros */}
        <div
          className={`
            ${(showAll === true) ? "hidden" : "absolute"}
            left-0 bottom-0 w-full h-[25%] rounded-xl bg-gradient-to-t from-semcompLightBlue dark:from-[#091e2e] via-30% to-transparent`}
        />

        <div ref={cardsRef} className="flex flex-wrap justify-center gap-8 gap-y-6 w-full pb-8">
          {visibleMembers.length > 0 ? (
            visibleMembers.map((member, index) => (
              <div
                key={index}
                className="team-card bg-white dark:bg-semcompAlmostDarkBlue rounded-xl p-5 flex flex-col items-center text-center w-full max-w-[260px] shadow-[8px_8px_0px_0px_rgba(53,123,163,0.12)] dark:shadow-[12px_12px_0px_0px_#0B2639]"
              >
                <picture>
                  <source
                    media="(max-width: 768px)"
                    srcSet={getSmallPhoto(member.nome)}
                  />

                  <img
                    src={getPhoto(member.nome)}
                    alt={member.nome}
                    loading="lazy"
                    decoding="async"
                    onError={(e) => {
                      (e.currentTarget as HTMLImageElement).src = DEFAULT_PHOTO;
                    }}
                    className="bg-semcompMidLightBlue/15 dark:bg-[#34729c7f] border-solid border-2 border-semcompMidLightBlue/35 dark:border-[#50aae632] w-32 h-32 object-cover rounded-full"
                  />
                </picture>

                <p className="mt-4 font-bold text-lg text-semcompDarkBlue dark:text-semcompOffWhite">
                  {member.nome}
                </p>

                <span className="text-xs sm:text-sm text-semcompDarkBlue/60 dark:text-semcompOffWhite/50">
                  {member.position}
                </span>

                {member.linkedin && (
                  <a
                    href={member.linkedin}
                    target="_blank"
                    rel="noreferrer"
                    className="mt-4 text-semcompMidDarkBlue dark:text-semcompLightBlue hover:scale-105 transition-transform duration-200"
                  >
                    <Linkedin size={24} />
                  </a>
                )}
              </div>
            ))
          ) : (
            <div className="w-full py-10 text-center">
              <p className="text-lg font-medium text-semcompDarkBlue/60 dark:text-semcompOffWhite/50">
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
