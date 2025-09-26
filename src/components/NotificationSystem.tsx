import React, { useState, useEffect, createContext, useContext } from 'react';
import { X, CheckCircle, AlertCircle, Info, AlertTriangle } from 'lucide-react';

export interface Notification {
  id: string;
  type: 'success' | 'error' | 'info' | 'warning';
  title: string;
  message: string;
  duration?: number;
  actions?: Array<{
    label: string;
    action: () => void;
    variant: 'primary' | 'secondary';
  }>;
}

interface NotificationContextType {
  notifications: Notification[];
  showSuccess: (title: string, message: string, actions?: Notification['actions']) => void;
  showError: (title: string, message: string, actions?: Notification['actions']) => void;
  showInfo: (title: string, message: string, actions?: Notification['actions']) => void;
  showWarning: (title: string, message: string, actions?: Notification['actions']) => void;
  removeNotification: (id: string) => void;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

export const useNotifications = () => {
  const context = useContext(NotificationContext);
  if (!context) {
    // Return a default implementation if context is not available
    return {
      notifications: [],
      showSuccess: (title: string, message: string) => console.log('Success:', title, message),
      showError: (title: string, message: string) => console.error('Error:', title, message),
      showInfo: (title: string, message: string) => console.info('Info:', title, message),
      showWarning: (title: string, message: string) => console.warn('Warning:', title, message),
      removeNotification: (id: string) => console.log('Remove notification:', id)
    };
  }
  return context;
};

export const NotificationProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [notifications, setNotifications] = useState<Notification[]>([]);

  const addNotification = (notification: Omit<Notification, 'id'>) => {
    const id = Date.now().toString();
    const newNotification = { ...notification, id };
    setNotifications(prev => [...prev, newNotification]);

    if (notification.duration !== 0) {
      setTimeout(() => {
        removeNotification(id);
      }, notification.duration || 5000);
    }
  };

  const removeNotification = (id: string) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
  };

  const showSuccess = (title: string, message: string, actions?: Notification['actions']) => {
    addNotification({ type: 'success', title, message, actions });
  };

  const showError = (title: string, message: string, actions?: Notification['actions']) => {
    addNotification({ type: 'error', title, message, actions, duration: 0 });
  };

  const showInfo = (title: string, message: string, actions?: Notification['actions']) => {
    addNotification({ type: 'info', title, message, actions });
  };

  const showWarning = (title: string, message: string, actions?: Notification['actions']) => {
    addNotification({ type: 'warning', title, message, actions });
  };

  return (
    <NotificationContext.Provider value={{
      notifications,
      showSuccess,
      showError,
      showInfo,
      showWarning,
      removeNotification
    }}>
      {children}
    </NotificationContext.Provider>
  );
};

interface NotificationSystemProps {
  notifications: Notification[];
  onRemove: (id: string) => void;
}

export const NotificationSystem: React.FC<NotificationSystemProps> = ({ notifications, onRemove }) => {
  const getIcon = (type: Notification['type']) => {
    switch (type) {
      case 'success': return <CheckCircle className="w-5 h-5 text-green-400" />;
      case 'error': return <AlertCircle className="w-5 h-5 text-red-400" />;
      case 'warning': return <AlertTriangle className="w-5 h-5 text-yellow-400" />;
      case 'info': return <Info className="w-5 h-5 text-blue-400" />;
    }
  };

  const getColors = (type: Notification['type']) => {
    switch (type) {
      case 'success': return 'bg-green-500/20 border-green-400/50';
      case 'error': return 'bg-red-500/20 border-red-400/50';
      case 'warning': return 'bg-yellow-500/20 border-yellow-400/50';
      case 'info': return 'bg-blue-500/20 border-blue-400/50';
    }
  };

  if (notifications.length === 0) return null;

  return (
    <div className="fixed top-4 right-4 z-50 space-y-3 max-w-md">
      {notifications.map((notification) => (
        <div
          key={notification.id}
          className={`backdrop-blur-xl rounded-2xl p-4 border ${getColors(notification.type)} animate-in slide-in-from-right-full`}
        >
          <div className="flex items-start gap-3">
            {getIcon(notification.type)}
            <div className="flex-1 min-w-0">
              <h4 className="font-semibold text-white text-sm">{notification.title}</h4>
              <p className="text-gray-300 text-sm mt-1">{notification.message}</p>
              
              {notification.actions && notification.actions.length > 0 && (
                <div className="flex gap-2 mt-3">
                  {notification.actions.map((action, index) => (
                    <button
                      key={index}
                      onClick={() => {
                        action.action();
                        onRemove(notification.id);
                      }}
                      className={`px-3 py-1 rounded-lg text-xs font-medium transition-all ${
                        action.variant === 'primary'
                          ? 'bg-cyan-600 hover:bg-cyan-700 text-white'
                          : 'bg-gray-600 hover:bg-gray-700 text-white'
                      }`}
                    >
                      {action.label}
                    </button>
                  ))}
                </div>
              )}
            </div>
            <button
              onClick={() => onRemove(notification.id)}
              className="text-gray-400 hover:text-white transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      ))}
    </div>
  );
};