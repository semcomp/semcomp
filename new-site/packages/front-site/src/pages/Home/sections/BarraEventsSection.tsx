const EVENTS = [
  { icon: "/img/Home/Icons/iconPalestras.svg",  label: "Palestras"   },
  { icon: "/img/Home/Icons/iconMinicursos.svg", label: "MiniCursos"  },
  { icon: "/img/Home/Icons/iconConcursos.svg",  label: "Concursos"   },
  { icon: "/img/Home/Icons/iconHackaton.svg",   label: "Hackatons"   },
  { icon: "/img/Home/Icons/iconGameNight.svg",  label: "Game Nights" },
];

export default function BarraEventsSection() {
  return (
    <section className="bg-semcompAlmostDarkBlue flex justify-center">
      <div className="w-full sm:w-[80%] p-3 sm:p-7 flex justify-around gap-1">
        {EVENTS.map(({ icon, label }) => (
          <div
            key={label}
            className="flex flex-col items-center justify-center gap-1 sm:gap-2 flex-1 min-w-0 px-1"
          >
            <img className="h-9 sm:h-12 lg:h-15 mb-1 sm:mb-2 w-auto" src={icon} alt={`Ícone representando ${label}`} />
            <p className="text-center text-[10px] sm:text-sm lg:text-lg text-semcompLightBlue leading-tight">{label}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
