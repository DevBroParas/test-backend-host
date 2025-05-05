import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import jwt from "jsonwebtoken";

const app = express();

app.use(express.json());
app.use(cookieParser());

// CORS config to accept frontend on localhost:5173
app.use(
  cors({
    origin: "http://localhost:5173",
    credentials: true,
  })
);

const JWT_SECRET = "supersecret";

app.post("/login", (req, res) => {
  const { username } = req.body;
  if (!username) return res.status(400).json({ msg: "Missing username" });

  const token = jwt.sign({ username }, JWT_SECRET, { expiresIn: "1h" });

  res.cookie("token", token, {
    httpOnly: true,
    sameSite: "Lax",
    secure: false, // use true only with HTTPS
  });

  res.json({ msg: "Login successful" });
});

app.get("/me", (req, res) => {
  const token = req.cookies.token;
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
