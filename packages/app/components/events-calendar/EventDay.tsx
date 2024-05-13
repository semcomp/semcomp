function EventDay({ home, dayDate, myPage, changePage, isCurrentDay }) {
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

  let isCurrentStyle = "text-white ";
  home ? (isCurrentStyle += "border-solid border-2 border-[#F4DEDE] bg-tertiary") : (isCurrentStyle += "bg-primary")

  let isNotCurrentStyle = "border-solid border-2 bg-transparent"; 
  home ? (isNotCurrentStyle += "border-[#F4DEDE] text-white hover:bg-[#F4DEDE] hover:text-tertiary hover:border-[#F4DEDE] ") 
       : (isNotCurrentStyle += "border-primary text-primary hover:bg-[#BFEBF4] hover:border-primary")

  return (
    <button
      className={
        "focus:outline-none w-full p-4 transition duration-300 " +
        (isCurrentDay
          ? isCurrentStyle
          : isNotCurrentStyle
        )
      }
      onClick={handleClick}
    >
      <strong>{dayDateStr}</strong>
      <p className="hidden md:block">{weekDayStr}</p>
    </button>
  );
}

export default EventDay;
