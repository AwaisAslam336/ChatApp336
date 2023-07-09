let mongoose = require("mongoose");
let validator = require("validator");

let conversationSchema = new mongoose.Schema({
  members: {
    type: Array,
    require: true,
  },
});

module.exports = mongoose.model("Conversation", conversationSchema);
