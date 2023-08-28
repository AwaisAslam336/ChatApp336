const Message = require("../Models/MessageModel");

const createMessage = async (req, res) => {
  const content = req.body?.content;
  const senderId = req.user?.data?._id;
  const conversation_id = req.body?.conversation_id;

  if (!content || !senderId || !conversation_id) {
    return res.status(400).send({ message: "Invalid Request Data." });
  }

  try {
    const newMsg = await Message.create({
      conversation_id,
      senderId,
      content,
    });
    res.status(201).send({ newMsg });
  } catch (error) {
    res.status(500).send(error?.message);
  }
};

const getAllMessages = async (req, res) => {
  const conversation_id = req.params?.conversation_id;

  if (!conversation_id) {
    res.status(400).send({ message: "Failed to get messages." });
  }
  try {
    const messages = await Message.find({ conversation_id });
    res.status(200).send(messages);
  } catch (error) {
    res.status(500).send(error?.message);
  }
};

module.exports = {
  createMessage,
  getAllMessages,
};
