const Conversation = require("../Models/ConversationModel");

const createConversation = async (req, res) => {
  if (Array.isArray(req.body)) {
    try {
      await Conversation.create({ members: req.body });
      res.status(201).send({ message: "Conversation Successfully Created" });
    } catch (error) {
      res.status(500).send(error?.message);
    }
  } else {
    res
      .status(400)
      .send({ message: "Invalid Request Data (Expecting Array)." });
  }
};

module.exports = {
  createConversation,
};
