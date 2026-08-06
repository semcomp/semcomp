import tira1 from "@/assets/img/Profile/Tira-1.svg";
import tira2 from "@/assets/img/Profile/Tira-2.svg";
import tira3 from "@/assets/img/Profile/Tira-3.svg";
import tira4 from "@/assets/img/Profile/Tira-4.svg";

const ANIMATION_DURATION = 80;
const MULTIPLIER = 8;
const ROTATION_ANGLE = 11;

export const AnimatedBackground = () => {
  const baseSequence = [
    { src: tira1, direction: "animate-up" },
    { src: tira2, direction: "animate-down" },
    { src: tira3, direction: "animate-up" },
    { src: tira4, direction: "animate-down" },
  ];
  
  const sequence = Array(MULTIPLIER).fill(baseSequence).flat();
  const imageRepetitions = Array(MULTIPLIER).fill(0);

  return (
    <>
      <style>{`
        @keyframes moveUp {
          0% { transform: translateY(0); }
          100% { transform: translateY(-25%); }
        }
        @keyframes moveDown {
          0% { transform: translateY(-25%); }
          100% { transform: translateY(0); }
        }

        .animate-up { animation: moveUp ${ANIMATION_DURATION}s linear infinite; }
        .animate-down { animation: moveDown ${ANIMATION_DURATION}s linear infinite; }
        
        .content-over-background {
          position: relative;
          z-index: 10;
        }
      `}</style>

      <div className="absolute inset-0 w-full h-full overflow-hidden z-0 pointer-events-none bg-semcompMidDarkBlue dark:bg-semcompDarkBlue transition-colors duration-300">
        <div 
          className="absolute top-[-50vh] left-[-50vw] w-[200vw] h-[200vh] flex justify-center gap-[0.8%]"
          style={{ transform: `rotate(${ROTATION_ANGLE}deg)` }}
        >
          {sequence.map((tira, indexCol) => (
            <div key={indexCol} className="flex-1 h-full relative overflow-visible">
              <div className={`absolute top-0 left-0 w-full flex flex-col will-change-transform ${tira.direction}`}>
                {imageRepetitions.map((_, indexImg) => (
                  <img 
                    key={indexImg} 
                    src={tira.src} 
                    alt="" 
                    className="w-full h-auto block" 
                  />
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </>
  );
};