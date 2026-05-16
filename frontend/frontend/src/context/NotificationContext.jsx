import React, { createContext, useContext, useCallback } from 'react';
import useNotificationWebSocket from '../hooks/useNotificationWebSocket';
import { showAppToast, showReversalToast, recordNotificationEvent } from '../utils/notify';

const NotificationContext = createContext(null);

export const useNotifications = () => {
  const ctx = useContext(NotificationContext);
  if (!ctx) throw new Error('useNotifications requires NotificationProvider');
  return ctx;
};

export const NotificationProvider = ({ children }) => {
  const {
    unreadCount,
    setUnreadCount,
    latestNotification,
    isConnected,
    refreshUnreadCount,
  } = useNotificationWebSocket();

  const pushToast = useCallback((message, variant = 'default') => {
    showAppToast(message, variant);
  }, []);

  const pushReversal = useCallback((message, onUndo) => {
    showReversalToast(message, onUndo);
  }, []);

  const notifyAction = useCallback(
    async ({ title, message, variant = 'default', metadata, sendEmail = false, onUndo }) => {
      if (onUndo) {
        pushReversal(message, onUndo);
      } else {
        pushToast(message, variant);
      }

      const result = await recordNotificationEvent({
        title,
        message,
        notificationType: metadata?.action === 'reversal' ? 'system' : 'system',
        metadata: { ...metadata, variant },
        sendEmail,
      });

      if (result?.unread_count != null) {
        setUnreadCount(result.unread_count);
      } else {
        setUnreadCount((c) => c + 1);
      }

      return result;
    },
    [pushToast, pushReversal, setUnreadCount]
  );

  const decrementUnread = useCallback(() => {
    setUnreadCount((c) => Math.max(0, c - 1));
  }, [setUnreadCount]);

  return (
    <NotificationContext.Provider
      value={{
        unreadCount,
        setUnreadCount,
        latestNotification,
        isConnected,
        refreshUnreadCount,
        pushToast,
        pushReversal,
        notifyAction,
        decrementUnread,
      }}
    >
      {children}
    </NotificationContext.Provider>
  );
};
