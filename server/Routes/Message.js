const express = require("express");
const auth = require("../Middlewares/auth");
const messageRouter = express.Router();
let {
  createMessage,
  getAllMessages,
} = require("../Controllers/MessageController");

messageRouter.post("/create", auth, createMessage);
messageRouter.get("/get/:conversationId", auth, getAllMessages);

module.exports = { messageRouter };
