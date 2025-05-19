const express = require("express");
const router = express.Router();
const db = require("../db");

// ✅ GET /profile/:userId/info - 유저 정보 조회
router.get("/:userId/info", async (req, res) => {
  const userId = req.params.userId;

  try {
    const [rows] = await db.query(
      `SELECT userId, name, nick, email, phone, birth, profileImg, bio
       FROM users
       WHERE userId = ?`,
      [userId]
    );

    if (rows.length === 0) {
      return res.status(404).json({ success: false, message: "사용자 없음" });
    }

    res.json({ success: true, user: rows[0] });
  } catch (err) {
    console.error("❌ 사용자 정보 오류:", err);
    res.status(500).json({ success: false, message: "서버 오류" });
  }
});


// ✅ GET /profile/:userId/feeds - 피드 조회
router.get("/:userId/feeds", async (req, res) => {
  const userId = req.params.userId;

  try {
    const sql = `
      SELECT p.postId, p.content, p.createdAt,
             (SELECT url FROM postImgs WHERE postId = p.postId ORDER BY sort LIMIT 1) AS thumbnailUrl
      FROM posts p
      WHERE p.userId = ?
      ORDER BY p.createdAt DESC
    `;
    const [rows] = await db.query(sql, [userId]);

    res.json({ success: true, feeds: rows });
  } catch (err) {
    console.error("❌ 피드 조회 오류:", err);
    res.status(500).json({ success: false, message: "서버 오류" });
  }
});

module.exports = router;
