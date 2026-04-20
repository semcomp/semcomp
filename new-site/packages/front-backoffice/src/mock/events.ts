import type { CrudItemType } from "@/types/CrudItem";

interface EventItem extends CrudItemType {
  tipo: string;
  palestrante: string;
  local: string;
  horario: string;
  vagas: string;
  status: string;
}

export const sampleEvents: EventItem[] = [
  { id: "1", name: "Inteligência Artificial na Prática", tipo: "Palestra", palestrante: "Dra. Ana Souza", local: "Auditório Central", horario: "09:00", vagas: "200", status: "Confirmado" },
  { id: "2", name: "Introdução ao Rust", tipo: "Oficina", palestrante: "Prof. Carlos Lima", local: "Lab 01", horario: "10:00", vagas: "30", status: "Confirmado" },
  { id: "3", name: "DevOps com Docker e Kubernetes", tipo: "Workshop", palestrante: "Eng. Pedro Alves", local: "Lab 02", horario: "14:00", vagas: "25", status: "Confirmado" },
  { id: "4", name: "Open Source: como contribuir", tipo: "Palestra", palestrante: "Mariana Costa", local: "Auditório Central", horario: "11:00", vagas: "200", status: "Pendente" },
  { id: "5", name: "Machine Learning com Python", tipo: "Oficina", palestrante: "Dr. Felipe Rocha", local: "Lab 03", horario: "14:30", vagas: "35", status: "Confirmado" },
  { id: "6", name: "Segurança em Aplicações Web", tipo: "Palestra", palestrante: "Esp. Beatriz Nunes", local: "Sala 101", horario: "16:00", vagas: "80", status: "Confirmado" },
  { id: "7", name: "UX Design para Devs", tipo: "Workshop", palestrante: "Julia Ferreira", local: "Sala 102", horario: "13:00", vagas: "40", status: "Lotado" },
  { id: "8", name: "Computação Quântica: introdução", tipo: "Palestra", palestrante: "Prof. Roberto Silva", local: "Auditório Central", horario: "17:00", vagas: "200", status: "Pendente" },
  { id: "9", name: "APIs REST com Node.js", tipo: "Oficina", palestrante: "Dev. Amanda Gomes", local: "Lab 01", horario: "08:30", vagas: "30", status: "Confirmado" },
  { id: "10", name: "Carreira em TI: mesa redonda", tipo: "Mesa Redonda", palestrante: "Vários", local: "Auditório B", horario: "15:30", vagas: "120", status: "Confirmado" },
  { id: "11", name: "Flutter do zero ao deploy", tipo: "Oficina", palestrante: "Tiago Barbosa", local: "Lab 02", horario: "09:30", vagas: "28", status: "Lotado" },
  { id: "12", name: "Álgebra Linear para ML", tipo: "Minicurso", palestrante: "Profa. Lara Mendes", local: "Sala 201", horario: "08:00", vagas: "50", status: "Confirmado" },
];
