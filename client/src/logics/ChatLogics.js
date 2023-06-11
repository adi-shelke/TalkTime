const getSender = (loggedUser, users) => {
  return users[0]._id === loggedUser._id ? users[1].name : users[0].name;
};
const getSenderObj = (loggedUser, users) => {
  return users[0]._id === loggedUser._id ? users[1] : users[0];
};

const isSameSender = (messages, msg, i, userId) => {
  return (
    i < messages.length - 1 &&
    (messages[i + 1].sender._id !== msg.sender._id ||
      messages[i + 1].sender._id === undefined) &&
    messages[i].sender._id !== userId
  );
};

const isLastMessage = (messages, i, userId) => {
  return (
    i === messages.length - 1 &&
    messages[messages.length - 1].sender._id !== userId &&
    messages[messages.length - 1].sender._id
  );
};

const sameSenderMargin = (messages, msg, i, userId) => {
  if (
    i < messages.length - 1 &&
    messages[i + 1].sender._id === msg.sender._id &&
    messages[i].sender._id !== userId
  )
    return 33;
  else if (
    (i < messages.length - 1 &&
      messages[i + 1].sender._id !== msg.sender._id &&
      messages[i].sender._id !== userId) ||
    (i === messages.length - 1 && messages[i].sender._id !== userId)
  )
    return 0;
  else return "auto";
};

const isSameUser = (messages, msg, i) => {
  return i > 0 && messages[i - 1].sender._id === msg.sender._id;
};

export {
  getSender,
  getSenderObj,
  isSameSender,
  isLastMessage,
  sameSenderMargin,
  isSameUser,
};
