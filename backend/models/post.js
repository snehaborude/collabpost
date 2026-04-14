const mongoose = require("mongoose");

const postSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  title: { type: String, required: true },
  category: { 
    type: String, 
    enum: ['academic', 'coding', 'experiences'], 
    default: 'academic' 
  },
  isPinned: { type: Boolean, default: false },
  content: { type: String, required: true },
  url: { type: String, default: "" },
  tags: [String],
  date: { type: Date, default: Date.now },
  likes: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
  comments: [{
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    text: String,
    date: { type: Date, default: Date.now }
  }]
}, { timestamps: true });

module.exports = mongoose.model("Post", postSchema);
