import React from 'react';

const MessageMe = ({ username, text }) => {
  return (
    <div className="messageme">
      <p className="messageme-username">{username} : {text}</p>
    </div>
  );
};

export default MessageMe;