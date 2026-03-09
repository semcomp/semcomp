import { useEffect, useState } from "react";


function computeRemaining(to: Date) {
  const now = new Date();
  const diff = Math.max(0, to.getTime() - now.getTime());
  const seconds = Math.floor(diff / 1000) % 60;
  const minutes = Math.floor(diff / (1000 * 60)) % 60;
  const hours = Math.floor(diff / (1000 * 60 * 60)) % 24;
  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  return { days, hours, minutes, seconds, finished: diff === 0 };
}

export default function Countdown({ target }: { target: Date }) {
  const [left, setLeft] = useState(() => computeRemaining(target));

  useEffect(() => {
    const id = setInterval(() => setLeft(computeRemaining(target)), 1000);
    return () => clearInterval(id);
  }, [target]);

  if (left.finished) return <div className="text-sm">O evento já começou!</div>;

  const itemClass = `bg-gradient-to-b from-semcompMidLightBlue to-semcompOffBlack text-semcompOffWhite mx-6 px-4 py-12 shadow-md rounded-4xl flex flex-col items-center justify-center`;

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 items-center justify-between">
      <div className={itemClass}>
        <div className="text-2xl md:text-3xl font-semibold">{left.days}</div>
        <div className="text-xs md:text-sm">dias</div>
      </div>
      <div className={itemClass}>
        <div className="text-2xl md:text-3xl font-semibold">{left.hours}</div>
        <div className="text-xs md:text-sm">horas</div>
      </div>
      <div className={itemClass}>
        <div className="text-2xl md:text-3xl font-semibold">{left.minutes}</div>
        <div className="text-xs md:text-sm">minutos</div>
      </div>
      <div className={itemClass}>
        <div className="text-2xl md:text-3xl font-semibold">{left.seconds}</div>
        <div className="text-xs md:text-sm">segundos</div>
      </div>
    </div>
  );
}
