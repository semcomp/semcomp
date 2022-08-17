function EventDay({ dayDate, myPage, changePage, isCurrentDay }) {
  dayDate = new Date(dayDate);
  const dayDateStr = new Intl.DateTimeFormat("pt-BR", {
    day: "numeric",
    month: "numeric",
  }).format(dayDate);
  const weekDayStr = new Intl.DateTimeFormat("pt-BR", {
    weekday: "long",
  }).format(dayDate);

  function handleClick(e) {
    e.preventDefault();
    changePage(myPage);
  }

  return (
    <button
      className={isCurrentDay ? "day-button-pressed" : "day-button"}
      onClick={handleClick}
    >
      <strong>{dayDateStr}</strong>
      <p className="hide-in-mobile">{weekDayStr}</p>
    </button>
  );
}

export default EventDay;
