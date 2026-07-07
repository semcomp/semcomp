import { useEffect, useRef } from "react";
import { gsap } from "@/lib/gsap";
import iconPalestras from "@/assets/img/Home/Icons/iconPalestras.svg"
import iconMinicursos from "@/assets/img/Home/Icons/iconMinicursos.svg"
import iconConcursos from "@/assets/img/Home/Icons/iconConcursos.svg"
import iconHackaton from "@/assets/img/Home/Icons/iconHackaton.svg"
import iconGameNight from "@/assets/img/Home/Icons/iconGameNight.svg"

const EVENTS = [
  { icon: iconPalestras,  label: "Palestras"   },
  { icon: iconMinicursos, label: "MiniCursos"  },
  { icon: iconConcursos,  label: "Concursos"   },
  { icon: iconHackaton,   label: "Hackatons"   },
  { icon: iconGameNight,  label: "Game Nights" },
];

export default function BarraEventsSection() {
  const sectionRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.from('.barra-item', {
        opacity: 0,
        y: 28,
        duration: 0.5,
        stagger: 0.1,
        ease: 'power2.out',
        scrollTrigger: {
          trigger: sectionRef.current,
          start: 'top 88%',
          once: true,
        },
      });
    }, sectionRef);

    return () => ctx.revert();
  }, []);

  return (
    <section ref={sectionRef} className="bg-semcompMidDarkBlue flex justify-center">
      <div className="w-full sm:w-[80%] p-3 sm:p-7 flex justify-around gap-1">
        {EVENTS.map(({ icon, label }) => (
          <div
            key={label}
            className="barra-item flex flex-col items-center justify-center gap-1 sm:gap-2 flex-1 min-w-0 px-1"
          >
            <img className="h-9 sm:h-12 lg:h-15 mb-1 sm:mb-2 w-auto" src={icon} alt={`Ícone representando ${label}`} />
            <p className="text-center text-[10px] sm:text-sm lg:text-lg text-semcompLightBlue leading-tight">{label}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
