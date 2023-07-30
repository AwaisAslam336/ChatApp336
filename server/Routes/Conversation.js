const express = require("express");
const auth = require("../Middlewares/auth");
const conversationRouter = express.Router();
let { createConversation } = require("../Controllers/ConversationController");

conversationRouter.post("/create", auth, createConversation);

module.exports = { conversationRouter };
