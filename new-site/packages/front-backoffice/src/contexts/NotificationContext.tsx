import { createContext, useContext, useCallback, useState } from "react";
import Notification from "@/components/Notification";
import type { NotificationType } from "@/types/NotificationType";

type ShowNotification = (
  message: string,
  type?: NotificationType | string,
  duration?: number
) => void;

interface NotificationContextValue {
  showNotification: ShowNotification;
  hideNotification: () => void;
}

const NotificationContext = createContext<NotificationContextValue>({
  showNotification: () => {},
  hideNotification: () => {},
});

export const NotificationProvider = ({ children }: { children: React.ReactNode }) => {
  const [visible, setVisible] = useState(false);
  const [message, setMessage] = useState("");
  const [type, setType] = useState<NotificationType | string>("info");
  const [duration, setDuration] = useState<number>(2500);

  const showNotification: ShowNotification = useCallback((msg, t = "info", d = 2500) => {
    setMessage(msg);
    setType(t);
    setDuration(d);
    setVisible(true);
  }, []);

  const hideNotification = useCallback(() => {
    setVisible(false);
    setTimeout(() => setMessage(""), 300);
  }, []);

  return (
    <>
      <NotificationContext.Provider value={{ showNotification, hideNotification }}>
        {children}
      </NotificationContext.Provider>
      <Notification
        message={message}
        type={type}
        visible={visible}
        duration={duration}
        onClose={hideNotification}
      />
    </>
  );
};

export const useNotification = () => useContext(NotificationContext);

export default NotificationContext;
