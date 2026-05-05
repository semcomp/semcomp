import type { EventType } from "@/types/EventType";

export const sampleEvents: EventType[] = [
  { id: "1", nameEvent: "Inteligência Artificial na Prática", type: "Palestra", description: "A palestra aborda conceitos e aplicações práticas de inteligência artificial.", local: "Auditório Central", datetime: "02/06/2023 09:00", hasPresence: false },
  { id: "2", nameEvent: "Oficina de Desenvolvimento Web", type: "Oficina", description: "Aprenda a criar sites e aplicações web utilizando as tecnologias mais recentes.", local: "Sala de Informática 1", datetime: "02/06/2023 14:00", hasPresence: false },
  { id: "3", nameEvent: "Mesa Redonda: O Futuro da Tecnologia", type: "Mesa Redonda", description: "Especialistas discutem as tendências e o futuro da tecnologia em diversas áreas.", local: "Auditório Secundário", datetime: "03/06/2023 10:00", hasPresence: true },
  { id: "4", nameEvent: "Workshop de Desenvolvimento Mobile", type: "Workshop", description: "Aprenda a desenvolver aplicativos para dispositivos móveis utilizando as principais plataformas.", local: "Sala de Informática 2", datetime: "03/06/2023 15:00", hasPresence: true },
  { id: "5", nameEvent: "Palestra de Encerramento: Inovação e Criatividade", type: "Palestra", description: "Encerramento da semana com uma palestra inspiradora sobre inovação e criatividade no campo da computação.", local: "Auditório Central", datetime: "04/06/2023 18:00", hasPresence: false },
  { id: "6", nameEvent: "Sprint de Desenvolvimento: Desafio Semcomp", type: "Sprint", description: "Participe de um desafio de desenvolvimento ágil, onde equipes competirão para criar a melhor solução para um problema proposto.", local: "Laboratório de Desenvolvimento", datetime: "05/06/2023 09:00", hasPresence: true },
];
