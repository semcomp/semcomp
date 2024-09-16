// Função compartilhada para obter as cores, extraímos para reutilizar
function getTitleColor(timeIndex: number): string {
  if (timeIndex === 0) return "#EFEAFA";
  if (timeIndex === 1) return "#FCFBFF";
  if (timeIndex === 2) return "#300E82";
  if (timeIndex <= 5) return "#242D5C";
  if (timeIndex === 6) return "#242D59";
  if (timeIndex <= 8) return "#F9F004";
  if (timeIndex === 9) return "#F9F004";

  return "#F9F004";
}

// Componente Countdown atualizado para usar a função getTitleColor
import { ReactElement, useEffect, useState } from "react";
import Card from "../Card";

interface CountdownNumberProps {
  timeIndex: number;
  number: number;
  label: string;
}

function CountdownNumber({ timeIndex, number, label }: CountdownNumberProps) {
  const textColor = getTitleColor(timeIndex); // Usando a função compartilhada para definir as cores
  return (
    <div className="p-2 md:p-4">
      <Card
        className={`flex flex-col items-center justify-center phone:w-14 phone:h-14 tablet:w-24 tablet:h-24 md:w-24 md:h-24 border-solid border rounded-lg`}
        style={{ borderColor: textColor }} // Cor da borda baseada no timeIndex
      >
        <span
          className={`phone:text-lg tablet:text-4xl md:text-4xl`}
          style={{ color: textColor }} // Cor do texto baseada no timeIndex
        >
          {number.toString().padStart(2, "0")}
        </span>
        <span
          className={`phone:text-[10px] tablet:text-base md:text-base`}
          style={{ color: textColor }} // Cor da label baseada no timeIndex
        >
          {label}
        </span>
      </Card>
    </div>
  );
}

const Countdown = ({ timeIndex }: { timeIndex: number }): ReactElement => {
  const [days, setDays] = useState<number | null>(null);
  const [hours, setHours] = useState<number | null>(null);
  const [minutes, setMinutes] = useState<number | null>(null);
  const [seconds, setSeconds] = useState<number | null>(null);
  const [timeUp, setTimeUp] = useState(false);

  useEffect(() => {
    const intervalId = setInterval(() => {
      let eventDate = new Date(2024, 9, 19, 8).getTime();
      let difference = eventDate - new Date().getTime();
      if (difference < 1) {
        setTimeUp(true);
      } else {
        let days = Math.floor(difference / (1000 * 60 * 60 * 24));
        let hours = Math.floor((difference / (1000 * 60 * 60)) % 24);
        let minutes = Math.floor((difference / (1000 * 60)) % 60);
        let seconds = Math.floor((difference / 1000) % 60);
        setDays(days);
        setHours(hours);
        setMinutes(minutes);
        setSeconds(seconds);
      }
    }, 1000);

    return () => clearInterval(intervalId);
  }, []);

  const dayString = days > 1 ? "dias" : "dia";

  if (days == null || minutes == null || hours == null || seconds == null) {
    return null;
  }

  if (timeUp) {
    return <p></p>;
  }

  return (
    <div className="flex flex-wrap justify-center font-thin select-none font-secondary">
      <CountdownNumber timeIndex={timeIndex} number={days} label={dayString}></CountdownNumber>
      <CountdownNumber timeIndex={timeIndex} number={hours} label="horas"></CountdownNumber>
      <CountdownNumber timeIndex={timeIndex} number={minutes} label="minutos"></CountdownNumber>
      <CountdownNumber timeIndex={timeIndex} number={seconds} label="segundos"></CountdownNumber>
    </div>
  );
};

export default Countdown;
