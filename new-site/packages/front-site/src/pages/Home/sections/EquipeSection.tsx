import { useEffect, useRef } from "react";
import { gsap } from "@/lib/gsap";
import TeamGrid from "@/components/TeamGrid";
import TEAM from "@/lib/constants/Team";
import RevealHeading from "@/components/ui/RevealHeading";
import SectionWatermark from "@/components/ui/SectionWatermark";

type EquipeSectionProps = { className?: string };

const EquipeSection = ({ className }: EquipeSectionProps) => {
  const sectionRef = useRef<HTMLElement>(null);

  const totalMembers = TEAM.frente.reduce((total, frente) => total + frente.membros.length, 0);
  const totalDepartments = TEAM.frente.length - 1;

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.from('.equipe-divider', {
        scaleX: 0,
        duration: 0.8,
        ease: 'power3.out',
        transformOrigin: 'left center',
        clearProps: 'all',
        scrollTrigger: { trigger: '.equipe-divider', start: 'top 88%', once: true },
      });
    }, sectionRef);

    return () => ctx.revert();
  }, []);

  return (
    <section ref={sectionRef} id="equipe" className={`${className} py-10 md:py-30 relative overflow-hidden`}>
      <SectionWatermark
        src="/img/decorative/setas.png"
        className="w-[60vw] md:w-[38vw] opacity-[0.06] right-0 bottom-0 translate-x-1/4 translate-y-1/4"
        style={{ mixBlendMode: 'multiply' }}
      />
      <div className="section-container">
        <RevealHeading
          words={[{ text: 'Conheça nossa' }, { text: 'Equipe', gradient: true }]}
          plainClass="text-semcompDarkBlue dark:text-semcompOffWhite"
          gradientClass="bg-linear-to-r from-semcompDarkBlue/80 via-semcompDarkBlue to-semcompOffBlack dark:from-semcompLightBlue/80 dark:via-semcompLightBlue dark:to-semcompOffWhite"
          className="text-2xl md:text-4xl font-extrabold mb-7 text-center font-poppins"
        />
        <p className="opacity-70 text-justify mb-5">
          A edição da SEMCOMP deste ano é construída com o esforço e dedicação de aproximadamente {totalMembers} membros,
          organizados em {totalDepartments} frentes distintas, além da presidência.
        </p>
        <hr className="equipe-divider w-full border border-semcompMidLightBlue dark:border-semcompOffWhite mb-7" />
        <TeamGrid data={TEAM} />
      </div>
    </section>
  );
};

export default EquipeSection;
