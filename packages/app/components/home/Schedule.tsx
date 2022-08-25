import EventsCalendar from "../events-calendar/EventsCalendar";

const Schedule = () => {
  return (<>
    <section className="flex flex-col items-center text-secondary bg-primary text-center p-16">
      <h1 className="text-4xl font-bold">Cronograma</h1>
      <div className="text-base pt-8 max-w-4xl">
        <EventsCalendar />
      </div>
    </section>
  </>);
};

export default Schedule;
