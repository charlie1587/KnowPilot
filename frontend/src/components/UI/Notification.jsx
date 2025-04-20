import React, { useEffect, useState } from 'react';
import { FiX, FiAlertCircle, FiCheckCircle, FiInfo } from 'react-icons/fi';

function Notification({ notifications }) {
  // Track which notifications should be visible
  const [visibleNotifications, setVisibleNotifications] = useState([]);

  useEffect(() => {
    // When notifications change, update visible ones
    if (notifications.length > 0) {
      // Add any new notifications to visible list
      const newNotifications = notifications.filter(
        notification => !visibleNotifications.find(n => n.id === notification.id)
      );
      
      if (newNotifications.length > 0) {
        setVisibleNotifications(prev => [...prev, ...newNotifications]);
        
        // Schedule auto-removal for each new notification
        newNotifications.forEach(notification => {
          setTimeout(() => {
            setVisibleNotifications(prev => 
              prev.filter(n => n.id !== notification.id)
            );
          }, 5000); // Auto-dismiss after 5 seconds
        });
      }
    }
  }, [notifications]);

  // Handle manual close
  const handleClose = (id) => {
    setVisibleNotifications(prev => prev.filter(n => n.id !== id));
  };
  
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
      {visibleNotifications.map(notification => (
        <div 
          key={notification.id} 
          className={`notification-card ${notification.type}`}
        >
          {getIcon(notification.type)}
          <div className="notification-content">
            {notification.message}
          </div>
          <button 
            className="notification-close" 
            onClick={() => handleClose(notification.id)}
            aria-label="Close notification"
          >
            <FiX />
          </button>
        </div>
      ))}
    </div>
  );
}

export default Notification;