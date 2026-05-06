import { useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import type { NotificationProps, NotificationType } from "@/types/NotificationType";

const palette: Record<NotificationType, { light: string; dark: string; text: string }> = {
  success: { light: "#E8F5E9", dark: "#003923", text: "#003923" },
  reminder: { light: "#FFF8E1", dark: "#FCC511", text: "#FCC511" },
  warning: { light: "#FFF3E0", dark: "#E7003B", text: "#E7003B" },
  info: { light: "#e6f0ff", dark: "#2B4A9C", text: "#2B4A9C" },
};

export function Notification({ message, type = "info", visible, duration = 2500, onClose }: NotificationProps) {
  useEffect(() => {
    if (!visible) return;
    const t = setTimeout(() => onClose?.(), duration);
    return () => clearTimeout(t);
  }, [visible, duration, onClose]);

  const p = (palette as any)[type] ?? palette.info;

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ opacity: 0, y: -12 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -12 }}
          transition={{ duration: 0.25 }}
          className="fixed left-1/2 top-6 z-50 -translate-x-1/2 w-[min(90vw,500px)] min-w-70 rounded-lg shadow-lg"
          style={{ backgroundColor: p.light, borderTop: `4px solid ${p.dark}` }}
        >
          <div className="px-6 py-4 text-center">
            <p className="m-0 text-sm font-semibold leading-relaxed wrap-break-word" style={{ color: p.text }}>{message}</p>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

export default Notification;
