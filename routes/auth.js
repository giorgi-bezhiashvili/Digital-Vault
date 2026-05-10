const express = require("express");
const router = express.Router();
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const passport = require("passport");
const User = require("../models/User");
const { validate, schemas } = require("../middleware/validation");

let refreshTokens = [];
const DUMMY_HASH =
  "$2b$10$abcdefghijklmnopqrstuuABCDEFGHIJKLMNOPQRSTUVWXYZ012345";

const generateAccessToken = (user) => {
  return jwt.sign(
    { userName: user.userName, id: user._id },
    process.env.ACCESS_TOKEN_SECRET,
    { expiresIn: "15m" },
  );
};
function authenticateToken(req, res, next) {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1];
  if (!token) return res.sendStatus(401);
  jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (err, user) => {
    if (err) return res.sendStatus(403);
    req.user = user;
    next();
  });
}

// Standard Register
router.post("/register", validate(schemas.register), async (req, res) => {
  try {
    const { userName, password } = req.body;
    const existingUser = await User.findOne({ userName });
    if (existingUser)
      return res.status(400).json({ message: "User already exists" });

    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = new User({ userName, password: hashedPassword });
    await newUser.save();
    res.send("User registered successfully.");
  } catch (err) {
    res.status(500).send("Server error");
  }
});

// Standard Login
router.post("/login", validate(schemas.login), async (req, res) => {
  const { userName, password } = req.body;
  const user = await User.findOne({ userName });
  const hashToCompare = user ? user.password : DUMMY_HASH;
  const isMatch = await bcrypt.compare(password, hashToCompare);

  if (!user || !isMatch) return res.status(401).send("Invalid credentials");
  if (user.password === "google-auth-user")
    return res.status(400).json({ message: "Use Google Login" });

  const accessToken = generateAccessToken(user);
  const refreshToken = jwt.sign(
    { userName: user.userName },
    process.env.REFRESH_TOKEN_SECRET,
    { expiresIn: "7d" },
  );
  refreshTokens.push(refreshToken);
  res.json({ accessToken, refreshToken });
});

// Google Auth Routes
router.get(
  "/google",
  passport.authenticate("google", { scope: ["email", "profile"] }),
);

router.get(
  "/google/callback",
  passport.authenticate("google", { session: false, failureRedirect: "/" }),
  (req, res) => {
    const accessToken = generateAccessToken(req.user);
    const refreshToken = jwt.sign(
      { userName: req.user.userName },
      process.env.REFRESH_TOKEN_SECRET,
      { expiresIn: "7d" },
    );
    refreshTokens.push(refreshToken);
    res.json({ accessToken, refreshToken });
  },
);

module.exports = { router, authenticateToken };
