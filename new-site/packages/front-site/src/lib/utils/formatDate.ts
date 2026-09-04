// formatação de 2026-05-16T08:00:00Z para "08:00"
export function formatTime(dateTime:string): string{
    const date = new Date(dateTime);

    return date.toLocaleTimeString("pt-BR", {
        hour: "2-digit",
        minute: "2-digit",
        timeZone: "America/Sao_Paulo"
    })
}

// formatação de 2026-05-16T08:00:00Z para:
// type 1: "16 de Maio" 
// type 2: "16/05"
// type 3: "16/05/2026"
export function formatDate(
    dateTime: string,
    type: number
): string {
    const date = new Date(dateTime);

    if (type === 1) {
        return date.toLocaleDateString("pt-BR", {
            day: "numeric",
            month: "long",
            timeZone: "UTC"
        });
    }

    if (type === 2) {
        return date.toLocaleDateString("pt-BR", {
            day: "2-digit",
            month: "2-digit",
            timeZone: "UTC"
        });
    }

    if (type === 3) {
        return date.toLocaleDateString("pt-BR", {
            day: "2-digit",
            month: "2-digit",
            year: "2-digit",
            timeZone: "UTC"
        });
    }

    return "";
}

// Formatação de 2026-05-16T08:00:00Z para "Sábado"
export function formatWeekDay(dateTime: string): string {
    const date = new Date(dateTime);

    const diaSemana = date.toLocaleDateString("pt-BR", {
        weekday: "long",
    });

    return (
        diaSemana.charAt(0).toUpperCase() +
        diaSemana.slice(1)
    );
}