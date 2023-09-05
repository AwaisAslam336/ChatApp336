require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const cookieParser = require("cookie-parser");
//const helmet = require("helmet");
const { userRouter } = require("./Routes/User.js");
const { conversationRouter } = require("./Routes/Conversation.js");
const { messageRouter } = require("./Routes/Message.js");
const path = require("path");

const app = express();
const port = 8000;
// let boolValue = process.env.HELMET_CROSS_ORIGIN === "true";
// app.use(
//   helmet({
//     crossOriginResourcePolicy: boolValue,
//   })
// );
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, "public")));
app.use(express.static(path.join(__dirname, "images")));

const corsOptions = {
  origin: ["*"],
  credentials: true, //access-control-allow-credentials:true
  optionSuccessStatus: 200,
};
app.use(cors(corsOptions));

app.use("/api/user", userRouter);
app.use("/api/conversation", conversationRouter);
app.use("/api/message", messageRouter);
app.get("/*", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "index.html"));
});

async function run() {
  try {
    await mongoose.connect(process.env.MONGODB_URL, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log("mongodb connected...");
    const server = app.listen(port, () => {
      console.log("App is running on port", port);
    });
    const io = require("socket.io")(server, {
      pingTimeout: 60000,
      cors: {
        origin: "*",
      },
    });
    io.on("connect", (socket) => {
      console.log(`connected to socket.io`);

      socket.on("setup", (userId) => {
        socket.join(userId);
        console.log("user connected");
        socket.emit("connected");
      });

      socket.on("join chat", (room) => {
        socket.join(room);
        console.log("User joined room " + room);
      });

      socket.on("sendMsg", (data) => {
        if (!data.receiverUserId) return;
        socket.in(data.receiverUserId).emit("onMsgReceive", data.newMsg);
      });

      socket.on("new Conversation Created", (data) => {
        if (!data) return;
        socket.in(data.otherMember).emit("new Conversation Added");
      });

      socket.on("typing", (conversationRoom) => {
        if (!conversationRoom) return;
        socket.in(conversationRoom).emit("typing", conversationRoom);
      });
      socket.on("stop typing", (receiverId) => {
        if (!receiverId) return;
        socket.in(receiverId).emit("stop typing");
      });

      socket.off("setup", () => {
        console.log("User Disconnected");
        socket.leave(userId);
      });

      socket.on("disconnect", () => {
        console.log(`Socket ${socket.id} disconnected`);
      });
    });
  } catch (error) {
    console.log("Connection Error with Database");
  }
}
run();
