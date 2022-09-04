import { ReactElement, useEffect, useState } from "react";

import Card from "../Card";

function CountdownNumber({ number, label }: { number: number; label: string }) {
  return (
    <div className="p-2 md:p-4">
      <Card className="flex flex-col items-center justify-center w-20 md:w-28 h-20 md:h-28">
        <span className="text-2xl md:text-4xl text-white">
          {number.toString().padStart(2, "0")}
        </span>
        <span className="text-xs md:text-base text-white">{label}</span>
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
      let eventDate = new Date(2022, 8, 24).getTime();
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
    return <p>Event in progress</p>;
  }

  return (
    <div className="flex flex-wrap justify-center">
      <CountdownNumber number={days} label={dayString}></CountdownNumber>
      <CountdownNumber number={hours} label="horas"></CountdownNumber>
      <CountdownNumber number={minutes} label="minutos"></CountdownNumber>
      <CountdownNumber number={seconds} label="segundos"></CountdownNumber>
    </div>
  );
};

export default Countdown;
