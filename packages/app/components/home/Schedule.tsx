import { BorderStyle } from "@mui/icons-material";
import EventsCalendar from "../events-calendar/EventsCalendar";

const Schedule = (props) => {
  return (
    <>
      <section
        id="schedule"
        className="flex flex-col items-center text-secondary text-center p-16 overflow-auto"
      > 
      <h1 id="titulo" className="
      superdesktop:text-title-superlarge
      desktop:text-title-large
      tablet:text-title-medium
      medphone:text-title-small
      phone:text-title-tiny
      text-white">
        Cronograma
      </h1>
        <div className="text-base mt-8">
          <EventsCalendar home={true}/>
        </div>
      </section>
    </>
  );
};

export default Schedule;
