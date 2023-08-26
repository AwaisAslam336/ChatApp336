let mongoose = require("mongoose");

let messageSchema = new mongoose.Schema({
  conversation_id: {
    type: String,
    required: true,
  },
  senderId: {
    type: String,
    required: true,
  },
  content: {
    type: String,
    required: true,
  },
});

module.exports = mongoose.model("Message", messageSchema);
