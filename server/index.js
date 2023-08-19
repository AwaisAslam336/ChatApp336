require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const cookieParser = require("cookie-parser");
const helmet = require("helmet");
const { userRouter } = require("./Routes/User");
const { conversationRouter } = require("./Routes/conversation");
const { messageRouter } = require("./Routes/message");

const app = express();
const port = 8000;
let boolValue = process.env.HELMET_CROSS_ORIGIN === "true";
app.use(
  helmet({
    crossOriginResourcePolicy: boolValue,
  })
);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(express.static(__dirname + "/public/images"));

const corsOptions = {
  origin: "http://localhost:3000",
  credentials: true, //access-control-allow-credentials:true
  optionSuccessStatus: 200,
};

app.use(cors(corsOptions));

app.use("/api/user", userRouter);
app.use("/api/conversation", conversationRouter);
app.use("/api/message", messageRouter);

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
        origin: "http://localhost:3000",
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

      socket.on("disconnect", () => {
        console.log(`Socket ${socket.id} disconnected`);
      });
    });
  } catch (error) {
    console.log("Connection Error with Database");
    process.exit();
  }
}
run();
