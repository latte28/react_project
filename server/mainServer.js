const express = require("express");
const http = require("http"); // ← 추가
const cors = require("cors");
const session = require("express-session");
const path = require("path");
const jwt = require("jsonwebtoken");
const { wss } = require("./wsServer"); // ← 새로 만들 wsServer.js 가져옴

const db = require("./db");
const userRouter = require("./routes/user");
const postsRouter = require("./routes/post");
const profileRouter = require("./routes/profile");
const likeRoutes = require("./routes/likes");
const commentRoutes = require("./routes/comments");
const authRouter = require("./routes/auth");
const notisRouter = require("./routes/notis");
const followRoutes = require("./routes/follow");
const dmRouter = require("./routes/dm");

const app = express();
const server = http.createServer(app); // ← 여기 변경

app.use(express.json());

app.use(cors({
  origin: ["http://localhost:3000"],
  credentials: true
}));

app.use("/uploads", express.static(path.join(__dirname, "uploads")));

app.use(session({
  secret: "test1234",
  resave: false,
  saveUninitialized: false,
  cookie: {
    httpOnly: true,
    secure: false,
    maxAge: 1000 * 60 * 60 * 24 * 365
  }
}));

app.use("/user", userRouter);
app.use("/posts", postsRouter);
app.use("/profile", profileRouter);
app.use("/likes", likeRoutes);
app.use("/comments", commentRoutes);
app.use("/auth", authRouter);
app.use("/notis", notisRouter);
app.use("/follows", followRoutes);
app.use("/dm", dmRouter);

// WebSocket 연결 처리
server.on("upgrade", (req, socket, head) => {
  const url = new URL(req.url, `http://${req.headers.host}`);
  const token = url.searchParams.get("token");

  if (!token) {
    console.error("❌ 토큰 누락!");
    socket.destroy();
    return;
  }

  try {
    const decoded = jwt.verify(token, "your_secret_key");
    req.userId = decoded.userId;

    wss.handleUpgrade(req, socket, head, (ws) => {
      wss.emit("connection", ws, req);
    });
  } catch (err) {
    socket.destroy();
  }
});

server.listen(3003, () => {
  console.log("서버 실행 중!");
});
