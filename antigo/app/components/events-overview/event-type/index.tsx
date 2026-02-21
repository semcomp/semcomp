function EventType({ type, presences, totalPresences }) {
  const percentage = (100 * presences) / totalPresences;

  return (
    <div className="event-type-component__root">
      <p className="event-type-component__type">{type}</p>
      <div className="event-type-component__lower-half">
        <p className="event-type-component__presences">
          {presences} / {totalPresences}
        </p>
        <div className="w-full h-1.5 bg-gray">
          <div
            style={{ width: `${percentage}%` }}
            className="bg-tertiary h-full"
          />
        </div>
      </div>
    </div>
  );
}

export default EventType;
