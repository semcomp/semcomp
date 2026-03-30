function Stats() {
  return (
    <>
      <section className="flex flex-col items-center text-white bg-primary text-center p-16">
        
        <h1 className="text-4xl font-bold font-qatar text-secondary">
          Jogue o jogo da Semcomp 25!
        </h1>
        <div className="flex justify-around w-full text-2xl font-bold max-w-4xl">
        {/*
          <p>
          +2000
          <br />
          Participantes
        </p>
        <p>
          24
          <br />
          Edições
        </p> 
        */}
          <div className="flex flex-col items-center md:flex-row mt-4">
            <div className="p-4">
              <a
                target="_blank"
                href="https://play.google.com/store/apps/details?id=com.FellowshipOfTheGame.Semcopa&pcampaignid=pcampaignidMKT-Other-global-all-co-prtnr-py-PartBadge-Mar2515-1"
              >
                <img
                  className="w-48"
                  alt="Disponível no Google Play"
                  src="https://play.google.com/intl/pt-BR/badges/static/images/badges/pt-br_badge_web_generic.png"
                />
              </a>
            </div>
            <div className="p-4">
              <iframe
                src="https://itch.io/embed/1667908"
                width="192"
                height="170"
              >
                <a href="https://fog-icmc.itch.io/semcopa">
                  Semcopa by Fellowship of the Game, Tyago Teoi, Jonyzim, Lucas
                  Xavier Leite, Jhonatas Paolozza, thadar, Lucas Ebling, Leila
                  Souza, kibozin, gusferreira1203
                </a>
              </iframe>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}

export default Stats;
