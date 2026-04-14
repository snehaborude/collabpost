const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true },
  name: { type: String, required: true },
  password: { type: String, required: true },
  bio: { type: String, default: "" },
  program: { type: String, default: "" },
  posts: [{
    type: mongoose.Schema.Types.ObjectId, ref: "Post"
  }],
  savedPosts: [{
    type: mongoose.Schema.Types.ObjectId, ref: "Post"
  }]
}, { timestamps: true });

module.exports = mongoose.model("User", userSchema);
