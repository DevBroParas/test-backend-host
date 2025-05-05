// server.js
import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import jwt from "jsonwebtoken";

const app = express();
app.use(express.json());
app.use(cookieParser());

// ✨ CORS: allow your React app to send/receive cookies ✨
const corsOptions = {
  origin: "https://localhost:5173", // your frontend origin
  credentials: true, // ← Access-Control-Allow-Credentials: true
  methods: ["GET", "POST", "OPTIONS"], // allowed HTTP methods
  allowedHeaders: ["Content-Type"], // allowed headers
  optionsSuccessStatus: 200, // for legacy browsers
};
app.use(cors(corsOptions)); // apply CORS to all routes
app.options("*", cors(corsOptions)); // enable preflight for all routes

// remove unsupported Permissions-Policy header
app.use((req, res, next) => {
  res.removeHeader("Permissions-Policy");
  next();
});

const JWT_SECRET = "supersecret";

app.post("/login", (req, res) => {
  const { username } = req.body;
  if (!username) return res.status(400).json({ msg: "Missing username" });

  const token = jwt.sign({ username }, JWT_SECRET, { expiresIn: "1h" });
  res.cookie("token", token, {
    httpOnly: true,
    sameSite: "None", // necessary for cross-site cookies
    secure: true, // HTTPS only
  });
  console.log("Set-Cookie header sent:", res.getHeader("Set-Cookie"));
  res.json({ msg: "Login successful" });
});

app.get("/me", (req, res) => {
  const token = req.cookies.token;
  console.log("token", token);
  if (!token) return res.status(401).json({ msg: "No token found" });

  try {
    const user = jwt.verify(token, JWT_SECRET);
    res.json({ msg: "Authenticated", user: user.username });
  } catch {
    res.status(403).json({ msg: "Invalid token" });
  }
});

const PORT = 8080;
app.listen(PORT, () => {
  console.log(`Backend running on port ${PORT}`);
});
