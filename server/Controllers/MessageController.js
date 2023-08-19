const Message = require("../Models/MessageModel");

const createMessage = async (req, res) => {
  const content = req.body?.content;
  const senderId = req.user?.data?._id;
  const conversationId = req.body?.conversationId;
  if (!content || !senderId || !conversationId) {
    return res.status(400).send({ message: "Invalid Request Data." });
  }

  try {
    const newMsg = await Message.create({ conversationId, senderId, content });
    res.status(201).send({ newMsg });
  } catch (error) {
    res.status(500).send(error?.message);
  }
};

const getAllMessages = async (req, res) => {
  const conversationId = req.params?.conversationId;

  if (!conversationId) {
    return res.status(400).send({ message: "Failed to get messages." });
  }
  try {
    const messages = await Message.find({ conversationId });
    res.status(200).send(messages);
  } catch (error) {
    res.status(500).send(error?.message);
  }
};

module.exports = {
  createMessage,
  getAllMessages,
};
