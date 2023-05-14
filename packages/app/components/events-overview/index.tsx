import useGetData from "../../libs/hooks/use-get-data";
import Spinner from "../spinner";
import EventType from "./event-type";
import API from "../../api";

function EventsOverview() {
  const { data, error, isLoading } = useGetData(API.events.getAll);

  function transformEvents(data) {
    data = data.filter(
      (event) => event.type !== "Concurso" && event.type !== "Game Night"
    );

    let allTypes = Object.create(null);
    data.forEach((event) => {
      if (allTypes[event.type]) {
        allTypes[event.type].totalPresences++;
        allTypes[event.type].presences += event.hasAttended ? 1 : 0;
      } else {
        allTypes[event.type] = {
          totalPresences: 1,
          presences: event.hasAttended ? 1 : 0,
        };
      }
    });

    return Object.entries(allTypes).map(([name, value]) => {
      return {
        name,
        ...value as any,
      };
    });
  }

  const transformedData = data && transformEvents(data);

  function renderEvents() {
    if (isLoading) return <Spinner color="black" size="large" />;
    if (error) return <>Houve um erro ao buscar as casas</>;

    return transformedData.map((event, index) => (
      <EventType
        key={index}
        presences={event.presences}
        totalPresences={event.totalPresences}
        type={event.name}
      />
    ));
  }

  return (
    <div className="events-overview-component__root">
      <p className="events-overview-component__title">Eventos</p>
      {/* <div className="events-overview-component__types-container">
        {renderEvents()}
      </div> */}
    </div>
  );
}

export default EventsOverview;
