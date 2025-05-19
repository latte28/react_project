const express = require("express");
const router = express.Router();
const db = require("../db");
const createNotification = require("../utils/createNotification");
const { sendToUser } = require("../wsServer");

// 1. 팔로우 요청 보내기
router.post("/", async (req, res) => {
  const { fromUser, toUser } = req.body;
  if (fromUser === toUser) {
    return res.status(400).json({ success: false, message: "자기 자신은 팔로우할 수 없습니다." });
  }

  try {
    const [existing] = await db.query(
      `SELECT * FROM follows 
       WHERE ((fromUser = ? AND toUser = ?) OR (fromUser = ? AND toUser = ?)) 
       AND status != 'rejected'`,
      [fromUser, toUser, toUser, fromUser]
    );

    if (existing.length > 0) {
      return res.json({ success: false, message: "이미 팔로우 요청 중이거나 팔로우 상태입니다." });
    }

    const [result] = await db.query(
      "INSERT INTO follows (fromUser, toUser, status) VALUES (?, ?, 'pending')",
      [fromUser, toUser]
    );
    const followId = result.insertId;

    const [[fromUserInfo]] = await db.query(
      "SELECT userId, name, nick, profileImg FROM users WHERE userId = ?",
      [fromUser]
    );

    await createNotification({
      userId: toUser,
      type: "follow_request",
      msg: `${fromUserInfo.nick}님이 당신을 팔로우 요청했습니다.`,
      fromUser,
      extraData: { followId },
    });

    sendToUser(toUser, {
      type: "follow-request",
      fromUser: {
        userId: fromUserInfo.userId,
        nick: fromUserInfo.nick,
        name: fromUserInfo.name,
        profileImg: fromUserInfo.profileImg,
      },
      followId,
      createdAt: new Date().toISOString(),
    });

    res.json({ success: true, message: "팔로우 요청 완료" });
  } catch (err) {
    console.error("팔로우 요청 오류:", err);
    res.status(500).json({ success: false });
  }
});

// 2. 팔로우 수락
router.put("/:followId/accept", async (req, res) => {
  const { followId } = req.params;
  try {
    await db.query("UPDATE follows SET status = 'accepted' WHERE followId = ?", [followId]);

    const [[follow]] = await db.query("SELECT fromUser, toUser FROM follows WHERE followId = ?", [followId]);

    // 요청 보낸 사람 정보
    const [[fromUserInfo]] = await db.query(
      "SELECT userId, name, nick, profileImg FROM users WHERE userId = ?",
      [follow.fromUser]
    );

    // 요청 수락한 사람 정보
    const [[toUserInfo]] = await db.query(
      "SELECT userId, name, nick, profileImg FROM users WHERE userId = ?",
      [follow.toUser]
    );

    // 맞팔 기록이 없다면 생성
    const [reverse] = await db.query(
      "SELECT * FROM follows WHERE fromUser = ? AND toUser = ? AND status = 'accepted'",
      [follow.toUser, follow.fromUser]
    );
    if (reverse.length === 0) {
      await db.query(
        "INSERT INTO follows (fromUser, toUser, status, createdAt) VALUES (?, ?, 'accepted', NOW())",
        [follow.toUser, follow.fromUser]
      );
    }

    // 기존 follow_request 알림 제거
    await db.query("DELETE FROM notis WHERE type = 'follow_request' AND extraData LIKE ?", [`%${followId}%`]);

    // 요청한 사람에게 수락 알림 (알림 + 웹소켓)
    await createNotification({
      userId: follow.fromUser,
      type: "follow_accept",
      msg: `${toUserInfo.nick}님이 팔로우 요청을 수락했습니다.`,
      fromUser: follow.toUser,
    });

    sendToUser(follow.fromUser, {
      type: "follow-accepted",
      fromUser: toUserInfo,
      message: `${toUserInfo.nick}님이 팔로우 요청을 수락했습니다.`,
      createdAt: new Date().toISOString(),
    });

    // 수락한 본인에게도 알림
    await createNotification({
      userId: follow.toUser,
      type: "follow_accept",
      msg: `${fromUserInfo.nick}님과 맞팔로우가 되었습니다.`,
      fromUser: follow.fromUser,
    });

    sendToUser(follow.toUser, {
      type: "follow-accepted",
      fromUser: fromUserInfo,
      message: `${fromUserInfo.nick}님과 맞팔로우가 되었습니다.`,
      createdAt: new Date().toISOString(),
    });

    res.json({ success: true, message: "팔로우 요청 수락됨 및 맞팔 처리 완료" });
  } catch (err) {
    console.error("팔로우 수락 오류:", err);
    res.status(500).json({ success: false });
  }
});


// 3. 팔로우 거절
router.put("/:followId/reject", async (req, res) => {
  const { followId } = req.params;
  try {
    const [[follow]] = await db.query("SELECT fromUser, toUser FROM follows WHERE followId = ?", [followId]);
    await db.query("DELETE FROM follows WHERE followId = ?", [followId]);

    const [[toUserInfo]] = await db.query(
      "SELECT userId, name, nick, profileImg FROM users WHERE userId = ?",
      [follow.toUser]
    );

    await db.query("DELETE FROM notis WHERE type = 'follow_request' AND extraData LIKE ?", [`%${followId}%`]);

    // 요청한 사람에게 알림
    await createNotification({
      userId: follow.fromUser,
      type: "follow_reject",
      msg: `${toUserInfo.nick}님이 팔로우 요청을 거절했습니다.`,
      fromUser: follow.toUser,
    });

    sendToUser(follow.fromUser, {
      type: "follow-rejected",
      fromUser: toUserInfo,
      message: `${toUserInfo.nick}님이 팔로우 요청을 거절했습니다.`,
      createdAt: new Date().toISOString(),
    });

    // 거절한 본인에게도 알림
    await createNotification({
      userId: follow.toUser,
      type: "follow_reject",
      msg: `${toUserInfo.nick}님이 ${follow.fromUser}님의 팔로우 요청을 거절했습니다.`,
      fromUser: follow.fromUser,
    });

    sendToUser(follow.toUser, {
      type: "follow-rejected", // ✅ 통일된 타입
      fromUser: toUserInfo,
      message: `${toUserInfo.nick}님이 ${follow.fromUser}님의 팔로우 요청을 거절했습니다.`,
      createdAt: new Date().toISOString(),
    });

    res.json({ success: true, message: "팔로우 요청 거절됨" });
  } catch (err) {
    console.error("팔로우 거절 오류:", err);
    res.status(500).json({ success: false });
  }
});

// 4. 팔로우 취소
router.delete("/:toUserId", async (req, res) => {
  const fromUser = req.body.fromUser;
  const { toUserId } = req.params;
  try {
    await db.query("DELETE FROM follows WHERE fromUser = ? AND toUser = ?", [fromUser, toUserId]);
    res.json({ success: true });
  } catch (err) {
    console.error("팔로우 취소 오류:", err);
    res.status(500).json({ success: false });
  }
});

// 5. DM 가능 여부
router.get("/canDM/:user1/:user2", async (req, res) => {
  const { user1, user2 } = req.params;
  try {
    const [rows] = await db.query(
      `SELECT COUNT(*) AS count
       FROM follows f1
       JOIN follows f2 ON f1.fromUser = f2.toUser AND f1.toUser = f2.fromUser
       WHERE f1.fromUser = ? AND f1.toUser = ? AND f1.status = 'accepted'
         AND f2.status = 'accepted'`,
      [user1, user2]
    );
    res.json({ success: true, canDM: rows[0].count > 0 });
  } catch (err) {
    console.error("DM 가능 여부 오류:", err);
    res.status(500).json({ success: false });
  }
});

// 6. 팔로우 상태 확인
router.get("/status/:fromUser/:toUser", async (req, res) => {
  const { fromUser, toUser } = req.params;
  try {
    const [rows] = await db.query(
      "SELECT * FROM follows WHERE fromUser = ? AND toUser = ?",
      [fromUser, toUser]
    );
    res.json({ success: true, follow: rows[0] || null });
  } catch (err) {
    console.error("팔로우 상태 조회 오류:", err);
    res.status(500).json({ success: false });
  }
});

// 7. 받은 요청 목록
router.get("/received/:userId", async (req, res) => {
  const { userId } = req.params;
  try {
    const [rows] = await db.query(
      `SELECT f.followId, f.fromUser, u.name, u.nick, u.profileImg
       FROM follows f
       JOIN users u ON f.fromUser = u.userId
       WHERE f.toUser = ? AND f.status = 'pending'`,
      [userId]
    );
    res.json({ success: true, requests: rows });
  } catch (err) {
    console.error("받은 팔로우 요청 목록 오류:", err);
    res.status(500).json({ success: false });
  }
});

module.exports = router;
