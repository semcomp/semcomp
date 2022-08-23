import { useEffect, useState } from "react";

const Countdown = () => {
  const [days, setDays] = useState(null);
  const [hours, setHours] = useState(null);
  const [minutes, setMinutes] = useState(null);
  const [seconds, setSeconds] = useState(null);
  const [timeUp, setTimeUp] = useState(false);

  useEffect(() => {
    setInterval(() => {
      let eventDate = (new Date(2022,8,24)).getTime();
      let difference = eventDate - (new Date()).getTime();
      if (difference < 1) {
        setTimeUp(true);
      } else {
        let days = Math.floor(difference / (1000 * 60 * 60 * 24));
        let hours = Math.floor((difference / (1000 * 60 * 60)) % 24);
        let minutes = Math.floor((difference / (1000 * 60)) % 60);
        let seconds = Math.floor((difference / (1000)) % 60);
        setDays(days);
        setHours(hours);
        setMinutes(minutes);
        setSeconds(seconds);
      }
    }, 1000);
  }, []);

  const dayString = days > 1 ? 'dias' : 'dia';

  if (days == null || minutes == null || hours == null || seconds == null) {
    console.log(days, minutes, hours, seconds)
    return null;
  }

  if (timeUp) {
    return <p>Event in progress</p>;
  }

  return (<div className="countdown">
    <div>
      <span className="number days">{days.toString().padStart(2, '0')}</span>
      <span>{dayString}</span>
    </div>
    <div>
      <span className="number hours">{hours.toString().padStart(2, '0')}</span>
      <span>horas</span>
    </div>
    <div>
      <span className="number minutes">{minutes.toString().padStart(2, '0')}</span>
      <span>minutos</span>
    </div>
    <div>
      <span className="number seconds">{seconds.toString().padStart(2, '0')}</span>
      <span>segundos</span>
    </div>
  </div>);
}

export default Countdown;
