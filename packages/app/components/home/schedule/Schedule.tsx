import EventsCalendar from "../../events-calendar";

const Schedule = () => {
  return (
    <div className="flex flex-col items-center bg-blue p-16">
      <h1 className="text-4xl text-white text-center pb-8">Cronograma</h1>
      <div className="max-w-2xl">
        <EventsCalendar />
      </div>
    </div>
  );
};

export default Schedule;
