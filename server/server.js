import express from "express";
import cors from "cors";
import chatsRoute from "./routes/chatsRoute.js";
import userRoutes from "./routes/userRoutes.js";
import messageRoutes from "./routes/messageRoutes.js";
import dotenv from "dotenv";
import connectDb from "./config/db.js";
import { Server } from "socket.io";
import { createServer } from "http";
import path from "path";
connectDb();
//initializes the express
const app = express();
dotenv.config();
app.use(cors()); // to allow cross platoform requests
app.use(express.json()); // to accept the json data from the request body

app.use("/api/chat", chatsRoute); //for chat endpoints
app.use("/api/user/", userRoutes); //for user endpoints like signup and login
app.use("/api/message", messageRoutes); // for message endpoints
app.get("/", (req, res) => {
  res.send("Hi there");
});

// ----------------------DEPLOYMENT CODE-------------------------------

// ----------------------DEPLOYMENT CODE-------------------------------

//for error handling and not found requests
app.get("*", function (req, res) {
  res.status(404).send("Not found");
});
app.post("*", function (req, res) {
  res.status(404).send("Not found");
});

//running the express server on a specific port
const port = process.env.PORT || 5000;

const server = createServer(app);
const io = new Server(server, {
  pingTimeout: 60000,
  cors: {
    origin: "https://talktimev1.netlify.app",
  },
});

io.on("connection", (socket) => {
  console.log("Connected to socket.io ");
  socket.on("setup", (userData) => {
    socket.join(userData._id);
    socket.emit("connected");
  });

  socket.on("join chat", (room) => {
    socket.join(room);
  });

  socket.on("typing", (room) => socket.in(room).emit("typing"));
  socket.on("stop typing", (room) => socket.in(room).emit("stop typing"));

  socket.on("new message", (newMessage) => {
    var chat = newMessage.chat;
    if (!chat.users) return console.log("chat.users not defined");

    chat.users.forEach((user) => {
      if (user._id === newMessage.sender._id) return;
      socket.in(user._id).emit("message received", newMessage);
    });
  });

  socket.off("setup", () => {
    console.log("USER DISCONNECTED");
    socket.leave(userData._id);
  });
});

server.listen(port, console.log(`Server started on port number ${port}`));
