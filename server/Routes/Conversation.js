const express = require("express");
const auth = require("../Middlewares/auth");
const conversationRouter = express.Router();
let {
  createConversation,
  getAllConversations,
} = require("../Controllers/ConversationController");

conversationRouter.post("/create", auth, createConversation);
conversationRouter.get("/get", auth, getAllConversations);

module.exports = { conversationRouter };
