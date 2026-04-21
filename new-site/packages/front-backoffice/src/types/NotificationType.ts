export type NotificationType = "success" | "reminder" | "warning" | "info";

export interface NotificationProps {
  message: string;
  type?: NotificationType | string;
  visible: boolean;
  duration?: number; // ms
  onClose?: () => void;
}
