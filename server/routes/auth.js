const express = require("express");
const axios = require("axios");
const jwt = require("jsonwebtoken");
const db = require("../db");
const router = express.Router();

const REST_API_KEY = "882332c3ee262b6764b8b37aceda1f1a";
const REDIRECT_URI = "http://localhost:3000/kakao/callback";
const SECRET_KEY = "your_secret_key";

router.post("/kakao", async (req, res) => {
  const { code } = req.body;

  try {
    const tokenRes = await axios.post(
      "https://kauth.kakao.com/oauth/token",
      new URLSearchParams({
        grant_type: "authorization_code",
        client_id: REST_API_KEY,
        redirect_uri: REDIRECT_URI,
        code,
      }),
      {
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
      }
    );

    const accessToken = tokenRes.data.access_token;

    const userRes = await axios.get("https://kapi.kakao.com/v2/user/me", {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });

    const kakao_account = userRes.data.kakao_account || {};
    const email = kakao_account.email || "";
    const nickname = kakao_account.profile?.nickname || "카카오사용자";

    let userId = ""; // 👈 JWT에 담을 userId

    // ✅ DB 확인 후 없으면 자동 회원가입
    const [rows] = await db.query("SELECT * FROM users WHERE email = ?", [
      email,
    ]);

    let isNewUser = false;
    if (rows.length === 0) {
      // 신규 회원
      isNewUser = true;
      userId = `kakao_${Date.now()}`;

      await db.query(
        `INSERT INTO users (userId, email, name, nick, createdAt, updatedAt, isDeleted)
         VALUES (?, ?, ?, ?, NOW(), NOW(), 0)`,
        [userId, email, nickname, nickname]
      );
    } else {
      // 기존 회원
      const user = rows[0];
      if (user.isDeleted === 1) {
        return res
          .status(403)
          .json({ success: false, message: "삭제된 사용자입니다." });
      }
      userId = user.userId; // ✅ userId 추출
    }

    // ✅ JWT 발급 시 userId 포함
    const token = jwt.sign({ userId, email, nickname }, SECRET_KEY, {
      expiresIn: "7d",
    });

    res.json({ success: true, token, firstLogin: isNewUser });
  } catch (err) {
    console.error("카카오 로그인 에러:", err.message);
    res.json({ success: false, message: "카카오 로그인 실패" });
  }
});

module.exports = router;
