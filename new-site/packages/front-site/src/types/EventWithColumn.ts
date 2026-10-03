import type { EventType } from "@/types/EventType.ts"

export type EventWithColumn = EventType & {
    column: "full" | 1 | 2 | 3
}