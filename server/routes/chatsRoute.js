import express from "express";
import Chat from "../models/chat.js";
import protect from "../middleware/authMiddleware.js";
import asyncHandler from "express-async-handler";
import User from "../models/user.js";
const router = express.Router();

//endpoint to access or create a chat
router.route("/").post(
  protect,
  asyncHandler(async (req, res) => {
    const { userId } = req.body; // fetching the user Id provided in the body

    if (!userId) {
      // if no user Id is provided, throw an error
      res.status(400);
      res.send("User Id not provided");
    }

    // if userId is provided, check if the chat with the two users exists or not
    var isChat = await Chat.find({
      isGroupChat: false,
      $and: [
        { users: { $elemMatch: { $eq: req.user._id } } },
        { users: { $elemMatch: { $eq: userId } } },
      ],
    })
      .populate("users", "-password")
      .populate("latestMessage");
    isChat = await User.populate(isChat, {
      path: "latestMessage",
      select: "name pic email",
    });

    if (isChat.length > 0) {
      res.send(isChat[0]);
    } else {
      var chatData = {
        chatName: "sender",
        isGroupChat: false,
        users: [req.user._id, userId],
      };
      try {
        const createdChat = await Chat.create(chatData);
        const fullChat = await Chat.findOne({ _id: createdChat._id }).populate(
          "users",
          "-password"
        );
        res.status(200).send(fullChat);
      } catch (error) {
        res.status(400);
        throw new Error(error.message);
      }
    }
  })
);

//endpoint to get all chats
router.route("/").get(
  protect,
  asyncHandler(async (req, res) => {
    try {
      Chat.find({ users: { $elemMatch: { $eq: req.user._id } } })
        .populate("users", "-password")
        .populate("groupAdmin", "-password")
        .populate("latestMessage")
        .sort({ updateAt: -1 })
        .then(async (results) => {
          results = await User.populate(results, {
            path: "latestMessage",
            select: "name pic email",
          });
          res.status(200).send(results);
        });
    } catch (error) {
      res.status(400);
      throw new Error(error.message);
    }
  })
);

//endpoint to create a group chat
router.route("/creategroup").post(
  //the body will contain chat name and array of users
  protect,
  asyncHandler(async (req, res) => {
    if (!req.body.users || !req.body.name) {
      return res.status(400).send({ message: "Please Fill all the Fields" });
    }

    //taking all the users from the body
    var users = JSON.parse(req.body.users);

    if (users.length < 2) {
      return res
        .status(400)
        .send({ message: "More than 2 users are required to form a group" });
    }

    //adding the current logged in user to the user list
    users.push(req.user);

    //creating group chat
    try {
      const groupChat = await Chat.create({
        chatName: req.body.name,
        users: users,
        isGroupChat: true,
        groupAdmin: req.user,
      });

      const fullGroupChat = await Chat.findOne({ _id: groupChat._id })
        .populate("users", "-password")
        .populate("groupAdmin", "-password");

      res.status(200).json(fullGroupChat);
    } catch (error) {
      res.status(400);
      throw new Error(error.message);
    }
  })
);

//renaming a group
router.route("/renamegroup").put(
  protect,
  asyncHandler(async (req, res) => {
    const { chatId, chatName } = req.body;
    const updatedChat = await Chat.findByIdAndUpdate(
      chatId,
      {
        chatName,
      },
      {
        new: true,
      }
    )
      .populate("users", "-password")
      .populate("groupAdmin", "-password");

    if (!updatedChat) {
      res.status(404);
      throw new Error("Chat not found");
    } else {
      res.json(updatedChat);
    }
  })
);

//remove user from group
router.route("/groupremove").put(
  protect,
  asyncHandler(async (req, res) => {
    const { chatId, userId } = req.body;
    const deletedChat = await Chat.findByIdAndUpdate(
      chatId,
      {
        $pull: { users: userId }, // pushing the user to the users array
      },
      { new: true }
    )
      .populate("users", "-password")
      .populate("groupAdmin", "-password");
    if (!deletedChat) {
      res.status(404);
      throw new Error("Chat not found");
    } else {
      res.json(deletedChat);
    }
  })
);

//adding a user to the group
router.route("/groupadd").put(
  protect,
  asyncHandler(async (req, res) => {
    const { chatId, userId } = req.body;
    const addedChat = await Chat.findByIdAndUpdate(
      chatId,
      {
        $push: { users: userId }, // pushing the user to the users array
      },
      { new: true }
    )
      .populate("users", "-password")
      .populate("groupAdmin", "-password");
    if (!addedChat) {
      res.status(404);
      throw new Error("Chat not found");
    } else {
      res.json(addedChat);
    }
  })
);
export default router;
