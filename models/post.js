const mongoose = require("mongoose");

mongoose.connect("mongodb://127.0.0.1:27017/miniproject")
  .then(() => console.log("MongoDB connected (user model)"))
  .catch(err => console.error(err));

const postSchema =  mongoose.Schema({
  user:{type:mongoose.Schema.Types.ObjectId,
  },
  date:{
    type:Date,
    default:Date.noe
  },
  content:String,
  likes:[{
    type:mongoose.Schema.Types.ObjectId,ref:"user"
  }]
});

module.exports = mongoose.model("post", postSchema);
