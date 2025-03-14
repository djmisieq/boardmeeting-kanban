import React, { createContext, useContext, useCallback, ReactNode } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { 
  CheckCircle, 
  AlertCircle, 
  Info, 
  AlertTriangle, 
  X 
} from 'lucide-react';

// Typy powiadomień
export type NotificationType = 'success' | 'error' | 'info' | 'warning';

// Struktura pojedynczego powiadomienia
export interface Notification {
  id: string;
  type: NotificationType;
  message: string;
  title?: string;
  duration?: number; // Czas w ms, domyślnie 5000ms (5s)
}

// Interfejs kontekstu
interface NotificationContextProps {
  notifications: Notification[];
  addNotification: (notification: Omit<Notification, 'id'>) => void;
  removeNotification: (id: string) => void;
  clearNotifications: () => void;
}

// Domyślne wartości kontekstu
const defaultContextValue: NotificationContextProps = {
  notifications: [],
  addNotification: () => {},
  removeNotification: () => {},
  clearNotifications: () => {},
};

// Tworzenie kontekstu
const NotificationContext = createContext<NotificationContextProps>(defaultContextValue);

// Hook do używania kontekstu
export const useNotifications = () => useContext(NotificationContext);

// Pomocnicze hooki dla różnych typów powiadomień
export const useSuccessNotification = () => {
  const { addNotification } = useNotifications();
  return useCallback(
    (message: string, title?: string, duration?: number) => {
      addNotification({
        type: 'success',
        message,
        title,
        duration,
      });
    },
    [addNotification]
  );
};

export const useErrorNotification = () => {
  const { addNotification } = useNotifications();
  return useCallback(
    (message: string, title?: string, duration?: number) => {
      addNotification({
        type: 'error',
        message,
        title,
        duration,
      });
    },
    [addNotification]
  );
};

export const useInfoNotification = () => {
  const { addNotification } = useNotifications();
  return useCallback(
    (message: string, title?: string, duration?: number) => {
      addNotification({
        type: 'info',
        message,
        title,
        duration,
      });
    },
    [addNotification]
  );
};

export const useWarningNotification = () => {
  const { addNotification } = useNotifications();
  return useCallback(
    (message: string, title?: string, duration?: number) => {
      addNotification({
        type: 'warning',
        message,
        title,
        duration,
      });
    },
    [addNotification]
  );
};

// Komponent powiadomienia
const NotificationItem: React.FC<{
  notification: Notification;
  onClose: () => void;
}> = ({ notification, onClose }) => {
  const { type, title, message } = notification;

  // Ustawienie ikony i koloru w zależności od typu
  const getTypeStyles = () => {
    switch (type) {
      case 'success':
        return {
          icon: <CheckCircle className="h-5 w-5" />,
          bgColor: 'bg-green-50 dark:bg-green-900/30',
          borderColor: 'border-green-400 dark:border-green-700',
          textColor: 'text-green-800 dark:text-green-200',
          iconColor: 'text-green-500 dark:text-green-400',
        };
      case 'error':
        return {
          icon: <AlertCircle className="h-5 w-5" />,
          bgColor: 'bg-red-50 dark:bg-red-900/30',
          borderColor: 'border-red-400 dark:border-red-700',
          textColor: 'text-red-800 dark:text-red-200',
          iconColor: 'text-red-500 dark:text-red-400',
        };
      case 'warning':
        return {
          icon: <AlertTriangle className="h-5 w-5" />,
          bgColor: 'bg-amber-50 dark:bg-amber-900/30',
          borderColor: 'border-amber-400 dark:border-amber-700',
          textColor: 'text-amber-800 dark:text-amber-200',
          iconColor: 'text-amber-500 dark:text-amber-400',
        };
      case 'info':
      default:
        return {
          icon: <Info className="h-5 w-5" />,
          bgColor: 'bg-blue-50 dark:bg-blue-900/30',
          borderColor: 'border-blue-400 dark:border-blue-700',
          textColor: 'text-blue-800 dark:text-blue-200',
          iconColor: 'text-blue-500 dark:text-blue-400',
        };
    }
  };

  const { icon, bgColor, borderColor, textColor, iconColor } = getTypeStyles();

  return (
    <motion.div
      initial={{ opacity: 0, y: -20, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: 20, scale: 0.95 }}
      className={`rounded-lg border shadow-md mb-3 max-w-md w-full ${bgColor} ${borderColor}`}
    >
      <div className="p-4 flex">
        <div className={`flex-shrink-0 ${iconColor}`}>
          {icon}
        </div>
        <div className="ml-3 flex-1">
          {title && (
            <h3 className={`text-sm font-medium ${textColor}`}>{title}</h3>
          )}
          <div className={`text-sm ${textColor}`}>{message}</div>
        </div>
        <button
          onClick={onClose}
          className={`ml-4 flex-shrink-0 ${textColor} hover:text-opacity-75 focus:outline-none`}
        >
          <X className="h-5 w-5" />
        </button>
      </div>
    </motion.div>
  );
};

// Provider komponent
export const NotificationProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [notifications, setNotifications] = React.useState<Notification[]>([]);

  // Dodanie powiadomienia
  const addNotification = useCallback((notification: Omit<Notification, 'id'>) => {
    const id = Math.random().toString(36).substring(2, 11);
    const newNotification: Notification = {
      ...notification,
      id,
      duration: notification.duration || 5000,
    };

    setNotifications((prev) => [...prev, newNotification]);

    // Usunięcie powiadomienia po określonym czasie
    setTimeout(() => {
      removeNotification(id);
    }, newNotification.duration);
  }, []);

  // Usunięcie powiadomienia
  const removeNotification = useCallback((id: string) => {
    setNotifications((prev) => prev.filter((item) => item.id !== id));
  }, []);

  // Wyczyszczenie wszystkich powiadomień
  const clearNotifications = useCallback(() => {
    setNotifications([]);
  }, []);

  return (
    <NotificationContext.Provider
      value={{
        notifications,
        addNotification,
        removeNotification,
        clearNotifications,
      }}
    >
      {children}
      {/* Powiadomienia */}
      <div className="fixed top-4 right-4 z-50 flex flex-col items-end space-y-2">
        <AnimatePresence>
          {notifications.map((notification) => (
            <NotificationItem
              key={notification.id}
              notification={notification}
              onClose={() => removeNotification(notification.id)}
            />
          ))}
        </AnimatePresence>
      </div>
    </NotificationContext.Provider>
  );
};
