import type { EventsResponse } from "@/types/EventsResponse.ts"
import imagemFundo from "@/assets/img/backgrounds/schedule.jpg";

export const mockEvents: EventsResponse = {
    "page": 1,
    "limit": 10,
    "sort_by": "name",
    "sort_order": "desc",
    "search_by": "type",
    "search_value": "Workshop",
    "total_records": 120,
    "filtered_records": 14,
    "events": [
        {
            "name": "Abertura",
            "dateInit": "2026-05-16T08:00:00Z",
            "dateEnd": "2026-05-16T08:30:00Z",
            "type": "Abertura",
            "location": "Auditorio A",
            "description": "Abertura da SEMCOMP BETA 29",
            "has_attendance": true
        },
        {
            "name": "Palestra A",
            "dateInit": "2026-05-16T08:30:00Z",
            "dateEnd": "2026-05-16T10:00:00Z",
            "type": "Palestra",
            "location": "Auditorio A",
            "description": "Introducao a Computacao",
            "has_attendance": true
        },
        {
            "name": "Vitrine Acadêmica A",
            "dateInit": "2026-05-16T10:00:00Z",
            "dateEnd": "2026-05-16T10:30:00Z",
            "type": "Vitrine Academica",
            "location": "Auditorio A",
            "description": "Introducao a Computacao",
            "has_attendance": true
        },
        {
            "name": "Palestra B",
            "dateInit": "2026-05-16T10:30:00Z",
            "dateEnd": "2026-05-16T12:00:00Z",
            "type": "Palestra",
            "location": "Auditorio A",
            "description": "Introducao a Computacao",
            "has_attendance": true
        },
        {
            "name": "Almoço",
            "dateInit": "2026-05-16T12:00:00Z",
            "dateEnd": "2026-05-16T13:00:00Z",
            "type": "intervalo",
            "location": "Auditorio A",
            "description": "Introducao a Computacao",
            "has_attendance": true,
            "image": imagemFundo
        },
        {
            "name": "Concurso A",
            "dateInit": "2026-05-16T14:00:00Z",
            "dateEnd": "2026-05-16T15:00:00Z",
            "type": "Concurso",
            "location": "Auditorio A",
            "description": "Introducao a Computacao",
            "has_attendance": true
        },
        {
            "name": "Concurso B",
            "dateInit": "2026-05-16T15:00:00Z",
            "dateEnd": "2026-05-16T16:00:00Z",
            "type": "Concurso",
            "location": "Auditorio A",
            "description": "Introducao a Computacao",
            "has_attendance": true
        },
        {
            "name": "Mini Curso",
            "dateInit": "2026-05-16T14:00:00Z",
            "dateEnd": "2026-05-16T16:00:00Z",
            "type": "Minicurso",
            "location": "Auditorio A",
            "description": "Introducao a Computacao",
            "has_attendance": true
        },
        {
            "name": "Coffee Break",
            "dateInit": "2026-05-16T16:00:00Z",
            "dateEnd": "2026-05-16T16:40:00Z",
            "type": "Coffee",
            "location": "Auditorio A",
            "description": "Introducao a Computacao",
            "has_attendance": true
        },
        {
            "name": "Vitrine Acadêmica B",
            "dateInit": "2026-05-16T16:40:00Z",
            "dateEnd": "2026-05-16T18:00:00Z",
            "type": "Vitrine Academica",
            "location": "Auditorio A",
            "description": "Introducao a Computacao",
            "has_attendance": true
        },
        {
            "name": "Mini Curso (continuação)",
            "dateInit": "2026-05-16T16:40:00Z",
            "dateEnd": "2026-05-16T18:00:00Z",
            "type": "Minicurso",
            "location": "Auditorio A",
            "description": "Introducao a Computacao",
            "has_attendance": true
        },
        {
            "name": "Encerramento",
            "dateInit": "2026-05-16T18:00:00Z",
            "dateEnd": "2026-05-16T18:30:00Z",
            "type": "Encerramento",
            "location": "Auditorio A",
            "description": "Introducao a Computacao",
            "has_attendance": true
        },
        {
            "name": "Janta",
            "dateInit": "2026-05-16T18:30:00Z",
            "dateEnd": "2026-05-16T19:00:00Z",
            "type": "intervalo",
            "location": "Auditorio A",
            "description": "Introducao a Computacao",
            "has_attendance": true
        },
        {
            "name": "Game Night",
            "dateInit": "2026-05-16T19:30:00Z",
            "dateEnd": "2026-05-16T23:00:00Z",
            "type": "Game Night",
            "location": "Auditorio A",
            "description": "Introducao a Computacao",
            "has_attendance": true
        }
    ]
};