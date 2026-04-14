// ================== IMPORTS ==================
const express = require("express");
const mongoose = require("mongoose");
const cookieParser = require("cookie-parser");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const cors = require("cors");

// ================== APP ==================
const app = express();

// ================== MODELS ==================
const userModel = require("./models/user");
const postModel = require("./models/post");

// ================== CONFIG ==================
const JWT_SECRET = "secretkey";
const PORT = process.env.PORT || 3001;

// ================== DB CONNECTION ==================
mongoose
  .connect(process.env.MONGODB_URI || "mongodb://127.0.0.1:27017/miniproject")
  .then(() => console.log("MongoDB connected"))
  .catch((err) => console.log(err));

// ================== MIDDLEWARE ==================
app.use(cors({
  origin: process.env.FRONTEND_URL || true,
  credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// ================== AUTH MIDDLEWARE ==================
function isLoggedIn(req, res, next) {
  const token = req.cookies.token;
  if (!token) return res.status(401).json({ message: "Unauthorized" });

  try {
    const data = jwt.verify(token, JWT_SECRET);
    req.user = data;
    next();
  } catch (err) {
    return res.status(401).json({ message: "Unauthorized" });
  }
}

// ================== ROUTES ==================

// ---- AUTH ROUTES ----

app.post("/api/auth/register", async (req, res) => {
  try {
    let { username, name, password, program, bio } = req.body;
    
    // Validate inputs
    if (!username || !password || !name) {
      return res.status(400).json({ message: "Missing required fields (Username, Name, Password)" });
    }

    // Check if user exists by username
    let existingUsername = await userModel.findOne({ username });
    if (existingUsername) return res.status(400).json({ message: "Username already taken" });

    // Hash password using promise version
    const salt = await bcrypt.genSalt(10);
    const hash = await bcrypt.hash(password, salt);

    // Create user
    let user = await userModel.create({
      username, 
      name, 
      password: hash, 
      program: program || "", 
      bio: bio || ""
    });

    let token = jwt.sign({ username: user.username, userid: user._id }, JWT_SECRET);
    res.cookie("token", token, { httpOnly: true, secure: false });
    
    const userResponse = user.toObject();
    delete userResponse.password;
    
    res.status(201).json({ user: userResponse, token });
  } catch(err) {
    res.status(500).json({ message: err.message });
  }
});

app.post("/api/auth/login", async (req, res) => {
  try {
    let { username, password } = req.body;
    
    if (!username || !password) {
      return res.status(400).json({ message: "Username and password required" });
    }

    let user = await userModel.findOne({ username });
    if (!user) return res.status(400).json({ message: "Invalid credentials" });

    let isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).json({ message: "Invalid credentials" });

    let token = jwt.sign({ username: user.username, userid: user._id }, JWT_SECRET);
    res.cookie("token", token, { httpOnly: true, secure: false });
    res.status(200).json({ user, token });
  } catch(err) {
    res.status(500).json({ message: err.message });
  }
});

app.post("/api/auth/logout", (req, res) => {
  res.clearCookie("token");
  res.status(200).json({ message: "Logged out" });
});

app.get("/api/auth/me", isLoggedIn, async (req, res) => {
  try {
    let user = await userModel.findById(req.user.userid)
      .select("-password -__v")
      .populate("posts")
      .populate({
        path: "savedPosts",
        populate: { path: "user", select: "name username" }
      });
    
    // Calculate simple reputation points: Posts * 10 + Total Likes * 2
    const postCount = user.posts.length;
    const totalLikes = user.posts.reduce((acc, post) => acc + (post.likes?.length || 0), 0);
    const reputation = (postCount * 10) + (totalLikes * 2);

    res.status(200).json({ user: { ...user.toObject(), reputation } });
  } catch(err) {
    res.status(500).json({ message: err.message });
  }
});

app.post("/api/posts/:id/pin", isLoggedIn, async (req, res) => {
  try {
    let post = await postModel.findById(req.params.id);
    if (!post) return res.status(404).json({ message: "Post not found" });
    if (String(post.user) !== String(req.user.userid)) return res.status(403).json({ message: "Forbidden" });

    // Unpin all other posts for this user (only 1 pinned at a time)
    if (!post.isPinned) {
      await postModel.updateMany({ user: req.user.userid }, { isPinned: false });
    }

    post.isPinned = !post.isPinned;
    await post.save();
    res.status(200).json({ post, message: post.isPinned ? "Post pinned" : "Post unpinned" });
  } catch(err) {
    res.status(500).json({ message: err.message });
  }
});


// ---- POST ROUTES ----

app.get("/api/posts", async (req, res) => {
  try {
    const { category, search } = req.query;
    let query = {};
    if (category && category !== "all") query.category = category;
    if (search) {
      query.$or = [
        { title: { $regex: search, $options: "i" } },
        { content: { $regex: search, $options: "i" } }
      ];
    }
    
    let posts = await postModel.find(query).populate("user", "name username").populate("comments.user", "name username").sort({ date: -1 });
    res.status(200).json({ posts });
  } catch(err) {
    res.status(500).json({ message: err.message });
  }
});

app.post("/api/posts", isLoggedIn, async (req, res) => {
  try {
    let { title, category, content, url, tags } = req.body;
    let user = await userModel.findById(req.user.userid);

    let post = await postModel.create({
      user: user._id, 
      title, 
      category, 
      content,
      url: url || "",
      tags: tags || []
    });

    user.posts.push(post._id);
    await user.save();

    res.status(201).json({ post, message: "Post created successfully" });
  } catch(err) {
    res.status(500).json({ message: err.message });
  }
});

app.post("/api/posts/:id/save", isLoggedIn, async (req, res) => {
  try {
    let user = await userModel.findById(req.user.userid);
    if (user.savedPosts.includes(req.params.id)) {
      user.savedPosts.pull(req.params.id);
    } else {
      user.savedPosts.push(req.params.id);
    }
    await user.save();
    res.status(200).json({ user, message: "Bookmark updated" });
  } catch(err) {
    res.status(500).json({ message: err.message });
  }
});

app.delete("/api/posts/:id", isLoggedIn, async (req, res) => {
  try {
    let post = await postModel.findById(req.params.id);
    if (!post) return res.status(404).json({ message: "Post not found" });

    // Ensure strict comparison string to string
    if (String(post.user) !== String(req.user.userid)) {
      return res.status(403).json({ message: "You are not authorized to delete this post" });
    }

    await postModel.findByIdAndDelete(req.params.id);
    await userModel.findByIdAndUpdate(req.user.userid, { $pull: { posts: req.params.id } });
    
    res.status(200).json({ message: "Post deleted successfully" });
  } catch(err) {
    res.status(500).json({ message: err.message });
  }
});

app.post("/api/posts/:id/like", isLoggedIn, async (req, res) => {
  try {
    let post = await postModel.findById(req.params.id);
    if (!post) return res.status(404).json({ message: "Not found" });

    if (post.likes.includes(req.user.userid)) {
      post.likes.pull(req.user.userid);
    } else {
      post.likes.push(req.user.userid);
    }

    await post.save();
    res.status(200).json({ post, message: "Like updated" });
  } catch(err) {
    res.status(500).json({ message: err.message });
  }
});

app.post("/api/posts/:id/comment", isLoggedIn, async (req, res) => {
  try {
    let { text } = req.body;
    let post = await postModel.findById(req.params.id);
    if (!post) return res.status(404).json({ message: "Not found" });

    post.comments.push({
      user: req.user.userid,
      text
    });

    await post.save();
    let populatedPost = await postModel.findById(req.params.id).populate("user", "name username").populate("comments.user", "name username");
    res.status(200).json({ post: populatedPost, message: "Comment added" });
  } catch(err) {
    res.status(500).json({ message: err.message });
  }
});

// ================== SERVER ==================
if (require.main === module) {
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
}

module.exports = app;
