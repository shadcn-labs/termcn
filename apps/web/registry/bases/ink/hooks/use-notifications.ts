import * as React from "react";

export type NotificationVariant = "info" | "success" | "warning" | "error";

export interface Notification {
  body?: string;
  duration?: number;
  id: string;
  persistent?: boolean;
  read: boolean;
  timestamp: number;
  title: string;
  variant: NotificationVariant;
}

export interface NotificationsContextValue {
  clear: () => void;
  dismiss: (id: string) => void;
  markRead: (id: string) => void;
  notifications: Notification[];
  notify: (options: Omit<Notification, "id" | "read" | "timestamp">) => string;
}

let counter = 0;

export const NotificationsContext =
  React.createContext<NotificationsContextValue>({
    clear: () => {
      /* noop */
    },
    dismiss: () => {
      /* noop */
    },
    markRead: () => {
      /* noop */
    },
    notifications: [],
    notify: () => "",
  });

export const useNotifications = (): NotificationsContextValue =>
  React.useContext(NotificationsContext);

export const useNotificationsProvider = (): NotificationsContextValue => {
  const [notifications, setNotifications] = React.useState<Notification[]>([]);

  const notify = React.useCallback(
    (options: Omit<Notification, "id" | "read" | "timestamp">) => {
      const id = `notif-${(counter += 1)}`;
      setNotifications((current) => [
        ...current,
        {
          ...options,
          id,
          read: false,
          timestamp: Date.now(),
        },
      ]);
      return id;
    },
    []
  );

  const dismiss = React.useCallback((id: string) => {
    setNotifications((current) =>
      current.filter((notification) => notification.id !== id)
    );
  }, []);

  const markRead = React.useCallback((id: string) => {
    setNotifications((current) =>
      current.map((notification) =>
        notification.id === id ? { ...notification, read: true } : notification
      )
    );
  }, []);

  const clear = React.useCallback(() => setNotifications([]), []);

  return { clear, dismiss, markRead, notifications, notify };
};
