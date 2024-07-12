import React from 'react';

const Message = ({ username, text }) => {
  return (
    <div className="message">
      <p className="message-username">{username} : {text}</p>
    </div>
  );
};

export default Message;