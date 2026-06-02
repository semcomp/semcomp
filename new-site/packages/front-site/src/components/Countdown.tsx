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

  useEffect(() {
    const id = setInterval(() => setLeft(computeRemaining(target)), 1000);
    return () => clearInterval(id);
  }, [target]);

  if (left.finished) {
    return <div className="text-sm">O evento já começou!</div>;
  }

  const itemClass = "bg-blue-600/90 backdrop-blur-sm text-white transition-all duration-300 ease-in-out mx-1 md:mx-2 px-3 md:px-5 py-4 md:py-6 shadow-lg rounded-lg md:rounded-xl flex flex-col items-center justify-center min-w-fit";

  return (
    <div className="flex gap-2 md:gap-4 items-center justify-center md:justify-start">
      <div className={itemClass}>
        <div className="text-3xl md:text-4xl font-bold">{String(left.days).padStart(3, "0")}</div>
        <div className="text-xs md:text-sm font-medium mt-1">dias</div>
      </div>
      <div className={itemClass}>
        <div className="text-3xl md:text-4xl font-bold">{String(left.hours).padStart(2, "0")}</div>
        <div className="text-xs md:text-sm font-medium mt-1">horas</div>
      </div>
      <div className={itemClass}>
        <div className="text-3xl md:text-4xl font-bold">{String(left.minutes).padStart(2, "0")}</div>
        <div className="text-xs md:text-sm font-medium mt-1">min</div>
      </div>
      <div className={itemClass}>
        <div className="text-3xl md:text-4xl font-bold">{String(left.seconds).padStart(2, "0")}</div>
        <div className="text-xs md:text-sm font-medium mt-1">seg</div>
      </div>
    </div>
  );
}
