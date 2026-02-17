// ================== IMPORTS ==================
const express = require("express");
const mongoose = require("mongoose");
const cookieParser = require("cookie-parser");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

// ================== APP ==================
const app = express();

// ================== MODELS ==================
const userModel = require("./models/user");
const postModel = require("./models/post");

// ================== CONFIG ==================
const JWT_SECRET = "secretkey";
const PORT = 3001;

// ================== DB CONNECTION ==================
mongoose
  .connect("mongodb://127.0.0.1:27017/miniproject")
  .then(() => console.log("MongoDB connected"))
  .catch((err) => console.log(err));

// ================== MIDDLEWARE ==================
app.set("view engine", "ejs");
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// ================== AUTH MIDDLEWARE ==================
function isLoggedIn(req, res, next) {
  const token = req.cookies.token;
  if (!token) return res.redirect("/login");

  try {
    const data = jwt.verify(token, JWT_SECRET);
    req.user = data;
    next();
  } catch (err) {
    return res.redirect("/login");
  }
}

// ================== ROUTES ==================

// HOME
app.get("/", (req, res) => {
  res.send("Server is running 🚀");
});

// LOGIN PAGE
app.get("/login", (req, res) => {
  res.render("login");
});

// REGISTER PAGE
app.get("/register", (req, res) => {
  res.render("register");
});

// PROFILE (PROTECTED)
app.get("/profile", isLoggedIn, async (req, res) => {
  let user = await userModel
    .findOne({ email: req.user.email })
    .populate("posts");

  res.render("profile", { user });
});

// CREATE POST
app.post("/post", isLoggedIn, async (req, res) => {
  let { content } = req.body;
  let user = await userModel.findOne({ email: req.user.email });

  let post = await postModel.create({
    user: user._id,
    content,
  });

  user.posts.push(post._id);
  await user.save();

  res.redirect("/profile");
});

// LIKE / UNLIKE POST
app.get("/like/:id", isLoggedIn, async (req, res) => {
  let post = await postModel.findById(req.params.id);

  if (post.likes.includes(req.user.userid)) {
    post.likes.pull(req.user.userid);
  } else {
    post.likes.push(req.user.userid);
  }

  await post.save();
  res.redirect("/profile");
});

// EDIT POST PAGE
app.get("/edit/:id", isLoggedIn, async (req, res) => {
  let post = await postModel.findById(req.params.id);
  res.render("edit", { post });
});

// UPDATE POST
app.post("/update/:id", isLoggedIn, async (req, res) => {
  let { content } = req.body;

  await postModel.findByIdAndUpdate(req.params.id, { content });
  res.redirect("/profile");
});

// REGISTER USER
app.post("/register", async (req, res) => {
  let { username, name, email, age, password } = req.body;

  let existingUser = await userModel.findOne({ email });
  if (existingUser) return res.redirect("/login");

  bcrypt.genSalt(10, (err, salt) => {
    bcrypt.hash(password, salt, async (err, hash) => {
      let user = await userModel.create({
        username,
        name,
        email,
        age,
        password: hash,
      });

      let token = jwt.sign(
        { email: user.email, userid: user._id },
        JWT_SECRET
      );

      res.cookie("token", token);
      res.redirect("/profile");
    });
  });
});

// LOGIN USER
app.post("/login", async (req, res) => {
  let { email, password } = req.body;

  let user = await userModel.findOne({ email });
  if (!user) return res.redirect("/login");

  bcrypt.compare(password, user.password, (err, result) => {
    if (!result) return res.redirect("/login");

    let token = jwt.sign(
      { email: user.email, userid: user._id },
      JWT_SECRET
    );

    res.cookie("token", token);
    res.redirect("/profile");
  });
});

// LOGOUT
app.get("/logout", (req, res) => {
  res.clearCookie("token");
  res.redirect("/login");
});

// ================== SERVER ==================
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
