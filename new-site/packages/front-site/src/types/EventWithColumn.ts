import type { EventType } from "@/types/EventType.ts"

export type EventWithColumn = EventType & {
    column: "left" | "right" | "full"
}