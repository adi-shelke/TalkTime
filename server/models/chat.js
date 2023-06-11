import mongoose from "mongoose";

// Creating a chat model

const chatModel = mongoose.Schema(
  {
    //For the chat name
    chatName: { type: String, trim: true },

    // to identify is the chat is one to one or group chat
    isGroupChat: { type: Boolean, default: false },

    // the users involved in the chat
    users: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
    ],

    // to reference to the latest message in the chat
    latestMessage: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Message",
    },

    // if it is a group chat then this is to refer to the admin of the group
    groupAdmin: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
  },

  // to record the time whenever theres a change in the chat database
  {
    timestamps: true,
  }
);

const Chat = mongoose.model("Chat", chatModel);
// module.exports = Chat;
export default Chat;
