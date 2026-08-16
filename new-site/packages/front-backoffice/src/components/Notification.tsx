import { useEffect } from "react";
import type {
  NotificationProps,
  NotificationType,
} from "@/types/NotificationType";

const palette: Record<
  NotificationType,
  { light: string; dark: string; text: string }
> = {
  success: { light: "#E8F5E9", dark: "#003923", text: "#003923" },
  reminder: { light: "#FFF8E1", dark: "#FCC511", text: "#FCC511" },
  warning: { light: "#FFF3E0", dark: "#E7003B", text: "#E7003B" },
  info: { light: "#e6f0ff", dark: "#2B4A9C", text: "#2B4A9C" },
};

export function Notification({
  message,
  type = "info",
  visible,
  duration = 2500,
  onClose,
}: NotificationProps) {
  useEffect(() => {
    if (!visible) return;
    const t = setTimeout(() => onClose?.(), duration);
    return () => clearTimeout(t);
  }, [visible, duration, onClose]);

  const p = (palette as any)[type] ?? palette.info;

  return (
    <div
      className={`
        fixed left-1/2 top-6 z-50 -translate-x-1/2 w-[min(90vw,600px)]
        rounded-lg shadow-lg transition-[opacity,transform] duration-300 ease-out
        ${visible ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-3 pointer-events-none'}
      `}
      style={{ backgroundColor: p.light, borderTop: `4px solid ${p.dark}` }}
      aria-live="polite"
      aria-atomic="true"
    >
      <div className="px-4 py-3 text-center">
        <p className="m-0 text-sm font-semibold" style={{ color: p.text }}>
          {message}
        </p>
      </div>
    </div>
  );
}

export default Notification;
