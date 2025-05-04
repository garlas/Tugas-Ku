require("dotenv").config();
const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { OAuth2Client } = require("google-auth-library");
const User = require("./models/User");
const Task = require("./models/Task");

const app = express();
app.use(express.json());

app.use(
  cors({
    origin: "http://127.0.0.1:5500",
    credentials: true,
  })
);

const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

mongoose
  .connect(process.env.MONGO_URI)
  .then(() => console.log("MongoDB terhubung"))
  .catch((err) => console.error("Gagal konek MongoDB:", err));

function generateToken(user) {
  return jwt.sign({ id: user._id, email: user.email }, process.env.JWT_SECRET, {
    expiresIn: "7d",
  });
}

function authenticateToken(req, res, next) {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1];

  if (!token) return res.sendStatus(403);

  jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
    if (err) return res.sendStatus(403);
    req.user = user;
    next();
  });
}

// Menambahkan endpoint GET /api/tasks untuk mengambil semua pengguna
app.get("/api/tasks", async (req, res) => {
  const userId = req.query.userId;

  if (!userId) return res.status(400).json({ error: "userId dibutuhkan" });

  try {
    // Cek apakah userId bisa di-cast menjadi ObjectId
    const validUserId = mongoose.Types.ObjectId.isValid(userId);
    if (!validUserId) {
      return res.status(400).json({ error: "userId tidak valid" });
    }

    const tasks = await Task.find({ userId: mongoose.Types.ObjectId(userId) });
    res.json(tasks);
  } catch (error) {
    console.error("Error fetching tasks:", error);
    res.status(500).json({ message: "Terjadi kesalahan", error });
  }
});

// Manual signup
app.post("/daftar", async (req, res) => {
  const { name, email, password } = req.body;
  try {
    let existing = await User.findOne({ email });
    if (existing)
      return res.status(400).json({ message: "Email sudah terdaftar" });

    const hashed = await bcrypt.hash(password, 10);
    const newUser = new User({ name, email, password: hashed });
    await newUser.save();

    const token = generateToken(newUser);
    res.status(201).json({ message: "Berhasil daftar", token });
  } catch (err) {
    res.status(500).json({ message: "Gagal daftar", error: err.message });
  }
});

// Manual login
app.post("/login", async (req, res) => {
  const { email, password } = req.body;
  try {
    let user = await User.findOne({ email });
    if (!user)
      return res.status(400).json({ message: "Email tidak ditemukan" });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).json({ message: "Password salah" });

    const token = generateToken(user);
    res.status(200).json({ message: "Login berhasil", token });
  } catch (err) {
    res.status(500).json({ message: "Gagal login", error: err.message });
  }
});

// Google login
app.post("/google-signup", async (req, res) => {
  const { credential } = req.body;

  try {
    const ticket = await client.verifyIdToken({
      idToken: credential,
      audience: process.env.GOOGLE_CLIENT_ID,
    });

    const payload = ticket.getPayload();
    const { email, name, sub: googleId } = payload;

    let user = await User.findOne({ email });

    if (!user) {
      user = new User({ name, email, googleId });
      await user.save();
    }

    const token = generateToken(user);
    res.status(200).json({ message: "Login Google berhasil", token });
  } catch (err) {
    res
      .status(400)
      .json({ message: "Token Google tidak valid", error: err.message });
  }
});

// Get current user
app.get("/me", authenticateToken, async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) return res.sendStatus(404);

    res.json({ id: user._id, name: user.name, email: user.email });
  } catch (err) {
    res
      .status(500)
      .json({ message: "Gagal ambil data user", error: err.message });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () =>
  console.log(`Server running at http://localhost:${PORT}`)
);
