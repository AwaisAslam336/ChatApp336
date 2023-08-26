const Conversation = require("../Models/ConversationModel");

const createConversation = async (req, res) => {
  const currentUserId = req.user?.data?._id;
  if (!currentUserId) {
    return res.status(400).send({ message: "Failed to get conversations." });
  }
  if (!Array.isArray(req.body)) {
    return res
      .status(400)
      .send({ message: "Invalid Request Data (Expecting Array)." });
  }
  const reversedData = req.body?.slice().reverse();
  try {
    const isConversation = await Conversation.findOne({
      $or: [{ members: req.body }, { members: reversedData }],
    });
    if (isConversation) {
      return res.status(200).send({ message: "Conversation Already Exists" });
    }
    const conversation = await Conversation.create({ members: req.body });
    //otherMember will be used to send socket emit to right receiver
    res.status(201).send({
      otherMember: conversation?.members?.find(
        (mbr) => mbr._id != currentUserId
      ),
    });
  } catch (error) {
    res.status(500).send(error?.message);
  }
};

const getAllConversations = async (req, res) => {
  const currentUserId = req.user?.data?._id;

  if (!currentUserId) {
    return res.status(400).send({ message: "Failed to get conversations." });
  }
  try {
    const conversations = await Conversation.find(
      {
        members: currentUserId,
      },
      "members"
    ).populate("members", "-password -refreshToken");

    //sending other user as other member
    let result = conversations.map((conversation) => {
      return {
        member: conversation.members.find((mbr) => mbr._id != currentUserId),
        conversation_id: conversation._id,
      };
    });
    res.status(200).send(result);
  } catch (error) {
    res.status(500).send(error?.message);
  }
};

module.exports = {
  createConversation,
  getAllConversations,
};
