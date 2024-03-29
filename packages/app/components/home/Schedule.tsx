import EventsCalendar from "../events-calendar/EventsCalendar";

const Schedule = () => {
  return (
    <>
      <section
        id="schedule"
        className="flex flex-col items-center text-secondary bg-primary text-center p-16"
      >
        <h1 id="titulo" className="text-4xl font-bold text-secondary">
          Cronograma
        </h1>
        <div className="text-base pt-8 max-w-4xl">
          <EventsCalendar />
        </div>
      </section>
    </>
  );
};

export default Schedule;
