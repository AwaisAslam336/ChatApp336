let mongoose = require("mongoose");

let messageSchema = new mongoose.Schema({
  conversationId: {
    type: String,
    required: true,
  },
  userId: {
    type: String,
    required: true,
  },
});

module.exports = mongoose.model("Message", messageSchema);
