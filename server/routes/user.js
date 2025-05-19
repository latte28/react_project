const express = require("express");
const router = express.Router();
const db = require("../db");
const jwt = require("jsonwebtoken");
const auth = require("../middlewares/auth");
const multer = require("multer");
const path = require("path");
const bcrypt = require("bcrypt");
const saltRounds = 10;

const SECRET_KEY = "your_secret_key";

// multer 설정
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, "uploads/"),
  filename: (req, file, cb) => cb(null, Date.now() + "-" + file.originalname),
});
const upload = multer({ storage });

// 이메일 형식 정규식
const validateEmail = (email) => {
  const regex = /^[\w-.]+@([\w-]+\.)+[\w-]{2,4}$/;
  return regex.test(email);
};

// 회원가입
router.post("/register", async (req, res) => {
  const { userId, email, pw, name, nick, phone, birth } = req.body;

  if (!userId || !email || !pw || !name || !nick || !phone || !birth) {
    return res
      .status(400)
      .json({ success: false, message: "모든 항목을 입력하세요." });
  }
  if (!validateEmail(email)) {
    return res.status(400).json({ success: false, message: "이메일 형식이 올바르지 않습니다." });
  }

  try {
    const [existingUser] = await db.query(
      "SELECT * FROM users WHERE userId = ? OR email = ?",
      [userId, email]
    );

    if (existingUser.length > 0) {
      return res.status(409).json({
        success: false,
        message: "이미 존재하는 아이디 또는 이메일입니다.",
      });
    }

    const hashedPw = await bcrypt.hash(pw, saltRounds);

    await db.query(
      `INSERT INTO users (userId, email, pw, name, nick, phone, birth, profileImg, createdAt, updatedAt, isDeleted)
       VALUES (?, ?, ?, ?, ?, ?, ?, NULL, NOW(), NOW(), 0)`,
      [userId, email, hashedPw, name, nick, phone, birth]
    );

    res.json({ success: true, message: "회원가입 성공!" });
  } catch (err) {
    console.error("회원가입 오류:", err);
    res.status(500).json({ success: false, message: "서버 오류 발생" });
  }
});

// 아이디 중복 확인
router.get("/check-id", async (req, res) => {
  const { userId } = req.query;

  if (!userId) {
    return res.status(400).json({ exists: false, message: "userId 누락됨" });
  }

  try {
    const [rows] = await db.query(
      "SELECT COUNT(*) AS cnt FROM users WHERE userId = ?",
      [userId]
    );
    res.json({ exists: rows[0].cnt > 0 });
  } catch (err) {
    console.error("\u274C 아이디 중복 확인 오류:", err);
    res.status(500).json({ exists: false, message: "서버 오류" });
  }
});

//  로그인
router.post("/login", async (req, res) => {
  const { userId, pw } = req.body;

  if (!userId || !pw) {
    return res
      .status(400)
      .json({ success: false, message: "아이디와 비밀번호를 입력하세요." });
  }

  try {
    const [rows] = await db.query("SELECT * FROM users WHERE userId = ?", [userId,]);

    if (rows.length === 0) {
      return res
        .status(404)
        .json({ success: false, message: "존재하지 않는 아이디입니다." });
    }

    const user = rows[0];
    const isMatch = await bcrypt.compare(pw, user.pw);

    if (!isMatch) {
      return res
        .status(401)
        .json({ success: false, message: "비밀번호가 틀렸습니다." });
    }

    // JWT 발급
    const token = jwt.sign(
      { userId: user.userId, nick: user.nick, name: user.name },
      SECRET_KEY,
      { expiresIn: "24h" }
    );

    res.json({
      success: true,
      message: "로그인 성공",
      user: {
        userId: user.userId,
        nick: user.nick,
        name: user.name,
      },
      token,
    });
  } catch (err) {
    console.error("로그인 오류:", err);
    res
      .status(500)
      .json({ success: false, message: "서버 오류: " + err.message });
  }
});

// 사용자 정보 조회 (로그인 필요)
router.get("/info", auth, async (req, res) => {
  const userId = req.user.userId;

  try {
    const [rows] = await db.query(
      `SELECT userId, name, nick, email, phone, birth, bio, gender, profileImg
   FROM users
   WHERE userId = ?`,
      [userId]
    );

    if (rows.length === 0) {
      return res
        .status(404)
        .json({ success: false, message: "사용자 정보 없음" });
    }

    res.json({ success: true, user: rows[0] });
  } catch (err) {
    console.error("❌ 사용자 정보 조회 오류:", err);
    res.status(500).json({ success: false, message: "서버 오류" });
  }
});

// 프로필 수정 (텍스트 + 이미지)
router.put("/update", auth, upload.single("profileImg"), async (req, res) => {
  const userId = req.user.userId;
  let { name, nick, bio, gender, birth, phone } = req.body;

  // 빈 문자열이나 "null" 문자열은 null로 변환 (DB null 값 처리)
  bio = !bio || bio === "null" ? null : bio;
  gender = gender === "남성" || gender === "여성" ? gender : "기타";
  birth = !birth || birth === "null" ? null : birth;
  phone = !phone || phone === "null" ? null : phone;

  const profileImg = req.file ? "/uploads/" + req.file.filename : null;

  try {
    await db.query(
      `UPDATE users
       SET name = ?, nick = ?, bio = ?, gender = ?, birth = ?, phone = ?,
           profileImg = IFNULL(?, profileImg), updatedAt = NOW()
       WHERE userId = ?`,
      [name, nick, bio, gender, birth, phone, profileImg, userId]
    );

    res.json({ success: true });
  } catch (err) {
    console.error("❌ 프로필 수정 오류:", err);
    res.status(500).json({ success: false, message: "서버 오류" });
  }
});

//아이디 찾기
router.post("/find-id", async (req, res) => {
  const { email } = req.body;

  if (!email) {
    return res
      .status(400)
      .json({ success: false, message: "이메일을 입력해주세요." });
  }

  try {
    const [rows] = await db.query("SELECT userId FROM users WHERE email = ?", [
      email,
    ]);

    if (rows.length === 0) {
      return res.json({
        success: false,
        message: "해당 이메일로 등록된 계정이 없습니다.",
      });
    }

    return res.json({ success: true, userId: rows[0].userId });
  } catch (err) {
    console.error("아이디 찾기 오류:", err);
    res.status(500).json({ success: false, message: "서버 오류 발생" });
  }
});

//비밀번호 찾기
router.put("/reset-password", async (req, res) => {
  const { token, newPw } = req.body;

  if (!token || !newPw) {
    return res
      .status(400)
      .json({ success: false, message: "토큰과 새 비밀번호를 입력해주세요." });
  }

  try {
    const decoded = jwt.verify(token, SECRET_KEY);
    const userId = decoded.userId;

    const hashedPw = await bcrypt.hash(newPw, saltRounds);

    await db.query(
      "UPDATE users SET pw = ?, updatedAt = NOW() WHERE userId = ?",
      [hashedPw, userId]
    );

    res.json({
      success: true,
      message: "비밀번호가 성공적으로 변경되었습니다.",
    });
  } catch (err) {
    console.error("비밀번호 변경 오류:", err);
    if (err.name === "TokenExpiredError") {
      return res
        .status(401)
        .json({ success: false, message: "재설정 링크가 만료되었습니다." });
    }
    res.status(500).json({ success: false, message: "서버 오류" });
  }
});

// 비밀번호 재설정 요청 → 토큰 발급
router.post("/request-reset", async (req, res) => {
  const { userId, email } = req.body;

  if (!userId || !email) {
    return res
      .status(400)
      .json({ success: false, message: "아이디와 이메일을 입력해주세요." });
  }

  try {
    const [rows] = await db.query(
      "SELECT * FROM users WHERE userId = ? AND email = ?",
      [userId, email]
    );

    if (rows.length === 0) {
      return res.json({ success: false, message: "일치하는 계정이 없습니다." });
    }

    const token = jwt.sign({ userId }, SECRET_KEY, { expiresIn: "24h" });

    res.json({ success: true, token });
  } catch (err) {
    console.error("비밀번호 재설정 요청 오류:", err);
    res.status(500).json({ success: false, message: "서버 오류" });
  }
});


// 추천 유저 목록
router.get("/recommend/:userId", async (req, res) => {
  const { userId } = req.params;

  try {
    const [rows] = await db.query(
      `SELECT userId, name, nick, profileImg FROM users 
       WHERE userId != ?
       AND userId NOT IN (
         SELECT toUser FROM follows WHERE fromUser = ? AND status IN ('pending', 'accepted')
       )
       ORDER BY RAND() LIMIT 10`,
      [userId, userId]
    );

    res.json({ success: true, users: rows });
  } catch (err) {
    console.error("추천 유저 조회 오류:", err);
    res.status(500).json({ success: false });
  }
});


// 8. 팔로우/팔로잉 수 조회 (팔로우 요청 포함)
router.get("/:userId/follow-stats", async (req, res) => {
  const { userId } = req.params;

  try {
    const [[followers]] = await db.query(
      "SELECT COUNT(*) AS count FROM follows WHERE toUser = ? AND status = 'accepted'",
      [userId]
    );

    const [[following]] = await db.query(
      "SELECT COUNT(*) AS count FROM follows WHERE fromUser = ? AND status IN ('pending', 'accepted')",
      [userId]
    );

    res.json({
      success: true,
      followers: followers.count,
      following: following.count,
    });
  } catch (err) {
    console.error("팔로우 수 조회 오류:", err);
    res.status(500).json({ success: false });
  }
});

// routes/user.js
router.get("/search", auth, async (req, res) => {
  const { keyword } = req.query;

  try {
    const [rows] = await db.query(
      `SELECT userId, nick, profileImg FROM users WHERE nick LIKE ? AND userId != ? LIMIT 20`,
      [`%${keyword}%`, req.user.userId]
    );

    res.json({ success: true, users: rows });
  } catch (err) {
    console.error("❌ 유저 검색 오류:", err);
    res.status(500).json({ success: false });
  }
});


module.exports = router;
