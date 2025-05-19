const express = require("express");
const router = express.Router();
const db = require("../db");
const auth = require("../middlewares/auth");
const createNotification = require("../utils/createNotification");
const { sendToUser } = require("../wsServer");

// ✅ 좋아요 추가
router.post("/", auth, async (req, res) => {
  const { postId } = req.body;
  const userId = req.user.userId;

  try {
    const [result] = await db.query(
      "INSERT IGNORE INTO postlikes (postId, userId, likedAt) VALUES (?, ?, NOW())",
      [postId, userId]
    );

    if (result.affectedRows > 0) {
      // 게시글 작성자 조회
      const [[post]] = await db.query(
        "SELECT userId FROM posts WHERE postId = ?",
        [postId]
      );

      if (post.userId !== userId) {
        const [[user]] = await db.query(
          "SELECT nick FROM users WHERE userId = ?",
          [userId]
        );

        // 🔔 알림 중복 방지 포함
        await createNotification({
          userId: post.userId,
          type: "like",
          msg: `${user.nick}님이 회원님의 게시글을 좋아합니다.`,
          postId: postId,
          fromUser: userId,
        });

        // WebSocket 알림
        sendToUser(post.userId, {
          type: "notification",
          message: `${user.nick}님이 회원님의 게시글을 좋아합니다.`,
        });
      }

      // 좋아요 수
      const [[{ count }]] = await db.query(
        "SELECT COUNT(*) AS count FROM postlikes WHERE postId = ?",
        [postId]
      );

      sendToUser(post.userId, {
        type: "like-update",
        postId,
        likeCount: count,
      });

      return res.json({ success: true, liked: true, likeCount: count });
    }

    // 이미 좋아요 상태였던 경우
    const [[{ count }]] = await db.query(
      "SELECT COUNT(*) AS count FROM postlikes WHERE postId = ?",
      [postId]
    );

    res.json({ success: true, liked: true, likeCount: count });

  } catch (err) {
    console.error("❌ 좋아요 등록 오류:", err);
    res.status(500).json({ success: false, message: "서버 오류" });
  }
});

// ✅ 좋아요 취소
router.delete("/", auth, async (req, res) => {
  const { postId } = req.body;
  const userId = req.user.userId;

  try {
    await db.query(
      "DELETE FROM postlikes WHERE postId = ? AND userId = ?",
      [postId, userId]
    );

    // 게시글 작성자 조회
    const [[post]] = await db.query(
      "SELECT userId FROM posts WHERE postId = ?",
      [postId]
    );

    // 🔔 알림 삭제
    await db.query(
      `DELETE FROM notis 
       WHERE userId = ? AND type = 'like' AND postId = ? AND fromUser = ?`,
      [post.userId, postId, userId]
    );

    const [[{ count }]] = await db.query(
      "SELECT COUNT(*) AS count FROM postlikes WHERE postId = ?",
      [postId]
    );

    sendToUser(post.userId, {
      type: "like-update",
      postId,
      likeCount: count,
    });

    res.json({ success: true, liked: false, likeCount: count });
  } catch (err) {
    console.error("❌ 좋아요 삭제 오류:", err);
    res.status(500).json({ success: false, message: "서버 오류" });
  }
});

// ✅ 좋아요 여부 + 개수 확인
router.get("/:postId", auth, async (req, res) => {
  const postId = req.params.postId;
  const userId = req.user.userId;

  try {
    const [likeRows] = await db.query(
      "SELECT * FROM postlikes WHERE postId = ? AND userId = ?",
      [postId, userId]
    );

    const [[{ count }]] = await db.query(
      "SELECT COUNT(*) AS count FROM postlikes WHERE postId = ?",
      [postId]
    );

    res.json({
      success: true,
      liked: likeRows.length > 0,
      likeCount: count,
    });
  } catch (err) {
    console.error("❌ 좋아요 여부 확인 오류:", err);
    res.status(500).json({ success: false, message: "서버 오류" });
  }
});

// ✅ 게시글 목록 (로그인 사용자 기준 좋아요 여부 포함)
router.get("/list", auth, async (req, res) => {
  const userId = req.user.userId;

  try {
    const [rows] = await db.query(
      `
      SELECT 
        p.postId,
        p.userId,
        p.content,
        p.createdAt,
        u.nick,
        u.name,
        u.profileImg,
        (
          SELECT COUNT(*) 
          FROM postlikes 
          WHERE postId = p.postId
        ) AS likeCount,
        EXISTS (
          SELECT 1 
          FROM postlikes 
          WHERE postId = p.postId AND userId = ?
        ) AS liked
      FROM posts p
      JOIN users u ON u.userId = p.userId
      ORDER BY p.createdAt DESC
    `,
      [userId]
    );

    res.json({ success: true, posts: rows });
  } catch (err) {
    console.error("❌ 게시글 목록 조회 실패:", err);
    res.status(500).json({ success: false });
  }
});

module.exports = router;
