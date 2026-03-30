import EventsCalendar from "../events-calendar/EventsCalendar";

const Schedule = (props) => {
  return (
    <>
      <section
        id="schedule"
        className="flex flex-col items-center text-center text-secondary w-full h-full"
        // style={{ maxWidth: '100%' }}  // Garantir que não ultrapasse a largura da tela
      > 
        <h1
          id="titulo"
          className="text-modalTitleColor font-primary superdesktop:text-title-superlarge desktop:text-title-large tablet:text-title-medium medphone:text-title-small phone:text-title-tiny text stroke"
        >
          Cronograma
        </h1>
        <p className="text-gray-400">Clique no evento para obter mais informações</p>
        <div className="mt-8 text-base w-full"> 
          <EventsCalendar home={true} />
        </div>
      </section>

      {/* CSS Inline para ocultar a barra de rolagem */}
      
        <style jsx>{`
       .custom-scroll::-webkit-scrollbar {
         width: 0px;
          height: 0px;
        }

        .custom-scroll {
          scrollbar-width: none; /* Firefox */
          -ms-overflow-style: none; /* Internet Explorer 10+ */
        }
      `}</style>

    </>
  );
};

export default Schedule; 
