// formatação de 2026-05-16T08:00:00Z para "08:00"
export function formatTime(dateTime:string): string{
    const date = new Date(dateTime);

    return date.toLocaleTimeString("pt-BR", {
        hour: "2-digit",
        minute: "2-digit",
        timeZone: "UTC"
    })
}

// formatação de 2026-05-16T08:00:00Z para "16 de Maio"
export function formatDate(dateTime:string): string{
    const date = new Date(dateTime);

    return date.toLocaleDateString("pt-BR", {
        day: "numeric",
        month: "long",
        timeZone: "UTC"
    })
}