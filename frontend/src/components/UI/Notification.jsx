import React from 'react';
import { FiX, FiAlertCircle, FiCheckCircle, FiInfo } from 'react-icons/fi';

function Notification({ notifications }) {
  // Get appropriate icon based on notification type
  const getIcon = (type) => {
    switch (type) {
      case 'success':
        return <FiCheckCircle className="notification-icon" />;
      case 'error':
        return <FiAlertCircle className="notification-icon" />;
      case 'info':
      default:
        return <FiInfo className="notification-icon" />;
    }
  };

  return (
    <div className="notifications-container">
      {notifications.map(notification => (
        <div 
          key={notification.id} 
          className={`notification-card ${notification.type}`}
        >
          {getIcon(notification.type)}
          <div className="notification-content">
            {notification.message}
          </div>
        </div>
      ))}
    </div>
  );
}

export default Notification;