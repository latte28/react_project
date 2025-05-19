const express = require("express");
const router = express.Router();
const db = require("../db");
const auth = require("../middlewares/auth");
const multer = require("multer");
const path = require("path");

// ✅ 파일 업로드 설정
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, "uploads/"),
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    const sanitized = file.originalname.replace(/[^a-zA-Z0-9]/g, "_");
    cb(null, Date.now() + "-" + sanitized);
  },
});
const upload = multer({ storage });

// ✅ 1. 대화방 생성 또는 조회
router.post("/room", auth, async (req, res) => {
  const fromUserId = req.user.userId;
  const { toUserId } = req.body;

  try {
    const [existing] = await db.query(
      `SELECT * FROM dm_rooms 
       WHERE (userA = ? AND userB = ?) OR (userA = ? AND userB = ?)`,
      [fromUserId, toUserId, toUserId, fromUserId]
    );

    if (existing.length > 0) {
      return res.json({ success: true, roomId: existing[0].roomId });
    }

    const [result] = await db.query(
      `INSERT INTO dm_rooms (userA, userB) VALUES (?, ?)`,
      [fromUserId, toUserId]
    );

    res.json({ success: true, roomId: result.insertId });
  } catch (err) {
    res.status(500).json({ success: false });
  }
});

// ✅ 2. 메시지 전송 (수정됨)
router.post("/message", auth, async (req, res) => {
  const senderId = req.user.userId;
  const { roomId, toUserId, content, mediaUrl, mediaType } = req.body;

  try {
    await db.query(
      `INSERT INTO dm_messages 
        (roomId, senderId, toUserId, content, mediaUrl, mediaType, isRead)
       VALUES (?, ?, ?, ?, ?, ?, FALSE)`,
      [roomId, senderId, toUserId, content || "", mediaUrl || null, mediaType || null]
    );

    res.json({ success: true });
  } catch (err) {
    console.error("❌ 메시지 전송 오류:", err);
    res.status(500).json({ success: false });
  }
});

// ✅ 3. 메시지 목록 조회
router.get("/messages/:roomId", auth, async (req, res) => {
  const { roomId } = req.params;

  try {
    const [messages] = await db.query(
      `SELECT * FROM dm_messages WHERE roomId = ? ORDER BY createdAt ASC`,
      [roomId]
    );

    res.json({ success: true, messages });
  } catch (err) {
    res.status(500).json({ success: false });
  }
});

// ✅ 4. 대화방 목록 조회
router.get("/conversations", auth, async (req, res) => {
  const userId = req.user.userId;

  try {
    const [rows] = await db.query(`
      SELECT 
        r.roomId,
        IF(r.userA = ?, r.userB, r.userA) AS targetId,
        u.nick AS targetNick,
        u.profileImg AS targetProfileImg,
        (
          SELECT 
            CASE 
              WHEN m.mediaUrl IS NOT NULL THEN '[미디어]'
              ELSE m.content
            END
          FROM dm_messages m 
          WHERE m.roomId = r.roomId 
          ORDER BY m.createdAt DESC 
          LIMIT 1
        ) AS lastMessage
      FROM dm_rooms r
      JOIN users u ON u.userId = IF(r.userA = ?, r.userB, r.userA)
      WHERE r.userA = ? OR r.userB = ?
      ORDER BY r.roomId DESC
    `, [userId, userId, userId, userId]);

    res.json({ success: true, rooms: rows });
  } catch (err) {
    res.status(500).json({ success: false });
  }
});

// ✅ 5. 상대방 userId 조회
router.get("/partner/:roomId", auth, async (req, res) => {
  const { roomId } = req.params;
  const myUserId = req.user.userId;

  try {
    const [rows] = await db.query(
      `SELECT userA, userB FROM dm_rooms WHERE roomId = ?`,
      [roomId]
    );

    if (rows.length === 0) {
      return res.status(404).json({ success: false, message: "해당 방이 없습니다" });
    }

    const { userA, userB } = rows[0];
    let partnerId;

    if (userA === myUserId) {
      partnerId = userB;
    } else if (userB === myUserId) {
      partnerId = userA;
    } else {
      return res.status(403).json({ success: false, message: "이 채팅방에 접근 권한이 없습니다" });
    }

    return res.json({ success: true, partnerId });
  } catch (err) {
    return res.status(500).json({ success: false });
  }
});

// ✅ 6. 이미지 업로드
router.post("/upload", auth, upload.single("file"), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ success: false, message: "파일이 없습니다" });
  }

  const fileUrl = "/uploads/" + req.file.filename;
  res.json({ success: true, url: fileUrl });
});

// ✅ 7. 메시지 삭제
router.delete("/message/:id", auth, async (req, res) => {
  const { id } = req.params;
  const userId = req.user.userId;

  try {
    const [rows] = await db.query(
      `SELECT * FROM dm_messages WHERE messageId = ? AND senderId = ?`,
      [id, userId]
    );

    if (rows.length === 0) {
      return res.status(403).json({ success: false, message: "삭제 권한이 없습니다" });
    }

    await db.query(`DELETE FROM dm_messages WHERE messageId = ?`, [id]);

    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ success: false });
  }
});

// ✅ 8. 읽지 않은 메시지 수
router.get("/unread-count", auth, async (req, res) => {
  const userId = req.user.userId;

  try {
    const [rows] = await db.query(
      `SELECT COUNT(*) AS unreadCount
       FROM dm_messages
       WHERE toUserId = ? AND isRead = FALSE`,
      [userId]
    );

    res.json({ success: true, count: rows[0].unreadCount });
  } catch (err) {
    console.error("❌ 안읽은 메시지 수 오류:", err);
    res.status(500).json({ success: false });
  }
});

// ✅ 9. 해당 방 메시지 읽음 처리
router.put("/mark-read/:roomId", auth, async (req, res) => {
  const userId = req.user.userId;
  const { roomId } = req.params;

  try {
    await db.query(
      `UPDATE dm_messages 
       SET isRead = TRUE 
       WHERE roomId = ? AND toUserId = ? AND isRead = FALSE`,
      [roomId, userId]
    );

    res.json({ success: true });
  } catch (err) {
    console.error("❌ 읽음 처리 오류:", err);
    res.status(500).json({ success: false });
  }
});

module.exports = router;
