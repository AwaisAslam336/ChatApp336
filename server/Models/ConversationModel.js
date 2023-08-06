let mongoose = require("mongoose");
let validator = require("validator");

let conversationSchema = new mongoose.Schema({
  members: {
    type: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
    ],
    require: true,
  },
});

module.exports = mongoose.model("Conversation", conversationSchema);
