import React, { createContext, useContext } from 'react';
import useNotificationWebSocket from '../hooks/useNotificationWebSocket';

const NotificationContext = createContext();

export const useNotifications = () => useContext(NotificationContext);

export const NotificationProvider = ({ children }) => {
  const { unreadCount, setUnreadCount, latestNotification, isConnected } = useNotificationWebSocket();

  return (
    <NotificationContext.Provider value={{ unreadCount, setUnreadCount, latestNotification, isConnected }}>
      {children}
    </NotificationContext.Provider>
  );
};
