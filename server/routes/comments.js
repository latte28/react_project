const express = require("express");
const router = express.Router();
const db = require("../db");
const auth = require("../middlewares/auth");
const createNotification = require("../utils/createNotification");

// ✅ 댓글 목록 조회 (특정 게시글)
router.get("/:postId", async (req, res) => {
  const postId = req.params.postId;

  try {
    const [rows] = await db.query(
      `SELECT c.*, u.nick FROM comments c
       JOIN users u ON c.userId = u.userId
       WHERE c.postId = ?
       ORDER BY c.createdAt ASC`,
      [postId]
    );

    res.json({ success: true, comments: rows });
  } catch (err) {
    console.error("❌ 댓글 목록 오류:", err);
    res.status(500).json({ success: false, message: "서버 오류" });
  }
});

// ✅ 댓글 등록
router.post("/", auth, async (req, res) => {
  const { postId, content, parentId = null } = req.body;
  const userId = req.user.userId;

  try {
    // 댓글 저장
    await db.query(
      "INSERT INTO comments (postId, userId, content, createdAt, parentId) VALUES (?, ?, ?, NOW(), ?)",
      [postId, userId, content, parentId]
    );

    // 내 닉네임
    const [[user]] = await db.query("SELECT nick FROM users WHERE userId = ?", [userId]);

    // 📌 대댓글인 경우
    if (parentId) {
      // 부모 댓글 작성자
      const [[parentComment]] = await db.query(
        "SELECT userId FROM comments WHERE commentId = ?",
        [parentId]
      );

      if (parentComment && parentComment.userId !== userId) {
        await createNotification({
          userId: parentComment.userId,
          type: "reply",
          msg: `${user.nick}님이 회원님의 댓글에 답글을 남겼습니다.`,
          postId,
        });
      }

    } else {
      // 📌 일반 댓글이면 → 게시글 작성자 알림
      const [[post]] = await db.query(
        "SELECT userId FROM posts WHERE postId = ?",
        [postId]
      );

      if (post && post.userId !== userId) {
        await createNotification({
          userId: post.userId,
          type: "comment",
          msg: `${user.nick}님이 회원님의 게시글에 댓글을 남겼습니다.`,
          postId,
        });
      }
    }

    res.json({ success: true, nick: user.nick });
  } catch (err) {
    console.error("❌ 댓글 등록 오류:", err);
    res.status(500).json({ success: false, message: "서버 오류" });
  }
});

// ✅ 댓글 삭제
router.delete("/:commentId", auth, async (req, res) => {
  const commentId = req.params.commentId;
  const userId = req.user.userId;

  try {
    const [result] = await db.query(
      `DELETE FROM comments WHERE commentId = ? AND userId = ?`,
      [commentId, userId]
    );

    if (result.affectedRows === 0) {
      return res.status(403).json({ success: false, message: "삭제 권한 없음" });
    }

    res.json({ success: true });
  } catch (err) {
    console.error("❌ 댓글 삭제 오류:", err);
    res.status(500).json({ success: false, message: "서버 오류" });
  }
});

module.exports = router;
