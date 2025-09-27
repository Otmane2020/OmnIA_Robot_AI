import React, { useState, useEffect } from 'react';
import { CheckCircle, AlertCircle, Info, X, Bot, Zap } from 'lucide-react';

export interface Notification {
  id: string;
  type: 'success' | 'error' | 'info' | 'warning';
  title: string;
  message: string;
  duration?: number;
  actions?: Array<{
    label: string;
    action: () => void;
    variant?: 'primary' | 'secondary';
  }>;
}

interface NotificationSystemProps {
  notifications: Notification[];
  onRemove: (id: string) => void;
}

export const NotificationSystem: React.FC<NotificationSystemProps> = ({ notifications, onRemove }) => {
  useEffect(() => {
    notifications.forEach(notification => {
      if (notification.duration && notification.duration > 0) {
        const timer = setTimeout(() => {
          onRemove(notification.id);
        }, notification.duration);

        return () => clearTimeout(timer);
      }
    });
  }, [notifications, onRemove]);

  const getNotificationStyles = (type: string) => {
    switch (type) {
      case 'success':
        return {
          bg: 'bg-green-500/20 border-green-400/50',
          icon: CheckCircle,
          iconColor: 'text-green-400',
          titleColor: 'text-green-200',
          messageColor: 'text-green-300'
        };
      case 'error':
        return {
          bg: 'bg-red-500/20 border-red-400/50',
          icon: AlertCircle,
          iconColor: 'text-red-400',
          titleColor: 'text-red-200',
          messageColor: 'text-red-300'
        };
      case 'warning':
        return {
          bg: 'bg-yellow-500/20 border-yellow-400/50',
          icon: AlertCircle,
          iconColor: 'text-yellow-400',
          titleColor: 'text-yellow-200',
          messageColor: 'text-yellow-300'
        };
      default:
        return {
          bg: 'bg-blue-500/20 border-blue-400/50',
          icon: Info,
          iconColor: 'text-blue-400',
          titleColor: 'text-blue-200',
          messageColor: 'text-blue-300'
        };
    }
  };

  if (notifications.length === 0) return null;

  return (
    <div className="fixed top-4 right-4 z-50 space-y-3 max-w-md">
      {notifications.map((notification) => {
        const styles = getNotificationStyles(notification.type);
        const Icon = styles.icon;

        return (
          <div
            key={notification.id}
            className={`${styles.bg} backdrop-blur-xl rounded-2xl p-4 border shadow-2xl animate-in slide-in-from-right-4 duration-300`}
          >
            <div className="flex items-start gap-3">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 bg-gradient-to-br from-cyan-500 to-blue-600 rounded-xl flex items-center justify-center">
                  <Bot className="w-4 h-4 text-white" />
                </div>
                <Icon className={`w-5 h-5 ${styles.iconColor}`} />
              </div>
              
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between mb-1">
                  <h4 className={`font-semibold ${styles.titleColor} text-sm`}>
                    🤖 OmnIA • {notification.title}
                  </h4>
                  <button
                    onClick={() => onRemove(notification.id)}
                    className="text-gray-400 hover:text-white transition-colors"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
                
                <p className={`${styles.messageColor} text-sm leading-relaxed`}>
                  {notification.message}
                </p>

                {notification.actions && notification.actions.length > 0 && (
                  <div className="flex gap-2 mt-3">
                    {notification.actions.map((action, index) => (
                      <button
                        key={index}
                        onClick={() => {
                          action.action();
                          onRemove(notification.id);
                        }}
                        className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                          action.variant === 'primary'
                            ? 'bg-cyan-500 hover:bg-cyan-600 text-white'
                            : 'bg-white/10 hover:bg-white/20 text-white border border-white/20'
                        }`}
                      >
                        {action.label}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};

// Hook pour gérer les notifications
export const useNotifications = () => {
  const [notifications, setNotifications] = useState<Notification[]>([]);

  const addNotification = (notification: Omit<Notification, 'id'>) => {
    const id = Date.now().toString() + Math.random().toString(36).substr(2, 9);
    const newNotification: Notification = {
      ...notification,
      id,
      duration: notification.duration || 5000
    };
    
    setNotifications(prev => [...prev, newNotification]);
    return id;
  };

  const removeNotification = (id: string) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
  };

  const clearAll = () => {
    setNotifications([]);
  };

  // Méthodes de convenance
  const showSuccess = (title: string, message: string, actions?: Notification['actions']) => {
    return addNotification({ type: 'success', title, message, actions });
  };

  const showError = (title: string, message: string, actions?: Notification['actions']) => {
    return addNotification({ type: 'error', title, message, duration: 8000, actions });
  };

  const showInfo = (title: string, message: string, actions?: Notification['actions']) => {
    return addNotification({ type: 'info', title, message, actions });
  };

  const showWarning = (title: string, message: string, actions?: Notification['actions']) => {
    return addNotification({ type: 'warning', title, message, actions });
  };

  return {
    notifications,
    addNotification,
    removeNotification,
    clearAll,
    showSuccess,
    showError,
    showInfo,
    showWarning
  };
};