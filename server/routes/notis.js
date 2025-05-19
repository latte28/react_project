const express = require("express");
const router = express.Router();
const db = require("../db");
const auth = require("../middlewares/auth");

// ✅ 읽지 않은 알림 개수 조회
router.get("/unread-count", auth, async (req, res) => {
  const userId = req.user.userId;

  try {
    const [[{ count }]] = await db.query(
      "SELECT COUNT(*) AS count FROM notis WHERE userId = ? AND isRead = 0",
      [userId]
    );
    res.json({ success: true, count });
  } catch (err) {
    console.error("❌ 알림 개수 조회 오류:", err);
    res.status(500).json({ success: false });
  }
});

// ✅ 알림 목록 조회
router.get("/list", auth, async (req, res) => {
  const userId = req.user.userId;

  try {
    const [rows] = await db.query(
      `SELECT 
         n.notiId, 
         n.type,
         n.msg, 
         n.postId, 
         n.extraData,
         n.isRead, 
         n.createdAt,
         p.userId AS ownerUserId,
         JSON_OBJECT(
           'userId', u.userId,
           'nick', u.nick,
           'name', u.name,
           'profileImg', u.profileImg
         ) AS fromUser
       FROM notis n
       LEFT JOIN posts p ON n.postId = p.postId
       LEFT JOIN users u ON n.fromUser = u.userId
       WHERE n.userId = ?
       ORDER BY n.createdAt DESC`,
      [userId]
    );

    const notis = rows.map((row) => ({
      ...row,
      extraData:
        typeof row.extraData === "string"
          ? JSON.parse(row.extraData)
          : row.extraData,
      fromUser:
        typeof row.fromUser === "string"
          ? JSON.parse(row.fromUser)
          : row.fromUser,
    }));

    res.json({ success: true, notis });
  } catch (err) {
    console.error("❌ 알림 목록 조회 오류:", err);
    res.status(500).json({ success: false, message: err.message });
  }
});

// ✅ 알림 읽음 처리
router.put("/read/:notiId", auth, async (req, res) => {
  const userId = req.user.userId;
  const notiId = req.params.notiId;

  try {
    await db.query(
      "UPDATE notis SET isRead = 1 WHERE notiId = ? AND userId = ?",
      [notiId, userId]
    );
    res.json({ success: true });
  } catch (err) {
    console.error("❌ 알림 읽음 처리 실패:", err);
    res.status(500).json({ success: false });
  }
});

module.exports = router;
