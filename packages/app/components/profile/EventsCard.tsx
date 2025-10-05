import { Divider, List, ListItem, ListItemText } from "@mui/material";
import Card from "../Card";

interface EventsCardProps {
  events: any;
  onRegisterClick: () => void;
}

function EventsCard({ events, onRegisterClick }: EventsCardProps) {
  function formatTime(startDate: string, endDate: string) {
    const start = new Date(startDate);
    const end = new Date(endDate);

    const week = [
      "Domingo",
      "Segunda-Feira",
      "Terça-Feira",
      "Quarta-Feira",
      "Quinta-Feira",
      "Sexta-Feira",
      "Sábado",
    ];

    const zeroPad = (num: number, places: number) => String(num).padStart(places, "0");
    const DayOfTheWeek = `${start.getDay()}`;
    const day = `${week[DayOfTheWeek]}`;
    const dayInNumbers = `${zeroPad(start.getDate(), 2)}/${zeroPad(start.getMonth() + 1, 2)}`;
    const startTime = `${zeroPad(start.getHours(), 2)}:${zeroPad(start.getMinutes(), 2)}`;
    const endTime = `${zeroPad(end.getHours(), 2)}:${zeroPad(end.getMinutes(), 2)}`;

    return `${day} (${dayInNumbers}), ${startTime} às ${endTime}`;
  }

  return (
    <Card className="flex flex-col items-center p-9 w-full bg-[#222333] text-white text-center rounded-lg justify-center">
      <h1 className="text-xl">
        Inscrições em Eventos
      </h1>
      <List className="events-list text-center grid grid-cols-1 gap-4">
        {Object.keys(events).map((type) =>
          events[type].map((eventType: any, index: number) =>
            eventType.events.map((item: any) => {
              if (item.isSubscribed === true) {
                return (
                  <div key={item.name} className="bg-[#2f2e46] rounded-lg">
                    <ListItem key={`${item.name}-${index}`} className="text-center">
                      <ListItemText
                        primary={
                          <div className="flex flex-row">
                            <div className="text-secondary mr-2">
                              {`${type} |`}
                            </div>
                            <div className="text-white">
                              {`${item.name}`}
                            </div>
                          </div>
                        }
                        secondary={
                          item.link ? (
                            <a
                              target="_blank"
                              className="underline text-center pb-4"
                              href={item.link}
                            >
                              Acesse aqui
                            </a>
                          ) : (
                            <div className="text-[#c1c1c1]">
                              {formatTime(item.startDate, item.endDate)}
                            </div>
                          )
                        }
                      />
                    </ListItem>
                    <Divider />
                  </div>
                );
              }
            })
          )
        )}
      </List>
      <button
        onClick={onRegisterClick}
        className="bg-primary text-white p-3 rounded-lg mt-2 hover:bg-white hover:text-primary"
      >
        Inscreva-se!
      </button>
    </Card>
  );
}

export default EventsCard; 