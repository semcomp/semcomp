import Countdown from "./Countdown";
import SemcompInfo from "../libs/constants/SemcompInfo";
import FotoSemcompMain from "../assets/img/semcomp/Semcomp28.jpg";

export default function MainEntrance() {
  
  return (
    <section aria-label="hero" className="relative w-full" style={{ height: "calc(100vh - 64px)" }}>
      <img src={FotoSemcompMain} alt={`SEMCOMP ${SemcompInfo.EDITION}`} className="absolute inset-0 h-full w-full object-cover" />
      <div className="absolute inset-0 bg-black/50" />

      <div className="absolute w-full flex justify-center px-4">
        <div className="relative w-full max-w-6xl">
          <div className="bg-white rounded-b-4xl shadow-xl px-20 py-30 text-center">
            <h1 className="text-7xl md:text-8xl font-sans font-bold text-[#003050]">SEMCOMP {SemcompInfo.EDITION}</h1>
            <p className="font-sans mt-2 text-2xl text-slate-600">{SemcompInfo.DATES_STRING}</p>
          </div>


          {/* countdown boxes overlapping bottom of white box */}
          <div className="absolute left-1/2 top-full w-full max-w-5xl -translate-x-1/2 -translate-y-8/12 px-6">
            <div className="mx-auto w-full">
              <Countdown target={new Date(SemcompInfo.START_DATE)} />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
