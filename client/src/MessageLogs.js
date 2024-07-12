import React from 'react';

const MessageLogs = ({ username, text }) => {
  return (
    <div className="messagelogs">
      <p className="messagelogs-username">{username} : {text}</p>
    </div>
  );
};

export default MessageLogs;