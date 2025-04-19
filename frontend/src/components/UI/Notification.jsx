import React from 'react';

function Notification({ notifications }) {
  return (
    <div className="notifications-container">
      {notifications.map(notification => (
        <div key={notification.id} className={`notification ${notification.type}`}>
          {notification.message}
        </div>
      ))}
    </div>
  );
}

export default Notification;