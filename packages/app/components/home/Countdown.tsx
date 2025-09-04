import { ReactElement, useEffect, useState } from "react";

import Card from "../Card";

interface CountdownNumberProps {
  number: number;
  label: string;
}

function textColor() {
  return 'text-white' // Cor branca consistente para o novo design
}

function borderColor() {
  return 'border-white' // Borda branca consistente para o novo design
}

function CountdownNumber({ number, label }: CountdownNumberProps) {
  return (
    <div className="p-2 md:p-4">
      <Card className={`flex flex-col items-center justify-center phone:w-14 phone:h-14 tablet:w-24 tablet:h-24 md:w-24 md:h-24 border-solid border rounded-lg ${borderColor()}`}>
        <span className={`phone:text-lg tablet:text-4xl md:text-4xl ${textColor()}`}>
          {number.toString().padStart(2, "0")}
        </span>
        <span className={`phone:text-[10px] tablet:text-base md:text-base ${textColor()}`}>{label}</span>
      </Card>
    </div>
  );
}

const Countdown = (): ReactElement => {
  const [days, setDays] = useState(null);
  const [hours, setHours] = useState(null);
  const [minutes, setMinutes] = useState(null);
  const [seconds, setSeconds] = useState(null);
  const [timeUp, setTimeUp] = useState(false);

  useEffect(() => {
    setInterval(() => {
      let eventDate = new Date(2025, 10, 16, 8).getTime();
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
      <CountdownNumber number={days} label={dayString}></CountdownNumber>
      <CountdownNumber number={hours} label="horas"></CountdownNumber>
      <CountdownNumber number={minutes} label="minutos"></CountdownNumber>
      <CountdownNumber number={seconds} label="segundos"></CountdownNumber>
    </div>
  );
};

export default Countdown;