import type { EventType } from "@/types/EventType";

const EVENT: EventType[] = [
  { title: "Abertura",           time: "08:30 - 09:00", col: "full",  description: "Melhor abertura de todas" },
  { title: "Palestra",           time: "09:00 - 10:30", col: "full",  description: "" },
  { title: "Vitrine Acadêmica",  time: "10:30 - 11:10", col: "full",  description: "" },
  { title: "Palestra",           time: "11:10 - 12:40", col: "full",  description: "" },
  { title: "Almoço",             time: "",              col: "full",  description: "Hora de bandecar" },
  { title: "Concurso / Oficina", time: "14:00 - 16:00", col: "left",  description: "" },
  { title: "Mini Curso",         time: "14:00 - 16:00", col: "right", description: "" },
  { title: "Coffe Break",        time: "16:00 - 16:40", col: "full",  description: "" },
  { title: "Vitrine Acadêmica",  time: "16:40 - 17:20", col: "left",  description: "" },
  { title: "Mini Curso (cont.)", time: "16:40 - 17:20", col: "right", description: "" },
  { title: "Encerramento",    time: "17:20 - 17:50", col: "full",  description: "" },
  { title: "Jantar",             time: "",              col: "full",  description: "" },
  { title: "Game Night",         time: "19:20 - 23:00", col: "full",  description: "" },
];

export default EVENT;