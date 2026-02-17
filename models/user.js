const mongoose = require("mongoose");

mongoose.connect("mongodb://127.0.0.1:27017/miniproject")
  .then(() => console.log("MongoDB connected (user model)"))
  .catch(err => console.error(err));

const userSchema = new mongoose.Schema({
  username: String,
  name: String,
  age: Number,
  email: String,
  password: String,
  posts:[{
    type:mongoose.Schema.Types.ObjectId,ref:"post"
  }]
});

module.exports = mongoose.model("User", userSchema);
