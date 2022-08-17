function EventType({ type, presences, totalPresences }) {
  const percentage = (100 * presences) / totalPresences;

  return (
    <div className="event-type-component__root">
      <p className="event-type-component__type">{type}</p>
      <div className="event-type-component__lower-half">
        <p className="event-type-component__presences">
          {presences} / {totalPresences}
        </p>
        <div className="event-type-component__progress-bar-container">
          <div
            style={{ width: `${percentage}%` }}
            className="event-type-component__progress-bar"
          />
        </div>
      </div>
    </div>
  );
}

export default EventType;
