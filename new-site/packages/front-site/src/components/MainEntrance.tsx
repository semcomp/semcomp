import { IonIcon } from "@ionic/react";
import { chevronDownOutline } from "ionicons/icons";
import { motion } from "framer-motion";
import Countdown from "./Countdown";
import SemcompInfo from "../lib/constants/SemcompInfo";
import FotoSemcompMain from "../assets/img/semcomp/Semcomp28.jpg";

export default function MainEntrance() {
  const scrollToContent = () => {
    const sobreSection = document.querySelector(`#sobre`);
    if (sobreSection) {
      sobreSection.scrollIntoView({ behavior: "smooth" });
    }
  };

  return (
    <section
      id="hero"
      aria-label="hero"
      className="relative w-full"
      style={{ height: "calc(100vh - 64px)" }}
    >
      <img
        src={FotoSemcompMain}
        alt={`SEMCOMP ${SemcompInfo.EDITION}`}
        className="absolute inset-0 h-full w-full object-cover"
      />
      <div className="absolute inset-0 bg-semcompOffBlack/50" />

      <div className="absolute w-full flex justify-center px-4">
        <div className="relative w-full max-w-6xl">
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className="bg-semcompOffWhite rounded-b-4xl shadow-xl px-20 py-30 text-center"
          >
            <h1 className="text-7xl md:text-8xl font-sans font-bold text-semcompDarkBlue">
              SEMCOMP {SemcompInfo.EDITION}
            </h1>
            <p className="font-sans mt-2 text-2xl text-semcompMidDarkBlue">
              {SemcompInfo.DATES_STRING}
            </p>
          </motion.div>
          {/* countdown boxes overlapping bottom of white box */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4, duration: 0.8 }}
            className="absolute left-1/2 top-full w-full max-w-5xl -translate-x-1/2 -translate-y-8/12 px-6"
          >
            <div className="mx-auto w-full">
              <Countdown target={new Date(SemcompInfo.START_DATE)} />
            </div>
          </motion.div>
        </div>
      </div>

      {/* Scroll indicator */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 1, duration: 0.6 }}
        className="absolute bottom-4 left-1/2 transform -translate-x-1/2"
      >
        <button
          onClick={scrollToContent}
          className="flex flex-col items-center text-semcompOffWhite hover:text-semcompOffWhite/80 focus:outline-none"
        >
          <IonIcon icon={chevronDownOutline} className="text-5xl animate-bounce" />
        </button>
      </motion.div>
    </section>
  );
}
