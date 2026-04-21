import type { EventType } from "@/types/EventType";
import AberturImg from "@/assets/img/semcomp/Semcomp.jpg";

const EVENT: EventType[] = [
  { title: "Abertura",           time: "08:30 - 09:00", col: "right",  description: "A abertura da Semcomp marca o início de uma semana cheia de tecnologia, aprendizado e troca de experiências. Neste momento, será feita a apresentação geral do evento, com uma visão do que vem pela frente, além de instruções importantes sobre como participar das atividades, inscrições em minicursos e aproveitamento máximo da programação. Também é a oportunidade perfeita para se situar, conhecer melhor a proposta do evento e entrar no clima da semana.", image: AberturImg },
  { title: "Palestra",           time: "09:00 - 10:30", col: "full",  description: "" },
  { title: "Vitrine Acadêmica",  time: "10:30 - 11:10", col: "full",  description: "" },
  { title: "Palestra",           time: "11:10 - 12:40", col: "full",  description: "" },
  { title: "Almoço",             time: "12:40 - 13:40", col: "full",  description: "" },
  { title: "Concurso / Oficina", time: "14:00 - 16:00", col: "left",  description: "" },
  { title: "Mini Curso",         time: "14:00 - 16:00", col: "right", description: "" },
  { title: "Coffe Break",        time: "16:00 - 16:40", col: "full",  description: "" },
  { title: "Vitrine Acadêmica",  time: "16:40 - 17:20", col: "left",  description: "" },
  { title: "Mini Curso (cont.)", time: "16:40 - 17:20", col: "right", description: "" },
  { title: "Encerramento",       time: "17:20 - 17:50", col: "full",  description: "" },
  { title: "Jantar",             time: "17:50 - 19:20", col: "full",  description: "" },
  { title: "Game Night",         time: "19:20 - 23:00", col: "full",  description: "" },
];

export default EVENT;