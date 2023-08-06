const Conversation = require("../Models/ConversationModel");

const createConversation = async (req, res) => {
  if (!Array.isArray(req.body)) {
    return res
      .status(400)
      .send({ message: "Invalid Request Data (Expecting Array)." });
  }

  try {
    const isConversation = await Conversation.findOne({ members: req.body });
    if (isConversation) {
      return res.status(200).send({ message: "Conversation Already Exists" });
    }
    await Conversation.create({ members: req.body });
    res.status(201).send({ message: "Conversation Successfully Created" });
  } catch (error) {
    res.status(500).send(error?.message);
  }
};

const getAllConversations = async (req, res) => {
  const currentUserEmail = req.user.data.email;
  console.log(currentUserEmail);
  if (!currentUserEmail) {
    return res.status(400).send({ message: "Failed to get conversations." });
  }
  try {
    const conversations = await Conversation.find({
      members: currentUserEmail,
    });
    res.status(200).send(conversations);
  } catch (error) {
    res.status(500).send(error?.message);
  }
};

module.exports = {
  createConversation,
  getAllConversations,
};
