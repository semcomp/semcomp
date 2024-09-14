import { ReactElement, useEffect, useState } from "react";

import Card from "../Card";

interface CountdownNumberProps {
  timeIndex: number;
  number: number;
  label: string;
}

function textColor(timeIndex) {
  if(timeIndex <= 6) {
    return 'text-black'
  } else {
    return 'text-white'
  }
}

function CountdownNumber({ timeIndex, number, label }: CountdownNumberProps) {
  return (
    <div className="p-2 md:p-4">
      <Card className="flex flex-col items-center justify-center w-14 h-14 md:w-28 md:h-28">
        <span className={`text-2xl md:text-4xl font-bold ${textColor(timeIndex)}`}>
          {number.toString().padStart(2, "0")}
        </span>
        <span className={`text-xs md:text-base font-bold ${textColor(timeIndex)}`}>{label}</span>
      </Card>
    </div>
  );
}

const Countdown = ({timeIndex}: {timeIndex: number}): ReactElement => {
  const [days, setDays] = useState(null);
  const [hours, setHours] = useState(null);
  const [minutes, setMinutes] = useState(null);
  const [seconds, setSeconds] = useState(null);
  const [timeUp, setTimeUp] = useState(false);

  useEffect(() => {
    setInterval(() => {
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
  }, []);

  const dayString = days > 1 ? "dias" : "dia";

  if (days == null || minutes == null || hours == null || seconds == null) {
    return null;
  }

  if (timeUp) {
    return <p></p>;
  }

  return (
    <div className="flex flex-wrap justify-center">
      <CountdownNumber timeIndex={timeIndex} number={days} label={dayString}></CountdownNumber>
      <CountdownNumber timeIndex={timeIndex} number={hours} label="horas"></CountdownNumber>
      <CountdownNumber timeIndex={timeIndex} number={minutes} label="minutos"></CountdownNumber>
      <CountdownNumber timeIndex={timeIndex} number={seconds} label="segundos"></CountdownNumber>
    </div>
  );
};

export default Countdown;
