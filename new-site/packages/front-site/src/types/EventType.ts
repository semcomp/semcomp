export type EventType = {
    name: string; // Nome do evento
    dateInit: string; // Data e hora inicial do evento
    dateEnd: string; // Data e hora final do evento
    type: string; // Tipo do evento
    location: string; // Local do evento
    description: string; // Descricao do evento
    has_attendance: boolean; // Indica se o evento tem presenca
    image?: string
};
