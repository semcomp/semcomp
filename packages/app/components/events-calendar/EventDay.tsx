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
      className={
        "focus:outline-none w-full p-4 transition duration-300 " +
        (isCurrentDay
          ? "bg-tertiary text-white"
          : "bg-primary text-white hover:bg-secondary hover:text-black")
      }
      onClick={handleClick}
    >
      <strong>{dayDateStr}</strong>
      <p className="hidden md:block">{weekDayStr}</p>
    </button>
  );
}

export default EventDay;
