import express from "express";
import protect from "../middleware/authMiddleware.js";
import asyncHandler from "express-async-handler";
import Message from "../models/message.js";
import User from "../models/user.js";
import Chat from "../models/chat.js";
const router = express.Router();

// endpoint to send messages
router.route("/").post(
  protect,
  asyncHandler(async (req, res) => {
    const { content, chatId } = req.body;
    if (!content || !chatId) {
      console.log("Invalid data passed into the request");
      return res.sendStatus(400);
    }
    var newMsg = {
      sender: req.user._id,
      content: content,
      chat: chatId,
    };

    try {
      var message = await Message.create(newMsg);
      message = await message.populate("sender", "name pic");
      message = await message.populate("chat");
      message = await User.populate(message, {
        path: "chat.users",
        select: "name pic email",
      });

      await Chat.findByIdAndUpdate(req.body.chatId, {
        latestMessage: message,
      });

      res.json(message);
    } catch (error) {
      res.status(400);
      throw new Error(error.message);
    }
  })
);

//endpoint to get all the messages inside a chat
router.route("/:chatId").get(
  protect,
  asyncHandler(async (req, res) => {
    try {
      const messages = await Message.find({ chat: req.params.chatId })
        .populate("sender", "name pic email")
        .populate("chat");

      res.json(messages);
    } catch (error) {
      res.status(400);
      throw new Error(error.message);
    }
  })
);

export default router;
