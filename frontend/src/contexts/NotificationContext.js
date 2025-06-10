
import React, { createContext, useContext, useState } from 'react';
import Notification from '../components/ui/Notification';

const NotificationContext = createContext();

export const useNotification = () => {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error('useNotification must be used within a NotificationProvider');
  }
  return context;
};

export const NotificationProvider = ({ children }) => {
  const [notification, setNotification] = useState(null);

  const showNotification = (message, type = 'success', duration = 5000) => {
    setNotification({
      message,
      type,
      duration,
      id: Date.now() // Simple ID for tracking
    });
  };

  const showSuccess = (message, duration = 5000) => {
    showNotification(message, 'success', duration);
  };

  const showError = (message, duration = 7000) => {
    showNotification(message, 'error', duration);
  };

  const showWarning = (message, duration = 6000) => {
    showNotification(message, 'warning', duration);
  };

  const showInfo = (message, duration = 5000) => {
    showNotification(message, 'info', duration);
  };

  const hideNotification = () => {
    setNotification(null);
  };

  return (
    <NotificationContext.Provider
      value={{
        showNotification,
        showSuccess,
        showError,
        showWarning,
        showInfo,
        hideNotification
      }}
    >
      {children}
      
      {/* Render notification if exists */}
      {notification && (
        <Notification
          message={notification.message}
          type={notification.type}
          isVisible={!!notification}
          onClose={hideNotification}
          duration={notification.duration}
          position="top-right"
        />
      )}
    </NotificationContext.Provider>
  );
};